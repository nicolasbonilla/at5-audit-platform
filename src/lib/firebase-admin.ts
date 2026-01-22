import { initializeApp, getApps, cert, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

let app: App;
let db: Firestore;
let storage: Storage;

function initializeFirebaseAdmin() {
  if (getApps().length === 0) {
    // En producción, usar las credenciales del entorno
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      });
    } else {
      // En desarrollo local con emuladores o credenciales por defecto
      app = initializeApp({
        projectId: process.env.FIREBASE_PROJECT_ID || 'prueba-software-axon',
        storageBucket: `${process.env.FIREBASE_PROJECT_ID || 'prueba-software-axon'}.appspot.com`,
      });
    }
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);
  storage = getStorage(app);

  return { app, db, storage };
}

// Inicializar al importar
const firebase = initializeFirebaseAdmin();

export const firebaseAdmin = firebase.app;
export const firestoreDb = firebase.db;
export const firebaseStorage = firebase.storage;

// Colecciones
export const COLLECTIONS = {
  USERS: 'users',
  ORGANIZATIONS: 'organizations',
  SESSIONS: 'sessions',
  VERIFICATION_TOKENS: 'verificationTokens',
  PASSWORD_RESET_TOKENS: 'passwordResetTokens',
  TEST_PLANS: 'testPlans',
  TEST_SUITES: 'testSuites',
  TEST_CASES: 'testCases',
  AUDIT_SESSIONS: 'auditSessions',
  TEST_EXECUTIONS: 'testExecutions',
  EVIDENCE: 'evidence',
  SIGNATURES: 'signatures',
  REPORTS: 'reports',
  AUDIT_LOGS: 'auditLogs',
  COMMENTS: 'comments',
} as const;

// Tipos de colecciones
export type CollectionName = typeof COLLECTIONS[keyof typeof COLLECTIONS];
