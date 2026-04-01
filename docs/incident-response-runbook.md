# Incident Response Runbook – Spice Krewe Marketplace

This runbook defines how Spice Krewe detects, classifies, and responds to security and operational incidents.
It serves as evidence for SOC2 CC7.3–CC7.5 and ISO 27001 A.5.24–A.5.28. Updates are tracked via git history.

---

## Incident classification

Incidents are classified by potential / actual impact on confidentiality, integrity, and availability of the platform.

### P1 – Critical

Criteria (any of the below):

- Data breach or confirmed unauthorized access to user data (PII, payment metadata, briefs, profiles).
- Payment system compromise (e.g., Stripe keys leaked, fraudulent charges detected).
- Full platform outage (production environment unavailable for all users).

Expected response:

- Detection to initial response: **within 1 hour**.
- Cross-functional incident response team engaged immediately.

### P2 – High

Criteria (any of the below):

- Partial outage impacting core flows (e.g., `/hire` brief submission, login, or checkout) for multiple users.
- SLA breach or repeated 5xx errors for critical APIs.
- Failed Stripe webhooks affecting revenue recognition or booking confirmation.
- Suspicious admin access patterns (e.g., unexpected admin logins, unusual activity in `audit_logs`).

Expected response:

- Detection to initial response: **within 4 hours**.

### P3 – Medium

Criteria (any of the below):

- Single-user data issue (e.g., incorrect brief shown to a user, but no broad data exposure).
- Degraded performance (slow matchmaker responses, intermittent timeouts) without full outage.
- Edge function failure (e.g., SLA monitor, onboarding email) that does not fully block core flows.
- Email delivery failure impacting non-critical notifications.

Expected response:

- Detection to initial response: **within 24 hours**.
- Fix scheduled for the next regular deployment.

### P4 – Low

Criteria (any of the below):

- Non-critical bug with easy workaround.
- Cosmetic UI issues that do not affect business logic or data.
- Single, non–revenue-affecting failure (e.g., minor analytics discrepancy).

Expected response:

- Detection to initial response: **within 1 week**.
- Addressed through normal backlog / sprint planning.

---

## Detection sources

Primary monitoring and detection channels:

- **Slack `#sk-ops`**  
  - Source for automated alerts from the SLA monitor, error notifiers, and failed payment alerts.  
  - On-call engineers must have notifications enabled for this channel.

- **`/admin/health` (Admin dashboard)**  
  - Displays TRD pipeline state, match quality metrics, and environment / secrets health.  
  - Used to detect degradation in the Gemini matchmaker or TRD generation pipeline.

- **Vercel dashboard**  
  - Build failures, deployment rollbacks, and function error rates.  
  - Traffic spikes or anomalies in request logs.

- **Supabase dashboard**  
  - Database errors, auth anomalies, and CPU/connection saturation.  
  - Inspection of `audit_logs` for suspicious activity patterns.

- **GitHub Actions**  
  - CI failures (build, typecheck, security scans) that may indicate regressions or dependency risks.

- **Resend dashboard**  
  - Email delivery failures, bounce / complaint spikes, and rate limiting issues.

- **User reports**  
  - Contact form at `/contact` and support email addresses.  
  - All incident-related user reports must be triaged and, if applicable, tracked as incidents.

---

## Response procedures by severity

### P1 – Critical incidents (within 1 hour)

1. **Assess scope**
   - Confirm what is affected: which environment (production vs. staging), which services, and how many users.  
   - Review `audit_logs`, Vercel logs, Supabase logs, and Stripe / Resend dashboards for corroborating evidence.

2. **Revoke sessions (data breach scenario)**
   - If there is a suspected or confirmed data breach or account takeover:
     - Revoke all active Supabase sessions and invalidate JWTs (using Supabase Auth tooling / APIs).  
     - Rotate any potentially compromised secrets (Stripe keys, service role keys, Resend keys, etc.).

