/**
 * Authentication Middleware
 *
 * Simple API key authentication for write operations (scan start/stop).
 * Read operations (workspaces, reports, findings) remain public.
 *
 * Set SHANNON_API_KEY environment variable to enable authentication.
 * If not set, all operations are allowed (development mode).
 *
 * Usage:
 *   Authorization: Bearer <api-key>
 */

import type { Request, Response, NextFunction } from 'express'

const API_KEY = process.env.SHANNON_API_KEY

/**
 * Middleware that requires API key for mutating operations.
 * Passes through if SHANNON_API_KEY is not configured (dev mode).
 */
export function requireApiKey(req: Request, res: Response, next: NextFunction): void {
  // Skip auth if no API key is configured (development mode)
  if (!API_KEY) {
    next()
    return
  }

  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      status: 'error',
      message: 'Missing or invalid Authorization header. Use: Bearer <api-key>',
    })
    return
  }

  const token = authHeader.slice(7)
  if (token !== API_KEY) {
    res.status(403).json({
      status: 'error',
      message: 'Invalid API key',
    })
    return
  }

  next()
}
