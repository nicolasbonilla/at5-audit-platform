# AT5 AI Auditor - Sistema de Auditoria Automatizada

## Descripcion General

El AI Auditor es un sistema avanzado de auditoria automatizada que permite ejecutar casos de prueba del protocolo MCP utilizando inteligencia artificial. Sigue los estandares ISO/IEC/IEEE 29119-2 (Test Processes) e IEEE 829.

## Arquitectura

```
src/lib/ai-auditor/
├── index.ts              # Barrel exports
├── types.ts              # Definiciones de tipos y schemas Zod
├── mcp-client.ts         # Cliente MCP para comunicacion con AT5
├── llm-adapter.ts        # Adaptadores para multiples proveedores LLM
├── service.ts            # Servicio core de orquestacion
├── execution-queue.ts    # Sistema de cola de ejecucion
└── README.md             # Esta documentacion
```

## Modulos

### 1. Types (`types.ts`)

Define todas las interfaces, enumeraciones y schemas de validacion:

- **Enumeraciones**: `LLMProvider`, `MCPConnectionType`, `AIAuditRunStatus`, `AIAuditMode`, etc.
- **Interfaces Core**: `AIAuditorConfiguration`, `AITestCaseInput`, `AITestAnalysis`, `MCPToolCall`
- **Schemas Zod**: Validacion en runtime para API inputs

### 2. MCP Client (`mcp-client.ts`)

Cliente tipado para comunicacion con el servidor MCP de AT5:

```typescript
const client = new MCPClient(config.mcp)
await client.connect()

const response = await client.callTool({
  tool: 'read_signals',
  parameters: { device_id: 'PLC_001' }
})
```

Caracteristicas:
- Soporte para Named Pipes, HTTP, WebSocket
- Reconexion automatica
- Manejo de timeouts
- Event-driven architecture

### 3. LLM Adapter (`llm-adapter.ts`)

Interfaz unificada para multiples proveedores LLM:

- OpenAI (GPT-4, GPT-4o)
- Anthropic (Claude)
- DeepSeek
- Google Gemini (pendiente)
- Mistral (pendiente)
- Ollama (pendiente)
- Azure OpenAI (pendiente)

```typescript
const adapter = createLLMAdapter(config)
const analysis = await adapter.analyzeTestCase(testCase)
```

### 4. Service (`service.ts`)

Servicio core que orquesta toda la ejecucion:

```typescript
const service = await createAIAuditorService(configId)
await service.initialize()

const runId = await service.startRun({
  sessionId: 'session-123',
  mode: 'SEMI_AUTOMATIC',
})

service.on('testCompleted', (result) => {
  console.log(`Test ${result.testCaseId}: ${result.verdict}`)
})
```

Responsabilidades:
- Gestion del ciclo de vida de runs
- Coordinacion LLM-MCP
- Manejo de confirmaciones human-in-the-loop
- Persistencia de estado

### 5. Execution Queue (`execution-queue.ts`)

Sistema Singleton para gestion de cola de ejecucion:

```typescript
const queue = ExecutionQueueManager.getInstance()
await queue.initialize()

const position = await queue.enqueue({
  runId: 'run-123',
  sessionId: 'session-456',
  configId: 'config-789',
  mode: 'SEMI_AUTOMATIC',
  priority: 1,
})
```

Caracteristicas:
- Limite de ejecuciones concurrentes
- Prioridad de ejecucion
- Recuperacion de estado tras restart
- Persistencia en base de datos

## API REST

### Endpoints

| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| GET | `/api/ai-auditor` | Listar ejecuciones |
| POST | `/api/ai-auditor` | Iniciar nueva ejecucion |
| GET | `/api/ai-auditor/[runId]` | Detalles de ejecucion |
| PATCH | `/api/ai-auditor/[runId]` | Pausar/Resumir/Cancelar |
| DELETE | `/api/ai-auditor/[runId]` | Eliminar ejecucion |
| GET | `/api/ai-auditor/[runId]/confirmations` | Listar confirmaciones |
| POST | `/api/ai-auditor/[runId]/confirmations` | Responder confirmacion |
| GET | `/api/ai-auditor/config` | Listar configuraciones |
| POST | `/api/ai-auditor/config` | Crear configuracion |

