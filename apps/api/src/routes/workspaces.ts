/**
 * Workspace API Routes
 *
 * GET  /api/workspaces              — List all workspaces
 * GET  /api/workspaces/:name        — Get workspace detail
 * GET  /api/workspaces/:name/log    — Get workflow log
 * GET  /api/workspaces/:name/report — Get final report markdown
 * GET  /api/workspaces/:name/findings — Get parsed findings
 * GET  /api/workspaces/:name/deliverables/:filename — Get specific deliverable
 */

import { Router } from 'express'
import type { WorkspaceService } from '../services/workspace.service.js'

export function createWorkspaceRoutes(service: WorkspaceService): Router {
  const router = Router()

  // List all workspaces
  router.get('/', async (_req, res) => {
    try {
      const workspaces = await service.listWorkspaces()
      res.json({
        status: 'ok',
        data: workspaces,
        count: workspaces.length,
      })
    } catch (err) {
      console.error('Error listing workspaces:', err)
      res.status(500).json({ status: 'error', message: 'Failed to list workspaces' })
    }
  })

  // Get workspace detail
  router.get('/:name', async (req, res) => {
    try {
      const workspace = await service.getWorkspace(req.params.name)
      if (!workspace) {
        res.status(404).json({ status: 'error', message: 'Workspace not found' })
        return
      }
      res.json({ status: 'ok', data: workspace })
    } catch (err) {
      console.error('Error getting workspace:', err)
      res.status(500).json({ status: 'error', message: 'Failed to get workspace' })
    }
  })

  // Get workflow log
  router.get('/:name/log', async (req, res) => {
    try {
      const log = await service.getWorkflowLog(req.params.name)
      if (log === null) {
        res.status(404).json({ status: 'error', message: 'Log not found' })
        return
      }
      res.json({ status: 'ok', data: { content: log } })
    } catch (err) {
      console.error('Error getting log:', err)
      res.status(500).json({ status: 'error', message: 'Failed to get log' })
    }
  })

  // Get final report
  router.get('/:name/report', async (req, res) => {
    try {
      const report = await service.getReport(req.params.name)
      if (report === null) {
        res.status(404).json({ status: 'error', message: 'Report not found' })
        return
      }
      res.json({ status: 'ok', data: { content: report } })
    } catch (err) {
      console.error('Error getting report:', err)
      res.status(500).json({ status: 'error', message: 'Failed to get report' })
    }
  })

  // Get parsed findings
  router.get('/:name/findings', async (req, res) => {
    try {
      const findings = await service.parseFindings(req.params.name)
      res.json({
        status: 'ok',
        data: findings,
        count: findings.length,
      })
    } catch (err) {
      console.error('Error getting findings:', err)
      res.status(500).json({ status: 'error', message: 'Failed to get findings' })
    }
  })

  // Get specific deliverable
  router.get('/:name/deliverables/:filename', async (req, res) => {
    try {
      const workspace = await service.getWorkspace(req.params.name)
      const content = await service.getDeliverable(
        req.params.name,
        req.params.filename,
        workspace?.repoPath,
      )
      if (content === null) {
        res.status(404).json({ status: 'error', message: 'Deliverable not found' })
        return
      }
      res.json({ status: 'ok', data: { filename: req.params.filename, content } })
    } catch (err) {
      console.error('Error getting deliverable:', err)
      res.status(500).json({ status: 'error', message: 'Failed to get deliverable' })
    }
  })

  return router
}
