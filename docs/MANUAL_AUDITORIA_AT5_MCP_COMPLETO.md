---
pdf_options:
  format: A4
  margin: 20mm 18mm
  printBackground: true
  headerTemplate: |
    <style>
      section { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8px; width: 100%; padding: 0 18mm; }
      .left { float: left; color: #0d9488; font-weight: bold; }
      .right { float: right; color: #666; }
    </style>
    <section>
      <span class="left">MANUAL DE AUDITORIA AT5 MCP - GUIA COMPLETA DE EJECUCION</span>
      <span class="right">ISO/IEC/IEEE 29119 | ISTQB | Enero 2026</span>
    </section>
  footerTemplate: |
    <style>
      section { font-family: 'Segoe UI', Arial, sans-serif; font-size: 8px; width: 100%; padding: 0 18mm; text-align: center; color: #666; }
    </style>
    <section>
      Pagina <span class="pageNumber"></span> de <span class="totalPages"></span> | AT5 Audit Platform v1.0 | Documento Confidencial
    </section>
  displayHeaderFooter: true
css: |
  body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; line-height: 1.5; color: #1a1a1a; }
  h1 { color: #0d9488; border-bottom: 3px solid #0d9488; padding-bottom: 8px; margin-top: 30px; font-size: 22pt; page-break-before: always; }
  h1:first-of-type { page-break-before: avoid; text-align: center; font-size: 26pt; }
  h2 { color: #115e59; border-bottom: 2px solid #14b8a6; padding-bottom: 4px; margin-top: 25px; font-size: 16pt; }
  h3 { color: #134e4a; margin-top: 20px; font-size: 13pt; border-left: 4px solid #14b8a6; padding-left: 10px; }
  h4 { color: #1f2937; font-size: 11pt; margin-top: 15px; }
  h5 { color: #374151; font-size: 10pt; margin-top: 12px; font-style: italic; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0; font-size: 9pt; }
  th { background-color: #0d9488; color: white; padding: 8px 6px; text-align: left; }
  td { padding: 6px; border: 1px solid #d1d5db; }
  tr:nth-child(even) { background-color: #f0fdfa; }
  code { background-color: #f3f4f6; padding: 1px 4px; border-radius: 3px; font-family: Consolas, monospace; font-size: 9pt; color: #0d9488; }
  pre { background-color: #1f2937; color: #f9fafb; padding: 12px; border-radius: 6px; font-size: 8pt; line-height: 1.3; border-left: 4px solid #0d9488; overflow-x: auto; }
  pre code { background: none; color: #f9fafb; padding: 0; }
  blockquote { border-left: 4px solid #f59e0b; background-color: #fffbeb; padding: 10px 15px; margin: 12px 0; border-radius: 0 6px 6px 0; }
  .tip { border-left: 4px solid #10b981; background-color: #ecfdf5; padding: 10px 15px; margin: 12px 0; border-radius: 0 6px 6px 0; }
  .warning { border-left: 4px solid #ef4444; background-color: #fef2f2; padding: 10px 15px; margin: 12px 0; border-radius: 0 6px 6px 0; }
  .step-box { border: 2px solid #0d9488; border-radius: 8px; padding: 15px; margin: 15px 0; background-color: #f0fdfa; }
  hr { border: none; border-top: 2px solid #0d9488; margin: 25px 0; }
  strong { color: #0d9488; }
  @media print { h1 { page-break-before: always; } h1:first-of-type { page-break-before: avoid; } pre, table, .step-box { page-break-inside: avoid; } }
---

# MANUAL COMPLETO DE AUDITORIA
# Sistema AT5 MCP usando AT5 Audit Platform

## Guia Paso a Paso para la Ejecucion Completa de la Auditoria de Software

---

| Campo | Valor |
|-------|-------|
| **Documento** | Manual de Auditoria AT5 MCP |
| **Version** | 1.0.0 |
| **Fecha** | Enero 2026 |
| **Sistema Bajo Prueba (SUT)** | AT5 MCP System v1.0 |
| **Herramienta de Auditoria** | AT5 Audit Platform (Web Application) |
| **Total Casos de Prueba** | 33 casos en 8 suites |
| **Estandares** | ISO/IEC/IEEE 29119, ISTQB, IEEE 829 |
| **Clasificacion** | Documento Operativo - Nivel Profesional |

---

## INDICE GENERAL

**PARTE I - PREPARACION DE LA AUDITORIA**
1. Introduccion y Objetivos
2. Arquitectura del Proceso de Auditoria
3. Requisitos Previos y Configuracion del Ambiente
4. Acceso a AT5 Audit Platform

**PARTE II - CONFIGURACION DE LA SESION DE AUDITORIA**
5. Creacion de la Sesion de Auditoria
6. Comprension del Plan de Pruebas AT5 MCP
7. Inicio de la Auditoria

**PARTE III - EJECUCION DE CASOS DE PRUEBA**
8. Suite PRJ: Gestion de Proyectos (5 casos)
9. Suite DEV: Gestion de Dispositivos (7 casos)
10. Suite SIG: Gestion de Senales (5 casos)
11. Suite RAG: Sistema RAG y Documentacion (3 casos)
12. Suite BAT: Operaciones Batch (2 casos)
13. Suite TPL: Templates (3 casos)
14. Suite RPT: Reportes y Exportacion (3 casos)
15. Suite TRF: Trafico y Analisis (2 casos)

**PARTE IV - FINALIZACION DE LA AUDITORIA**
16. Revision de Resultados
17. Proceso de Firma y Aprobacion
18. Generacion de Reportes Finales
19. Archivado de la Auditoria

**ANEXOS**
A. Checklist de Verificacion Pre-Auditoria
B. Plantilla de Registro de Defectos
C. Glosario de Terminos
D. Resolucion de Problemas

---

# PARTE I - PREPARACION DE LA AUDITORIA

---

## 1. Introduccion y Objetivos

### 1.1 Proposito de este Manual

Este manual proporciona una guia **completa, detallada y paso a paso** para ejecutar la auditoria del sistema **AT5 MCP** utilizando la aplicacion web **AT5 Audit Platform**. El documento esta disenado para que cualquier auditor, siguiendo las instrucciones al pie de la letra, pueda completar exitosamente la auditoria de las 33 pruebas definidas en el Plan de Pruebas AT5 MCP 2026.

### 1.2 Que es AT5 MCP (Sistema Bajo Prueba)

**AT5 MCP** es un sistema industrial de tipo SCADA que incluye:

| Componente | Descripcion | Cantidad |
|------------|-------------|----------|
| **Agentes IA** | Agentes especializados con orquestador | 7 agentes |
| **Herramientas MCP** | Tools para operaciones del sistema | 30+ herramientas |
| **Proveedores LLM** | Integracion con modelos de lenguaje | 8 proveedores |
| **Protocolos Industriales** | Comunicacion SCADA | IEC104, Modbus, DNP3, IEC61850 |
| **Sistema RAG** | Consultas de documentacion | 1 sistema |

### 1.3 Que es AT5 Audit Platform (Herramienta de Auditoria)

**AT5 Audit Platform** es la aplicacion web que utilizaremos para:

- Gestionar sesiones de auditoria
- Ejecutar casos de prueba de forma interactiva
- Documentar resultados y agregar evidencias
- Firmar digitalmente las aprobaciones
- Generar reportes de auditoria
- Mantener trazabilidad completa con audit log inmutable

### 1.4 Objetivos de la Auditoria

| ID | Objetivo | Prioridad | Casos Relacionados |
|----|----------|-----------|-------------------|
| OBJ-001 | Validar funcionalidad de herramientas MCP | CRITICA | TC-PRJ-*, TC-DEV-*, TC-SIG-* |
| OBJ-002 | Verificar integracion entre agentes | ALTA | TC-DEV-007, TC-RAG-* |
| OBJ-003 | Comprobar sistema RAG | ALTA | TC-RAG-001, TC-RAG-002, TC-RAG-003 |
| OBJ-004 | Validar protocolos industriales | CRITICA | TC-DEV-001, TC-DEV-002 |
| OBJ-005 | Verificar gestion de proyectos/dispositivos | ALTA | TC-PRJ-*, TC-DEV-* |
| OBJ-006 | Probar operaciones batch | MEDIA | TC-BAT-001, TC-BAT-002 |
| OBJ-007 | Validar exportacion y reportes | MEDIA | TC-RPT-* |

### 1.5 Estructura del Plan de Pruebas

El Plan de Pruebas AT5 MCP 2026 contiene **33 casos de prueba** organizados en **8 suites**:

| Suite | Nombre | Casos | Prioridad General |
|-------|--------|-------|-------------------|
| PRJ | Gestion de Proyectos | 5 | ALTA |
| DEV | Gestion de Dispositivos | 7 | CRITICA |
| SIG | Gestion de Senales | 5 | CRITICA |
| RAG | Sistema RAG y Documentacion | 3 | ALTA |
| BAT | Operaciones Batch | 2 | ALTA |
| TPL | Templates | 3 | MEDIA |
| RPT | Reportes y Exportacion | 3 | MEDIA |
| TRF | Trafico y Analisis | 2 | ALTA |
| **TOTAL** | | **33** | |

### 1.6 Tiempo Estimado de Auditoria

| Fase | Actividad | Tiempo Estimado |
|------|-----------|-----------------|
| Preparacion | Configuracion del ambiente | 30 minutos |
| Configuracion | Crear sesion en AT5 Audit Platform | 15 minutos |
| Ejecucion | 33 casos de prueba | 6-8 horas |
| Documentacion | Agregar evidencias | Incluido en ejecucion |
| Revision | Verificar resultados | 30 minutos |
| Aprobacion | Firmas digitales | 15 minutos |
| Reportes | Generacion de informes | 15 minutos |
| **TOTAL** | | **8-10 horas** |

---

## 2. Arquitectura del Proceso de Auditoria

### 2.1 Diagrama del Proceso Completo

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    PROCESO DE AUDITORIA AT5 MCP                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ FASE 1: PREPARACION                                                  │   │
│  │ ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐         │   │
│  │ │Verificar  │─▶│Configurar │─▶│Verificar  │─▶│Preparar   │         │   │
│  │ │Requisitos │  │Ambiente   │  │AT5 MCP    │  │Evidencias │         │   │
│  │ └───────────┘  └───────────┘  └───────────┘  └───────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ FASE 2: CONFIGURACION EN AT5 AUDIT PLATFORM                         │   │
│  │ ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐         │   │
│  │ │Login      │─▶│Crear      │─▶│Seleccionar│─▶│Iniciar    │         │   │
│  │ │Sistema    │  │Sesion     │  │Plan Prueba│  │Auditoria  │         │   │
│  │ └───────────┘  └───────────┘  └───────────┘  └───────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ FASE 3: EJECUCION DE PRUEBAS (33 CASOS)                             │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │              CICLO POR CADA CASO DE PRUEBA                   │   │   │
│  │  │                                                              │   │   │
│  │  │  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐  │   │   │
│  │  │  │Leer     │───▶│Ejecutar │───▶│Documentar│───▶│Agregar  │  │   │   │
│  │  │  │Caso     │    │en AT5   │    │Resultado │    │Evidencia│  │   │   │
│  │  │  │Prueba   │    │MCP      │    │Actual    │    │         │  │   │   │
│  │  │  └─────────┘    └─────────┘    └─────────┘    └─────────┘  │   │   │
│  │  │       │                                              │      │   │   │
│  │  │       │         ┌─────────┐                          │      │   │   │
│  │  │       │         │Registrar│◀─────────────────────────┘      │   │   │
│  │  │       │         │PASSED/  │                                 │   │   │
│  │  │       │         │FAILED/  │                                 │   │   │
│  │  │       │         │BLOCKED  │                                 │   │   │
│  │  │       │         └────┬────┘                                 │   │   │
│  │  │       │              │                                      │   │   │
│  │  │       └──────────────┴───────── Siguiente caso ────────────▶│   │   │
│  │  │                                                              │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  │  Suite PRJ (5) ─▶ Suite DEV (7) ─▶ Suite SIG (5) ─▶ Suite RAG (3)  │   │
│  │       │                                                              │   │
│  │       └──▶ Suite BAT (2) ─▶ Suite TPL (3) ─▶ Suite RPT (3) ─▶      │   │
│  │                                                  Suite TRF (2)      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ FASE 4: REVISION Y APROBACION                                       │   │
│  │ ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐         │   │
│  │ │Revisar    │─▶│Enviar a   │─▶│Firma Lead │─▶│Firma      │         │   │
│  │ │Resultados │  │Revision   │  │Auditor    │  │Reviewer   │         │   │
│  │ └───────────┘  └───────────┘  └───────────┘  └───────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│                                    ▼                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ FASE 5: DOCUMENTACION FINAL                                         │   │
│  │ ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐         │   │
│  │ │Generar    │─▶│Generar    │─▶│Exportar   │─▶│Archivar   │         │   │
│  │ │Reporte    │  │Reporte    │  │Datos      │  │Sesion     │         │   │
│  │ │Ejecutivo  │  │Defectos   │  │           │  │           │         │   │
│  │ └───────────┘  └───────────┘  └───────────┘  └───────────┘         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 Interaccion entre Sistemas

```
┌───────────────────────────────────────────────────────────────────────────┐
│                                                                           │
│   ┌─────────────────────┐          ┌─────────────────────┐               │
│   │                     │          │                     │               │
│   │   AT5 AUDIT         │          │     AT5 MCP         │               │
│   │   PLATFORM          │          │     (Sistema Bajo   │               │
│   │   (Web App)         │          │      Prueba)        │               │
│   │                     │          │                     │               │
│   │  ┌───────────────┐  │          │  ┌───────────────┐  │               │
│   │  │ Sesion de     │  │          │  │ Asistente IA  │  │               │
│   │  │ Auditoria     │  │   El     │  │ (Chat)        │  │               │
│   │  └───────────────┘  │ auditor  │  └───────────────┘  │               │
│   │         │           │ ejecuta  │         │           │               │
│   │         ▼           │ pruebas  │         ▼           │               │
│   │  ┌───────────────┐  │ en AT5   │  ┌───────────────┐  │               │
│   │  │ Caso de       │──┼────────▶─┼──│ Herramientas  │  │               │
│   │  │ Prueba        │  │   MCP    │  │ MCP           │  │               │
│   │  └───────────────┘  │    y     │  └───────────────┘  │               │
│   │         │           │documenta │         │           │               │
│   │         ▼           │   en     │         ▼           │               │
│   │  ┌───────────────┐  │  Audit   │  ┌───────────────┐  │               │
│   │  │ Resultado +   │◀─┼─Platform─┼──│ Respuesta     │  │               │
│   │  │ Evidencia     │  │          │  │ del Sistema   │  │               │
│   │  └───────────────┘  │          │  └───────────────┘  │               │
│   │                     │          │                     │               │
│   └─────────────────────┘          └─────────────────────┘               │
│                                                                           │
│   AUDITOR: Persona que ejecuta la auditoria                               │
│   - Lee el caso de prueba en AT5 Audit Platform                          │
│   - Ejecuta las acciones en AT5 MCP (sistema real)                       │
│   - Documenta el resultado en AT5 Audit Platform                         │
│   - Agrega evidencias (capturas, logs) en AT5 Audit Platform             │
│                                                                           │
└───────────────────────────────────────────────────────────────────────────┘
```

### 2.3 Flujo de Trabajo del Auditor

Para **cada caso de prueba**, el auditor debe:

| Paso | Accion en AT5 Audit Platform | Accion en AT5 MCP |
|------|------------------------------|-------------------|
| 1 | Seleccionar caso de prueba | - |
| 2 | Leer precondiciones | Verificar que se cumplan |
| 3 | Iniciar cronometro | - |
| 4 | - | Ejecutar paso 1 del caso |
| 5 | Marcar paso 1 completado | - |
| 6 | - | Ejecutar paso 2 del caso |
| 7 | Marcar paso 2 completado | - |
| 8 | ... continuar con todos los pasos ... | |
| 9 | - | Observar resultado |
| 10 | Documentar resultado actual | - |
| 11 | Tomar captura de pantalla | - |
| 12 | Subir evidencia | - |
| 13 | Seleccionar PASSED/FAILED/BLOCKED | - |
| 14 | Sistema avanza al siguiente caso | - |

---

## 3. Requisitos Previos y Configuracion del Ambiente

### 3.1 Requisitos de Hardware para el Auditor

| Componente | Minimo | Recomendado |
|------------|--------|-------------|
| **Computador** | ||
| Procesador | Intel i5 / AMD Ryzen 5 | Intel i7 / AMD Ryzen 7 |
| RAM | 8 GB | 16 GB |
| Disco | 10 GB libres | 20 GB libres |
| **Monitores** | 1 (1920x1080) | 2 (para tener ambos sistemas visibles) |
| **Red** | Conexion estable | Cable ethernet preferido |

### 3.2 Requisitos de Software

#### Para AT5 Audit Platform (Navegador Web):

| Software | Version | Verificacion |
|----------|---------|--------------|
| Google Chrome | 90+ | chrome://version |
| O Firefox | 88+ | about:support |
| O Microsoft Edge | 90+ | edge://version |
| JavaScript | Habilitado | Requerido |
| Cookies | Habilitadas | Requerido |

#### Para AT5 MCP (Sistema Bajo Prueba):

| Software | Ruta | Verificacion |
|----------|------|--------------|
| Windows 10/11 | - | winver |
| .NET Framework | 4.8 | Panel de Control > Programas |
| AT5 Workbench | Build/Development/Axon.At5.Workbench.exe | Debe ejecutar |
| Manual-AT5.pdf | Build/Development/Manual-AT5.pdf | Debe existir |
| Plugin IEC104 | Plugins/Protocols/IEC104/ | Carpeta presente |
| Plugin Modbus | Plugins/Protocols/Modbus/ | Carpeta presente |
| Plugin Agent | Plugins/Tools/Agent/ | Carpeta presente |

### 3.3 Checklist de Verificacion Pre-Auditoria

Antes de iniciar la auditoria, complete este checklist:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CHECKLIST PRE-AUDITORIA                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  AMBIENTE AT5 AUDIT PLATFORM (Web)                                      │
│  ─────────────────────────────────────────────────────────────────────  │
│  [ ] Navegador actualizado (Chrome/Firefox/Edge)                        │
│  [ ] URL accesible: http://localhost:3000                               │
│  [ ] Credenciales disponibles (email/password)                          │
│  [ ] Login exitoso verificado                                           │
│                                                                         │
│  AMBIENTE AT5 MCP (Sistema Bajo Prueba)                                 │
│  ─────────────────────────────────────────────────────────────────────  │
│  [ ] AT5 Workbench instalado y ejecutable                               │
│  [ ] Todos los plugins presentes en carpeta Plugins/                    │
│  [ ] Manual-AT5.pdf copiado a Build/Development/                        │
│  [ ] API Key de LLM configurada (OpenAI/Claude/etc.)                    │
│  [ ] Conexion a Internet activa                                         │
│  [ ] AT5 Workbench inicia sin errores                                   │
│  [ ] Asistente IA responde a mensajes                                   │
│                                                                         │
│  DATOS DE PRUEBA                                                        │
│  ─────────────────────────────────────────────────────────────────────  │
│  [ ] Al menos 2 proyectos existentes en AT5                             │
│  [ ] Proyecto limpio disponible para crear dispositivos                 │
│  [ ] Templates predefinidos verificados (si aplica)                     │
│                                                                         │
│  HERRAMIENTAS DE DOCUMENTACION                                          │
│  ─────────────────────────────────────────────────────────────────────  │
│  [ ] Herramienta de captura de pantalla lista (Windows+Shift+S)         │
│  [ ] Carpeta para guardar evidencias creada                             │
│  [ ] Este manual disponible (impreso o digital)                         │
│                                                                         │
│  VERIFICADO POR: ____________________  FECHA: __/__/____                │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.4 Configuracion del Ambiente AT5 MCP

#### Paso 1: Verificar instalacion de AT5 Workbench

1. Navegar a la carpeta de instalacion de AT5
2. Localizar: `Build/Development/Axon.At5.Workbench.exe`
3. Ejecutar con doble clic
4. Verificar que la aplicacion inicia sin errores

#### Paso 2: Verificar el Manual PDF

1. Verificar que existe: `Build/Development/Manual-AT5.pdf`
2. Si no existe, copiar el archivo desde la ubicacion original
3. El sistema RAG necesita este archivo para responder consultas

#### Paso 3: Verificar plugins instalados

```
Plugins/
├── Protocols/
│   ├── IEC104/          ← Requerido para TC-DEV-001
│   ├── Modbus/          ← Requerido para TC-DEV-002
│   ├── DNP3/            ← Opcional
│   └── IEC61850/        ← Opcional
└── Tools/
    └── Agent/           ← Requerido para Asistente IA
```

#### Paso 4: Configurar API Key del LLM

1. En AT5 Workbench, ir a Settings/Configuracion
2. Localizar seccion de AI/LLM
3. Ingresar API Key valida (OpenAI, Claude, Gemini, etc.)
4. Guardar configuracion
5. Verificar conectividad con una consulta simple

#### Paso 5: Verificar proyectos existentes

1. Abrir AT5 Workbench
2. Abrir el Asistente IA (panel derecho)
3. Escribir: "lista los proyectos disponibles"
4. Debe mostrar al menos 2 proyectos

---

## 4. Acceso a AT5 Audit Platform

### 4.1 Iniciar el Servidor (si es necesario)

Si el servidor de AT5 Audit Platform no esta corriendo:

1. Abrir terminal/Command Prompt
2. Navegar a la carpeta del proyecto:
   ```
   cd C:\Users\Nicolas\Documents\at5-audit-platform
   ```
3. Ejecutar el servidor:
   ```
   npm run dev
   ```
4. Esperar mensaje: "Ready in X.Xs"
5. El servidor estara disponible en http://localhost:3000

### 4.2 Proceso de Login

#### Paso 1: Abrir el navegador

1. Abrir Google Chrome (recomendado)
2. Navegar a: `http://localhost:3000/login`

#### Paso 2: Pantalla de Login

Vera la siguiente pantalla:

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│              [LOGO] AT5 Audit Platform                          │
│              Sistema de Auditoria Interactiva                   │
│                                                                 │
│         ┌─────────────────────────────────────────────┐        │
│         │           Iniciar Sesion                    │        │
│         │  Ingrese sus credenciales para acceder      │        │
│         │                                             │        │
│         │  Correo Electronico                         │        │
│         │  ┌─────────────────────────────────────┐   │        │
│         │  │                                     │   │        │
│         │  └─────────────────────────────────────┘   │        │
│         │                                             │        │
│         │  Contrasena                                 │        │
│         │  ┌─────────────────────────────────┬───┐   │        │
│         │  │                                 │ o │   │        │
│         │  └─────────────────────────────────┴───┘   │        │
│         │                                             │        │
│         │         ┌───────────────────┐              │        │
│         │         │     Ingresar      │              │        │
│         │         └───────────────────┘              │        │
│         │                                             │        │
│         │  ┌─────────────────────────────────────┐   │        │
│         │  │ Credenciales de Prueba:             │   │        │
│         │  │ Lead Auditor: garcia@axongroup.com  │   │        │
│         │  │ Auditor: lopez@axongroup.com        │   │        │
│         │  │ Reviewer: martinez@axongroup.com    │   │        │
│         │  │ Contrasena: audit2026               │   │        │
│         │  └─────────────────────────────────────┘   │        │
│         └─────────────────────────────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

#### Paso 3: Ingresar credenciales

Para ejecutar la auditoria completa, use las credenciales de **Lead Auditor**:

| Campo | Valor |
|-------|-------|
| Correo Electronico | `garcia@axongroup.com` |
| Contrasena | `audit2026` |

1. Escribir el email en el campo "Correo Electronico"
2. Escribir la contrasena en el campo "Contrasena"
3. Hacer clic en el boton **"Ingresar"**

#### Paso 4: Verificar acceso exitoso

Despues del login exitoso:
- Sera redirigido al **Dashboard**
- Vera su nombre en la esquina superior derecha
- El mensaje de bienvenida dira "Bienvenido, Maria Garcia"

> **IMPORTANTE**: Si ve el error "Credenciales invalidas", verifique que escribio correctamente el email y contrasena. Despues de 5 intentos fallidos, la cuenta se bloqueara por 15 minutos.

### 4.3 Navegacion Principal

Una vez en el Dashboard, tendra acceso a:

| Menu | Funcion | Icono |
|------|---------|-------|
| **Dashboard** | Vista general de estadisticas | Casa |
| **Sesiones** | Gestionar sesiones de auditoria | Portapapeles |
| **Audit Log** | Ver registro de todas las acciones | Lista |
| **Reportes** | Generar y descargar informes | Documento |
| **Metricas** | KPIs y graficos avanzados | Grafico |
| **Configuracion** | Ajustes del sistema | Engranaje |

---

# PARTE II - CONFIGURACION DE LA SESION DE AUDITORIA

---

## 5. Creacion de la Sesion de Auditoria

### 5.1 Acceder al formulario de creacion

Desde el Dashboard:

1. Localizar el boton **"+ Nueva Auditoria"** en la esquina superior derecha
2. Hacer clic en el boton
3. Se abrira el formulario de creacion de sesion

Alternativamente:
1. Ir a menu **Sesiones** en el panel lateral
2. Hacer clic en **"+ Nueva Sesion"**

### 5.2 Completar el formulario

```
┌─────────────────────────────────────────────────────────────────────────┐
│                     Nueva Sesion de Auditoria                           │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Nombre de la Sesion *                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Auditoria AT5 MCP System - Enero 2026                           │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Descripcion                                                            │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Auditoria completa del sistema AT5 MCP incluyendo:              │   │
│  │ - 7 Agentes especializados                                      │   │
│  │ - 30+ Herramientas MCP                                          │   │
│  │ - 8 Proveedores LLM                                             │   │
│  │ - 4 Protocolos industriales                                     │   │
│  │ - Sistema RAG                                                   │   │
│  │ Segun Plan de Pruebas AT5 MCP 2026 (33 casos, 8 suites)        │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Plan de Pruebas *                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Plan de Pruebas AT5 MCP 2026 (33 casos)                    [v]  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  Auditor Responsable *                                                  │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │ Maria Garcia (Lead Auditor)                                [v]  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│                    ┌────────────┐    ┌────────────┐                    │
│                    │  Cancelar  │    │   Crear    │                    │
│                    └────────────┘    └────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

#### Valores a ingresar:

| Campo | Valor | Obligatorio |
|-------|-------|:-----------:|
| **Nombre** | Auditoria AT5 MCP System - Enero 2026 | Si |
| **Descripcion** | Ver texto completo arriba | No |
| **Plan de Pruebas** | Plan de Pruebas AT5 MCP 2026 (33 casos) | Si |
| **Auditor** | Maria Garcia (Lead Auditor) | Si |

### 5.3 Confirmar creacion

1. Verificar que todos los campos obligatorios esten completos
2. Hacer clic en el boton **"Crear"**
3. Esperar mensaje de confirmacion
4. La sesion se crea en estado **DRAFT** (Borrador)

### 5.4 Verificar la sesion creada

Despues de crear la sesion:

1. Sera redirigido a la pagina de detalle de la sesion
2. Verifique los siguientes elementos:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  ← Volver                                                               │
│                                                                         │
│  Auditoria AT5 MCP System - Enero 2026                                  │
│  ────────────────────────────────────────────────────────────────────   │
│  Estado: [BORRADOR]                   Progreso: ░░░░░░░░░░ 0%          │
│                                                                         │
│  Auditor: Maria Garcia                                                  │
│  Plan: Plan de Pruebas AT5 MCP 2026                                    │
│  Casos Totales: 33                                                      │
│                                                                         │
│  Estadisticas:                                                          │
│  ┌──────────────┬──────────────┬──────────────┬──────────────┐         │
│  │ Aprobados    │ Fallidos     │ Bloqueados   │ Pendientes   │         │
│  │     0        │     0        │     0        │     33       │         │
│  └──────────────┴──────────────┴──────────────┴──────────────┘         │
│                                                                         │
│  ┌───────────────────┐  ┌───────────────────┐                          │
│  │ Iniciar Auditoria │  │ Editar Sesion     │                          │
│  └───────────────────┘  └───────────────────┘                          │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Comprension del Plan de Pruebas AT5 MCP

### 6.1 Estructura del Plan de Pruebas

El Plan de Pruebas AT5 MCP 2026 esta organizado en **8 Suites** con un total de **33 Casos de Prueba**:

```
Plan de Pruebas AT5 MCP 2026
│
├── Suite PRJ: Gestion de Proyectos (5 casos)
│   ├── TC-PRJ-001: Listar Proyectos Disponibles
│   ├── TC-PRJ-002: Abrir Proyecto Existente
│   ├── TC-PRJ-003: Crear Nuevo Proyecto
│   ├── TC-PRJ-004: Cerrar Proyecto
│   └── TC-PRJ-005: Obtener Estado del Proyecto
│
├── Suite DEV: Gestion de Dispositivos (7 casos)
│   ├── TC-DEV-001: Crear Dispositivo IEC104 Slave
│   ├── TC-DEV-002: Crear Dispositivo Modbus Master
│   ├── TC-DEV-003: Listar Dispositivos
│   ├── TC-DEV-004: Iniciar Dispositivo
│   ├── TC-DEV-005: Detener Dispositivo
│   ├── TC-DEV-006: Eliminar Dispositivo
│   └── TC-DEV-007: Diagnostico de Dispositivo
│
├── Suite SIG: Gestion de Senales (5 casos)
│   ├── TC-SIG-001: Listar Senales de Dispositivo
│   ├── TC-SIG-002: Leer Valor de Senal Individual
│   ├── TC-SIG-003: Escribir Valor en Senal
│   ├── TC-SIG-004: Lectura Masiva de Senales
│   └── TC-SIG-005: Crear Multiples Senales
│
├── Suite RAG: Sistema RAG y Documentacion (3 casos)
│   ├── TC-RAG-001: Consulta de Instalacion
│   ├── TC-RAG-002: Consulta Tecnica Especifica
│   └── TC-RAG-003: Consulta con Referencia a Figura
│
├── Suite BAT: Operaciones Batch (2 casos)
│   ├── TC-BAT-001: Iniciar Todos los Dispositivos
│   └── TC-BAT-002: Detener Dispositivos Especificos
│
├── Suite TPL: Templates (3 casos)
│   ├── TC-TPL-001: Listar Templates Disponibles
│   ├── TC-TPL-002: Crear Dispositivo desde Template
│   └── TC-TPL-003: Guardar Dispositivo como Template
│
├── Suite RPT: Reportes y Exportacion (3 casos)
│   ├── TC-RPT-001: Generar Reporte de Pruebas
│   ├── TC-RPT-002: Exportar Configuracion de Dispositivo
│   └── TC-RPT-003: Exportar Historial de Senales
│
└── Suite TRF: Trafico y Analisis (2 casos)
    ├── TC-TRF-001: Obtener Estadisticas de Trafico
    └── TC-TRF-002: Analizar Tramas de Protocolo
```

### 6.2 Orden de Ejecucion Recomendado

Las pruebas deben ejecutarse en un orden especifico debido a las dependencias entre casos:

| Fase | Suite | Casos | Razon |
|------|-------|-------|-------|
| 1 | PRJ | TC-PRJ-001, TC-PRJ-002 | Necesitamos proyectos para dispositivos |
| 2 | DEV | TC-DEV-001, TC-DEV-002, TC-DEV-003 | Crear dispositivos para senales |
| 3 | DEV | TC-DEV-004 | Iniciar dispositivos para pruebas |
| 4 | SIG | TC-SIG-001 a TC-SIG-005 | Pruebas de senales |
| 5 | RAG | TC-RAG-001 a TC-RAG-003 | Independiente |
| 6 | BAT | TC-BAT-001, TC-BAT-002 | Requiere multiples dispositivos |
| 7 | TPL | TC-TPL-001 a TC-TPL-003 | Requiere dispositivo configurado |
| 8 | TRF | TC-TRF-001, TC-TRF-002 | Requiere trafico activo |
| 9 | RPT | TC-RPT-001 a TC-RPT-003 | Mejor al final con datos |
| 10 | DEV | TC-DEV-005, TC-DEV-006 | Limpieza |
| 11 | PRJ | TC-PRJ-003, TC-PRJ-004, TC-PRJ-005 | Completar suite |

---

## 7. Inicio de la Auditoria

### 7.1 Cambiar estado a IN_PROGRESS

Desde la pagina de detalle de la sesion:

1. Localizar el boton **"Iniciar Auditoria"**
2. Hacer clic en el boton
3. El sistema:
   - Cambiara el estado de DRAFT a **IN_PROGRESS**
   - Registrara la hora de inicio
   - Habilitara la ejecucion de pruebas

### 7.2 Acceder al modo de ejecucion interactiva

1. Despues de iniciar la auditoria, aparecera el boton **"Ejecutar Pruebas"**
2. Hacer clic en **"Ejecutar Pruebas"**
3. Se abrira la interfaz de ejecucion interactiva

### 7.3 Interfaz de Ejecucion Interactiva

```
┌────────────────────────────────────────────────────────────────────────────────┐
│ ← Auditoria AT5 MCP System - Enero 2026                Progreso: ░░░░░ 0%     │
├───────────────┬────────────────────────────────────────────────┬───────────────┤
│               │                                                │               │
│ CASOS DE      │              DETALLE DEL CASO                  │  PANEL        │
│ PRUEBA        │                                                │  DERECHO      │
│               │                                                │               │
│ [Suite PRJ]   │  TC-PRJ-001                        [ALTA]     │  Cronometro   │
│ ───────────── │  Listar Proyectos Disponibles                  │  ──────────   │
│ ○ TC-PRJ-001  │                                                │  00:00:00     │
│ ○ TC-PRJ-002  │  Descripcion:                                  │  [▶] [⟲]      │
│ ○ TC-PRJ-003  │  Verifica que el sistema lista correctamente   │               │
│ ○ TC-PRJ-004  │  todos los proyectos AT5 disponibles.          │  Estadisticas │
│ ○ TC-PRJ-005  │                                                │  ──────────   │
│               │  Precondiciones:                               │  ● Aprob: 0   │
│ [Suite DEV]   │  - Aplicacion AT5 ejecutandose                 │  ● Fall: 0    │
│ ───────────── │  - Existen proyectos en el directorio de BD    │  ● Bloq: 0    │
│ ○ TC-DEV-001  │                                                │  ○ Pend: 33   │
│ ○ TC-DEV-002  │  Resultado Esperado:                           │               │
│ ○ TC-DEV-003  │  - El sistema responde con lista de proyectos  │  Evidencias   │
│ ...           │  - Cada proyecto muestra: nombre, fecha, ruta  │  ──────────   │
│               │  - Tiempo de respuesta < 5 segundos            │  [↑] Subir    │
│               │                                                │               │
│               │  ─────────────────────────────────────────────│               │
│               │                                                │               │
│               │  Pasos de Ejecucion:                           │               │
│               │  ┌────────────────────────────────────────┐   │               │
│               │  │ ☐ 1. Abrir el Asistente IA            │   │               │
│               │  │ ☐ 2. Escribir: "lista los proyectos   │   │               │
│               │  │      disponibles"                      │   │               │
│               │  │ ☐ 3. Enviar mensaje                    │   │               │
│               │  └────────────────────────────────────────┘   │               │
│               │                                                │               │
│               │  Resultado Actual:                             │               │
│               │  ┌────────────────────────────────────────┐   │               │
│               │  │ Describa el resultado observado...     │   │               │
│               │  └────────────────────────────────────────┘   │               │
│               │                                                │               │
│               │  ┌────────┐ ┌────────┐ ┌─────────┐ ┌──────┐  │               │
│               │  │Aprobado│ │Fallido │ │Bloqueado│ │Omitir│  │               │
│               │  └────────┘ └────────┘ └─────────┘ └──────┘  │               │
│               │                                                │               │
└───────────────┴────────────────────────────────────────────────┴───────────────┘
```

### 7.4 Elementos de la Interfaz

| Seccion | Descripcion | Uso |
|---------|-------------|-----|
| **Panel Izquierdo** | Lista de todos los casos agrupados por suite | Seleccionar caso a ejecutar |
| **Panel Central** | Detalle del caso seleccionado | Leer y ejecutar pasos |
| **Panel Derecho** | Cronometro, estadisticas, evidencias | Controlar tiempo, subir archivos |
| **Pasos de Ejecucion** | Checklist de pasos del caso | Marcar completados |
| **Resultado Actual** | Campo de texto libre | Documentar observaciones |
| **Botones de Resultado** | PASSED/FAILED/BLOCKED/SKIP | Registrar resultado final |

---

# PARTE III - EJECUCION DE CASOS DE PRUEBA

---

## 8. Suite PRJ: Gestion de Proyectos

### 8.1 Vision General de la Suite

| Informacion | Valor |
|-------------|-------|
| **ID de Suite** | PRJ |
| **Nombre** | Gestion de Proyectos |
| **Cantidad de Casos** | 5 |
| **Prioridad General** | ALTA |
| **Objetivo** | Validar operaciones CRUD de proyectos AT5 |
| **Herramientas MCP** | list_projects, open_project, create_project, close_project, get_project_state |

### 8.2 TC-PRJ-001: Listar Proyectos Disponibles

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-PRJ-001 |
| **Nombre** | Listar Proyectos Disponibles |
| **Prioridad** | ALTA |
| **Herramienta MCP** | list_projects |
| **Tiempo Estimado** | 3 minutos |

#### Precondiciones a Verificar

Antes de ejecutar este caso, verifique:

| # | Precondicion | Como Verificar | Estado |
|---|--------------|----------------|--------|
| 1 | AT5 Workbench ejecutandose | Ventana de AT5 abierta | ☐ |
| 2 | Existen proyectos en BD | Carpeta de proyectos no vacia | ☐ |
| 3 | Asistente IA disponible | Panel derecho visible | ☐ |

#### Pasos de Ejecucion Detallados

**EN AT5 AUDIT PLATFORM:**

1. Verificar que el caso TC-PRJ-001 esta seleccionado en el panel izquierdo
2. Hacer clic en el boton [▶] para iniciar el cronometro
3. Leer las precondiciones del caso

**EN AT5 MCP (Sistema Bajo Prueba):**

4. Abrir AT5 Workbench (si no esta abierto)
5. Localizar el panel del Asistente IA (lado derecho de la ventana)
6. Si no esta visible, hacer clic en el boton para expandirlo
7. En el campo de texto del chat, escribir exactamente:
   ```
   lista los proyectos disponibles
   ```
8. Presionar Enter o hacer clic en el boton Enviar
9. Esperar la respuesta del sistema (maximo 10 segundos)

**OBSERVAR Y DOCUMENTAR:**

10. Verificar que el sistema responde con una lista
11. Para cada proyecto en la lista, verificar que muestra:
    - Nombre del proyecto
    - Fecha de creacion/modificacion
    - Ruta del archivo
12. Medir el tiempo de respuesta (debe ser < 5 segundos)

**EN AT5 AUDIT PLATFORM:**

13. Marcar cada paso como completado haciendo clic en el checkbox
14. En el campo "Resultado Actual", documentar:
    - Cantidad de proyectos listados
    - Ejemplo de la informacion mostrada
    - Tiempo de respuesta observado
15. Tomar captura de pantalla de la respuesta en AT5 MCP
16. Guardar la captura con nombre: `TC-PRJ-001_resultado.png`
17. Subir la captura como evidencia usando el boton [↑] Subir
18. Detener el cronometro

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Lista completa de proyectos | ☐ Muestra todos los proyectos existentes |
| 2 | Informacion correcta | ☐ Nombre, fecha y ruta visibles |
| 3 | Sin errores | ☐ No hay mensajes de error |
| 4 | Performance | ☐ Respuesta en menos de 5 segundos |

#### Decision de Resultado

**Seleccionar APROBADO (verde) si:**
- Todos los criterios de aceptacion se cumplen
- La lista muestra todos los proyectos esperados
- La informacion es correcta y completa

**Seleccionar FALLIDO (rojo) si:**
- No se muestra ninguna lista
- Hay errores en la respuesta
- Faltan proyectos que deberian aparecer
- La informacion es incorrecta

**Seleccionar BLOQUEADO (amarillo) si:**
- El Asistente IA no responde
- AT5 Workbench no inicia
- No hay conexion con el LLM

#### Ejemplo de Documentacion Correcta

**Resultado Actual (campo de texto):**
```
El sistema respondio exitosamente con una lista de 3 proyectos:

1. Project6 - Creado: 10/01/2026 - Ruta: C:\AT5\Projects\Project6.db
2. DemoProject - Creado: 05/01/2026 - Ruta: C:\AT5\Projects\Demo.db
3. TestProject - Creado: 08/01/2026 - Ruta: C:\AT5\Projects\Test.db

Tiempo de respuesta: 1.2 segundos
Sin errores en consola.
Informacion completa y correcta.
```

---

### 8.3 TC-PRJ-002: Abrir Proyecto Existente

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-PRJ-002 |
| **Nombre** | Abrir Proyecto Existente |
| **Prioridad** | CRITICA |
| **Herramienta MCP** | open_project |
| **Tiempo Estimado** | 5 minutos |
| **Dependencia** | TC-PRJ-001 (para conocer nombres de proyectos) |

#### Precondiciones a Verificar

| # | Precondicion | Como Verificar | Estado |
|---|--------------|----------------|--------|
| 1 | TC-PRJ-001 ejecutado | Conocemos nombres de proyectos | ☐ |
| 2 | Existe proyecto "Project6" | Aparecio en lista anterior | ☐ |
| 3 | No hay proyecto abierto | Barra de titulo sin nombre | ☐ |

#### Pasos de Ejecucion Detallados

**EN AT5 AUDIT PLATFORM:**

1. Seleccionar TC-PRJ-002 en el panel izquierdo
2. Iniciar cronometro [▶]
3. Verificar precondiciones

**EN AT5 MCP:**

4. Si hay un proyecto abierto, cerrarlo primero
5. En el Asistente IA, escribir:
   ```
   abre el proyecto Project6
   ```
   (Usar el nombre de un proyecto real que aparecio en TC-PRJ-001)
6. Enviar mensaje
7. Esperar respuesta del sistema
8. Observar cambios en la UI:
   - Barra de titulo actualizada
   - Panel de dispositivos cargado
   - Sin mensajes de error

**VERIFICACIONES:**

9. Verificar que la barra de titulo muestra "Project6"
10. Verificar que el panel de dispositivos esta disponible
11. Si el proyecto tiene dispositivos, verificar que aparecen listados

**EN AT5 AUDIT PLATFORM:**

12. Marcar pasos completados
13. Documentar resultado actual:
    - Confirmacion de apertura
    - Contenido del proyecto (dispositivos si hay)
    - Cualquier mensaje mostrado
14. Capturar pantalla mostrando:
    - Barra de titulo con nombre del proyecto
    - Panel de dispositivos
15. Subir evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Proyecto abierto | ☐ Confirmacion del sistema |
| 2 | UI actualizada | ☐ Nombre visible en barra de titulo |
| 3 | Dispositivos cargados | ☐ Lista de dispositivos disponible |
| 4 | Sin errores | ☐ No hay mensajes de error |

#### Posibles Problemas y Soluciones

| Problema | Causa Probable | Solucion |
|----------|---------------|----------|
| "Proyecto no encontrado" | Nombre incorrecto | Verificar nombre exacto con list_projects |
| "Error de permisos" | Archivo bloqueado | Cerrar otras instancias de AT5 |
| UI no se actualiza | Bug de interfaz | Intentar de nuevo o reiniciar AT5 |

---

### 8.4 TC-PRJ-003: Crear Nuevo Proyecto

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-PRJ-003 |
| **Nombre** | Crear Nuevo Proyecto |
| **Prioridad** | ALTA |
| **Herramienta MCP** | create_project |
| **Tiempo Estimado** | 5 minutos |

#### Precondiciones a Verificar

| # | Precondicion | Como Verificar | Estado |
|---|--------------|----------------|--------|
| 1 | Nombre unico | "TestProject_QA_2026" no existe | ☐ |
| 2 | Permisos de escritura | Carpeta de proyectos accesible | ☐ |

#### Pasos de Ejecucion Detallados

**EN AT5 AUDIT PLATFORM:**

1. Seleccionar TC-PRJ-003
2. Iniciar cronometro

**VERIFICACION PREVIA EN AT5 MCP:**

3. Primero, verificar que el nombre no existe:
   ```
   lista los proyectos disponibles
   ```
4. Confirmar que "TestProject_QA_2026" NO aparece en la lista

**CREAR EL PROYECTO:**

5. Escribir en el Asistente IA:
   ```
   crea un nuevo proyecto llamado TestProject_QA_2026
   ```
6. Enviar mensaje
7. Esperar confirmacion del sistema

**VERIFICAR CREACION:**

8. Ejecutar nuevamente:
   ```
   lista los proyectos disponibles
   ```
9. Verificar que "TestProject_QA_2026" ahora aparece en la lista

**VERIFICAR FUNCIONALIDAD:**

10. Intentar abrir el proyecto creado:
    ```
    abre el proyecto TestProject_QA_2026
    ```
11. Verificar que se abre correctamente

**EN AT5 AUDIT PLATFORM:**

12. Documentar:
    - Confirmacion de creacion
    - Verificacion en lista
    - Prueba de apertura
13. Capturar evidencia mostrando el proyecto en la lista

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Proyecto creado | ☐ Confirmacion del sistema |
| 2 | Aparece en lista | ☐ Visible en list_projects |
| 3 | Es funcional | ☐ Se puede abrir |

---

### 8.5 TC-PRJ-004: Cerrar Proyecto

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-PRJ-004 |
| **Nombre** | Cerrar Proyecto Actual |
| **Prioridad** | ALTA |
| **Herramienta MCP** | close_project |
| **Tiempo Estimado** | 3 minutos |
| **Dependencia** | Proyecto abierto (TC-PRJ-002 o TC-PRJ-003) |

#### Precondiciones a Verificar

| # | Precondicion | Como Verificar | Estado |
|---|--------------|----------------|--------|
| 1 | Proyecto abierto | Nombre visible en barra de titulo | ☐ |

#### Pasos de Ejecucion Detallados

**EN AT5 AUDIT PLATFORM:**

1. Seleccionar TC-PRJ-004
2. Iniciar cronometro

**EN AT5 MCP:**

3. Verificar que hay un proyecto abierto (ver barra de titulo)
4. Anotar el nombre del proyecto abierto
5. Escribir en el Asistente IA:
   ```
   cierra el proyecto actual
   ```
6. Enviar mensaje
7. Esperar confirmacion

**VERIFICAR CIERRE:**

8. Verificar que la barra de titulo ya no muestra el nombre del proyecto
9. Verificar que el panel de dispositivos esta vacio o deshabilitado
10. Verificar que no hay mensajes de error

**EN AT5 AUDIT PLATFORM:**

11. Documentar resultado
12. Capturar pantalla mostrando estado sin proyecto

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Proyecto cerrado | ☐ Confirmacion del sistema |
| 2 | UI actualizada | ☐ Sin nombre en barra de titulo |
| 3 | Sin errores | ☐ No hay mensajes de error |
| 4 | Datos guardados | ☐ Cambios persistidos (si habia) |

---

### 8.6 TC-PRJ-005: Obtener Estado del Proyecto

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-PRJ-005 |
| **Nombre** | Obtener Estado del Proyecto |
| **Prioridad** | MEDIA |
| **Herramienta MCP** | get_project_state |
| **Tiempo Estimado** | 3 minutos |
| **Dependencia** | Proyecto abierto con dispositivos |

#### Precondiciones a Verificar

| # | Precondicion | Como Verificar | Estado |
|---|--------------|----------------|--------|
| 1 | Proyecto abierto | Nombre en barra de titulo | ☐ |
| 2 | Al menos un dispositivo | Panel de dispositivos con items | ☐ |

#### Pasos de Ejecucion Detallados

**PREPARACION:**

1. Si no hay proyecto abierto, abrir uno que tenga dispositivos
2. Si el proyecto no tiene dispositivos, ejecutar primero TC-DEV-001

**EN AT5 MCP:**

3. Escribir en el Asistente IA:
   ```
   cual es el estado del proyecto actual?
   ```
4. Enviar mensaje
5. Observar la respuesta

**VERIFICAR INFORMACION:**

6. La respuesta debe incluir:
   - Nombre del proyecto
   - Cantidad de dispositivos
   - Estado de los dispositivos (activos/inactivos)
   - Otra informacion relevante

**EN AT5 AUDIT PLATFORM:**

7. Documentar toda la informacion recibida
8. Capturar pantalla de la respuesta

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Informacion completa | ☐ Nombre, dispositivos, estado |
| 2 | Datos correctos | ☐ Coinciden con la realidad |

---

## 9. Suite DEV: Gestion de Dispositivos

### 9.1 Vision General de la Suite

| Informacion | Valor |
|-------------|-------|
| **ID de Suite** | DEV |
| **Nombre** | Gestion de Dispositivos |
| **Cantidad de Casos** | 7 |
| **Prioridad General** | CRITICA |
| **Objetivo** | Validar operaciones CRUD de dispositivos de comunicacion |
| **Herramientas MCP** | create_device, list_devices, start_device, stop_device, delete_device, diagnose_device |

### 9.2 TC-DEV-001: Crear Dispositivo IEC104 Slave

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-DEV-001 |
| **Nombre** | Crear Dispositivo IEC104 Slave |
| **Prioridad** | CRITICA |
| **Herramienta MCP** | create_device |
| **Tiempo Estimado** | 10 minutos |

#### Precondiciones a Verificar

| # | Precondicion | Como Verificar | Estado |
|---|--------------|----------------|--------|
| 1 | Proyecto abierto | Nombre en barra de titulo | ☐ |
| 2 | Plugin IEC104 cargado | Carpeta Plugins/Protocols/IEC104 existe | ☐ |
| 3 | Puerto 2404 disponible | No hay otro proceso usandolo | ☐ |

#### Pasos de Ejecucion Detallados

**EN AT5 AUDIT PLATFORM:**

1. Seleccionar TC-DEV-001
2. Iniciar cronometro

**EN AT5 MCP:**

3. Verificar que hay un proyecto abierto
4. Escribir en el Asistente IA:
   ```
   crea un dispositivo IEC104 esclavo llamado RTU_Test en 127.0.0.1:2404 con 10 senales
   ```
5. Enviar mensaje
6. Esperar confirmacion del sistema

**VERIFICAR CREACION:**

7. El sistema debe confirmar:
   - Dispositivo creado exitosamente
   - Nombre: RTU_Test
   - Protocolo: IEC104
   - Tipo: Slave
   - IP: 127.0.0.1
   - Puerto: 2404
   - 10 senales creadas

8. Verificar en la lista de dispositivos:
   ```
   lista todos los dispositivos
   ```
9. Confirmar que RTU_Test aparece en la lista

**VERIFICAR CONFIGURACION:**

10. Verificar detalles del dispositivo:
    ```
    muestra el estado del dispositivo RTU_Test
    ```
11. Confirmar que la configuracion es correcta

**EN AT5 AUDIT PLATFORM:**

12. Documentar:
    - Confirmacion de creacion
    - Parametros del dispositivo
    - Lista de senales creadas
13. Capturar evidencia del dispositivo creado
14. Subir evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Dispositivo creado | ☐ Confirmacion del sistema |
| 2 | Visible en lista | ☐ Aparece en list_devices |
| 3 | Configuracion correcta | ☐ IP, puerto, protocolo correcto |
| 4 | Senales creadas | ☐ 10 senales con IOAs validas |
| 5 | Puede ser iniciado | ☐ Sin errores al intentar start |

#### Ejemplo de Respuesta Esperada

```
Dispositivo creado exitosamente:
- Nombre: RTU_Test
- Protocolo: IEC104
- Tipo: Slave
- Direccion: 127.0.0.1:2404
- Senales: 10 creadas (DI_001 a DI_010)
- Estado: Detenido

El dispositivo esta listo para ser iniciado.
```

---

### 9.3 TC-DEV-002: Crear Dispositivo Modbus Master

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-DEV-002 |
| **Nombre** | Crear Dispositivo Modbus Master |
| **Prioridad** | ALTA |
| **Herramienta MCP** | create_device |
| **Tiempo Estimado** | 10 minutos |

#### Precondiciones a Verificar

| # | Precondicion | Como Verificar | Estado |
|---|--------------|----------------|--------|
| 1 | Proyecto abierto | Nombre en barra de titulo | ☐ |
| 2 | Plugin Modbus cargado | Carpeta Plugins/Protocols/Modbus existe | ☐ |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Escribir en el Asistente IA:
   ```
   crea un dispositivo Modbus maestro llamado Modbus_PLC en 192.168.1.100:502
   ```
2. Enviar mensaje
3. Verificar confirmacion

**VERIFICACIONES:**

4. El sistema debe confirmar:
   - Nombre: Modbus_PLC
   - Protocolo: Modbus
   - Tipo: Master
   - IP: 192.168.1.100
   - Puerto: 502

5. Verificar en lista de dispositivos

**EN AT5 AUDIT PLATFORM:**

6. Documentar y capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Dispositivo creado | ☐ Confirmacion del sistema |
| 2 | Configuracion correcta | ☐ Protocolo Modbus, tipo Master |

---

### 9.4 TC-DEV-003: Listar Dispositivos

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-DEV-003 |
| **Nombre** | Listar Todos los Dispositivos |
| **Prioridad** | ALTA |
| **Herramienta MCP** | list_devices |
| **Tiempo Estimado** | 3 minutos |
| **Dependencia** | TC-DEV-001, TC-DEV-002 (dispositivos creados) |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Escribir:
   ```
   lista todos los dispositivos
   ```
2. Enviar mensaje
3. Verificar que aparecen TODOS los dispositivos creados:
   - RTU_Test (IEC104 Slave)
   - Modbus_PLC (Modbus Master)
   - Cualquier otro dispositivo existente

4. Para cada dispositivo, verificar que muestra:
   - Nombre
   - Protocolo
   - Tipo (Master/Slave)
   - Estado (Running/Stopped)
   - Direccion IP:Puerto

**EN AT5 AUDIT PLATFORM:**

5. Documentar lista completa
6. Capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Lista completa | ☐ Todos los dispositivos aparecen |
| 2 | Informacion correcta | ☐ Nombre, protocolo, estado, direccion |

---

### 9.5 TC-DEV-004: Iniciar Dispositivo

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-DEV-004 |
| **Nombre** | Iniciar Comunicacion de Dispositivo |
| **Prioridad** | CRITICA |
| **Herramienta MCP** | start_device |
| **Tiempo Estimado** | 5 minutos |
| **Dependencia** | TC-DEV-001 (RTU_Test debe existir) |

#### Precondiciones a Verificar

| # | Precondicion | Como Verificar | Estado |
|---|--------------|----------------|--------|
| 1 | Dispositivo existe | RTU_Test en lista | ☐ |
| 2 | Estado es "stopped" | Verificar con get_device_status | ☐ |
| 3 | Puerto disponible | 2404 no en uso | ☐ |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Verificar estado actual:
   ```
   cual es el estado del dispositivo RTU_Test?
   ```
2. Confirmar que esta en "stopped"

3. Iniciar el dispositivo:
   ```
   inicia el dispositivo RTU_Test
   ```
4. Esperar confirmacion

**VERIFICAR INICIO:**

5. Verificar nuevo estado:
   ```
   cual es el estado del dispositivo RTU_Test?
   ```
6. Debe mostrar estado "running"

7. Para IEC104 Slave, verificar que el puerto esta escuchando
   (el sistema puede mostrar "Listening on 127.0.0.1:2404")

**EN AT5 AUDIT PLATFORM:**

8. Documentar:
   - Estado antes de iniciar
   - Confirmacion de inicio
   - Estado despues de iniciar
9. Capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Dispositivo iniciado | ☐ Confirmacion del sistema |
| 2 | Estado "running" | ☐ Verificado con get_device_status |
| 3 | Sin errores | ☐ No hay mensajes de error |
| 4 | Puerto activo | ☐ Escuchando conexiones (para Slave) |

---

### 9.6 TC-DEV-005: Detener Dispositivo

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-DEV-005 |
| **Nombre** | Detener Comunicacion de Dispositivo |
| **Prioridad** | ALTA |
| **Herramienta MCP** | stop_device |
| **Tiempo Estimado** | 3 minutos |
| **Dependencia** | TC-DEV-004 (dispositivo en running) |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Verificar que RTU_Test esta en "running"
2. Ejecutar:
   ```
   deten el dispositivo RTU_Test
   ```
3. Esperar confirmacion
4. Verificar estado:
   ```
   cual es el estado del dispositivo RTU_Test?
   ```
5. Debe mostrar "stopped"

**EN AT5 AUDIT PLATFORM:**

6. Documentar cambio de estado
7. Capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Dispositivo detenido | ☐ Confirmacion del sistema |
| 2 | Estado "stopped" | ☐ Verificado |
| 3 | Recursos liberados | ☐ Puerto liberado |
| 4 | Puede reiniciarse | ☐ start_device funciona |

---

### 9.7 TC-DEV-006: Eliminar Dispositivo

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-DEV-006 |
| **Nombre** | Eliminar Dispositivo |
| **Prioridad** | MEDIA |
| **Herramienta MCP** | delete_device |
| **Tiempo Estimado** | 5 minutos |

#### Precondiciones

| # | Precondicion | Estado |
|---|--------------|--------|
| 1 | Dispositivo existe | ☐ |
| 2 | Dispositivo detenido (preferible) | ☐ |

#### Pasos de Ejecucion Detallados

> **NOTA**: Para esta prueba, crearemos un dispositivo temporal para eliminar, asi no afectamos los dispositivos que necesitamos para pruebas posteriores.

**EN AT5 MCP:**

1. Crear un dispositivo temporal:
   ```
   crea un dispositivo IEC104 esclavo llamado Temp_Delete en 127.0.0.1:2405
   ```
2. Verificar que existe en la lista

3. Eliminar el dispositivo:
   ```
   elimina el dispositivo Temp_Delete
   ```
4. Si pide confirmacion, confirmar la eliminacion

5. Verificar que ya no existe:
   ```
   lista todos los dispositivos
   ```
6. Confirmar que Temp_Delete NO aparece

**EN AT5 AUDIT PLATFORM:**

7. Documentar proceso completo
8. Capturar evidencia de la lista sin el dispositivo

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Dispositivo eliminado | ☐ Confirmacion del sistema |
| 2 | No aparece en lista | ☐ Verificado con list_devices |
| 3 | Sin efectos secundarios | ☐ Otros dispositivos intactos |

---

### 9.8 TC-DEV-007: Diagnostico de Dispositivo

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-DEV-007 |
| **Nombre** | Ejecutar Diagnostico de Dispositivo |
| **Prioridad** | ALTA |
| **Herramienta MCP** | diagnose_device |
| **Tiempo Estimado** | 5 minutos |
| **Dependencia** | Dispositivo existente (preferiblemente en running) |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Asegurar que RTU_Test existe y preferiblemente esta en running
2. Ejecutar diagnostico:
   ```
   diagnostica el dispositivo RTU_Test
   ```
3. Esperar respuesta completa

**VERIFICAR CONTENIDO DEL DIAGNOSTICO:**

4. El diagnostico debe incluir:
   - Estado de conexion
   - Estadisticas de comunicacion (bytes, paquetes)
   - Errores detectados (si hay)
   - Tiempo de actividad
   - Informacion de configuracion

**EN AT5 AUDIT PLATFORM:**

5. Documentar TODO el contenido del diagnostico
6. Capturar pantalla completa del reporte

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Diagnostico generado | ☐ Reporte completo |
| 2 | Informacion precisa | ☐ Estado correcto |
| 3 | Identificacion de problemas | ☐ Si hay, los reporta |

---

## 10. Suite SIG: Gestion de Senales

### 10.1 Vision General de la Suite

| Informacion | Valor |
|-------------|-------|
| **ID de Suite** | SIG |
| **Nombre** | Gestion de Senales |
| **Cantidad de Casos** | 5 |
| **Prioridad General** | CRITICA |
| **Objetivo** | Validar operaciones de lectura/escritura de senales |
| **Herramientas MCP** | list_signals, read_signal, write_signal, batch_read_signals, batch_create_signals |

### 10.2 TC-SIG-001: Listar Senales de Dispositivo

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-SIG-001 |
| **Nombre** | Listar Senales de un Dispositivo |
| **Prioridad** | ALTA |
| **Herramienta MCP** | list_signals |
| **Tiempo Estimado** | 3 minutos |
| **Dependencia** | TC-DEV-001 (RTU_Test con senales) |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Verificar que RTU_Test existe y tiene senales
2. Ejecutar:
   ```
   lista las senales del dispositivo RTU_Test
   ```
3. Verificar que muestra:
   - Nombre de cada senal
   - Tipo (DI, AI, DO, AO, etc.)
   - Direccion IOA
   - Valor actual (si disponible)

**EN AT5 AUDIT PLATFORM:**

4. Documentar lista completa de senales
5. Capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Lista completa | ☐ Todas las senales aparecen |
| 2 | Informacion correcta | ☐ Nombre, tipo, IOA, valor |

---

### 10.3 TC-SIG-002: Leer Valor de Senal Individual

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-SIG-002 |
| **Nombre** | Leer Valor de Senal Individual |
| **Prioridad** | CRITICA |
| **Herramienta MCP** | read_signal |
| **Tiempo Estimado** | 3 minutos |
| **Dependencia** | TC-SIG-001 (conocer nombres de senales) |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Usar el nombre de una senal real (de TC-SIG-001)
2. Ejecutar:
   ```
   lee el valor de la senal DI_001 del dispositivo RTU_Test
   ```
   (Usar el nombre real de la senal)
3. Verificar respuesta:
   - Valor actual de la senal
   - Timestamp de lectura
   - Calidad (si aplica)

**EN AT5 AUDIT PLATFORM:**

4. Documentar valor leido
5. Capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Valor retornado | ☐ Numero o estado valido |
| 2 | Formato legible | ☐ Facil de entender |
| 3 | Sin errores | ☐ Lectura exitosa |

---

### 10.4 TC-SIG-003: Escribir Valor en Senal

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-SIG-003 |
| **Nombre** | Escribir Valor en Senal |
| **Prioridad** | CRITICA |
| **Herramienta MCP** | write_signal |
| **Tiempo Estimado** | 5 minutos |
| **Dependencia** | Dispositivo Slave en running |

#### Precondiciones

| # | Precondicion | Estado |
|---|--------------|--------|
| 1 | RTU_Test en estado running | ☐ |
| 2 | Senal de escritura disponible | ☐ |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Asegurar que RTU_Test esta en running (ejecutar TC-DEV-004 si es necesario)
2. Primero, leer el valor actual:
   ```
   lee el valor de la senal AI_001 del dispositivo RTU_Test
   ```
3. Anotar el valor actual

4. Escribir un nuevo valor:
   ```
   escribe el valor 100 en la senal AI_001 del dispositivo RTU_Test
   ```
5. Esperar confirmacion

6. Verificar la escritura leyendo de nuevo:
   ```
   lee el valor de la senal AI_001 del dispositivo RTU_Test
   ```
7. Confirmar que el valor es 100 (o el valor escrito)

**EN AT5 AUDIT PLATFORM:**

8. Documentar:
   - Valor antes de escribir
   - Confirmacion de escritura
   - Valor despues de escribir
9. Capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Escritura exitosa | ☐ Confirmacion del sistema |
| 2 | Valor persistido | ☐ Lectura posterior lo confirma |
| 3 | Sin errores | ☐ Operacion limpia |

---

### 10.5 TC-SIG-004: Lectura Masiva de Senales

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-SIG-004 |
| **Nombre** | Lectura Masiva de Senales (Batch) |
| **Prioridad** | ALTA |
| **Herramienta MCP** | batch_read_signals |
| **Tiempo Estimado** | 5 minutos |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Ejecutar lectura masiva:
   ```
   lee las primeras 10 senales del dispositivo RTU_Test
   ```
2. Verificar que retorna multiples valores
3. Verificar que el tiempo de respuesta es razonable (< 5 segundos)

**EN AT5 AUDIT PLATFORM:**

4. Documentar todos los valores leidos
5. Anotar el tiempo de respuesta
6. Capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Todas las senales leidas | ☐ 10 valores retornados |
| 2 | Performance aceptable | ☐ < 5 segundos |
| 3 | Formato estructurado | ☐ Facil de leer |

---

### 10.6 TC-SIG-005: Crear Multiples Senales

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-SIG-005 |
| **Nombre** | Crear Multiples Senales (Batch) |
| **Prioridad** | ALTA |
| **Herramienta MCP** | batch_create_signals |
| **Tiempo Estimado** | 5 minutos |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Contar senales actuales del dispositivo
2. Crear senales en batch:
   ```
   crea 20 senales con prefijo 'TEST_' en el dispositivo RTU_Test empezando en direccion 1000
   ```
3. Verificar creacion:
   ```
   lista las senales del dispositivo RTU_Test
   ```
4. Confirmar que aparecen TEST_1, TEST_2, ..., TEST_20

**EN AT5 AUDIT PLATFORM:**

5. Documentar cantidad de senales creadas
6. Capturar evidencia de la lista

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Senales creadas | ☐ 20 nuevas senales |
| 2 | Nomenclatura correcta | ☐ TEST_1 a TEST_20 |
| 3 | Direcciones secuenciales | ☐ 1000, 1001, ..., 1019 |

---

## 11. Suite RAG: Sistema RAG y Documentacion

### 11.1 Vision General de la Suite

| Informacion | Valor |
|-------------|-------|
| **ID de Suite** | RAG |
| **Nombre** | Sistema RAG y Documentacion |
| **Cantidad de Casos** | 3 |
| **Prioridad General** | ALTA |
| **Objetivo** | Validar consultas de documentacion mediante RAG |
| **Herramienta MCP** | query_manual |

### 11.2 TC-RAG-001: Consulta de Instalacion

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-RAG-001 |
| **Nombre** | Consulta de Instalacion en Manual |
| **Prioridad** | CRITICA |
| **Herramienta MCP** | query_manual |
| **Tiempo Estimado** | 5 minutos |

#### Precondiciones

| # | Precondicion | Estado |
|---|--------------|--------|
| 1 | Manual-AT5.pdf en Build/Development/ | ☐ |
| 2 | Sistema RAG inicializado | ☐ |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Escribir una consulta sobre instalacion:
   ```
   como instalo el AT5?
   ```
2. Enviar mensaje
3. Esperar respuesta

**VERIFICAR RESPUESTA:**

4. La respuesta debe:
   - Basarse en el contenido del manual PDF
   - Incluir pasos de instalacion
   - Ser coherente y util
   - Responder en tiempo razonable (< 10 segundos)

5. Verificar que NO es una respuesta inventada (debe coincidir con el manual)

**EN AT5 AUDIT PLATFORM:**

6. Documentar la respuesta completa
7. Evaluar calidad y precision
8. Capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Respuesta basada en manual | ☐ No inventada |
| 2 | Informacion correcta | ☐ Pasos reales |
| 3 | Tiempo < 10 segundos | ☐ Performance OK |

---

### 11.3 TC-RAG-002: Consulta Tecnica Especifica

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-RAG-002 |
| **Nombre** | Consulta Tecnica Especifica |
| **Prioridad** | ALTA |
| **Herramienta MCP** | query_manual |
| **Tiempo Estimado** | 5 minutos |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Hacer una consulta tecnica especifica:
   ```
   que es un dispositivo IEC104 Slave en AT5?
   ```
2. Esperar respuesta
3. Verificar que explica el concepto correctamente

**EN AT5 AUDIT PLATFORM:**

4. Documentar respuesta
5. Evaluar precision tecnica

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Respuesta tecnica | ☐ Explicacion correcta |
| 2 | Basada en documentacion | ☐ Del manual |

---

### 11.4 TC-RAG-003: Consulta con Referencia a Figura

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-RAG-003 |
| **Nombre** | Consulta con Referencia a Figura |
| **Prioridad** | MEDIA |
| **Herramienta MCP** | query_manual |
| **Tiempo Estimado** | 5 minutos |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Hacer una consulta que podria requerir una figura:
   ```
   muestrame la arquitectura del sistema AT5
   ```
2. Verificar si el sistema:
   - Hace referencia a una figura del manual
   - Describe la arquitectura
   - Muestra imagen (si es soportado)

**EN AT5 AUDIT PLATFORM:**

3. Documentar respuesta
4. Evaluar si hace referencia a figuras

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Referencia a figura | ☐ Menciona figura del manual |
| 2 | Contexto explicado | ☐ Descripcion util |

---

## 12. Suite BAT: Operaciones Batch

### 12.1 TC-BAT-001: Iniciar Todos los Dispositivos

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-BAT-001 |
| **Nombre** | Iniciar Todos los Dispositivos |
| **Prioridad** | ALTA |
| **Herramienta MCP** | batch_start_devices |
| **Tiempo Estimado** | 5 minutos |
| **Dependencia** | Multiples dispositivos existentes |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Verificar que hay multiples dispositivos (RTU_Test, Modbus_PLC)
2. Detener todos si estan corriendo:
   ```
   deten todos los dispositivos
   ```
3. Iniciar todos los dispositivos:
   ```
   inicia todos los dispositivos
   ```
4. Verificar estados:
   ```
   lista todos los dispositivos
   ```
5. Todos deben mostrar estado "running"

**EN AT5 AUDIT PLATFORM:**

6. Documentar resultados
7. Capturar evidencia

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Todos iniciados | ☐ Todos en "running" |
| 2 | Reporte de operacion | ☐ Exito/fallo por dispositivo |

---

### 12.2 TC-BAT-002: Detener Dispositivos Especificos

#### Informacion del Caso

| Campo | Valor |
|-------|-------|
| **ID** | TC-BAT-002 |
| **Nombre** | Detener Dispositivos Especificos |
| **Prioridad** | MEDIA |
| **Herramienta MCP** | batch_stop_devices |
| **Tiempo Estimado** | 5 minutos |

#### Pasos de Ejecucion Detallados

**EN AT5 MCP:**

1. Asegurar que multiples dispositivos estan en running
2. Detener solo algunos:
   ```
   deten los dispositivos RTU_Test
   ```
3. Verificar que:
   - RTU_Test esta detenido
   - Modbus_PLC sigue corriendo (si existia)

**EN AT5 AUDIT PLATFORM:**

4. Documentar estados antes y despues

#### Criterios de Aceptacion

| # | Criterio | Verificacion |
|---|----------|--------------|
| 1 | Dispositivos correctos detenidos | ☐ Solo los especificados |
| 2 | Otros intactos | ☐ Siguen en running |

---

## 13. Suite TPL: Templates

### 13.1 TC-TPL-001: Listar Templates Disponibles

#### Pasos de Ejecucion

**EN AT5 MCP:**

1. Ejecutar:
   ```
   muestra las plantillas de dispositivos disponibles
   ```
2. Verificar lista de templates predefinidos

**EN AT5 AUDIT PLATFORM:**

3. Documentar templates encontrados

---

### 13.2 TC-TPL-002: Crear Dispositivo desde Template

#### Pasos de Ejecucion

**EN AT5 MCP:**

1. Usando un template de la lista anterior:
   ```
   crea un dispositivo desde el template IEC104_Slave_Basic con nombre RTU_FromTemplate
   ```
2. Verificar que el dispositivo se crea con la configuracion del template

**EN AT5 AUDIT PLATFORM:**

3. Documentar creacion

---

### 13.3 TC-TPL-003: Guardar Dispositivo como Template

#### Pasos de Ejecucion

**EN AT5 MCP:**

1. Usando un dispositivo configurado:
   ```
   guarda el dispositivo RTU_Test como plantilla llamada Mi_Template_QA
   ```
2. Verificar que aparece en lista de templates

**EN AT5 AUDIT PLATFORM:**

3. Documentar template creado

---

## 14. Suite RPT: Reportes y Exportacion

### 14.1 TC-RPT-001: Generar Reporte de Pruebas

#### Pasos de Ejecucion

**EN AT5 MCP:**

1. Ejecutar:
   ```
   genera un reporte de pruebas en formato JSON
   ```
2. Verificar que el reporte contiene informacion del proyecto

**EN AT5 AUDIT PLATFORM:**

3. Documentar contenido del reporte

---

### 14.2 TC-RPT-002: Exportar Configuracion de Dispositivo

#### Pasos de Ejecucion

**EN AT5 MCP:**

1. Ejecutar:
   ```
   exporta la configuracion del dispositivo RTU_Test en formato JSON
   ```
2. Verificar que se genera archivo/contenido JSON valido

**EN AT5 AUDIT PLATFORM:**

3. Documentar configuracion exportada

---

### 14.3 TC-RPT-003: Exportar Historial de Senales

#### Pasos de Ejecucion

**EN AT5 MCP:**

1. Ejecutar:
   ```
   exporta el historial de senales del dispositivo RTU_Test de la ultima hora en CSV
   ```
2. Verificar formato CSV

**EN AT5 AUDIT PLATFORM:**

3. Documentar exportacion

---

## 15. Suite TRF: Trafico y Analisis

### 15.1 TC-TRF-001: Obtener Estadisticas de Trafico

#### Precondiciones

| # | Precondicion | Estado |
|---|--------------|--------|
| 1 | Dispositivo en running con trafico | ☐ |

#### Pasos de Ejecucion

**EN AT5 MCP:**

1. Asegurar que RTU_Test esta en running
2. Ejecutar:
   ```
   muestra las estadisticas de trafico del dispositivo RTU_Test
   ```
3. Verificar metricas: bytes, paquetes, errores

**EN AT5 AUDIT PLATFORM:**

4. Documentar estadisticas

---

### 15.2 TC-TRF-002: Analizar Tramas de Protocolo

#### Pasos de Ejecucion

**EN AT5 MCP:**

1. Ejecutar:
   ```
   analiza las ultimas 50 tramas del dispositivo RTU_Test
   ```
2. Verificar analisis de tramas

**EN AT5 AUDIT PLATFORM:**

3. Documentar analisis

---

# PARTE IV - FINALIZACION DE LA AUDITORIA

---

## 16. Revision de Resultados

### 16.1 Verificar Estadisticas Finales

Una vez ejecutados todos los 33 casos de prueba:

1. En AT5 Audit Platform, ir a la vista de detalle de la sesion
2. Verificar las estadisticas:

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Estadisticas Finales de la Auditoria                                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  Total Casos:        33                                                 │
│  ──────────────────────────────────────────────────────────────────    │
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌────────────┐ │
│  │  APROBADOS   │  │   FALLIDOS   │  │  BLOQUEADOS  │  │  OMITIDOS  │ │
│  │     __       │  │      __      │  │      __      │  │     __     │ │
│  │    (_%)      │  │     (_%)     │  │     (_%)     │  │    (_%)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └────────────┘ │
│                                                                         │
│  Progreso: ████████████████████████████████████████████████████ 100%  │
│                                                                         │
│  Tasa de Exito: ____% (Aprobados / (Aprobados + Fallidos))            │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 16.2 Revisar Casos Fallidos

Para cada caso marcado como FALLIDO:

1. Verificar que tiene evidencia adjunta
2. Verificar que el resultado actual esta documentado
3. Verificar que se identifica claramente el defecto

### 16.3 Revisar Casos Bloqueados

Para cada caso marcado como BLOQUEADO:

1. Verificar que la razon del bloqueo esta documentada
2. Determinar si el bloqueo es justificado

### 16.4 Enviar a Revision

Una vez completada la revision interna:

1. Hacer clic en **"Enviar a Revision"**
2. El estado cambiara de IN_PROGRESS a **REVIEW**
3. La sesion queda lista para firmas

---

## 17. Proceso de Firma y Aprobacion

### 17.1 Firma del Lead Auditor

Con el usuario Lead Auditor (garcia@axongroup.com):

1. Ir a la sesion en estado REVIEW
2. En la seccion "Firmas y Aprobaciones", hacer clic en **"Agregar Firma"**
3. Opcionalmente, dibujar firma visual
4. Hacer clic en **"Firmar"**
5. Se generara certificado SHA-256

### 17.2 Firma del Reviewer

Cerrar sesion del Lead Auditor y entrar como Reviewer:

1. Login con: martinez@axongroup.com / audit2026
2. Ir a la sesion
3. Revisar todos los resultados y evidencias
4. Si todo esta correcto, hacer clic en **"Agregar Firma"**
5. Firmar

### 17.3 Aprobacion Automatica

Cuando ambas firmas estan presentes:

- El estado cambia automaticamente a **APPROVED**
- Se registra en el audit log

---

## 18. Generacion de Reportes Finales

### 18.1 Generar Reporte Ejecutivo (PDF)

1. En la sesion aprobada, hacer clic en **"Generar Reporte"**
2. Seleccionar: **Resumen Ejecutivo (PDF)**
3. Opciones:
   - [x] Incluir evidencias
   - [x] Incluir firmas
4. Hacer clic en **"Generar"**
5. Descargar el archivo

### 18.2 Generar Reporte de Defectos (PDF)

1. Hacer clic en **"Generar Reporte"**
2. Seleccionar: **Reporte de Defectos (PDF)**
3. Generar y descargar

### 18.3 Exportar Datos Completos (JSON)

1. Hacer clic en **"Exportar Sesion"**
2. Se descargara archivo JSON con todos los datos

---

## 19. Archivado de la Auditoria

### 19.1 Archivar la Sesion

1. En la sesion aprobada, hacer clic en **"Archivar"**
2. Confirmar archivado
3. El estado cambia a **ARCHIVED**

### 19.2 Verificacion Final

1. La sesion archivada queda en modo solo lectura
2. Todos los reportes y evidencias permanecen accesibles
3. El audit log contiene registro completo de la auditoria

---

# ANEXOS

---

## Anexo A: Checklist de Verificacion Pre-Auditoria

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    CHECKLIST PRE-AUDITORIA                              │
│                    AT5 MCP System - Enero 2026                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  AMBIENTE AT5 AUDIT PLATFORM                                            │
│  ──────────────────────────────────────────────────────────────────    │
│  [ ] Servidor iniciado (npm run dev)                                    │
│  [ ] URL accesible: http://localhost:3000                               │
│  [ ] Login exitoso como Lead Auditor                                    │
│  [ ] Plan de Pruebas AT5 MCP cargado                                   │
│                                                                         │
│  AMBIENTE AT5 MCP                                                       │
│  ──────────────────────────────────────────────────────────────────    │
│  [ ] AT5 Workbench ejecutable                                           │
│  [ ] Plugins instalados (IEC104, Modbus, Agent)                         │
│  [ ] Manual-AT5.pdf presente                                            │
│  [ ] API Key LLM configurada                                            │
│  [ ] Conexion a Internet activa                                         │
│  [ ] Asistente IA responde correctamente                                │
│                                                                         │
│  DATOS DE PRUEBA                                                        │
│  ──────────────────────────────────────────────────────────────────    │
│  [ ] Al menos 2 proyectos existentes                                    │
│  [ ] Proyecto limpio disponible                                         │
│                                                                         │
│  HERRAMIENTAS                                                           │
│  ──────────────────────────────────────────────────────────────────    │
│  [ ] Captura de pantalla lista (Win+Shift+S)                            │
│  [ ] Este manual disponible                                             │
│                                                                         │
│  Verificado por: ________________________ Fecha: __/__/____             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Anexo B: Plantilla de Registro de Defectos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         REGISTRO DE DEFECTO                             │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ID del Defecto: DEF-____                                               │
│  Caso de Prueba: TC-____-____                                           │
│  Fecha: __/__/____                                                      │
│  Reportado por: ____________________                                    │
│                                                                         │
│  SEVERIDAD:  [ ] Critica  [ ] Alta  [ ] Media  [ ] Baja                │
│                                                                         │
│  TITULO:                                                                │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  DESCRIPCION:                                                           │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  │                                                                  │   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  PASOS PARA REPRODUCIR:                                                 │
│  1. ____________________________________________________________       │
│  2. ____________________________________________________________       │
│  3. ____________________________________________________________       │
│                                                                         │
│  RESULTADO ESPERADO:                                                    │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  RESULTADO ACTUAL:                                                      │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                                                                  │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                         │
│  EVIDENCIAS:                                                            │
│  [ ] Captura de pantalla: ________________                              │
│  [ ] Log de error: ________________                                     │
│  [ ] Otro: ________________                                             │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Anexo C: Glosario de Terminos

| Termino | Definicion |
|---------|------------|
| **AT5 MCP** | Sistema bajo prueba - software industrial SCADA con IA |
| **AT5 Audit Platform** | Aplicacion web para gestionar la auditoria |
| **MCP** | Model Context Protocol - protocolo de comunicacion con LLM |
| **RAG** | Retrieval-Augmented Generation - consultas aumentadas con documentacion |
| **IEC 60870-5-104** | Protocolo de comunicacion para sistemas SCADA |
| **Modbus** | Protocolo de comunicacion industrial |
| **Slave/Master** | Servidor/Cliente en comunicacion industrial |
| **IOA** | Information Object Address - direccion de objeto IEC104 |
| **LLM** | Large Language Model - modelo de lenguaje (GPT, Claude, etc.) |
| **Suite** | Agrupacion de casos de prueba relacionados |
| **Caso de Prueba** | Conjunto de pasos para verificar un requisito |
| **Evidencia** | Archivo que documenta el resultado de una prueba |
| **Audit Log** | Registro inmutable de todas las acciones |
| **Firma Digital** | Certificado SHA-256 de aprobacion |

---

## Anexo D: Resolucion de Problemas

### Problemas en AT5 Audit Platform

| Problema | Solucion |
|----------|----------|
| No puedo hacer login | Verificar credenciales, esperar si cuenta bloqueada |
| Sesion expira | Refrescar pagina, volver a autenticar |
| No puedo subir evidencia | Registrar resultado primero |
| Boton "Firmar" no aparece | Verificar rol (debe ser LEAD_AUDITOR o REVIEWER) |

### Problemas en AT5 MCP

| Problema | Solucion |
|----------|----------|
| Asistente IA no responde | Verificar API Key, conexion a Internet |
| "Proyecto no encontrado" | Verificar nombre exacto con list_projects |
| "Puerto en uso" | Cerrar otras instancias, verificar con netstat |
| Dispositivo no inicia | Verificar configuracion, revisar logs |
| RAG no encuentra informacion | Verificar que Manual-AT5.pdf existe |

---

**FIN DEL MANUAL**

---

*Manual de Auditoria AT5 MCP*
*Version 1.0.0 - Enero 2026*
*Generado para AT5 Audit Platform*
*Cumple con ISO/IEC/IEEE 29119, ISTQB, IEEE 829*

