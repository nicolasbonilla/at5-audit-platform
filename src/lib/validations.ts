import { z } from 'zod'

// ============================================
// Esquemas de Usuario
// ============================================

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres'),
})

export const userCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  email: z
    .string()
    .min(1, 'El email es requerido')
    .email('Formato de email inválido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida')
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'La contraseña debe contener al menos una mayúscula, una minúscula y un número'
    ),
  role: z.enum(['ADMIN', 'LEAD_AUDITOR', 'AUDITOR', 'REVIEWER', 'VIEWER'], {
    errorMap: () => ({ message: 'Rol inválido' }),
  }),
})

export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres')
    .optional(),
  email: z.string().email('Formato de email inválido').optional(),
  role: z
    .enum(['ADMIN', 'LEAD_AUDITOR', 'AUDITOR', 'REVIEWER', 'VIEWER'])
    .optional(),
  isActive: z.boolean().optional(),
})

// ============================================
// Esquemas de Plan de Pruebas
// ============================================

export const testPlanCreateSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es requerido')
    .min(3, 'El título debe tener al menos 3 caracteres')
    .max(200, 'El título no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  version: z
    .string()
    .regex(/^\d+\.\d+(\.\d+)?$/, 'Formato de versión inválido (ej: 1.0 o 1.0.0)')
    .optional(),
  status: z
    .enum(['DRAFT', 'ACTIVE', 'ARCHIVED'])
    .default('DRAFT'),
})

export const testPlanUpdateSchema = testPlanCreateSchema.partial()

// ============================================
// Esquemas de Suite de Pruebas
// ============================================

export const testSuiteCreateSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres'),
  description: z
    .string()
    .max(1000, 'La descripción no puede exceder 1000 caracteres')
    .optional(),
  order: z.number().int().min(0).default(0),
  testPlanId: z.string().uuid('ID de plan de pruebas inválido'),
})

export const testSuiteUpdateSchema = testSuiteCreateSchema.partial().omit({ testPlanId: true })

// ============================================
// Esquemas de Caso de Prueba
// ============================================

export const testCaseCreateSchema = z.object({
  code: z
    .string()
    .min(1, 'El código es requerido')
    .regex(/^[A-Z]{2,5}-\d{3,5}$/, 'Formato de código inválido (ej: TC-001, FAT-0001)'),
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(5, 'El nombre debe tener al menos 5 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  preconditions: z
    .string()
    .max(2000, 'Las precondiciones no pueden exceder 2000 caracteres')
    .optional(),
  steps: z
    .string()
    .min(1, 'Los pasos son requeridos')
    .max(5000, 'Los pasos no pueden exceder 5000 caracteres'),
  expectedResult: z
    .string()
    .min(1, 'El resultado esperado es requerido')
    .max(2000, 'El resultado esperado no puede exceder 2000 caracteres'),
  priority: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'], {
    errorMap: () => ({ message: 'Prioridad inválida' }),
  }),
  testType: z.enum(['FUNCTIONAL', 'REGRESSION', 'INTEGRATION', 'PERFORMANCE', 'SECURITY', 'USABILITY'], {
    errorMap: () => ({ message: 'Tipo de prueba inválido' }),
  }),
  order: z.number().int().min(0).default(0),
  testSuiteId: z.string().uuid('ID de suite inválido'),
})

export const testCaseUpdateSchema = testCaseCreateSchema.partial().omit({ testSuiteId: true })

// ============================================
// Esquemas de Sesión de Auditoría
// ============================================

// Schema base para crear sesiones (sin refinement para permitir extend)
export const auditSessionBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'El nombre es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres'),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  testPlanId: z.string().uuid('ID de plan de pruebas inválido'),
  auditorId: z.string().uuid('ID de auditor inválido').optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

// Schema con validación de fechas
export const auditSessionCreateSchema = auditSessionBaseSchema.refine(
  (data) => {
    if (data.startDate && data.endDate) {
      return data.endDate >= data.startDate
    }
    return true
  },
  {
    message: 'La fecha de fin debe ser posterior a la fecha de inicio',
    path: ['endDate'],
  }
)

