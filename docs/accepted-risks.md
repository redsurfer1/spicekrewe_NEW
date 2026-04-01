# Accepted Security Risks – Dependency Vulnerabilities

This document lists known dependency vulnerabilities that remain after targeted upgrades on the `security/dep-upgrade` branch.
Each item records why it was not immediately remediated and the planned follow-up, for SOC2 / ISO 27001 evidence.

> Baseline audit captured in `docs/audit-baseline-2026-03-31.json` using `npm audit --json` on 2026-03-31.

## Remaining vulnerabilities (post-upgrade)

### Minimatch / @vercel/python-analysis / @vercel/build-utils (legacy – superseded by newer @vercel/node stack)

- **CVE / Advisory**: GHSA-3ppc-4f35-3m26, GHSA-7r86-cg39-jmmj, GHSA-23c5-xmqv-rm74  
- **Package / Version**: `minimatch` via `@vercel/python-analysis` / `@vercel/build-utils` (transitive), versions as reported by `npm audit` on 2026-03-31.  
- **Risk description**: Regular expression DoS (ReDoS) risk in complex glob patterns, potentially allowing an attacker to craft input that causes high CPU usage during pattern matching. The vulnerable code path sits inside Vercel’s internal build tooling, not in runtime request handling.  
- **Why not immediately remediated**:  
  - `npm audit fix --force` would upgrade to a newer `@vercel/node` major version and adjust its transitive graph in ways that may affect Vercel build/runtime behavior.  
  - The current application build and deployment on Vercel are stable; forcing the upgrade without a full staging rollout and preview verification on all environments would introduce release risk.  
  - There is no direct user-controlled glob input in the Spice Krewe app that is passed to `minimatch` via these internal tools.  
- **Planned remediation date**: Targeted for the next scheduled platform upgrade window **no later than 2026-06-30**, including:  
  - Upgrading `@vercel/node` and related tooling in a dedicated branch.  
  - Verifying builds across Vercel preview deployments and regression tests.  
- **Signed-off by**: [Spice Krewe Engineering] [2026-03-31]

### Undici via @vercel/node (updated stack, remaining risk)

- **CVE / Advisory**: Multiple advisories, including GHSA-c76h-2ccp-4975, GHSA-g9mf-h72j-4rw9, GHSA-cxrh-j4jr-qwg3, GHSA-2mjp-6q6p-2qxm, GHSA-vrm6-8vpv-qv8q, GHSA-v9p9-hfj2-hcw8, GHSA-4992-7rv2-5pvq  
- **Package / Version**: `undici` as a transitive dependency of `@vercel/node` (see `npm audit` output).  
- **Risk description**: Various HTTP client/server issues (insufficient randomness, decompression resource exhaustion, certificate parsing DoS, request/response smuggling, WebSocket decompression issues, CRLF injection). These primarily affect services that directly use the vulnerable `undici` APIs.  
- **Why not immediately remediated**:  
  - The Spice Krewe app does not directly depend on `undici`; it is used internally by Vercel’s serverless platform.  
  - Remediation requires upgrading `@vercel/node` to a newer major version via `npm audit fix --force`, which is a breaking change for the build/runtime environment.  
  - Coordinated testing is required with Vercel preview deployments to ensure no regressions in all API routes and edge functions.  
- **Planned remediation date**: Evaluate and, if safe, adopt a newer `@vercel/node` release **by 2026-06-30** in a dedicated hardening sprint, with full preview verification.  
- **Signed-off by**: [Spice Krewe Engineering] [2026-03-31]

### Ajv via @vercel/static-config (remaining)

- **CVE / Advisory**: GHSA-2g4f-4pwh-qvx6  
- **Package / Version**: `ajv` via `@vercel/static-config` → `@vercel/node` (transitive).  
- **Risk description**: ReDoS when the `$data` option is used in certain JSON schema validations. This is part of Vercel’s internal static config processing, not exposed directly in application code.  
- **Why not immediately remediated**:  
  - Requires upgrading the same `@vercel/node` toolchain as above, with the same potential impact on builds and serverless behavior.  
  - There is no evidence that the Spice Krewe app exercises the vulnerable `$data` option paths.  
