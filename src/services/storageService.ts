import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { app, db } from './firebase';
import { Resource } from '../types';

const storage = getStorage(app);

/**
 * Upload PDF to Firebase Storage with progress callback
 */
export const uploadPdfToStorage = async (
  userId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> => {
  try {
    const filename = `${Date.now()}-${file.name}`;
    const fileRef = ref(storage, `pdfs/${userId}/${filename}`);

    console.log('[uploadPdfToStorage] Starting upload:', { userId, filename, fileSize: file.size });

    const uploadTask = uploadBytesResumable(fileRef, file);

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          console.log('[uploadPdfToStorage] Progress:', percent, '/', snapshot.totalBytes, 'bytes');
          onProgress?.(percent);
        },
        (error) => {
          console.error('[uploadPdfToStorage] Upload error:', error);
          reject(new Error(`Failed to upload PDF: ${error.message || error}`));
        },
        async () => {
          try {
            console.log('[uploadPdfToStorage] Upload complete, getting download URL...');
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('[uploadPdfToStorage] Download URL obtained:', downloadUrl.substring(0, 50) + '...');
            resolve(downloadUrl);
          } catch (e) {
            console.error('[uploadPdfToStorage] Failed to get download URL:', e);
            reject(new Error(`Failed to get download URL: ${e}`));
          }
        }
      );
    });
  } catch (error) {
    console.error('[uploadPdfToStorage] Outer error:', error);
    throw new Error(`Failed to upload PDF: ${error}`);
  }
};

/**
 * Save resource metadata to Firestore (optional, per-user collection)
 */
export const saveResourceMetadataToFirestore = async (
  userId: string,
  resource: Resource
): Promise<void> => {
  try {
    const userResources = collection(db, 'users', userId, 'resources');
    await addDoc(userResources, {
      ...resource,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Failed to save resource metadata to Firestore:', error);
    throw error;
  }
};

/**
 * Upload PDF with progress tracking
 */
export const uploadPdfWithProgress = async (
  userId: string,
  file: File,
  onProgress: (progress: number) => void
): Promise<string> => {
  try {
    const filename = `${userId}/${Date.now()}-${file.name}`;
    const fileRef = ref(storage, `pdfs/${filename}`);

    const uploadTask = uploadBytesResumable(fileRef, file);

    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const percent = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
          onProgress(percent);
        },
        (error) => reject(new Error(`Failed to upload PDF: ${error.message || error}`)),
        async () => {
          try {
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(downloadUrl);
          } catch (e) {
            reject(new Error(`Failed to get download URL: ${e}`));
          }
        }
      );
    });
  } catch (error) {
    throw new Error(`Failed to upload PDF: ${error}`);
  }
};

/**
 * Delete PDF from Firebase Storage
 */
export const deletePdfFromStorage = async (pdfUrl: string): Promise<void> => {
  try {
    // Extract the path from the download URL
    const urlPattern = /pdfs\/(.+)\?/;
    const match = pdfUrl.match(urlPattern);

    if (match && match[1]) {
      const filepath = decodeURIComponent(match[1]);
      const fileRef = ref(storage, `pdfs/${filepath}`);
      await deleteObject(fileRef);
    }
  } catch (error) {
    console.warn(`Failed to delete PDF from storage: ${error}`);
  }
};
