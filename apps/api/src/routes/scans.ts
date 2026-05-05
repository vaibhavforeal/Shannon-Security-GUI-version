/**
 * Scan API Routes
 *
 * POST /api/scans              — Start a new scan
 * GET  /api/scans/:id/progress — Get live scan progress (polls Temporal)
 * POST /api/scans/:id/stop     — Stop/cancel a running scan
 */

import { Router } from 'express'

export function createScanRoutes(): Router {
  const router = Router()

  // Start a new scan
  router.post('/', async (req, res) => {
    try {
      const { targetUrl, repoPath, workspace, config } = req.body

      if (!targetUrl || !repoPath) {
        res.status(400).json({
          status: 'error',
          message: 'targetUrl and repoPath are required',
        })
        return
      }

      // TODO: Connect to Temporal to start a workflow
      // For now, return a mock response
      const scanId = `scan-${Date.now()}`

      console.log(`[Scan] Starting new scan ${scanId}:`, {
        targetUrl,
        repoPath,
        workspace: workspace || scanId,
      })

      res.status(201).json({
        status: 'ok',
        data: {
          scanId,
          workspaceName: workspace || scanId,
          message: 'Scan queued successfully',
        },
      })
    } catch (err) {
      console.error('Error starting scan:', err)
      res.status(500).json({ status: 'error', message: 'Failed to start scan' })
    }
  })

  // Get scan progress (Temporal query)
  router.get('/:id/progress', async (req, res) => {
    try {
      // TODO: Connect to Temporal client and query getProgress
      // For now, return mock progress
      res.json({
        status: 'ok',
        data: {
          workflowId: req.params.id,
          status: 'running',
          currentPhase: 'vuln-analysis',
          currentAgent: 'injection-vuln',
          completedAgents: ['pre-recon', 'recon'],
          failedAgent: null,
          error: null,
          startTime: Date.now() - 2520000, // 42 minutes ago
          elapsedMs: 2520000,
          agentMetrics: {},
          summary: null,
        },
      })
    } catch (err) {
      console.error('Error getting progress:', err)
      res.status(500).json({ status: 'error', message: 'Failed to get progress' })
    }
  })

  // Stop a running scan
  router.post('/:id/stop', async (req, res) => {
    try {
      // TODO: Connect to Temporal to cancel the workflow
      console.log(`[Scan] Stopping scan ${req.params.id}`)

      res.json({
        status: 'ok',
        data: { message: `Scan ${req.params.id} stop requested` },
      })
    } catch (err) {
      console.error('Error stopping scan:', err)
      res.status(500).json({ status: 'error', message: 'Failed to stop scan' })
    }
  })

  return router
}