### Ejemplo: Iniciar Ejecucion

```bash
POST /api/ai-auditor
Content-Type: application/json

{
  "sessionId": "clx123...",
  "mode": "SEMI_AUTOMATIC",
  "testCaseIds": ["tc1", "tc2"],  // opcional, null = todos
  "options": {
    "stopOnCriticalFailure": true,
    "maxRetries": 3
  }
}
```

## Modos de Ejecucion

| Modo | Descripcion |
|------|-------------|
| `AUTOMATIC` | Sin intervencion humana, solo para pruebas de bajo riesgo |
| `SEMI_AUTOMATIC` | Requiere confirmacion para acciones criticas (write_signal, etc.) |
| `ASSISTED` | IA sugiere acciones, humano ejecuta manualmente |
| `DRY_RUN` | Simula ejecucion sin ejecutar, util para validacion |

## Modelo de Datos

### Tablas Principales

- `AIAuditorConfig`: Configuraciones del sistema
- `AIAuditRun`: Ejecuciones de auditoria
- `AITestExecution`: Ejecucion individual de casos
- `AIConfirmationRequest`: Solicitudes de confirmacion
- `AIAuditLog`: Log detallado de eventos

### Relaciones

```
AuditSession 1--* AIAuditRun
AIAuditRun 1--* AITestExecution
AIAuditRun 1--* AIConfirmationRequest
AIAuditRun 1--* AIAuditLog
AITestExecution *--1 TestCase
```

## Configuracion

### Variables de Entorno

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Anthropic
ANTHROPIC_API_KEY=sk-ant-...

# DeepSeek
DEEPSEEK_API_KEY=...

# MCP Server (si usa HTTP)
MCP_SERVER_HOST=localhost
MCP_SERVER_PORT=3001
```

### Configuracion en Base de Datos

La configuracion se almacena en `AIAuditorConfig` y puede ser gestionada via API:

```json
{
  "name": "Production Config",
  "llmProvider": "OPENAI",
  "llmModel": "gpt-4o",
  "llmTemperature": 0.1,
  "mcpConnectionType": "NAMED_PIPE",
  "mcpPipeName": "AT5_MCP_PIPE",
  "actionsRequiringConfirmation": ["write_signal", "stop_device"]
}
```

## Flujo de Ejecucion

1. **Inicializacion**: Conexion MCP, validacion LLM
2. **Analisis**: LLM analiza caso de prueba
3. **Planificacion**: LLM genera plan de ejecucion
4. **Ejecucion**: Ejecuta pasos via MCP
5. **Confirmacion**: Solicita confirmacion humana si es necesario
6. **Validacion**: LLM interpreta resultados
7. **Persistencia**: Guarda resultados y evidencias

## Eventos

El servicio emite eventos para monitoreo en tiempo real:

```typescript
service.on('runStarted', (summary) => { ... })
service.on('runProgress', (summary) => { ... })
service.on('testStarted', (testId, testCode) => { ... })
service.on('testCompleted', (result) => { ... })
service.on('confirmationRequired', (request) => { ... })
service.on('runCompleted', (summary) => { ... })
service.on('runFailed', (summary, error) => { ... })
```

## Seguridad

- Todas las API requieren autenticacion
- Acciones criticas requieren confirmacion humana
- Logs inmutables para auditoria
- Hash de integridad en resultados
- API keys no se persisten en DB

## Estandares Cumplidos

- **ISO/IEC/IEEE 29119-2**: Test Processes
- **IEEE 829**: Test Documentation
- **ISTQB**: Metodologias de testing
- **SOLID**: Principios de diseno
- **Clean Architecture**: Separacion de responsabilidades

## Limitaciones Conocidas

1. Named Pipes solo funcionan en entorno servidor (no browser)
2. Proveedores Gemini, Mistral, Ollama pendientes de implementacion
3. Capturas de pantalla requieren integracion adicional

## Proximos Pasos

1. Implementar adaptadores LLM faltantes
2. Agregar soporte para capturas de pantalla
3. Integrar con sistema de reportes
4. Dashboard de metricas en tiempo real
5. Tests unitarios y de integracion
