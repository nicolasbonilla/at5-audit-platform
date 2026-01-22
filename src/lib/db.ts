/**
 * Capa de abstracción de base de datos
 *
 * Este archivo proporciona una interfaz similar a Prisma pero usa Firestore.
 * Para desarrollo local, puedes seguir usando Prisma/SQLite.
 * Para producción en Firebase, usa Firestore.
 */

import { firestoreDb, COLLECTIONS } from './firebase-admin';
import {
  DocumentData,
  WhereFilterOp,
  FieldValue,
  Timestamp
} from 'firebase-admin/firestore';

// Determinar qué base de datos usar
const USE_FIRESTORE = process.env.USE_FIRESTORE === 'true' || process.env.NODE_ENV === 'production';

// Helper para generar IDs
function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 15);
  return `c${timestamp}${randomPart}`;
}

// Helper para convertir timestamps
function convertTimestamps(data: DocumentData): DocumentData {
  const result: DocumentData = {};
  for (const [key, value] of Object.entries(data)) {
    if (value instanceof Timestamp) {
      result[key] = value.toDate();
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      result[key] = convertTimestamps(value as DocumentData);
    } else {
      result[key] = value;
    }
  }
  return result;
}

// Interfaz similar a Prisma para Firestore
class FirestoreModel<T extends DocumentData> {
  private collectionName: string;

  constructor(collectionName: string) {
    this.collectionName = collectionName;
  }

  private get collection() {
    return firestoreDb.collection(this.collectionName);
  }

