// ============================================================
// FixFlow — Firebase Storage Service
// Handles all file uploads: images, videos, audio, documents
// ============================================================

import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type UploadTask,
} from 'firebase/storage';
import { storage } from './firebase';

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/mov', 'video/webm', 'video/quicktime'];
export const ALLOWED_AUDIO_TYPES = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mpeg'];
export const ALL_ALLOWED_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES, ...ALLOWED_AUDIO_TYPES];

// Max file sizes
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
export const MAX_AUDIO_SIZE = 20 * 1024 * 1024; // 20MB

export interface UploadProgress {
  progress: number;
  downloadUrl?: string;
  error?: string;
}

export interface UploadResult {
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}

// Validate file before upload
export const validateFile = (file: File): { valid: boolean; error?: string } => {
  if (!ALL_ALLOWED_TYPES.includes(file.type)) {
    return { valid: false, error: `File type ${file.type} is not supported.` };
  }
  if (ALLOWED_IMAGE_TYPES.includes(file.type) && file.size > MAX_IMAGE_SIZE) {
    return { valid: false, error: 'Image files must be under 10MB.' };
  }
  if (ALLOWED_VIDEO_TYPES.includes(file.type) && file.size > MAX_VIDEO_SIZE) {
    return { valid: false, error: 'Video files must be under 100MB.' };
  }
  if (ALLOWED_AUDIO_TYPES.includes(file.type) && file.size > MAX_AUDIO_SIZE) {
    return { valid: false, error: 'Audio files must be under 20MB.' };
  }
  return { valid: true };
};

// Upload a single file with progress tracking
export const uploadFile = (
  file: File,
  path: string,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const uploadTask: UploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on(
      'state_changed',
      snapshot => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        onProgress?.(Math.round(progress));
      },
      error => {
        reject(new Error(`Upload failed: ${error.message}`));
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          url: downloadUrl,
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
        });
      }
    );
  });
};

// Upload ticket attachment
export const uploadTicketAttachment = (
  ticketId: string,
  file: File,
  attachmentType: 'evidence' | 'before' | 'progress' | 'completion',
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  const timestamp = Date.now();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path = `tickets/${ticketId}/${attachmentType}/${timestamp}_${safeName}`;
  return uploadFile(file, path, onProgress);
};

// Upload voice message
export const uploadVoiceMessage = (
  ticketId: string,
  audioBlob: Blob,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  const file = new File([audioBlob], `voice_${Date.now()}.wav`, { type: 'audio/wav' });
  const path = `tickets/${ticketId}/voice/${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Upload user avatar
export const uploadAvatar = (
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<UploadResult> => {
  const ext = file.name.split('.').pop();
  const path = `avatars/${userId}/avatar.${ext}`;
  return uploadFile(file, path, onProgress);
};

// Delete a file
export const deleteFile = async (url: string): Promise<void> => {
  try {
    const fileRef = ref(storage, url);
    await deleteObject(fileRef);
  } catch {
    // File may not exist, ignore
  }
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

// Get file icon based on type
export const getFileIcon = (fileType: string): string => {
  if (ALLOWED_IMAGE_TYPES.includes(fileType)) return 'image';
  if (ALLOWED_VIDEO_TYPES.includes(fileType)) return 'video';
  if (ALLOWED_AUDIO_TYPES.includes(fileType)) return 'audio';
  return 'file';
};
