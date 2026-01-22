import { firestoreDb, COLLECTIONS } from './firebase-admin';
import {
  DocumentData,
  QueryDocumentSnapshot,
  WhereFilterOp,
  OrderByDirection,
  FieldValue,
  Timestamp
} from 'firebase-admin/firestore';

// Tipos base
export type FirestoreDoc<T> = T & { id: string };

// Convertir Timestamp a Date y viceversa
export function toDate(timestamp: Timestamp | Date | null | undefined): Date | null {
  if (!timestamp) return null;
  if (timestamp instanceof Date) return timestamp;
  return timestamp.toDate();
}

export function toTimestamp(date: Date | string | null | undefined): Timestamp | null {
  if (!date) return null;
  if (typeof date === 'string') return Timestamp.fromDate(new Date(date));
  return Timestamp.fromDate(date);
}

// Convertir documento de Firestore a objeto con fechas
function convertDoc<T>(doc: QueryDocumentSnapshot<DocumentData>): FirestoreDoc<T> {
  const data = doc.data();
  const converted: Record<string, unknown> = { id: doc.id };

  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      converted[key] = value.toDate();
    } else {
      converted[key] = value;
    }
  }

  return converted as FirestoreDoc<T>;
}

// Generar ID único similar a cuid
export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `${timestamp}${randomPart}`;
}

// Clase genérica para operaciones CRUD
export class FirestoreRepository<T extends Record<string, unknown>> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private get collection() {
    return firestoreDb.collection(this.collectionName);
  }

  // Crear documento
  async create(data: Omit<T, 'id'>): Promise<FirestoreDoc<T>> {
    const id = generateId();
    const now = FieldValue.serverTimestamp();

    const docData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.doc(id).set(docData);

    const doc = await this.collection.doc(id).get();
    return convertDoc<T>(doc as QueryDocumentSnapshot<DocumentData>);
  }

  // Crear con ID específico
  async createWithId(id: string, data: Omit<T, 'id'>): Promise<FirestoreDoc<T>> {
    const now = FieldValue.serverTimestamp();

    const docData = {
      ...data,
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.doc(id).set(docData);

    const doc = await this.collection.doc(id).get();
    return convertDoc<T>(doc as QueryDocumentSnapshot<DocumentData>);
  }

  // Obtener por ID
  async findById(id: string): Promise<FirestoreDoc<T> | null> {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) return null;
    return convertDoc<T>(doc as QueryDocumentSnapshot<DocumentData>);
  }

  // Obtener único por campo
  async findUnique(field: string, value: unknown): Promise<FirestoreDoc<T> | null> {
    const snapshot = await this.collection.where(field, '==', value).limit(1).get();
    if (snapshot.empty) return null;
    return convertDoc<T>(snapshot.docs[0]);
  }

  // Obtener todos
  async findMany(options?: {
    where?: Array<{ field: string; op: WhereFilterOp; value: unknown }>;
    orderBy?: { field: string; direction: OrderByDirection };
    limit?: number;
    offset?: number;
  }): Promise<FirestoreDoc<T>[]> {
    let query = this.collection as FirebaseFirestore.Query<DocumentData>;

    if (options?.where) {
      for (const condition of options.where) {
        query = query.where(condition.field, condition.op, condition.value);
      }
    }

    if (options?.orderBy) {
      query = query.orderBy(options.orderBy.field, options.orderBy.direction);
    }

    if (options?.offset) {
      query = query.offset(options.offset);
    }

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => convertDoc<T>(doc));
  }

  // Actualizar
  async update(id: string, data: Partial<T>): Promise<FirestoreDoc<T> | null> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return null;

    const updateData = {
      ...data,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.update(updateData);

    const updated = await docRef.get();
    return convertDoc<T>(updated as QueryDocumentSnapshot<DocumentData>);
  }

  // Eliminar
  async delete(id: string): Promise<boolean> {
    const docRef = this.collection.doc(id);
    const doc = await docRef.get();

    if (!doc.exists) return false;

    await docRef.delete();
    return true;
  }

  // Eliminar múltiples
  async deleteMany(ids: string[]): Promise<number> {
    const batch = firestoreDb.batch();

    for (const id of ids) {
      batch.delete(this.collection.doc(id));
    }

    await batch.commit();
    return ids.length;
  }

  // Contar documentos
  async count(where?: Array<{ field: string; op: WhereFilterOp; value: unknown }>): Promise<number> {
    let query = this.collection as FirebaseFirestore.Query<DocumentData>;

    if (where) {
      for (const condition of where) {
        query = query.where(condition.field, condition.op, condition.value);
      }
    }

    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  // Verificar existencia
  async exists(id: string): Promise<boolean> {
    const doc = await this.collection.doc(id).get();
    return doc.exists;
  }

  // Transacción
  async runTransaction<R>(
    updateFunction: (transaction: FirebaseFirestore.Transaction) => Promise<R>
  ): Promise<R> {
    return firestoreDb.runTransaction(updateFunction);
  }
}

// Repositorios específicos
export const usersRepo = new FirestoreRepository(COLLECTIONS.USERS);
export const organizationsRepo = new FirestoreRepository(COLLECTIONS.ORGANIZATIONS);
export const sessionsRepo = new FirestoreRepository(COLLECTIONS.SESSIONS);
export const testPlansRepo = new FirestoreRepository(COLLECTIONS.TEST_PLANS);
export const testSuitesRepo = new FirestoreRepository(COLLECTIONS.TEST_SUITES);
export const testCasesRepo = new FirestoreRepository(COLLECTIONS.TEST_CASES);
export const auditSessionsRepo = new FirestoreRepository(COLLECTIONS.AUDIT_SESSIONS);
export const testExecutionsRepo = new FirestoreRepository(COLLECTIONS.TEST_EXECUTIONS);
export const evidenceRepo = new FirestoreRepository(COLLECTIONS.EVIDENCE);
export const signaturesRepo = new FirestoreRepository(COLLECTIONS.SIGNATURES);
export const reportsRepo = new FirestoreRepository(COLLECTIONS.REPORTS);
export const auditLogsRepo = new FirestoreRepository(COLLECTIONS.AUDIT_LOGS);
export const commentsRepo = new FirestoreRepository(COLLECTIONS.COMMENTS);