3. **Preserve evidence**
   - Before applying fixes that could overwrite data:
     - Export all relevant `audit_logs` rows for the incident window to a secure, access-controlled location.  
     - Snapshot relevant database tables if feasible (e.g., affected `briefs`, `profiles`, `data_requests`).  
     - Capture logs from Vercel, Supabase, Stripe, Resend, and GitHub Actions as needed.

4. **Notify affected users (data incidents)**
   - For confirmed data breaches, prepare and send user notifications **within 72 hours** to meet GDPR-style expectations.  
   - Use the “User notification (data incident)” template below and tailor it to the specific event.

5. **Root cause analysis, fix, deploy, verify**
   - Identify the root cause (code, configuration, dependency, or external vendor issue).  
   - Implement and review the fix (peer review required).  
   - Deploy via the standard CI/CD pipeline.  
   - Verify resolution via `/admin/health`, monitoring dashboards, and targeted testing.

6. **Post-incident report**
   - Prepare a written post-incident report **within 5 business days** using the template below.  
   - Store the report in the internal incident repository and link it from the relevant ticket.

### P2 – High incidents (within 4 hours)

- Triage and investigate within 4 hours of detection.  
- Communicate status in Slack `#sk-ops` and, if applicable, a public status channel.  
- Implement fix and deploy as soon as safely possible.  
- If user-facing, send a concise incident update to affected customers (email or in-app banner).

### P3 – Medium incidents (within 24 hours)

- Confirm the issue, classify as P3, and create a ticket.  
- Plan and implement a fix for the next regular deployment window.  
- Monitor related metrics after deploy to confirm resolution.

### P4 – Low incidents (within 1 week)

- Log the issue in the backlog with clear reproduction steps and impact.  
- Prioritize during regular sprint planning; group similar P4 items where possible.

---

## Communication templates

### User notification – data incident

**Subject:** Important security notice from Spice Krewe  

**Body (outline):**

1. **What happened**  
   - Brief, clear description of the incident, including when it occurred and how it was detected.

2. **What data was involved**  
   - Specify the categories of data that may have been affected (e.g., name, email, brief content, payment metadata).  
   - Explicitly state if passwords or full card numbers were *not* affected, if applicable.

3. **What we did**  
   - Steps taken to contain the incident (e.g., revoking sessions, rotating keys).  
   - Fixes deployed and monitoring in place to prevent recurrence.

4. **What you should do**  
   - Any recommended user actions (e.g., change password, watch for suspicious emails, review recent activity).  
   - Clear instructions for contacting support if they see something unusual.

5. **Contact information**  
   - Provide a dedicated support email and/or link to the data request page (`/data-request`) for follow-up.  
   - Reiterate expected response times (e.g., “We respond to all security-related inquiries within 2 business days.”)

---

## Post-incident review template

Each significant incident (P1 and P2, and any material P3) must have a documented review:

- **Incident date/time**  
  - When the incident began (best estimate) and when it was resolved.

- **Detection method and time**  
  - How the incident was detected (e.g., SLA alert in `#sk-ops`, `/admin/health`, user report) and detection timestamp.

- **Response timeline**  
  - Key actions and timestamps from detection to resolution.

- **Root cause**  
  - Technical and/or process root cause (e.g., misconfiguration, code bug, missing rate limiting).

- **Impact**  
  - Number of users affected, data involved, duration of outage or degradation, and any revenue impact.

- **Remediation steps taken**  
  - Code changes, configuration updates, credential rotations, vendor escalations.

- **Preventive measures added**  
  - Monitoring or alerting improvements, additional tests, process changes, training, or new controls.

- **Lessons learned**  
  - What worked well, what needs improvement, and action items for the team.

---

## Emergency contacts

Vendor and platform support contacts for escalation:

- **Supabase support** – <https://supabase.com/support>  
- **Stripe support** – <https://support.stripe.com>  
- **Vercel support** – <https://vercel.com/support>  
- **Resend support** – <https://resend.com/support>  

Internal escalation paths and on-call rotations are maintained in internal (non-public) documentation, but should always include:

- An engineering on-call contact (primary and backup).  
- A product / operations owner for customer communications.  
- A security / compliance contact for regulatory and contractual obligations.

