import { PrismaClient, UserRole, Priority, TestType, SessionStatus, ExecutionStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Hash de contrasena por defecto
  const defaultPassword = await bcrypt.hash('audit2026', 12)

  // Create Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Axon Group Ltda',
      description: 'Empresa de software industrial especializada en protocolos SCADA',
    },
  })
  console.log('Organization created')

  // Create Admin User
  const admin = await prisma.user.create({
    data: {
      email: 'admin@axongroup.com',
      name: 'Administrador',
      password: defaultPassword,
      role: UserRole.ADMIN,
      organizationId: org.id,
      isActive: true,
    },
  })

  // Create Users
  const leadAuditor = await prisma.user.create({
    data: {
      email: 'garcia@axongroup.com',
      name: 'Dr. Garcia',
      password: defaultPassword,
      role: UserRole.LEAD_AUDITOR,
      organizationId: org.id,
      isActive: true,
    },
  })

  const auditor = await prisma.user.create({
    data: {
      email: 'lopez@axongroup.com',
      name: 'Ing. Lopez',
      password: defaultPassword,
      role: UserRole.AUDITOR,
      organizationId: org.id,
      isActive: true,
    },
  })

  const reviewer = await prisma.user.create({
    data: {
      email: 'martinez@axongroup.com',
      name: 'Dr. Martinez',
      password: defaultPassword,
      role: UserRole.REVIEWER,
      organizationId: org.id,
      isActive: true,
    },
  })

  const viewer = await prisma.user.create({
    data: {
      email: 'observador@axongroup.com',
      name: 'Observador',
      password: defaultPassword,
      role: UserRole.VIEWER,
      organizationId: org.id,
      isActive: true,
    },
  })
  console.log('Users created')

  // Create Test Plan
  const testPlan = await prisma.testPlan.create({
    data: {
      title: 'Plan de Pruebas AT5 MCP v1.0',
      version: '1.0.0',
      description: 'Plan de pruebas integral para el sistema AT5 MCP con 33+ herramientas y 7 agentes especializados',
      scope: 'Sistema completo AT5 MCP incluyendo agentes, herramientas MCP, proveedores LLM y sistema RAG',
      objectives: 'Validar la funcionalidad completa del sistema de IA Assistant integrado en AT5 Workbench',
      organizationId: org.id,
    },
  })
  console.log('Test Plan created')

  // Create Test Suites and Test Cases
  const categories = [
    {
      name: 'PROYECTOS',
      description: 'Pruebas de gestion de proyectos AT5',
      cases: [
        { code: 'TC-PRJ-001', name: 'Verificar listado de proyectos', priority: Priority.CRITICAL, expectedResult: 'Lista de proyectos disponibles' },
        { code: 'TC-PRJ-002', name: 'Crear nuevo proyecto', priority: Priority.HIGH, expectedResult: 'Proyecto creado exitosamente' },
        { code: 'TC-PRJ-003', name: 'Abrir proyecto existente', priority: Priority.HIGH, expectedResult: 'Proyecto abierto en el workbench' },
        { code: 'TC-PRJ-004', name: 'Cerrar proyecto', priority: Priority.MEDIUM, expectedResult: 'Proyecto cerrado correctamente' },
        { code: 'TC-PRJ-005', name: 'Guardar proyecto como', priority: Priority.MEDIUM, expectedResult: 'Proyecto guardado con nuevo nombre' },
        { code: 'TC-PRJ-006', name: 'Obtener estado del proyecto', priority: Priority.LOW, expectedResult: 'Estado del proyecto mostrado' },
      ],
    },
    {
      name: 'DISPOSITIVOS',
      description: 'Pruebas de gestion de dispositivos',
      cases: [
        { code: 'TC-DEV-001', name: 'Listar dispositivos', priority: Priority.HIGH, expectedResult: 'Lista de dispositivos del proyecto' },
        { code: 'TC-DEV-002', name: 'Crear dispositivo IEC104', priority: Priority.CRITICAL, expectedResult: 'Dispositivo IEC104 creado' },
        { code: 'TC-DEV-003', name: 'Crear dispositivo Modbus', priority: Priority.HIGH, expectedResult: 'Dispositivo Modbus creado' },
        { code: 'TC-DEV-004', name: 'Configurar dispositivo DNP3', priority: Priority.HIGH, expectedResult: 'Dispositivo DNP3 configurado' },
        { code: 'TC-DEV-005', name: 'Modificar parametros de dispositivo', priority: Priority.MEDIUM, expectedResult: 'Parametros modificados' },
        { code: 'TC-DEV-006', name: 'Eliminar dispositivo', priority: Priority.MEDIUM, expectedResult: 'Dispositivo eliminado' },
        { code: 'TC-DEV-007', name: 'Duplicar dispositivo', priority: Priority.LOW, expectedResult: 'Dispositivo duplicado' },
      ],
    },
    {
      name: 'SENALES',
      description: 'Pruebas de lectura y escritura de senales',
      cases: [
        { code: 'TC-SIG-001', name: 'Leer senal digital', priority: Priority.HIGH, expectedResult: 'Valor de senal digital leido' },
        { code: 'TC-SIG-002', name: 'Escribir senal analogica', priority: Priority.CRITICAL, expectedResult: 'Valor escrito correctamente' },
        { code: 'TC-SIG-003', name: 'Leer multiples senales', priority: Priority.HIGH, expectedResult: 'Valores de senales leidos' },
        { code: 'TC-SIG-004', name: 'Monitorear senal en tiempo real', priority: Priority.MEDIUM, expectedResult: 'Monitoreo activo' },
        { code: 'TC-SIG-005', name: 'Exportar valores de senales', priority: Priority.LOW, expectedResult: 'Valores exportados' },
      ],
    },
    {
      name: 'LOTES',
      description: 'Pruebas de operaciones batch',
      cases: [
        { code: 'TC-BAT-001', name: 'Crear dispositivos en lote', priority: Priority.HIGH, expectedResult: 'Dispositivos creados' },
        { code: 'TC-BAT-002', name: 'Modificar dispositivos en lote', priority: Priority.MEDIUM, expectedResult: 'Dispositivos modificados' },
      ],
    },
    {
      name: 'TEMPLATES',
      description: 'Pruebas de plantillas de dispositivos',
      cases: [
        { code: 'TC-TPL-001', name: 'Listar templates disponibles', priority: Priority.MEDIUM, expectedResult: 'Lista de templates' },
        { code: 'TC-TPL-002', name: 'Aplicar template a dispositivo', priority: Priority.HIGH, expectedResult: 'Template aplicado' },
        { code: 'TC-TPL-003', name: 'Crear dispositivo desde template', priority: Priority.HIGH, expectedResult: 'Dispositivo creado' },
      ],
    },
    {
      name: 'TRAFICO',
      description: 'Pruebas de control de trafico',
      cases: [
        { code: 'TC-TRF-001', name: 'Iniciar trafico de dispositivo', priority: Priority.CRITICAL, expectedResult: 'Trafico iniciado' },
        { code: 'TC-TRF-002', name: 'Detener trafico de dispositivo', priority: Priority.CRITICAL, expectedResult: 'Trafico detenido' },
        { code: 'TC-TRF-003', name: 'Verificar estado de comunicacion', priority: Priority.HIGH, expectedResult: 'Estado mostrado' },
      ],
    },
    {
      name: 'REPORTES',
      description: 'Pruebas de generacion de reportes',
      cases: [
        { code: 'TC-RPT-001', name: 'Generar reporte de proyecto', priority: Priority.MEDIUM, expectedResult: 'Reporte generado' },
        { code: 'TC-RPT-002', name: 'Exportar reporte a PDF', priority: Priority.MEDIUM, expectedResult: 'PDF generado' },
        { code: 'TC-RPT-003', name: 'Generar historial de senales', priority: Priority.HIGH, expectedResult: 'Historial generado' },
        { code: 'TC-RPT-004', name: 'Exportar configuracion', priority: Priority.LOW, expectedResult: 'Configuracion exportada' },
      ],
    },
    {
      name: 'ESCENARIOS',
      description: 'Pruebas de ejecucion de escenarios',
      cases: [
        { code: 'TC-SCN-001', name: 'Listar escenarios', priority: Priority.MEDIUM, expectedResult: 'Lista de escenarios' },
        { code: 'TC-SCN-002', name: 'Ejecutar escenario', priority: Priority.HIGH, expectedResult: 'Escenario ejecutado' },
        { code: 'TC-SCN-003', name: 'Detener escenario', priority: Priority.HIGH, expectedResult: 'Escenario detenido' },
      ],
    },
  ]

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i]
    const suite = await prisma.testSuite.create({
      data: {
        name: cat.name,
        description: cat.description,
        category: cat.name,
        order: i,
        testPlanId: testPlan.id,
      },
    })

    for (const tc of cat.cases) {
      await prisma.testCase.create({
        data: {
          code: tc.code,
          name: tc.name,
          description: `Caso de prueba para ${tc.name.toLowerCase()}`,
          preconditions: 'AT5 Workbench iniciado, Plugin IA Assistant activo',
          steps: JSON.stringify([
            { step: 1, description: 'Abrir el chat del asistente IA' },
            { step: 2, description: 'Ejecutar el comando correspondiente' },
            { step: 3, description: 'Verificar la respuesta del sistema' },
            { step: 4, description: 'Confirmar el resultado esperado' },
          ]),
          expectedResult: tc.expectedResult,
          priority: tc.priority,
          testType: TestType.FUNCTIONAL,
          estimatedTime: 5,
          testSuiteId: suite.id,
        },
      })
    }
  }
  console.log('Test Suites and Test Cases created')

  // Create a sample Audit Session
  const session = await prisma.auditSession.create({
    data: {
      name: 'Auditoria AT5 MCP v1.0 - Sprint 23',
      description: 'Auditoria completa del sistema MCP con todos los agentes especializados',
      status: SessionStatus.IN_PROGRESS,
      startDate: new Date(),
      auditorId: leadAuditor.id,
      testPlanId: testPlan.id,
      progress: 65,
      passedCount: 21,
      failedCount: 2,
      blockedCount: 1,
      skippedCount: 0,
      totalCount: 33,
    },
  })
  console.log('Audit Session created')

  // Create audit log entry for seed
  await prisma.auditLog.create({
    data: {
      action: 'SEED_DATABASE',
      entity: 'System',
      entityId: 'seed',
      userId: admin.id,
      details: 'Base de datos inicializada con datos de prueba',
    },
  })

  console.log('Database seeded successfully!')
  console.log('')
  console.log('=== Usuarios disponibles ===')
  console.log('admin@axongroup.com     - Administrador (ADMIN)')
  console.log('garcia@axongroup.com    - Dr. Garcia (LEAD_AUDITOR)')
  console.log('lopez@axongroup.com     - Ing. Lopez (AUDITOR)')
  console.log('martinez@axongroup.com  - Dr. Martinez (REVIEWER)')
  console.log('observador@axongroup.com - Observador (VIEWER)')
  console.log('')
  console.log('Contrasena para todos: audit2026')
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
