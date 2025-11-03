// Firebase Storage Operations for File Uploads
import { 
  getStorage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload writeup file (PDF/DOCX) to Firebase Storage
 * @param {File} file - The file to upload
 * @param {string} userId - User ID for folder organization
 * @param {Function} onProgress - Callback for upload progress (0-100)
 * @returns {Promise<Object>} { success, url, error }
 */
export const uploadWriteupFile = async (file, userId, onProgress = null) => {
  try {
    // Validate file type
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Invalid file type. Only PDF and DOCX allowed.' 
      };
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: 'File too large. Maximum size is 10MB.' 
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;
    
    // Upload to: writeups/{userId}/{filename}
    const storageRef = ref(storage, `writeups/${userId}/${filename}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Calculate progress percentage
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Upload error:', error);
          reject({ success: false, error: error.message });
        },
        async () => {
          // Upload complete, get download URL
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ 
              success: true, 
              url: downloadURL,
              filename: filename,
              path: `writeups/${userId}/${filename}`
            });
          } catch (error) {
            reject({ success: false, error: error.message });
          }
        }
      );
    });
  } catch (error) {
    console.error('Upload setup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Delete writeup file from Firebase Storage
 * @param {string} filePath - The storage path to delete
 * @returns {Promise<Object>} { success, error }
 */
export const deleteWriteupFile = async (filePath) => {
  try {
    const fileRef = ref(storage, filePath);
    await deleteObject(fileRef);
    return { success: true };
  } catch (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Upload screenshot/image for writeup
 * @param {File} file - Image file
 * @param {string} userId - User ID
 * @param {Function} onProgress - Upload progress callback
 * @returns {Promise<Object>} { success, url, error }
 */
export const uploadWriteupImage = async (file, userId, onProgress = null) => {
  try {
    // Validate image type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(file.type)) {
      return { 
        success: false, 
        error: 'Invalid image type. Only JPEG, PNG, GIF, WebP allowed.' 
      };
    }

    // Validate file size (max 5MB for images)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return { 
        success: false, 
        error: 'Image too large. Maximum size is 5MB.' 
      };
    }

    // Create unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filename = `${timestamp}_${sanitizedName}`;
    
    // Upload to: writeup_images/{userId}/{filename}
    const storageRef = ref(storage, `writeup_images/${userId}/${filename}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress));
          }
        },
        (error) => {
          console.error('Image upload error:', error);
          reject({ success: false, error: error.message });
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            resolve({ 
              success: true, 
              url: downloadURL,
              filename: filename,
              path: `writeup_images/${userId}/${filename}`
            });
          } catch (error) {
            reject({ success: false, error: error.message });
          }
        }
      );
    });
  } catch (error) {
    console.error('Image upload setup error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size (e.g., "2.5 MB")
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Validate file before upload
 * @param {File} file - File to validate
 * @param {string} type - 'document' or 'image'
 * @returns {Object} { valid, error }
 */
export const validateFile = (file, type = 'document') => {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (type === 'document') {
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword'
    ];
    const maxSize = 10 * 1024 * 1024; // 10MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only PDF and DOCX files allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'File size must be less than 10MB' };
    }
  } else if (type === 'image') {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'Only JPEG, PNG, GIF, WebP images allowed' };
    }

    if (file.size > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }
  }

  return { valid: true };
};

export default {
  uploadWriteupFile,
  deleteWriteupFile,
  uploadWriteupImage,
  formatFileSize,
  validateFile
};
