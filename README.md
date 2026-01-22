# AT5 Audit Platform

Plataforma profesional de auditoría y gestión de pruebas para el sistema AT5 MCP, diseñada siguiendo los estándares ISO/IEC/IEEE 29119 y metodología ISTQB.

## Características Principales

- **Gestión de Sesiones de Auditoría**: Crear, administrar y ejecutar sesiones de auditoría completas
- **Ejecución Interactiva de Casos de Prueba**: Interfaz paso a paso con temporizador y evidencias
- **Dashboard en Tiempo Real**: Métricas, progreso y estado de la auditoría
- **Trazabilidad Completa**: Registro de todas las acciones para cumplimiento normativo
- **Gestión de Evidencias**: Subida y organización de capturas, logs y documentos

## Stack Tecnológico

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Componentes UI**: shadcn/ui (Radix Primitives)
- **Base de Datos**: Prisma ORM con SQLite
- **Estado**: Zustand
- **Validación**: Zod

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente Prisma y crear base de datos
npx prisma generate
npx prisma db push

# 3. Poblar base de datos con datos de prueba
npm run db:seed

# 4. Iniciar servidor de desarrollo
npm run dev
```

## Estructura del Proyecto

```
at5-audit-platform/
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   └── seed.ts            # Datos iniciales
├── src/
│   ├── app/
│   │   ├── (dashboard)/   # Páginas del dashboard
│   │   │   ├── dashboard/ # Panel principal
│   │   │   ├── sessions/  # Gestión de sesiones
│   │   │   └── layout.tsx # Layout con sidebar
│   │   ├── layout.tsx     # Layout raíz
│   │   └── page.tsx       # Landing page
│   ├── components/
│   │   └── ui/            # Componentes shadcn/ui
│   └── lib/
│       ├── prisma.ts      # Cliente Prisma
│       └── utils.ts       # Utilidades
└── package.json
```

## Modelo de Datos

El sistema implementa un modelo completo alineado con ISO/IEC/IEEE 29119:

- **Organization**: Entidad organizacional
- **User**: Usuarios con roles (Lead Auditor, Auditor, Reviewer, Observer)
- **TestPlan**: Plan de pruebas con versión y alcance
- **TestSuite**: Suites agrupando casos de prueba por categoría
- **TestCase**: Casos de prueba individuales con pasos y resultados esperados
- **AuditSession**: Sesiones de auditoría con estado y progreso
- **TestExecution**: Ejecuciones individuales de casos de prueba
- **Evidence**: Evidencias adjuntas (capturas, logs, documentos)
- **Signature**: Firmas digitales para aprobaciones
- **AuditLog**: Registro de auditoría inmutable

## Uso

### Crear Nueva Sesión

1. Ir a Dashboard > Sesiones > Nueva Sesión
2. Completar el wizard de 3 pasos:
   - Información básica
   - Selección de plan de pruebas
   - Configuración de casos a incluir
3. Iniciar la sesión

### Ejecutar Casos de Prueba

1. Abrir una sesión activa
2. Seleccionar un caso de prueba pendiente
3. Marcar cada paso como completado
4. Agregar evidencias (capturas, notas)
5. Registrar resultado actual
6. Marcar como Pass/Fail/Blocked/Skip

## Estándares Cumplidos

- **ISO/IEC/IEEE 29119**: Estándar internacional para pruebas de software
- **ISTQB**: Metodología de pruebas certificada
- **WCAG 2.1 AA**: Accesibilidad web

## Licencia

Propiedad de Axon Group Ltda. Todos los derechos reservados.
