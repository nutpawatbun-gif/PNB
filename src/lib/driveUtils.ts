/**
 * Utility to convert various Google Drive file sharing URLs to direct embeddable web image URLs.
 */
export function getEmbeddableDriveUrl(url: string): string {
  if (!url) return '';
  
  const trimmed = url.trim();
  
  // Check if it is a Google Drive or Docs link
  if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
    // 1. Match pattern: /file/d/[ID]/view or /file/d/[ID]/edit
    const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileDMatch && fileDMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${fileDMatch[1]}`;
    }
    
    // 2. Match pattern: id=[ID] inside query parameters (e.g. ?id=xxx or &id=xxx)
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch && idMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${idMatch[1]}`;
    }

    // 3. Match pattern: folders/[ID] (just in case they try to pass folders)
    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) {
      return `https://lh3.googleusercontent.com/d/${folderMatch[1]}`;
    }
  }
  
  return trimmed;
}
