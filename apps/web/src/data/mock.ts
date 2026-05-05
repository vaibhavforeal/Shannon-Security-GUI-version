import type { Scan, Finding, PipelineAgent, DashboardMetrics, Boundary } from '../types'

export const mockMetrics: DashboardMetrics = {
  totalScans: 1284,
  totalScansChange: 12,
  activeScans: 24,
  criticalFindings: 7,
  criticalFindingsChange: 2,
  avgScanTime: '4m 12s',
  avgScanTimeChange: '8s',
}

export const mockScans: Scan[] = [
  {
    id: 'scan-001',
    target: 'api.example.com',
    repo: '/repos/api-service',
    status: 'running',
    startedAt: '2026-05-04T18:00:00Z',
    duration: '00:42:15',
    findingsCount: 12,
    criticalCount: 2,
    highCount: 4,
    mediumCount: 3,
    lowCount: 3,
    currentPhase: 'vuln-analysis',
    cost: 18.42,
  },
  {
    id: 'scan-002',
    target: 'dashboard.acme.io',
    repo: '/repos/dashboard',
    status: 'completed',
    startedAt: '2026-05-04T14:00:00Z',
    duration: '01:12:33',
    findingsCount: 21,
    criticalCount: 3,
    highCount: 7,
    mediumCount: 6,
    lowCount: 5,
    cost: 47.80,
  },
  {
    id: 'scan-003',
    target: 'auth.microservice.dev',
    repo: '/repos/auth-svc',
    status: 'completed',
    startedAt: '2026-05-04T10:00:00Z',
    duration: '00:55:41',
    findingsCount: 8,
    criticalCount: 1,
    highCount: 2,
    mediumCount: 3,
    lowCount: 2,
    cost: 32.15,
  },
  {
    id: 'scan-004',
    target: 'payments.stripe-int.com',
    repo: '/repos/payment-gateway',
    status: 'failed',
    startedAt: '2026-05-04T08:00:00Z',
    duration: '00:03:22',
    findingsCount: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
    cost: 1.20,
  },
  {
    id: 'scan-005',
    target: 'store.ecommerce.app',
    repo: '/repos/storefront',
    status: 'queued',
    startedAt: '2026-05-04T20:00:00Z',
    duration: '--',
    findingsCount: 0,
    criticalCount: 0,
    highCount: 0,
    mediumCount: 0,
    lowCount: 0,
  },
]

export const mockPipelineAgents: PipelineAgent[] = [
  { name: 'pre-recon', displayName: 'Pre-Recon', phase: 'pre-recon', state: 'completed', icon: 'check', duration: '2m 14s', cost: 1.20 },
  { name: 'recon', displayName: 'Recon', phase: 'recon', state: 'completed', icon: 'check', duration: '5m 42s', cost: 3.80 },
  { name: 'vuln-analysis', displayName: 'Vuln Analysis', phase: 'vuln-analysis', state: 'active', icon: 'radar', duration: '34m 19s', cost: 13.42 },
  { name: 'exploitation', displayName: 'Exploitation', phase: 'exploitation', state: 'pending', icon: 'api' },
  { name: 'report', displayName: 'Report', phase: 'report', state: 'pending', icon: 'summarize' },
]

export const mockVulnAgents = [
  { name: 'injection-vuln', label: 'Injection', state: 'completed' as const, findings: 3 },
  { name: 'xss-vuln', label: 'XSS', state: 'active' as const, findings: 1 },
  { name: 'auth-vuln', label: 'Auth', state: 'completed' as const, findings: 5 },
  { name: 'ssrf-vuln', label: 'SSRF', state: 'pending' as const, findings: 0 },
  { name: 'authz-vuln', label: 'Authz', state: 'pending' as const, findings: 0 },
]

