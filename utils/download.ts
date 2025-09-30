/**
 * 파일 다운로드 관련 유틸리티 함수들
 */

/**
 * Blob 객체를 파일로 다운로드
 * @param blob - 다운로드할 Blob 객체
 * @param filename - 저장할 파일명
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download blob:', error);
    throw error;
  }
};

/**
 * URL에서 리소스를 fetch하여 파일로 다운로드
 * @param url - 다운로드할 리소스 URL (data URL 또는 HTTP URL)
 * @param filename - 저장할 파일명
 */
export const downloadFromUrl = async (url: string, filename: string): Promise<void> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    downloadBlob(blob, filename);
  } catch (error) {
    console.error('Failed to download from URL:', error);
    throw error;
  }
};

/**
 * JSON 객체를 JSON 파일로 다운로드
 * @param data - JSON으로 변환할 객체
 * @param filename - 저장할 파일명 (기본값: 'data.json')
 */
export const downloadJson = (data: any, filename: string = 'data.json'): void => {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  downloadBlob(blob, filename);
};

/**
 * 텍스트를 텍스트 파일로 다운로드
 * @param text - 다운로드할 텍스트
 * @param filename - 저장할 파일명
 * @param mimeType - MIME 타입 (기본값: 'text/plain')
 */
export const downloadText = (text: string, filename: string, mimeType: string = 'text/plain'): void => {
  const blob = new Blob([text], { type: `${mimeType};charset=UTF-8` });
  downloadBlob(blob, filename);
};

/**
 * Base64 문자열을 파일로 다운로드
 * @param base64 - Base64 인코딩된 문자열
 * @param filename - 저장할 파일명
 * @param mimeType - MIME 타입
 */
export const downloadBase64 = (base64: string, filename: string, mimeType: string): void => {
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
};

/**
 * 클립보드에 텍스트 복사 (fallback으로 다운로드)
 * @param text - 복사할 텍스트
 * @param fallbackFilename - 클립보드 복사 실패 시 다운로드할 파일명
 * @returns 복사 성공 여부
 */
export const copyToClipboardWithFallback = async (
  text: string, 
  fallbackFilename: string
): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback: download as file
    downloadText(text, fallbackFilename);
    return false;
  }
};
