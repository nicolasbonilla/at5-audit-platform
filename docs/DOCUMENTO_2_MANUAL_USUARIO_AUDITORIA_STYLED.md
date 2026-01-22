---
pdf_options:
  format: A4
  margin: 25mm 20mm
  printBackground: true
  headerTemplate: |
    <style>
      section { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; width: 100%; padding: 0 20mm; }
      .left { float: left; color: #0d9488; font-weight: bold; }
      .right { float: right; color: #666; }
    </style>
    <section>
      <span class="left">AT5 AUDIT PLATFORM - MANUAL DE USUARIO PARA AUDITORIA</span>
      <span class="right">Guia Completa - Enero 2026</span>
    </section>
  footerTemplate: |
    <style>
      section { font-family: 'Segoe UI', Arial, sans-serif; font-size: 9px; width: 100%; padding: 0 20mm; text-align: center; color: #666; }
    </style>
    <section>
      Pagina <span class="pageNumber"></span> de <span class="totalPages"></span> | Manual Operativo | ISO/IEC/IEEE 29119 - ISTQB
    </section>
  displayHeaderFooter: true
body_class: markdown-body
css: |
  body {
    font-family: 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.6;
    color: #1a1a1a;
    max-width: 100%;
  }
  h1 {
    color: #0d9488;
    border-bottom: 3px solid #0d9488;
    padding-bottom: 10px;
    margin-top: 40px;
    font-size: 24pt;
    page-break-before: always;
  }
  h1:first-of-type {
    page-break-before: avoid;
    text-align: center;
    font-size: 28pt;
    margin-top: 0;
  }
  h2 {
    color: #115e59;
    border-bottom: 2px solid #14b8a6;
    padding-bottom: 5px;
    margin-top: 30px;
    font-size: 18pt;
  }
  h3 {
    color: #134e4a;
    margin-top: 25px;
    font-size: 14pt;
  }
  h4 {
    color: #1a1a1a;
    font-size: 12pt;
    margin-top: 20px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 15px 0;
    font-size: 10pt;
  }
  th {
    background-color: #0d9488;
    color: white;
    padding: 10px 8px;
    text-align: left;
    font-weight: bold;
  }
  td {
    padding: 8px;
    border: 1px solid #d1d5db;
  }
  tr:nth-child(even) {
    background-color: #f0fdfa;
  }
  tr:hover {
    background-color: #ccfbf1;
  }
  code {
    background-color: #f3f4f6;
    padding: 2px 6px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', monospace;
    font-size: 10pt;
    color: #0d9488;
  }
  pre {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 15px;
    border-radius: 8px;
    overflow-x: auto;
    font-size: 9pt;
    line-height: 1.4;
    border-left: 4px solid #0d9488;
  }
  pre code {
    background-color: transparent;
    color: #f9fafb;
    padding: 0;
  }
  blockquote {
    border-left: 4px solid #14b8a6;
    padding-left: 15px;
    margin: 15px 0;
    color: #4b5563;
    background-color: #f0fdfa;
    padding: 10px 15px;
    border-radius: 0 8px 8px 0;
  }
  hr {
    border: none;
    border-top: 2px solid #0d9488;
    margin: 30px 0;
  }
  strong {
    color: #0d9488;
  }
  a {
    color: #0d9488;
    text-decoration: none;
  }
  ul, ol {
    margin: 10px 0;
    padding-left: 25px;
  }
  li {
    margin: 5px 0;
  }
  .tip-box {
    background-color: #ecfdf5;
    border: 1px solid #10b981;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
  }
  .warning-box {
    background-color: #fffbeb;
    border: 1px solid #f59e0b;
    border-radius: 8px;
    padding: 15px;
    margin: 15px 0;
  }
  @media print {
    h1 { page-break-before: always; }
    h1:first-of-type { page-break-before: avoid; }
    pre, table { page-break-inside: avoid; }
  }
---

# AT5 Audit Platform: Manual de Usuario para Auditoria de Software

## Guia Completa para Auditores
### Procedimientos de Verificacion y Validacion de Software

---

**Version**: 1.0.0
**Fecha**: Enero 2026
**Clasificacion**: Manual Operativo de Usuario
**Audiencia**: Auditores de Software, Lead Auditors, Reviewers
**Estandares**: ISO/IEC/IEEE 29119, ISTQB Foundation Level

---

## Indice de Contenidos

1. Introduccion al Sistema
2. Requisitos y Acceso al Sistema
3. Autenticacion y Roles de Usuario
4. Panel de Control (Dashboard)
5. Gestion de Sesiones de Auditoria
6. Ejecucion de Casos de Prueba
7. Gestion de Evidencias
8. Proceso de Firma y Aprobacion
9. Generacion de Reportes
10. Consulta del Log de Auditoria
11. Flujo Completo de Auditoria: Caso Practico
12. Resolucion de Problemas Comunes
13. Glosario de Terminos

---

## 1. Introduccion al Sistema

### 1.1 Proposito de AT5 Audit Platform

AT5 Audit Platform es un sistema empresarial de auditoria de software disenado para facilitar la ejecucion, documentacion y trazabilidad de pruebas de software de acuerdo con los estandares internacionales ISO/IEC/IEEE 29119 e ISTQB.

### 1.2 Caracteristicas Principales

| Caracteristica | Descripcion | Beneficio |
|---------------|-------------|-----------|
| **Ejecucion Interactiva** | Interfaz paso a paso | Guia clara del proceso |
| **Gestion de Evidencias** | Capturas, logs, documentos | Documentacion completa |
| **Firmas Digitales** | Certificados SHA-256 | No repudio y validez legal |
| **Audit Log Inmutable** | Hash encadenado | Trazabilidad total |
| **Reportes Automaticos** | PDF, DOCX, JSON | Ahorro de tiempo |
| **Metricas en Tiempo Real** | Dashboards con KPIs | Visibilidad del progreso |

### 1.3 Flujo General de Trabajo

El proceso de auditoria sigue estos pasos principales:

1. **LOGIN** - Autenticacion en el sistema
2. **CREAR SESION** - Seleccionar plan de pruebas y auditor
3. **INICIAR AUDITORIA** - Cambiar estado a IN_PROGRESS
4. **EJECUTAR CASOS** - Seguir pasos, documentar resultados, agregar evidencias
5. **REVISION** - Enviar a revision de firmas
6. **FIRMA Y APROBACION** - Lead Auditor + Reviewer firman
7. **GENERAR REPORTES** - PDF ejecutivo, detallado, defectos
8. **ARCHIVAR** - Estado final ARCHIVED

---

## 2. Requisitos y Acceso al Sistema

### 2.1 Requisitos de Hardware

| Componente | Minimo | Recomendado |
|------------|--------|-------------|
| Procesador | Dual Core 2.0 GHz | Quad Core 2.5 GHz+ |
| Memoria RAM | 4 GB | 8 GB+ |
| Almacenamiento | 500 MB libre | 2 GB+ libre |
| Pantalla | 1280x720 | 1920x1080+ |
| Conexion | 1 Mbps | 10 Mbps+ |

### 2.2 Requisitos de Software

| Software | Version | Notas |
|----------|---------|-------|
| **Navegador** | Chrome 90+, Firefox 88+, Edge 90+ | Chrome recomendado |
| **JavaScript** | Habilitado | Requerido |
| **Cookies** | Habilitadas | Para sesion |

### 2.3 URL de Acceso

- **Produccion**: https://at5-audit.axongroup.com
- **Desarrollo**: http://localhost:3000

---

## 3. Autenticacion y Roles de Usuario

### 3.1 Proceso de Inicio de Sesion

**Paso 1**: Acceder a la pagina de login
- Abrir navegador y navegar a la URL del sistema

**Paso 2**: Ingresar credenciales
- Email corporativo en el campo "Correo Electronico"
- Contrasena en el campo "Contrasena"

**Paso 3**: Autenticar
- Clic en "Ingresar"
- Redireccion automatica al Dashboard

### 3.2 Credenciales de Prueba

| Rol | Email | Contrasena |
|-----|-------|------------|
| **Lead Auditor** | garcia@axongroup.com | audit2026 |
| **Auditor** | lopez@axongroup.com | audit2026 |
| **Reviewer** | martinez@axongroup.com | audit2026 |

### 3.3 Roles y Permisos

| Rol | Crear Sesion | Ejecutar | Firmar | Ver Logs |
|-----|:------------:|:--------:|:------:|:--------:|
| **ADMIN** | ✓ | ✓ | ✓ | ✓ |
| **LEAD_AUDITOR** | ✓ | ✓ | ✓ | ✓ |
| **AUDITOR** | - | ✓ | - | - |
| **REVIEWER** | - | - | ✓ | ✓ |
| **VIEWER** | - | - | - | - |

### 3.4 Seguridad de la Cuenta

- **Bloqueo automatico**: 5 intentos fallidos = 15 minutos de bloqueo
- **Duracion de sesion**: 8 horas de inactividad
- **Contrasenas**: Encriptadas con bcrypt (10 rounds)

---

## 4. Panel de Control (Dashboard)

### 4.1 Vista General

El Dashboard presenta una vista consolidada del estado de las auditorias con:

**Tarjetas de Estadisticas:**
- Sesiones Activas (azul)
- Tasa de Exito (verde)
- En Revision (amarillo)
- Completadas (teal)

**Graficos Interactivos:**
- Grafico de Torta: Distribucion de estados
- Indicador Gauge: Tasa de exito global
- Grafico de Linea: Tendencia 7 dias
- Grafico de Barras: Progreso de sesiones

### 4.2 Acciones Rapidas

Desde el Dashboard puede:
1. **Crear Nueva Auditoria**: Boton "+ Nueva Auditoria"
2. **Continuar Auditoria**: Retomar ultima sesion
3. **Revisar Defectos**: Ver casos FAILED
4. **Aprobar Sesion**: Acceder a pendientes de firma

---

## 5. Gestion de Sesiones de Auditoria

### 5.1 Crear Nueva Sesion

**Campos del Formulario:**

| Campo | Obligatorio | Descripcion |
|-------|:-----------:|-------------|
| Nombre | Si | Identificador descriptivo |
| Descripcion | No | Alcance y objetivos |
| Plan de Pruebas | Si | Plan con casos a ejecutar |
| Auditor | Si | Responsable de ejecucion |

**Proceso:**
1. Clic en "+ Nueva Auditoria"
2. Completar formulario
3. Clic en "Crear"
4. Sesion creada en estado DRAFT

### 5.2 Estados de una Sesion

| Estado | Descripcion | Siguiente |
|--------|-------------|-----------|
| **DRAFT** | Borrador inicial | IN_PROGRESS |
| **IN_PROGRESS** | Ejecucion activa | REVIEW |
| **REVIEW** | Pendiente de firmas | APPROVED/REJECTED |
| **APPROVED** | Firmas completas | ARCHIVED |
| **REJECTED** | Requiere re-trabajo | IN_PROGRESS |
| **ARCHIVED** | Estado final | - |

### 5.3 Ver Lista de Sesiones

Navegue a **Sesiones** para ver la tabla con filtros por:
- Estado (Todos, En Progreso, Completadas)
- Fecha
- Auditor responsable

---

## 6. Ejecucion de Casos de Prueba

### 6.1 Acceder al Modo de Ejecucion

1. Desde detalle de sesion, clic en "Ejecutar Pruebas"
2. O clic en "Continuar" en sesion IN_PROGRESS

### 6.2 Interfaz de Ejecucion

La pantalla se divide en tres columnas:

| Columna | Contenido |
|---------|-----------|
| **Izquierda** | Lista de casos de prueba por suite |
| **Centro** | Detalle del caso, pasos, resultado |
| **Derecha** | Cronometro, estadisticas, evidencias |

### 6.3 Procedimiento Paso a Paso

**Paso 1: Seleccionar Caso**
- Casos agrupados por Suite
- Iconos indican estado (gris=pendiente, verde=aprobado, rojo=fallido)

**Paso 2: Revisar Informacion**
- Codigo (ej: TC-LOG-001)
- Prioridad (CRITICAL, HIGH, MEDIUM, LOW)
- Descripcion y precondiciones
- Resultado esperado

**Paso 3: Iniciar Cronometro**
- Boton [▶] para iniciar
- Boton [⟲] para reiniciar

**Paso 4: Ejecutar Pasos**
- Seguir cada paso indicado
- Marcar checkbox al completar
- Verificar comportamiento del sistema

**Paso 5: Documentar Resultado**
- Campo "Resultado Actual": descripcion objetiva
- Campo "Notas": informacion adicional

**Paso 6: Registrar Resultado**

| Boton | Cuando Usar |
|-------|-------------|
| **Aprobado** (verde) | Comportamiento correcto |
| **Fallido** (rojo) | Defecto detectado |
| **Bloqueado** (amarillo) | Dependencia no satisfecha |
| **Omitir** (gris) | Fuera de alcance |

### 6.4 Criterios de Resultado

**PASSED (Aprobado):**
- Todos los pasos completados
- Resultado coincide con esperado
- Sin desviaciones

**FAILED (Fallido):**
- Al menos un paso fallo
- Resultado difiere del esperado
- **Siempre agregar evidencia**

**BLOCKED (Bloqueado):**
- No se pudo ejecutar
- Documentar razon del bloqueo

**SKIPPED (Omitido):**
- No aplica en este ciclo
- Razon valida documentada

---

## 7. Gestion de Evidencias

### 7.1 Tipos Soportados

| Tipo | Extensiones | Uso |
|------|-------------|-----|
| Screenshot | .png, .jpg | Capturas de pantalla |
| Log | .txt, .log | Archivos de log |
| PDF | .pdf | Documentos |
| Video | .mp4, .webm | Grabaciones |
| JSON | .json | Datos de API |

### 7.2 Subir Evidencia

**Metodo 1: Drag & Drop**
- Arrastrar archivo al area de evidencias
- Soltar para subir automaticamente

**Metodo 2: Boton Seleccionar**
- Clic en "Seleccionar Archivos"
- Navegar y seleccionar archivo

**Metodo 3: Botones Rapidos**
- "Captura": Solo imagenes
- "Log": Solo archivos de texto

> **Importante**: Solo puede subir evidencia despues de registrar un resultado en el caso de prueba.

### 7.3 Visualizar y Eliminar

- **Ver**: Icono [👁] abre vista previa
- **Eliminar**: Icono [🗑] elimina con confirmacion

### 7.4 Integridad de Evidencias

Cada archivo genera automaticamente:
- Hash SHA-256 (verificacion de integridad)
- Timestamp de subida
- Metadatos (tamano, tipo MIME)

---

## 8. Proceso de Firma y Aprobacion

### 8.1 Requisitos para Firmar

- Sesion en estado **REVIEW**
- Rol: LEAD_AUDITOR, REVIEWER, o ADMIN
- No haber firmado previamente

### 8.2 Firmas Requeridas

| Rol | Obligatorio | Proposito |
|-----|:-----------:|-----------|
| LEAD_AUDITOR | Si | Certifica ejecucion |
| REVIEWER | Si | Certifica revision |

### 8.3 Procedimiento de Firma

1. Acceder a sesion en REVIEW
2. Revisar resultados y evidencias
3. Clic en "Agregar Firma"
4. Opcionalmente dibujar firma visual
5. Confirmar con "Firmar"

### 8.4 Certificado Digital

La firma genera un certificado con:
- ID unico de firma
- Usuario y email
- Rol del firmante
- Fecha/hora exacta
- Direccion IP
- Hash SHA-256 del estado

### 8.5 Verificacion de Firma

- Clic en "Verificar" junto a una firma
- Sistema recalcula hash y compara
- **VALIDA**: Datos no alterados
- **INVALIDA**: Posible alteracion detectada

### 8.6 Aprobacion Automatica

Cuando ambas firmas estan presentes:
- Estado cambia a **APPROVED**
- Registro en audit log
- Lista para archivar

---

## 9. Generacion de Reportes

### 9.1 Tipos de Reportes

| Tipo | Formato | Audiencia |
|------|---------|-----------|
| **Resumen Ejecutivo** | PDF | Gerencia |
| **Reporte Detallado** | DOCX | Equipo tecnico |
| **Reporte de Defectos** | PDF | Desarrolladores |
| **Metricas** | JSON | Integraciones |

### 9.2 Generar Reporte

1. Desde detalle de sesion, clic en "Generar Reporte"
2. Seleccionar tipo de reporte
3. Marcar opciones (evidencias, firmas, logs)
4. Clic en "Generar"
5. Descargar archivo generado

### 9.3 Contenido del Reporte Detallado

1. **Portada**: Nombre, fecha, auditor, estado
2. **Resumen Ejecutivo**: KPIs y recomendaciones
3. **Detalle**: Cada caso con resultado y evidencias
4. **Firmas**: Lista de certificados
5. **Anexos**: Evidencias en alta resolucion

---

## 10. Consulta del Log de Auditoria

### 10.1 Acceso

- Menu lateral > "Audit Log"
- Requiere: ADMIN, LEAD_AUDITOR, o REVIEWER

### 10.2 Filtros Disponibles

| Filtro | Descripcion |
|--------|-------------|
| Usuario | Quien realizo la accion |
| Accion | Tipo (LOGIN, TEST_PASSED, etc.) |
| Entidad | Objeto afectado |
| Fecha | Rango temporal |

### 10.3 Acciones Registradas

| Accion | Descripcion |
|--------|-------------|
| LOGIN | Inicio de sesion exitoso |
| LOGIN_FAILED | Intento fallido |
| SESSION_CREATED | Sesion creada |
| TEST_PASSED | Caso aprobado |
| TEST_FAILED | Caso fallido |
| EVIDENCE_UPLOADED | Evidencia subida |
| SIGNATURE_ADDED | Firma agregada |
| REPORT_GENERATED | Reporte generado |

### 10.4 Verificar Integridad

- Boton "Verificar Integridad"
- Recalcula todos los hashes
- **OK**: Cadena intacta
- **COMPROMETIDA**: Registros alterados

---

## 11. Flujo Completo de Auditoria: Caso Practico

### Escenario: Auditoria del Modulo de Login

**Fase 1: Preparacion**
1. Login con garcia@axongroup.com
2. Crear sesion "Auditoria Login v2.1"
3. Asignar plan de pruebas de Login
4. Iniciar auditoria

**Fase 2: Ejecucion**

| Caso | Resultado | Evidencia |
|------|-----------|-----------|
| TC-LOG-001: Login valido | PASSED | - |
| TC-LOG-002: Login invalido | PASSED | - |
| TC-LOG-003: Bloqueo cuenta | FAILED | captura.png, log.txt |
| TC-LOG-004: 2FA | BLOCKED | - |

**Fase 3: Revision**
1. Revisar estadisticas: 2 PASSED, 1 FAILED, 1 BLOCKED
2. Verificar evidencias del caso fallido
3. Enviar a revision

**Fase 4: Aprobacion**
1. Lead Auditor firma (garcia@)
2. Reviewer firma (martinez@)
3. Estado cambia a APPROVED

**Fase 5: Documentacion**
1. Generar Reporte Ejecutivo (PDF)
2. Generar Reporte de Defectos
3. Archivar sesion

**Resumen:**

| Metrica | Valor |
|---------|-------|
| Total Casos | 4 |
| Aprobados | 2 (50%) |
| Fallidos | 1 (25%) |
| Bloqueados | 1 (25%) |
| Tasa de Exito | 66.7% |

---

## 12. Resolucion de Problemas Comunes

### 12.1 Problemas de Autenticacion

| Problema | Solucion |
|----------|----------|
| "Credenciales invalidas" | Verificar mayusculas/minusculas |
| "Cuenta bloqueada" | Esperar 15 minutos |
| "Cuenta desactivada" | Contactar administrador |

### 12.2 Problemas de Ejecucion

| Problema | Solucion |
|----------|----------|
| No puedo ejecutar | Iniciar auditoria primero |
| No aparecen casos | Verificar plan asignado |
| Resultados no guardan | Refrescar, re-autenticar |

### 12.3 Problemas de Evidencias

| Problema | Solucion |
|----------|----------|
| No puedo subir | Registrar resultado primero |
| Archivo muy grande | Comprimir o dividir |
| No visualiza | Formato no soportado |

### 12.4 Problemas de Firma

| Problema | Solucion |
|----------|----------|
| No puedo firmar | Verificar rol y estado |
| "Ya firmaste" | Solo una firma por rol |
| Firma invalida | Datos modificados post-firma |

---

## 13. Glosario de Terminos

| Termino | Definicion |
|---------|------------|
| **Auditoria de Software** | Evaluacion independiente de productos de software |
| **Caso de Prueba** | Condiciones y pasos para verificar un requisito |
| **Certificado Digital** | Hash que garantiza autenticidad de firma |
| **Evidencia** | Archivo que documenta resultado de prueba |
| **Hash SHA-256** | Funcion criptografica de resumen unico |
| **Plan de Pruebas** | Documento con alcance y enfoque de testing |
| **RBAC** | Control de Acceso Basado en Roles |
| **Sesion de Auditoria** | Instancia de ejecucion de un plan |
| **Suite de Pruebas** | Agrupacion de casos relacionados |
| **Trazabilidad** | Capacidad de rastrear acciones a su origen |

---

## Anexos

### Anexo A: Atajos de Teclado

| Atajo | Accion |
|-------|--------|
| Ctrl + Enter | Guardar resultado |
| Espacio | Marcar/desmarcar paso |
| ↑ / ↓ | Navegar casos |
| P | Marcar PASSED |
| F | Marcar FAILED |

### Anexo B: Contacto de Soporte

- **Email**: soporte@axongroup.com
- **Telefono**: +56 2 1234 5678
- **Horario**: Lunes a Viernes, 9:00 - 18:00

---

**Fin del Manual de Usuario**

*AT5 Audit Platform - Manual de Usuario para Auditoria*
*Version 1.0.0 - Enero 2026*
*Todos los derechos reservados*
