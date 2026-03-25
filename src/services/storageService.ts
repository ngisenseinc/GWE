import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';

export const uploadImageToStorage = async (file: File, folderName: string = 'inventory'): Promise<string> => {
  try {
    const timestamp = new Date().getTime();
    const uniqueFilename = `${timestamp}_${file.name}`;
    const storageRef = ref(storage, `${folderName}/${uniqueFilename}`);
    
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading to Firebase Storage:', error);
    throw error;
  }
};