export const mockFindings: Finding[] = [
  {
    id: 'INJ-VULN-01',
    scanId: 'scan-002',
    title: 'SQL Injection Authentication Bypass',
    severity: 'critical',
    category: 'injection',
    status: 'exploited',
    confidence: 'high',
    location: 'POST /rest/user/login (email field)',
    description: 'Direct string interpolation in SQL query enables complete authentication bypass. The email field accepts arbitrary SQL commands allowing complete database access.',
    impact: 'Administrative access bypass, complete system compromise',
    exploitSteps: [
      'Send POST request to login endpoint with SQL injection payload in email field',
      'Receive admin JWT token and user details',
      'Verify account takeover by accessing protected admin data',
    ],
    proofOfImpact: 'Successfully bypassed authentication and obtained admin-level access token for user ID 1 (admin@juice-sh.op) with role "admin".',
    remediation: 'Use parameterized queries or an ORM with prepared statements. Never interpolate user input directly into SQL strings.',
    codeSnippet: 'curl -X POST http://target/rest/user/login \\\n  -H "Content-Type: application/json" \\\n  -d \'{"email":"\\\'OR \\\'1\\\'=\\\'1\\\' --","password":"test"}\'',
  },
  {
    id: 'INJ-VULN-02',
    scanId: 'scan-002',
    title: 'SQL Injection Data Extraction (UNION)',
    severity: 'critical',
    category: 'injection',
    status: 'exploited',
    confidence: 'high',
    location: 'GET /rest/products/search (q parameter)',
    description: 'UNION-based SQL injection enabling complete database extraction including user credentials.',
    impact: 'Full user database access including password hashes',
    exploitSteps: [
      'Confirm SQL injection vulnerability with single quote',
      'Extract user credentials using UNION injection',
    ],
    proofOfImpact: 'Successfully extracted user database containing admin credentials, password hashes (MD5), and role assignments.',
    remediation: 'Implement parameterized queries for all database operations. Add input validation and WAF rules for SQL injection patterns.',
    codeSnippet: 'curl -s "http://target/rest/products/search?q=xxx%25%27%29%20UNION%20SELECT%20id,email,password,role%20FROM%20Users--"',
  },
  {
    id: 'XSS-VULN-01',
    scanId: 'scan-002',
    title: 'Reflected XSS in Search Parameter',
    severity: 'medium',
    category: 'xss',
    status: 'exploited',
    confidence: 'high',
    location: '/#/search?q=[PAYLOAD]',
    description: 'Search query parameter directly processed through Angular\'s bypassSecurityTrustHtml() function without sanitization.',
    impact: 'Immediate JavaScript execution in victim\'s browser, session token access',
    exploitSteps: [
      'Navigate to search URL with XSS payload',
      'Observe JavaScript execution via alert dialog',
    ],
    proofOfImpact: 'Successfully achieved JavaScript execution. Payload <img src=x onerror=alert("XSS")> executed without sanitization.',
    remediation: 'Remove use of bypassSecurityTrustHtml(). Implement proper output encoding for all user-controlled data rendered in HTML.',
  },
  {
    id: 'AUTH-VULN-05',
    scanId: 'scan-002',
    title: 'Brute Force Login (No Rate Limiting)',
    severity: 'high',
    category: 'auth',
    status: 'exploited',
    confidence: 'high',
    location: 'POST /rest/user/login',
    description: 'Unlimited authentication attempts with no rate limiting or account lockout mechanism.',
    impact: 'Successful credential discovery via automated attacks',
    exploitSteps: [
      'Execute automated brute force attack against known admin account',
      'Successfully authenticate on attempt #4 with password "admin123"',
    ],
    proofOfImpact: 'Discovered working admin credentials admin@juice-sh.op:admin123 through automated dictionary attack with average 386ms per attempt.',
    remediation: 'Implement rate limiting (e.g., 5 attempts per 15 minutes). Add progressive delays and CAPTCHA after failed attempts.',
  },
  {
    id: 'AUTHZ-VULN-04',
    scanId: 'scan-002',
    title: 'Anonymous Access to User Memories',
    severity: 'critical',
    category: 'authz',
    status: 'exploited',
    confidence: 'high',
    location: 'GET /rest/memories',
    description: 'Complete anonymous access to ALL users\' private memories without authentication.',
    impact: 'Critical data exposure including personal photos, user information, password hashes',
    exploitSteps: [
      'Make unauthenticated GET request to memories endpoint',
      'Receive complete response with all user memories and full user data',
    ],
    proofOfImpact: 'Successfully accessed 10+ user memories including emails, password hashes, roles, and deluxe tokens. Zero authentication required.',
    remediation: 'Add authentication middleware to the memories endpoint. Implement user-scoped queries so users can only access their own data.',
  },
  {
    id: 'SSRF-VULN-01',
    scanId: 'scan-002',
    title: 'SSRF via Profile Image URL Upload',
    severity: 'high',
    category: 'ssrf',
    status: 'exploited',
    confidence: 'high',
    location: 'POST /profile/image/url',
    description: 'SSRF vulnerability in profile image URL upload with HTTP method bypass enabling internal service access.',
    impact: 'Ability to make arbitrary HTTP requests from the server to internal services',
    exploitSteps: [
      'Register a user account and authenticate',
      'Bypass SSRF protection using PUT method instead of POST',
      'Access internal services via localhost URLs',
    ],
    proofOfImpact: 'Successfully accessed localhost services on ports 22, 80, 3000, 3001, 8080, 9090. Cloud metadata endpoints also accessible.',
    remediation: 'Validate and sanitize all user-provided URLs. Block requests to private IP ranges and metadata endpoints. Use allowlists for permitted domains.',
  },
  {
    id: 'AUTH-VULN-07',
    scanId: 'scan-002',
    title: 'Password Cracking via MD5 Hashes',
    severity: 'high',
    category: 'auth',
    status: 'exploited',
    confidence: 'high',
    location: 'Database password storage',
    description: 'Weak MD5 hashing without salt enables rapid password recovery for all user accounts.',
    impact: 'Multiple user account passwords successfully cracked in under 0.001 seconds each',
    exploitSteps: [
      'Extract password hashes via SQL injection',
      'Run MD5 dictionary attack against extracted hashes',
    ],
    proofOfImpact: 'Achieved 100% success rate cracking MD5 hashes: admin→admin123, jim→ncc-1701, demo→demo.',
    remediation: 'Migrate to bcrypt, scrypt, or Argon2 with per-user salts. Force password reset for all users after migration.',
  },
  {
    id: 'AUTHZ-VULN-06',
    scanId: 'scan-002',
    title: 'Admin Role Injection During Registration',
    severity: 'critical',
    category: 'authz',
    status: 'exploited',
    confidence: 'high',
    location: 'POST /api/Users',
    description: 'Create administrator accounts by injecting admin role during user registration.',
    impact: 'Complete privilege escalation from anonymous to full administrator access',
    exploitSteps: [
      'Register new user with role: "admin" in request body',
      'Login with the new admin account',
    ],
    proofOfImpact: 'Admin account created with User ID 65 and full administrative privileges. No validation of role assignment during registration.',
    remediation: 'Never trust client-supplied role values. Assign default role server-side and require admin action for privilege escalation.',
  },
]