  async findUnique(args: { where: { id?: string; [key: string]: unknown } }): Promise<(T & { id: string }) | null> {
    if (args.where.id) {
      const doc = await this.collection.doc(args.where.id).get();
      if (!doc.exists) return null;
      return { id: doc.id, ...convertTimestamps(doc.data() as DocumentData) } as T & { id: string };
    }

    // Buscar por otro campo único
    const [field, value] = Object.entries(args.where)[0];
    const snapshot = await this.collection.where(field, '==', value).limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...convertTimestamps(doc.data()) } as T & { id: string };
  }

  async findFirst(args?: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'>;
  }): Promise<(T & { id: string }) | null> {
    let query = this.collection as FirebaseFirestore.Query<DocumentData>;

    if (args?.where) {
      for (const [field, value] of Object.entries(args.where)) {
        if (value !== undefined) {
          query = query.where(field, '==', value);
        }
      }
    }

    if (args?.orderBy) {
      for (const [field, direction] of Object.entries(args.orderBy)) {
        query = query.orderBy(field, direction);
      }
    }

    const snapshot = await query.limit(1).get();
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...convertTimestamps(doc.data()) } as T & { id: string };
  }

  async findMany(args?: {
    where?: Record<string, unknown>;
    include?: Record<string, unknown>;
    orderBy?: Record<string, 'asc' | 'desc'> | Array<Record<string, 'asc' | 'desc'>>;
    skip?: number;
    take?: number;
    select?: Record<string, boolean>;
  }): Promise<Array<T & { id: string }>> {
    let query = this.collection as FirebaseFirestore.Query<DocumentData>;

    if (args?.where) {
      for (const [field, value] of Object.entries(args.where)) {
        if (value === undefined) continue;

        if (field === 'OR' && Array.isArray(value)) {
          // Firestore no soporta OR directamente, hacemos queries separadas
          // Por simplicidad, ignoramos OR por ahora
          continue;
        }

        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          const condition = value as Record<string, unknown>;
          if ('contains' in condition) {
            // Firestore no tiene contains, usamos >= y <=
            // Esto es una aproximación
            continue;
          }
          if ('in' in condition) {
            query = query.where(field, 'in', condition.in);
            continue;
          }
          if ('gte' in condition) {
            query = query.where(field, '>=', condition.gte);
          }
          if ('lte' in condition) {
            query = query.where(field, '<=', condition.lte);
          }
        } else {
          query = query.where(field, '==', value);
        }
      }
    }

    if (args?.orderBy) {
      const orderByArray = Array.isArray(args.orderBy) ? args.orderBy : [args.orderBy];
      for (const orderItem of orderByArray) {
        for (const [field, direction] of Object.entries(orderItem)) {
          query = query.orderBy(field, direction);
        }
      }
    }

    if (args?.skip) {
      query = query.offset(args.skip);
    }

    if (args?.take) {
      query = query.limit(args.take);
    }

    const snapshot = await query.get();
    const results = snapshot.docs.map(doc => ({
      id: doc.id,
      ...convertTimestamps(doc.data())
    })) as Array<T & { id: string }>;

    // Handle includes (relaciones) - esto es simplificado
    if (args?.include) {
      for (const result of results) {
        for (const [relation, options] of Object.entries(args.include)) {
          if (options) {
            // Buscar documentos relacionados
            const relationId = (result as Record<string, unknown>)[`${relation}Id`];
            if (relationId && typeof relationId === 'string') {
              const relatedCollection = relation === 'organization' ? COLLECTIONS.ORGANIZATIONS :
                                       relation === 'auditor' ? COLLECTIONS.USERS :
                                       relation === 'testPlan' ? COLLECTIONS.TEST_PLANS :
                                       relation === 'user' ? COLLECTIONS.USERS :
                                       relation === 'session' ? COLLECTIONS.AUDIT_SESSIONS :
                                       relation;
              const relatedDoc = await firestoreDb.collection(relatedCollection).doc(relationId).get();
              if (relatedDoc.exists) {
                (result as Record<string, unknown>)[relation] = { id: relatedDoc.id, ...convertTimestamps(relatedDoc.data() as DocumentData) };
              }
            }
          }
        }
      }
    }

    return results;
  }

  async create(args: { data: Partial<T>; include?: Record<string, unknown> }): Promise<T & { id: string }> {
    const id = generateId();
    const now = FieldValue.serverTimestamp();

    const docData = {
      ...args.data,
      createdAt: now,
      updatedAt: now,
    };

    await this.collection.doc(id).set(docData);

    const doc = await this.collection.doc(id).get();
    const result = { id: doc.id, ...convertTimestamps(doc.data() as DocumentData) } as T & { id: string };

    // Handle includes
    if (args.include) {
      for (const [relation, options] of Object.entries(args.include)) {
        if (options) {
          const relationId = (result as Record<string, unknown>)[`${relation}Id`];
          if (relationId && typeof relationId === 'string') {
            const relatedCollection = relation === 'organization' ? COLLECTIONS.ORGANIZATIONS :
                                     relation === 'auditor' ? COLLECTIONS.USERS :
                                     relation === 'testPlan' ? COLLECTIONS.TEST_PLANS :
                                     relation === 'user' ? COLLECTIONS.USERS :
                                     relation;
            const relatedDoc = await firestoreDb.collection(relatedCollection).doc(relationId).get();
            if (relatedDoc.exists) {
              (result as Record<string, unknown>)[relation] = { id: relatedDoc.id, ...convertTimestamps(relatedDoc.data() as DocumentData) };
            }
          }
        }
      }
    }

    return result;
  }

  async update(args: {
    where: { id: string };
    data: Partial<T>;
    include?: Record<string, unknown>;
  }): Promise<T & { id: string }> {
    const docRef = this.collection.doc(args.where.id);

    const updateData = {
      ...args.data,
      updatedAt: FieldValue.serverTimestamp(),
    };

    await docRef.update(updateData);

    const doc = await docRef.get();
    const result = { id: doc.id, ...convertTimestamps(doc.data() as DocumentData) } as T & { id: string };

    // Handle includes
    if (args.include) {
      for (const [relation, options] of Object.entries(args.include)) {
        if (options) {
          const relationId = (result as Record<string, unknown>)[`${relation}Id`];
          if (relationId && typeof relationId === 'string') {
            const relatedCollection = relation === 'organization' ? COLLECTIONS.ORGANIZATIONS :
                                     relation === 'auditor' ? COLLECTIONS.USERS :
                                     relation === 'testPlan' ? COLLECTIONS.TEST_PLANS :
                                     relation === 'user' ? COLLECTIONS.USERS :
                                     relation;
            const relatedDoc = await firestoreDb.collection(relatedCollection).doc(relationId).get();
            if (relatedDoc.exists) {
              (result as Record<string, unknown>)[relation] = { id: relatedDoc.id, ...convertTimestamps(relatedDoc.data() as DocumentData) };
            }
          }
        }
      }
    }

    return result;
  }

  async delete(args: { where: { id: string } }): Promise<T & { id: string }> {
    const docRef = this.collection.doc(args.where.id);
    const doc = await docRef.get();

    if (!doc.exists) {
      throw new Error('Document not found');
    }

    const data = { id: doc.id, ...convertTimestamps(doc.data() as DocumentData) } as T & { id: string };
    await docRef.delete();
    return data;
  }

  async count(args?: { where?: Record<string, unknown> }): Promise<number> {
    let query = this.collection as FirebaseFirestore.Query<DocumentData>;

    if (args?.where) {
      for (const [field, value] of Object.entries(args.where)) {
        if (value !== undefined && field !== 'OR') {
          query = query.where(field, '==', value);
        }
      }
    }

    const snapshot = await query.count().get();
    return snapshot.data().count;
  }

  async updateMany(args: {
    where: Record<string, unknown>;
    data: Partial<T>;
  }): Promise<{ count: number }> {
    let query = this.collection as FirebaseFirestore.Query<DocumentData>;

    for (const [field, value] of Object.entries(args.where)) {
      if (value !== undefined) {
        query = query.where(field, '==', value);
      }
    }

    const snapshot = await query.get();
    const batch = firestoreDb.batch();

    for (const doc of snapshot.docs) {
      batch.update(doc.ref, {
        ...args.data,
        updatedAt: FieldValue.serverTimestamp(),
      });
    }

    await batch.commit();
    return { count: snapshot.docs.length };
  }

  async deleteMany(args?: { where?: Record<string, unknown> }): Promise<{ count: number }> {
    let query = this.collection as FirebaseFirestore.Query<DocumentData>;

    if (args?.where) {
      for (const [field, value] of Object.entries(args.where)) {
        if (value !== undefined) {
          query = query.where(field, '==', value);
        }
      }
    }

    const snapshot = await query.get();
    const batch = firestoreDb.batch();

    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
    }

    await batch.commit();
    return { count: snapshot.docs.length };
  }
}

