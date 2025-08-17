# 🛠 Roadmap v2 — Bitrix Audit Platform

## 📌 Фаза 0 — Discovery (2–3 недели)

**Ответственные:** Researcher, BA, PO

* 🔍 Анализ конкурентов (SEO-аудиторы, Bitrix-модули, SaaS-анализаторы).
* 🎯 Customer interviews (владельцы сайтов, агентства, студии).
* 📊 Финмодель: ARPU, CAC, LTV, Payback.
* ⚖️ Legal review: GDPR, 152-ФЗ, условия Bitrix Marketplace.
* 📑 Draft PRD/BRD + тарифная модель.

---

## 🚧 Фаза 1 — Foundation (2–4 недели)

**Ответственные:** Architect, Coder, DevOps, Doc Writer

* 🏗 Архитектура (ADR-001: стек NestJS/FastAPI, ADR-002: DB PostgreSQL+TimescaleDB).
* 🛠 CI/CD pipeline (GitHub Actions/GitLab CI, автосборка Docker).
* 🔒 Security baseline (KMS/Vault, шифрование токенов).
* 📡 Infrastructure as Code (Terraform/Helm).
* 📖 Dev docs: схема БД, API спецификация (OpenAPI).

---

## ⚡ Фаза 2 — MVP (6–8 недель)

**Ответственные:** Coder, QA, Doc Writer, UI/UX

* 🚀 Лид-магнит: тест по URL (скоринг + топ-3 ошибок).
* 📊 Отчёты: базовые метрики скорости/SEO/Bitrix-настроек.
* 🖥 Дашборд: проекты, история запусков, PDF-экспорт (ограниченно).
* 🔔 Алерты (минимум: email/Slack).
* 🔗 Интеграции: PageSpeed Insights API, базовый модуль для Bitrix.
* 🧪 QA: Unit + Integration тесты, базовый E2E.
* 📖 User docs: «Как запустить аудит», FAQ.

---

## 🔁 Фаза 3 — Release R1 (8–10 недель)

**Ответственные:** Architect, QA, Coder, Doc Writer

* 📈 Full audits: Core Web Vitals, SEO, контент, Bitrix-специфика.
* 🧠 AI: Explain-mode + чек-лист (impact × effort).
* 🔗 Интеграции: Яндекс.Вебмастер API, GA4/Я.Метрика.
* 📊 White-label отчёты (логотип+контакты).
* 📤 Экспорт CSV/PDF (для Pro/Agency).
* 💳 Billing: Stripe/ЮKassa, Free/Pro/Agency лимиты.
* 🧪 QA: нагрузочные тесты (50k URL), security audit.
* 📖 Docs: API doc, гайд для агентств, туториалы.
* 🌍 RU/EN локализация (или только RU, если PO подтвердил).

---

## 🧩 Фаза 4 — Scale / R2 (12+ недель)

**Ответственные:** Все роли

* 🧠 AI: авто-генерация задач (Jira/ClickUp/YouTrack), сравнение прогресса.
* 🔗 Интеграции: VK Ads, Яндекс.Директ (затраты), CRM (Битрикс24/amoCRM).
* ⚙️ Advanced Alerts: кастомные условия, webhooks.
* 📊 Agency Dashboard: портфель сайтов, приоритезация по проектам.
* 📦 Marketplace сертификация (Bitrix).
* 🧪 QA: UAT с агентствами, баг-башни.
* 📖 Docs: скринкасты, гайды по white-label, Enterprise FAQ.
* 🚀 Go-to-market: партнёрские пакеты, демо для агентств.

---

# 🎯 Финальная структура видимости

* **Coder** → Roadmap с техблоками (CI/CD, API, интеграции, воркеры).
* **QA** → Roadmap с тестами (unit, perf, sec, UAT).
* **Doc Writer** → Roadmap с документацией (Dev docs, User docs, Tutorials).
* **BA/PO** → Roadmap с бизнес-блоками (KPI, ARPU, тарифы, маркетинг).
* **Architect** → Roadmap с ADR, DevOps, инфраструктурой.

---


**Roadmap v2 в формате Gantt-like таблицы** — чтобы всем ролям (Coder, QA, Doc Writer, Architect, BA, PO, Researcher) было сразу видно **сроки, задачи и ответственность**:

---

# 📊 Roadmap v2 — Bitrix Audit Platform

| Фаза / Недели                               | Основные задачи                                                                                                                                                                                                                                                                                                                          | Ответственные роли                                              |
| ------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| **Фаза 0 — Discovery** <br> (Недели 1–3)    | • Анализ конкурентов<br>• Интервью с агентствами<br>• Финмодель (ARPU/CAC/LTV)<br>• Legal review (GDPR, 152-ФЗ)<br>• Draft PRD/BRD                                                                                                                                                                                                       | Researcher, BA, PO                                              |
| **Фаза 1 — Foundation** <br> (Недели 4–7)   | • Архитектура (ADR-001/002)<br>• CI/CD pipeline<br>• IaC (Terraform/Helm)<br>• Security baseline<br>• Dev docs (DB, API)                                                                                                                                                                                                                 | Architect, Coder, DevOps, Doc Writer                            |
| **Фаза 2 — MVP** <br> (Недели 8–15)         | • Лид-магнит (скоринг + топ-3 ошибок)<br>• Базовые отчёты (SEO/Speed/Bitrix)<br>• Дашборд + PDF (ограниченно)<br>• Алерты (email/Slack, 1 триггер)<br>• Интеграции: PageSpeed API<br>• QA: Unit/Integration/E2E<br>• User docs + FAQ                                                                                                     | Coder, QA, Doc Writer, UI/UX                                    |
| **Фаза 3 — Release R1** <br> (Недели 16–25) | • Full audits (Core Web Vitals, SEO, Bitrix)<br>• AI Explain-mode + чек-лист<br>• Интеграции: GSC/Я.Вебмастер, GA4/Метрика<br>• White-label отчёты (лого+контакты)<br>• Экспорт CSV/PDF<br>• Billing (Stripe/ЮKassa)<br>• QA: Perf & Security tests<br>• API doc, гайды, локализация                                                     | Architect, QA, Coder, Doc Writer                                |
| **Фаза 4 — Scale / R2** <br> (Недели 26+)   | • AI: автогенерация задач, сравнение прогресса<br>• Интеграции: Я.Директ, VK Ads, CRM (Bitrix24, amoCRM)<br>• Advanced Alerts (webhooks, кастомные условия)<br>• Agency Dashboard (портфель сайтов)<br>• Marketplace сертификация<br>• QA: UAT, баг-башни<br>• Docs: скринкасты, white-label гайды<br>• Go-to-market: партнёрские пакеты | Все роли (Coder, QA, Doc Writer, BA, PO, Architect, Researcher) |

---

📌 Особенности этого вида:

* Видны **сроки по неделям** (ориентировочно).
* Для каждой фазы указаны **крупные блоки задач**.
* Явно распределены **роли и зоны ответственности**.

---

Хочешь, я сделаю этот Roadmap **визуально как диаграмму Ганта** (с цветными блоками по фазам) — чтобы можно было вставить прямо в презентацию для команды?