export const auditSessionUpdateSchema = z.object({
  name: z
    .string()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(200, 'El nombre no puede exceder 200 caracteres')
    .optional(),
  description: z
    .string()
    .max(2000, 'La descripción no puede exceder 2000 caracteres')
    .optional(),
  status: z
    .enum(['DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED', 'CANCELLED'])
    .optional(),
  auditorId: z.string().uuid('ID de auditor inválido').optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
})

// ============================================
// Esquemas de Ejecución
// ============================================

export const executionCreateSchema = z.object({
  testCaseId: z.string().uuid('ID de caso de prueba inválido'),
  sessionId: z.string().uuid('ID de sesión inválido'),
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED'], {
    errorMap: () => ({ message: 'Estado inválido' }),
  }),
  actualResult: z
    .string()
    .max(5000, 'El resultado actual no puede exceder 5000 caracteres')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Las notas no pueden exceder 2000 caracteres')
    .optional(),
})

export const executionUpdateSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'PASSED', 'FAILED', 'BLOCKED', 'SKIPPED']).optional(),
  actualResult: z
    .string()
    .max(5000, 'El resultado actual no puede exceder 5000 caracteres')
    .optional(),
  notes: z
    .string()
    .max(2000, 'Las notas no pueden exceder 2000 caracteres')
    .optional(),
})

// ============================================
// Esquemas de Firma
// ============================================

export const signatureCreateSchema = z.object({
  sessionId: z.string().uuid('ID de sesión inválido'),
  signatureImage: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        return val.startsWith('data:image/')
      },
      { message: 'Formato de imagen de firma inválido' }
    ),
})

// ============================================
// Esquemas de Evidencia
// ============================================

export const evidenceUploadSchema = z.object({
  executionId: z.string().uuid('ID de ejecución inválido'),
  description: z
    .string()
    .max(500, 'La descripción no puede exceder 500 caracteres')
    .optional(),
})

// ============================================
// Esquemas de Filtros y Paginación
// ============================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export const auditLogFilterSchema = paginationSchema.extend({
  userId: z.string().uuid().optional(),
  sessionId: z.string().uuid().optional(),
  entity: z.string().max(50).optional(),
  action: z.string().max(50).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
})

export const sessionFilterSchema = paginationSchema.extend({
  status: z.enum(['DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED', 'CANCELLED']).optional(),
  auditorId: z.string().uuid().optional(),
  testPlanId: z.string().uuid().optional(),
  search: z.string().max(100).optional(),
})

// ============================================
// Tipos inferidos
// ============================================

export type LoginInput = z.infer<typeof loginSchema>
export type UserCreateInput = z.infer<typeof userCreateSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type TestPlanCreateInput = z.infer<typeof testPlanCreateSchema>
export type TestPlanUpdateInput = z.infer<typeof testPlanUpdateSchema>
export type TestSuiteCreateInput = z.infer<typeof testSuiteCreateSchema>
export type TestSuiteUpdateInput = z.infer<typeof testSuiteUpdateSchema>
export type TestCaseCreateInput = z.infer<typeof testCaseCreateSchema>
export type TestCaseUpdateInput = z.infer<typeof testCaseUpdateSchema>
export type AuditSessionCreateInput = z.infer<typeof auditSessionCreateSchema>
export type AuditSessionUpdateInput = z.infer<typeof auditSessionUpdateSchema>
export type ExecutionCreateInput = z.infer<typeof executionCreateSchema>
export type ExecutionUpdateInput = z.infer<typeof executionUpdateSchema>
export type SignatureCreateInput = z.infer<typeof signatureCreateSchema>
export type EvidenceUploadInput = z.infer<typeof evidenceUploadSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
export type AuditLogFilterInput = z.infer<typeof auditLogFilterSchema>
export type SessionFilterInput = z.infer<typeof sessionFilterSchema>

// ============================================
// Utilidades de validación
// ============================================

export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  }
  return {
    success: false,
    errors: result.error.errors.map((e) => e.message),
  }
}

export function formatZodErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const issue of error.errors) {
    const path = issue.path.join('.')
    errors[path] = issue.message
  }
  return errors
}
