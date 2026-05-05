/**
 * Shannon API Server
 *
 * Express backend for the Obsidian Security Control Plane UI.
 * Reads workspace data from the filesystem and exposes REST endpoints.
 *
 * Endpoints:
 *   GET  /api/workspaces              — List all workspaces
 *   GET  /api/workspaces/:name        — Get workspace detail
 *   GET  /api/workspaces/:name/log    — Get workflow log
 *   GET  /api/workspaces/:name/report — Get report markdown
 *   GET  /api/workspaces/:name/findings — Get parsed findings
 *   GET  /api/workspaces/:name/deliverables/:filename — Get deliverable
 *   POST /api/scans                   — Start a new scan
 *   GET  /api/scans/:id/progress      — Get scan progress
 *   POST /api/scans/:id/stop          — Stop a scan
 *   GET  /api/health                  — Health check
 *
 * Environment:
 *   PORT           — Server port (default: 3001)
 *   WORKSPACES_DIR — Path to workspaces directory (default: ../../workspaces)
 *   CORS_ORIGIN    — Frontend origin (default: http://localhost:5173)
 */

import express from 'express'
import cors from 'cors'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { WorkspaceService } from './services/workspace.service.js'
import { createWorkspaceRoutes } from './routes/workspaces.js'
import { createScanRoutes } from './routes/scans.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Configuration
const PORT = parseInt(process.env.PORT || '3001', 10)
const WORKSPACES_DIR = process.env.WORKSPACES_DIR || path.resolve(__dirname, '..', '..', '..', 'workspaces')
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173'

// Initialize services
const workspaceService = new WorkspaceService(WORKSPACES_DIR)

// Create Express app
const app = express()

// Middleware
app.use(cors({
  origin: CORS_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))
app.use(express.json())

// Request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`)
  next()
})

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'shannon-api',
    version: '1.0.0',
    workspacesDir: WORKSPACES_DIR,
    timestamp: new Date().toISOString(),
  })
})

// Mount routes
app.use('/api/workspaces', createWorkspaceRoutes(workspaceService))
app.use('/api/scans', createScanRoutes())

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ status: 'error', message: 'Not found' })
})

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ status: 'error', message: 'Internal server error' })
})

// Start server
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════╗
║   Shannon API Server                          ║
║   Port: ${String(PORT).padEnd(38)}║
║   Workspaces: ${WORKSPACES_DIR.slice(-33).padEnd(33)}║
║   CORS: ${CORS_ORIGIN.padEnd(38)}║
╚═══════════════════════════════════════════════╝
  `)
})

export default app
