import { useCallback, useRef, useState } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

type ConvertOptions = {
  bitrate?: string;
  sampleRate?: number;
  channels?: number;
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

  return {
    ready,
    loading,
    error,
    convertVideoToAudio,
    ensureLoaded: ensureFfmpeg,
  } as const;
}
