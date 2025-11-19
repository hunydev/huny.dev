import { useCallback, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type ConvertOptions = {
  bitrate?: string;
  sampleRate?: number;
  channels?: number;
};

type ThumbnailOptions = {
  intervalSec: number;
  enableScene: boolean;
  sceneThreshold: number;
};

type Thumbnail = {
  url: string;
  timestamp: number;
  filename: string;
};

const CORE_VERSION = '0.12.6';
const CORE_BASE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd/`;

const createOutputName = (inputName: string, ext = 'mp3') => {
  const base = inputName.replace(/\.[^/.]+$/, '') || 'audio';
  return `${base}-extracted.${ext}`;
};

export function useFfmpeg() {
  const ffmpegRef = useRef<FFmpeg | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (ffmpegRef.current && ready) {
      return ffmpegRef.current;
    }
    if (loading) {
      return ffmpegRef.current;
    }

    setLoading(true);
    setError('');
    try {
      const ffmpeg = new FFmpeg();
      ffmpegRef.current = ffmpeg;

      await ffmpeg.load();
      setReady(true);
      return ffmpeg;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
      ffmpegRef.current = null;
      setReady(false);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [loading, ready]);

  const ensureFfmpeg = useCallback(async () => {
    if (ffmpegRef.current && ready) {
      return ffmpegRef.current;
    }
    return load();
  }, [load, ready]);

  const convertVideoToAudio = useCallback(
    async (file: File, options: ConvertOptions = {}): Promise<File> => {
      if (!file) {
        throw new Error('변환할 파일이 없습니다.');
      }

      // 모든 파일을 표준 mp3로 변환 (m4a, aac 등 호환성 문제 방지)
      const ffmpeg = await ensureFfmpeg();
      const inputName = `input-${Date.now()}`;
      const outputExt = 'mp3';
      const outputName = `output-${Date.now()}.${outputExt}`;

      try {
        await ffmpeg.writeFile(inputName, await fetchFile(file));
        const { bitrate = '96k', sampleRate = 16000, channels = 1 } = options;
        await ffmpeg.exec([
          '-i',
          inputName,
          '-vn',
          '-acodec',
          'libmp3lame',
          '-ac',
          String(channels),
          '-ar',
          String(sampleRate),
          '-b:a',
          bitrate,
          '-f',
          'mp3',
          outputName,
        ]);

        const data = await ffmpeg.readFile(outputName);
        const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBufferLike);
        const arrayBuffer = new ArrayBuffer(uint8.byteLength);
        new Uint8Array(arrayBuffer).set(uint8);
        const blob = new Blob([arrayBuffer], { type: 'audio/mpeg' });
        return new File([blob], createOutputName(file.name, outputExt), { type: 'audio/mpeg' });
      } finally {
        try {
          await ffmpeg.deleteFile(inputName);
        } catch {
          // ignore
        }
        try {
          await ffmpeg.deleteFile(outputName);
        } catch {
          // ignore
        }
      }
    },
    [ensureFfmpeg],
  );

  const extractThumbnails = useCallback(
    async (file: File, options: ThumbnailOptions): Promise<Thumbnail[]> => {
      if (!file) {
        throw new Error('추출할 비디오 파일이 없습니다.');
      }

      const ffmpeg = await ensureFfmpeg();
      const inputName = `input-${Date.now()}.mp4`;
      const outputPattern = `out_%04d.jpg`;

      // 로그 수집을 위한 배열
      const logs: string[] = [];
      const logHandler = ({ message }: { message: string }) => {
        logs.push(message);
        console.log('[FFmpeg]', message);
      };
      
      ffmpeg.on('log', logHandler);

      try {
        await ffmpeg.writeFile(inputName, await fetchFile(file));

        // 필터 표현식 생성
        // 주의: FFmpeg 필터 체인에서 쉼표는 필터 구분자이므로
        // select 필터 표현식 내부의 쉼표는 \,로 이스케이프해야 함
        const selectConds: string[] = [];
        selectConds.push(`not(mod(t\\,${options.intervalSec}))`);
        if (options.enableScene) {
          selectConds.push(`gt(scene\\,${options.sceneThreshold})`);
        }
        const selectExpr = selectConds.join('+');
        // 메모리 부족 방지: 작은 크기 + 낮은 품질
        const vf = `select=${selectExpr},scale=120:-1`;

        console.log(`🎬 FFmpeg 실행: -vf "${vf}"`);

        await ffmpeg.exec([
          '-i',
          inputName,
          '-vf',
          vf,
          '-vsync',
          'vfr',
          '-q:v',
          '10',  // 품질을 더 낮춤 (높을수록 낮은 품질, 그리드 표시에는 충분)
          outputPattern,
        ]);

        console.log(`📝 수집된 로그: ${logs.length}개`);

        // 로그에서 타임스탬프 파싱 (여러 패턴 시도)
        const timestampMap = new Map<string, number>();
        let frameIndex = 1;
        
        for (const log of logs) {
          // 패턴 1: select:1.00 pts:123456 t:6.12
          let match = log.match(/select:[^\s]+\s+pts:[^\s]+\s+t:([\d.]+)/);
          if (!match) {
            // 패턴 2: t:6.12 (더 단순한 형식)
            match = log.match(/\bt:([\d.]+)/);
          }
          if (match) {
            const timestamp = parseFloat(match[1]);
            const filename = `out_${String(frameIndex).padStart(4, '0')}.jpg`;
            timestampMap.set(filename, timestamp);
            console.log(`⏱️  프레임 ${frameIndex}: ${filename} -> ${timestamp}초`);
            frameIndex++;
          }
        }

        console.log(`🗺️  타임스탬프 맵: ${timestampMap.size}개`);

        // 생성된 파일 찾기 (최대 500개까지 확인)
        // 메모리 부족 방지: 파일을 읽은 직후 즉시 삭제
        const thumbnails: Thumbnail[] = [];
        for (let i = 1; i <= 500; i++) {
          const filename = `out_${String(i).padStart(4, '0')}.jpg`;
          try {
            const data = await ffmpeg.readFile(filename);
            
            // 파일 읽은 즉시 삭제 (메모리 확보)
            try {
              await ffmpeg.deleteFile(filename);
            } catch {
              // ignore
            }
            
            const uint8 = data instanceof Uint8Array ? data : new Uint8Array(data as ArrayBufferLike);
            const arrayBuffer = new ArrayBuffer(uint8.byteLength);
            new Uint8Array(arrayBuffer).set(uint8);
            const blob = new Blob([arrayBuffer], { type: 'image/jpeg' });
            const url = URL.createObjectURL(blob);
            
            const timestamp = timestampMap.get(filename) || ((i - 1) * options.intervalSec);
            thumbnails.push({
              url,
              timestamp,
              filename,
            });
            console.log(`✅ 파일 읽기 성공: ${filename} (${uint8.byteLength} bytes)`);
          } catch {
            // 파일이 없으면 종료
            break;
          }
        }

        console.log(`🎉 총 ${thumbnails.length}개 썸네일 추출`);
        return thumbnails;
      } finally {
        ffmpeg.off('log', logHandler);
        
        // 정리: 입력 파일과 혹시 남아있을 수 있는 출력 파일들 삭제
        try {
          await ffmpeg.deleteFile(inputName);
        } catch {
          // ignore
        }
        
        // 혹시 모를 남은 썸네일 파일들 정리 (이미 위에서 삭제했지만 안전장치)
        for (let i = 1; i <= 10; i++) {
          const filename = `out_${String(i).padStart(4, '0')}.jpg`;
          try {
            await ffmpeg.deleteFile(filename);
          } catch {
            break;
          }
        }
      }
    },
    [ensureFfmpeg],
  );

  return {
    ready,
    loading,
    error,
    convertVideoToAudio,
    extractThumbnails,
    ensureLoaded: ensureFfmpeg,
  } as const;
}
