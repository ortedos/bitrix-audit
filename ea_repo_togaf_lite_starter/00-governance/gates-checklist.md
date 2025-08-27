# Release / Change Gates Checklist (v0.1)
**Security & Privacy**: AES‑256 at rest; TLS in transit; KMS/Vault; PII в РФ; presigned‑download; CSRF/XSS; rate‑limits.
**Performance & SLO**: p95 API < 400мс (MVP); отчёт ≤5 мин (≤100 URL); sampling ≤200 URL ≤6 мин (>1000).
**Operability**: мониторинг/логирование/алерты; DR/BCP — RTO ≤15 мин, RPO=0.
**Product Limits**: LM: hCaptcha + ≤30 req/min/IP; Public API: ≤5/ч и ≤20/сутки (IP).
**Docs**: обновлены user guide, API, ADR/roadmap.