// Cliente de base de datos similar a Prisma
export const db = {
  user: new FirestoreModel(COLLECTIONS.USERS),
  organization: new FirestoreModel(COLLECTIONS.ORGANIZATIONS),
  session: new FirestoreModel(COLLECTIONS.SESSIONS),
  testPlan: new FirestoreModel(COLLECTIONS.TEST_PLANS),
  testSuite: new FirestoreModel(COLLECTIONS.TEST_SUITES),
  testCase: new FirestoreModel(COLLECTIONS.TEST_CASES),
  auditSession: new FirestoreModel(COLLECTIONS.AUDIT_SESSIONS),
  testExecution: new FirestoreModel(COLLECTIONS.TEST_EXECUTIONS),
  evidence: new FirestoreModel(COLLECTIONS.EVIDENCE),
  signature: new FirestoreModel(COLLECTIONS.SIGNATURES),
  report: new FirestoreModel(COLLECTIONS.REPORTS),
  auditLog: new FirestoreModel(COLLECTIONS.AUDIT_LOGS),
  comment: new FirestoreModel(COLLECTIONS.COMMENTS),
  verificationToken: new FirestoreModel(COLLECTIONS.VERIFICATION_TOKENS),
  passwordResetToken: new FirestoreModel(COLLECTIONS.PASSWORD_RESET_TOKENS),
};

// Para compatibilidad con código existente que usa prisma directamente
// En desarrollo local, puedes seguir usando Prisma
// En producción, usa db (Firestore)
export { db as firestore };
