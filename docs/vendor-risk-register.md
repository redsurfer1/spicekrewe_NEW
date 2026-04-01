# Vendor Risk Register – Spice Krewe Marketplace

This vendor risk register documents the third-party services used by Spice Krewe and their associated risk profile.
It is maintained in version control to provide a complete audit trail of updates over time (SOC2 CC9.2, ISO 27001 A.5.19–A.5.21).

## Current vendors

| Vendor        | Service                                                   | Data access level                                                                                   | Cert status                                          | Sub-processor agreement                       | Review date | Risk level |
|--------------|-----------------------------------------------------------|-----------------------------------------------------------------------------------------------------|------------------------------------------------------|-----------------------------------------------|------------|-----------|
| Supabase     | PostgreSQL database, auth, edge functions, storage        | Full access to all user data (PII, briefs, payment metadata)                                       | SOC 2 Type II (see Supabase security page)          | Yes – Supabase DPA and sub-processor list     | Quarterly  | High      |
| Stripe       | Payment processing, checkout sessions                     | Payment method data only (card data handled by Stripe JS; card numbers never reach SK servers)     | PCI DSS Level 1, SOC 2 Type II                      | Yes – Stripe DPA via Stripe dashboard         | Quarterly  | High      |
| Vercel       | Frontend hosting, serverless API, CDN, CI/CD deployments  | Source code, encrypted environment variables, request logs (IP addresses, user agents, headers)    | SOC 2 Type II                                       | Yes                                           | Quarterly  | High      |
| Google Cloud (Gemini API) | AI matchmaking, TRD generation                        | Brief descriptions and project context only; no direct PII (content is anonymized where possible)  | ISO 27001, SOC 2 Type II, SOC 3                     | Yes – Google Cloud DPA                        | Semi-annual | Medium    |
| Resend       | Transactional email delivery                              | Recipient email addresses and email content (booking confirmations, check-ins, feedback requests)  | SOC 2 (see Resend security page)                    | Yes                                           | Semi-annual | Medium    |
| GitHub       | Source code repository, CI/CD (GitHub Actions)            | Full application source code, build logs; secrets stored as encrypted GitHub Actions secrets       | SOC 2 Type II, ISO 27001                            | Yes                                           | Semi-annual | Medium    |

> Note: “Review date” indicates the planned frequency of formal review, not a specific calendar date. Actual review events are captured in git commit history when this document is updated.

## Review process

Spice Krewe maintains an ongoing vendor risk management process aligned with SOC2 CC9.2 and ISO 27001 A.5.19–A.5.21:

- **Quarterly reviews (Supabase, Stripe, Vercel)**  
  - Review each vendor’s public security / compliance page for changes to SOC2, PCI DSS, ISO or similar certifications.  
  - Confirm that data processing agreements (DPAs) and sub-processor listings remain acceptable for Spice Krewe’s use case.  
  - Re-assess risk level if there are any material changes (e.g., scope of processing, incident disclosures).

- **Semi-annual reviews (Google Cloud / Gemini, Resend, GitHub)**  
  - Verify current certification status and security posture via vendor security portals.  
  - Confirm that any new sub-processors or material changes to terms are compatible with Spice Krewe’s risk tolerance.

- **On contract renewal**  
  - Perform a targeted risk re-assessment for the renewing vendor, including: data categories processed, geographic location, incident history, and contract terms (including DPA and sub-processor list).  
  - Update the “Risk level” column in the table if the assessment changes.

- **On security or availability incident**  
  - Immediately review the affected vendor’s status, incident reports, and mitigation steps.  
  - Determine whether to adjust configuration, rotate credentials, restrict data flows, or replace the vendor.  
  - Document findings and decisions in this register (via git commit with a descriptive message).

- **Documentation and evidence**  
  - This file (`docs/vendor-risk-register.md`) is kept under version control.  
  - **Evidence**: git commit history (including authorship and timestamps) serves as the primary audit trail showing when reviews were performed, vendors added/removed, and risk levels changed.  
  - Additional supporting evidence (e.g., downloaded SOC2 reports or DPA PDFs) is stored in internal compliance repositories outside of the public codebase.

