/**
 * Scan API Routes
 *
 * POST /api/scans              — Start a new scan (triggers Temporal workflow)
 * GET  /api/scans/:id/progress — Get live scan progress (queries Temporal)
 * POST /api/scans/:id/stop     — Stop/cancel a running scan
 * GET  /api/scans/active       — List all running scans
 */

import { Router } from 'express'
import {
  startScan,
  getScanProgress,
  stopScan,
  listRunningScans,
} from '../services/temporal.service.js'
import { requireApiKey } from '../middleware/auth.js'

export function createScanRoutes(): Router {
  const router = Router()

  // List active scans
  router.get('/active', async (_req, res) => {
    try {
      const scans = await listRunningScans()
      res.json({ status: 'ok', data: scans, count: scans.length })
    } catch (err) {
      console.error('Error listing active scans:', err)
      res.status(500).json({ status: 'error', message: 'Failed to list active scans' })
    }
  })

  // Start a new scan (requires API key)
  router.post('/', requireApiKey, async (req, res) => {
    try {
      const { targetUrl, repoPath, workspace, apiKey, pipelineTestingMode } = req.body

      if (!targetUrl || !repoPath) {
        res.status(400).json({
          status: 'error',
          message: 'targetUrl and repoPath are required',
        })
        return
      }

      console.log(`[Scan] Starting new scan:`, {
        targetUrl,
        repoPath,
        workspace: workspace || '(auto-generated)',
      })

      const result = await startScan({
        targetUrl,
        repoPath,
        workspace,
        apiKey,
        pipelineTestingMode,
      })

      res.status(201).json({
        status: 'ok',
        data: {
          scanId: result.scanId,
          workspaceName: result.workspaceName,
          message: 'Scan started successfully',
        },
      })
    } catch (err) {
      console.error('Error starting scan:', err)
      const message = err instanceof Error ? err.message : 'Failed to start scan'
      res.status(500).json({ status: 'error', message })
    }
  })

  // Get scan progress (Temporal query)
  router.get('/:id/progress', async (req, res) => {
    try {
      const progress = await getScanProgress(req.params.id)

      if (!progress) {
        res.status(404).json({
          status: 'error',
          message: `Scan ${req.params.id} not found`,
        })
        return
      }

      res.json({ status: 'ok', data: progress })
    } catch (err) {
      console.error('Error getting progress:', err)
      res.status(500).json({ status: 'error', message: 'Failed to get progress' })
    }
  })

  // Stop a running scan (requires API key)
  router.post('/:id/stop', requireApiKey, async (req, res) => {
    try {
      const stopped = await stopScan(req.params.id as string)

      if (!stopped) {
        res.status(404).json({
          status: 'error',
          message: `Scan ${req.params.id} not found or already stopped`,
        })
        return
      }

      res.json({
        status: 'ok',
        data: { message: `Scan ${req.params.id} cancelled successfully` },
      })
    } catch (err) {
      console.error('Error stopping scan:', err)
      res.status(500).json({ status: 'error', message: 'Failed to stop scan' })
    }
  })

  return router
}
