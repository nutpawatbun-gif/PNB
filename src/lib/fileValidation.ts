/**
 * Central Client-side File Size and Type Validation Helper
 * Ensures smooth performance and protects server bandwidth before uploading
 */

export interface FileValidationResult {
  valid: boolean;
  error?: string;
  formattedSize: string;
}

const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.sh', '.php', '.php3', '.phtml', '.py',
  '.js', '.vbs', '.ps1', '.dll', '.so', '.cgi', '.pl', '.jar', '.msi', '.scr', '.hta'
];

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export function validateUploadFile(file: File, maxMB = 10): FileValidationResult {
  const formattedSize = formatBytes(file.size);

  if (!file) {
    return { valid: false, error: 'กรุณาเลือกไฟล์ที่ต้องการอัปโหลด', formattedSize: '0 Bytes' };
  }

  // 1. Extension / Security check
  const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  if (DANGEROUS_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `ปฏิเสธการอัปโหลด: ไม่อนุญาตไฟล์ประเภทสกุล ${ext} เพื่อความปลอดภัยของระบบ`,
      formattedSize
    };
  }

  // 2. Max File Size Check
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    return {
      valid: false,
      error: `ขนาดไฟล์ (${formattedSize}) เกินขีดจำกัดที่อนุญาต (สูงสุด ${maxMB} MB) กรุณาย่อขนาดไฟล์หรือบีบอัดรูปภาพก่อนลองอีกครั้ง`,
      formattedSize
    };
  }

  return { valid: true, formattedSize };
}