export const mockBoundaries: Boundary[] = [
  { id: 'b-1', name: 'API Gateway', type: 'service', fileCount: 124, language: 'TypeScript', inScope: true },
  { id: 'b-2', name: 'Auth Service', type: 'service', fileCount: 67, language: 'TypeScript', inScope: true },
  { id: 'b-3', name: 'Payment Service', type: 'service', fileCount: 89, language: 'Go', inScope: true },
  { id: 'b-4', name: 'Frontend SPA', type: 'frontend', fileCount: 312, language: 'React/TS', inScope: false },
  { id: 'b-5', name: 'Email Worker', type: 'worker', fileCount: 34, language: 'Python', inScope: true },
  { id: 'b-6', name: 'Admin Dashboard', type: 'frontend', fileCount: 156, language: 'React/TS', inScope: false },
  { id: 'b-7', name: 'Database Migrations', type: 'infra', fileCount: 48, language: 'SQL', inScope: false },
]

export const mockReportMarkdown = `# Security Assessment Report

## Executive Summary
- **Target:** dashboard.acme.io
- **Assessment Date:** May 2026
- **Scope:** Authentication, XSS, SQL and Command Injection, SSRF, Authorization testing
- **Total Findings:** 21 (3 Critical, 7 High, 6 Medium, 5 Low)

## Summary by Vulnerability Type

**Authentication Vulnerabilities:**
Critical authentication failures including SQL injection authentication bypass, brute force attacks due to missing rate limiting, MD5 password cracking, and token replay vulnerabilities.

**Authorization Vulnerabilities:**
Systemic authorization bypass including anonymous access to user data, admin role injection during registration, and IDOR vulnerabilities across multiple endpoints.

**Cross-Site Scripting (XSS) Vulnerabilities:**
Multiple XSS attack vectors including reflected XSS in search parameters and JSONP callback XSS enabling cross-domain attacks.

**SQL/Command Injection Vulnerabilities:**
Critical injection vulnerabilities including SQL authentication bypass, UNION-based data extraction, NoSQL injection, XXE file disclosure, and YAML injection DoS.

**Server-Side Request Forgery (SSRF) Vulnerabilities:**
SSRF vulnerability in profile image URL upload with HTTP method bypass enabling internal service access.

---

## INJ-VULN-01: SQL Injection Authentication Bypass

**Severity:** Critical | **Confidence:** High | **Status:** Exploited

**Location:** \`POST /rest/user/login\` (email field)

**Description:**
Direct string interpolation in SQL query enables complete authentication bypass. The email field accepts arbitrary SQL commands allowing complete database access.

**Impact:** Administrative access bypass, complete system compromise

**Exploitation Steps:**

1. Send POST request to login endpoint with SQL injection payload:
\`\`\`bash
curl -X POST http://target/rest/user/login \\
  -H "Content-Type: application/json" \\
  -d '{"email":"\\' OR \\'1\\'=\\'1\\' --","password":"test"}'
\`\`\`

2. Receive admin JWT token:
\`\`\`json
{
  "authentication": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9...",
    "bid": 1,
    "umail": "admin@juice-sh.op"
  }
}
\`\`\`

**Remediation:** Use parameterized queries or an ORM with prepared statements. Never interpolate user input directly into SQL strings.

---

## AUTHZ-VULN-04: Anonymous Access to All User Memories

**Severity:** Critical | **Confidence:** High | **Status:** Exploited

**Location:** \`GET /rest/memories\`

**Description:**
Complete anonymous access to ALL users' private memories without authentication. The endpoint returns full user objects including password hashes.

**Exploitation Steps:**

1. Make unauthenticated GET request:
\`\`\`bash
curl -s "http://target/rest/memories"
\`\`\`

2. Response includes all user data:
\`\`\`json
{
  "status": "success",
  "data": [
    {
      "UserId": 13,
      "caption": "Private memory content",
      "User": {
        "email": "admin@target.com",
        "password": "9283f1b2e9669749081963be0462e466",
        "role": "deluxe"
      }
    }
  ]
}
\`\`\`

**Remediation:** Add authentication middleware. Implement user-scoped queries.

---

## XSS-VULN-01: Reflected XSS in Search

**Severity:** Medium | **Confidence:** High | **Status:** Exploited

**Location:** \`/#/search?q=[PAYLOAD]\`

**Exploitation:**
\`\`\`
http://target/#/search?q=<img src=x onerror=alert('XSS')>
\`\`\`

**Remediation:** Remove bypassSecurityTrustHtml(). Implement output encoding.
`
