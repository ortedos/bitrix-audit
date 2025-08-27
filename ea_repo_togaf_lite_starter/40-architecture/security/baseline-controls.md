# Security Baseline (v0.1)
- AES‑256 at rest; TLS in transit; KMS/Vault; запрет секретов в коде.
- Presigned‑download для отчётов (TTL 24 ч).
- Rate‑limits и антибот (hCaptcha на LM, лимиты публичных API).
- Data residency: PII — в РФ; логи без PII; DPIA/Threat Model; доступы по минимуму.