- **Planned remediation date**: Addressed together with the `@vercel/node` upgrade path described above, **by 2026-06-30**.  
- **Signed-off by**: [Spice Krewe Engineering] [2026-03-31]

### Smol-toml via @vercel/python-analysis (legacy – may no longer apply after @vercel/node v4)

- **CVE / Advisory**: GHSA-v3rj-xjv7-4jmq  
- **Package / Version**: `smol-toml` as a transitive dependency of `@vercel/python-analysis` / `@vercel/build-utils`.  
- **Risk description**: Potential DoS when parsing TOML documents with thousands of consecutive commented lines. This affects tooling that parses TOML configuration.  
- **Why not immediately remediated**:  
  - Fix again requires updating the Vercel build tooling stack through `@vercel/node` and friends.  
  - The Spice Krewe project does not expose user-writable TOML configuration; `smol-toml` is used only in CI/build-time tooling.  
- **Planned remediation date**: Included in the `@vercel/node` / build-tooling upgrade plan **by 2026-06-30**.  
- **Signed-off by**: [Spice Krewe Engineering] [2026-03-31]

### Brace-expansion (transitive)

- **CVE / Advisory**: GHSA-v6h2-p8h4-qcjw, GHSA-f886-m6hf-6m8v  
- **Package / Version**: `brace-expansion` as a transitive dependency (see `npm audit` output).  
- **Risk description**: ReDoS risk via crafted glob patterns leading to process hang or excessive memory usage.  
- **Why not immediately remediated**:  
  - Current usage is limited to build-time tooling; no direct user-controlled patterns flow into this dependency.  
  - Remediation would follow from the broader tooling upgrades above; upgrading isolated transitive packages directly is not supported.  
- **Planned remediation date**: Tracked with the rest of the Vercel/tooling dependency upgrades **by 2026-06-30**.  
- **Signed-off by**: [Spice Krewe Engineering] [2026-03-31]

### Tar via @mapbox/node-pre-gyp

- **CVE / Advisory**: Multiple node-tar advisories including GHSA-34x7-hfp2-rc4v, GHSA-8qq5-rm4j-mr97, GHSA-83g3-92jg-28cx, GHSA-qffp-2rhf-9h96, GHSA-9ppj-qmqm-q256, GHSA-r6q2-hw4h-h46w  
- **Package / Version**: `tar` as a transitive dependency of `@mapbox/node-pre-gyp` (build-time tooling).  
- **Risk description**: Path traversal and arbitrary file read/write risks during archive extraction. The affected code is used during installation/build of native modules, not at runtime in the Spice Krewe application.  
- **Why not immediately remediated**:  
  - Remediation would require bumping or replacing `@mapbox/node-pre-gyp` and its dependents, which is non-trivial and may affect native module build steps in CI and on Vercel.  
  - The attack surface is limited to developer/CI environments; production runtime does not expose archive extraction endpoints.  
- **Planned remediation date**: Evaluate alternatives and/or patched versions and schedule an upgrade **by 2026-06-30**, aligned with broader tooling hardening.  
- **Signed-off by**: [Spice Krewe Engineering] [2026-03-31]

### Esbuild via @vercel/node (embedded)

- **CVE / Advisory**: GHSA-67mh-4wv8-2f99  
- **Package / Version**: `esbuild` bundled within `@vercel/node@4` as reported by `npm audit`.  
- **Risk description**: Development server request proxying issue that can allow unintended requests/responses during local dev. This primarily affects developer tooling, not production builds.  
- **Why not immediately remediated**:  
  - Fix requires upgrading to `@vercel/node@5.6.22` (or later) per `npm audit`, which is a breaking change on the Vercel adapter stack.  
  - Application already uses latest standalone `esbuild` and Vite for builds; the vulnerable instance is internal to the Vercel adapter.  
- **Planned remediation date**: Consider upgrade to `@vercel/node@5.x` in a future hardening sprint with full preview validation, **no later than 2026-09-30**.  
- **Signed-off by**: [Spice Krewe Engineering] [2026-03-31]

