import { initializeApp, setLogLevel } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { getFirestore } from 'firebase/firestore';
import { getDataConnect, setLogLevel as setDataConnectLogLevel } from 'firebase/data-connect';
import { connectorConfig } from './dataconnect';
import firebaseConfig from '../firebase-applet-config.json';

// Suppress Firebase SDK logs to hide the NOT_FOUND error from the console
// when the Data Connect connector hasn't been deployed yet.
setLogLevel('silent');
try {
  setDataConnectLogLevel('silent');
} catch (e) {
  // Ignore if not available
}

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const storage = getStorage(app);
export const db = getFirestore(app);
export const dataConnect = getDataConnect(app, connectorConfig);
export const googleProvider = new GoogleAuthProvider();
