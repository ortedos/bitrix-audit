Полный перечень тестов v1.0** (Rulebook). 
Формат: `testCode | Краткое описание | Тяжесть (P0–P3) | Источник (cloud/bitrix) | Мин. тариф (free/pro/agency)`.
Это список для PRD/BRD и загрузки в `/rulebook/rules/*.yml`.

---

## 1) Web Vitals / Производительность страницы

| testCode                        | Описание                                                     |  P | Источник | Тариф |
| ------------------------------- | ------------------------------------------------------------ | -: | -------- | ----- |
| webv.lcp.slow\.mobile           | Наибольший контентный элемент (LCP) на мобильных выше порога | P0 | cloud    | free  |
| webv.lcp.slow\.desktop          | LCP на десктопе выше порога                                  | P1 | cloud    | free  |
| webv.cls.high                   | Кумулятивный сдвиг макета (CLS) выше порога                  | P1 | cloud    | free  |
| webv.inp.slow                   | Плохой отклик интерфейса (INP) выше порога                   | P1 | cloud    | free  |
| webv.fcp.slow                   | Медленная первая отрисовка контента (FCP)                    | P2 | cloud    | free  |
| webv.ttfb.high                  | Время до первого байта (TTFB) высокое                        | P1 | cloud    | free  |
| webv.longtasks.sum.high         | Сумма «длинных задач» JavaScript велика                      | P2 | cloud    | free  |
| webv.render.blocking.resources  | Блокирующие CSS/JS на критическом пути                       | P2 | cloud    | free  |
| webv.unused.jscss.high          | Большой объём неиспользуемых CSS/JS                          | P3 | cloud    | pro   |
| webv.preconnect.preload.missing | Нет `preconnect`/`preload` к критичным источникам            | P3 | cloud    | pro   |

---

## 2) SEO / Индексирование

| testCode                                                   | Описание                                                    |  P | Источник | Тариф |
| ---------------------------------------------------------- | ----------------------------------------------------------- | -: | -------- | ----- |
| seo.robots.missing                                         | Файл `robots.txt` отсутствует                               | P0 | cloud    | free  |
| seo.robots.disallow\.all                                   | Полный запрет индексации в `robots.txt`                     | P0 | cloud    | free  |
| seo.robots.no.sitemap                                      | В `robots.txt` нет ссылки на `sitemap.xml`                  | P1 | cloud    | free  |
| seo.sitemap.missing                                        | `sitemap.xml` отсутствует или недоступен                    | P1 | cloud    | free  |
| seo.sitemap.invalid                                        | Структура `sitemap.xml` некорректна                         | P2 | cloud    | pro   |
| seo.canonical.missing                                      | Отсутствует `rel=canonical`                                 | P1 | cloud    | free  |
| seo.canonical.conflict                                     | Конфликт канонических ссылок                                | P1 | cloud    | pro   |
| seo.meta.robots.misused                                    | Неверные директивы `noindex`/`nofollow` на важных страницах | P1 | cloud    | pro   |
| seo.redirect.chain                                         | Длинные цепочки перенаправлений                             | P2 | cloud    | free  |
| seo.redirect.loop                                          | Зацикленные перенаправления                                 | P0 | cloud    | free  |
| seo.http.[www.canonical.split](http://www.canonical.split) | Разделение трафика между `www`/без `www`                    | P2 | cloud    | pro   |
| seo.page404.missing                                        | Нет пользовательской страницы 404                           | P2 | cloud    | free  |

---

## 3) SEO / Контент и сниппеты

| testCode                   | Описание                                 |  P | Источник | Тариф |
| -------------------------- | ---------------------------------------- | -: | -------- | ----- |
| seo.title.missing          | Отсутствует тег `title`                  | P1 | cloud    | free  |
| seo.title.too.short        | Слишком короткий `title`                 | P3 | cloud    | free  |
| seo.title.too.long         | Слишком длинный `title`                  | P3 | cloud    | free  |
| seo.description.missing    | Отсутствует `meta description`           | P2 | cloud    | free  |
| seo.description.bad.length | Некорректная длина `meta description`    | P3 | cloud    | free  |
| seo.h1.missing             | Отсутствует `h1`                         | P2 | cloud    | free  |
| seo.h1.multiple            | Несколько `h1` на странице               | P2 | cloud    | free  |
| seo.headings.order.invalid | Нарушение иерархии заголовков            | P3 | cloud    | pro   |
| seo.meta.title.dup         | Дубликаты `title`                        | P2 | cloud    | pro   |
| seo.meta.desc.dup          | Дубликаты `meta description`             | P2 | cloud    | pro   |
| seo.img.alt.missing        | Отсутствуют атрибуты `alt` у изображений | P2 | cloud    | free  |
| seo.og.missing             | Отсутствуют базовые Open Graph метки     | P3 | cloud    | pro   |
| seo.twitter.card.missing   | Нет Twitter Card меток                   | P3 | cloud    | pro   |
| seo.schema.errors          | Ошибки Schema.org разметки               | P2 | cloud    | pro   |

---

## 4) SEO / Мультиязычность

| testCode                      | Описание                                     |  P | Источник | Тариф |
| ----------------------------- | -------------------------------------------- | -: | -------- | ----- |
| seo.hreflang.missing          | Нет `hreflang` для альтернативных версий     | P2 | cloud    | pro   |
| seo.hreflang.invalid          | Неверные коды языка/региона                  | P2 | cloud    | pro   |
| seo.hreflang.not.reciprocal   | Нет обратных ссылок между языковыми версиями | P2 | cloud    | pro   |
| seo.hreflang.xdefault.missing | Отсутствует запись `x-default`               | P3 | cloud    | pro   |
| seo.lang.header.mismatch      | Конфликт `Content-Language` и разметки       | P3 | cloud    | pro   |

---

## 5) Инфраструктура и сеть

| testCode                    | Описание                                          |  P | Источник | Тариф |
| --------------------------- | ------------------------------------------------- | -: | -------- | ----- |
| infra.http2.disabled        | Не используется протокол HTTP/2                   | P2 | cloud    | free  |
| infra.http3.disabled        | Не используется протокол HTTP/3                   | P3 | cloud    | pro   |
| infra.cache.headers.missing | Нет заголовков `Cache-Control`/`ETag`             | P1 | cloud    | free  |
| infra.compress.gzip.off     | Нет сжатия текстовых ответов                      | P1 | cloud    | free  |
| infra.etag.missing          | Нет `ETag` для статики                            | P2 | cloud    | pro   |
| infra.html.size.huge        | Слишком большой размер HTML                       | P2 | cloud    | free  |
| infra.requests.too.many     | Слишком много запросов на страницу                | P2 | cloud    | free  |
| infra.vary.missing          | Нет корректного заголовка `Vary`                  | P3 | cloud    | pro   |
| infra.cdn.not.used          | Статика не раздаётся через сеть доставки контента | P3 | cloud    | pro   |
| infra.tls.weak              | Устаревшие версии шифрования/шифры                | P1 | cloud    | pro   |

---

## 6) Медиа

| testCode                     | Описание                                                |  P | Источник | Тариф |
| ---------------------------- | ------------------------------------------------------- | -: | -------- | ----- |
| media.webp.absent            | Нет версий изображений в WebP/AVIF                      | P2 | cloud    | pro   |
| media.img.oversized          | Изображения больше контейнера                           | P2 | cloud    | free  |
| media.img.dimensions.missing | Не заданы размеры изображений                           | P2 | cloud    | free  |
| media.lazyload.missing       | Нет отложенной загрузки изображений ниже первого экрана | P2 | cloud    | pro   |
| media.img.uncompressed       | Избыточный вес изображений                              | P2 | cloud    | free  |
| media.video.autoplay.heavy   | Тяжёлое автозапуск видео без оптимизации                | P3 | cloud    | pro   |

---

## 7) Безопасность

| testCode                    | Описание                                        |  P | Источник | Тариф |
| --------------------------- | ----------------------------------------------- | -: | -------- | ----- |
| sec.https.redirect.missing  | Нет перенаправления на защищённый протокол      | P0 | cloud    | free  |
| sec.hsts.missing            | Нет заголовка строгой транспортной безопасности | P2 | cloud    | pro   |
| sec.mixed.content           | Смешанный контент на защищённых страницах       | P1 | cloud    | free  |
| sec.xframe.missing          | Нет защиты от встраивания в кадры               | P2 | cloud    | pro   |
| sec.csp.missing             | Нет политики безопасности содержимого           | P2 | cloud    | pro   |
| sec.referrer.policy.missing | Нет политики передачи источника перехода        | P3 | cloud    | pro   |
| sec.xcontenttype.missing    | Нет запрета распознавания типов содержимого     | P2 | cloud    | pro   |
| sec.server.banner.leak      | Утечка версий сервера в заголовках              | P3 | cloud    | pro   |
| sec.cookies.insecure        | Файлы cookie без флагов Secure/SameSite         | P1 | cloud    | pro   |
| sec.dir.indexing.enabled    | Включён список файлов в каталогах               | P2 | cloud    | pro   |

---

## 8) 1С-Битрикс / Производительность и кэш

| testCode                    | Описание                        |  P | Источник | Тариф |
| --------------------------- | ------------------------------- | -: | -------- | ----- |
| bitrix.composite.off        | Композитный режим отключён      | P0 | bitrix   | pro   |
| bitrix.cache.managed.off    | Управляемый кэш отключён        | P1 | bitrix   | pro   |
| bitrix.component.slow       | Долгое выполнение компонентов   | P1 | bitrix   | pro   |
| bitrix.component.nocache    | Компоненты без кэширования      | P2 | bitrix   | pro   |
| bitrix.orm.query.heavy      | Тяжёлые запросы ORM (эвристика) | P2 | bitrix   | pro   |
| bitrix.event.handlers.slow  | Медленные обработчики событий   | P2 | bitrix   | pro   |
| bitrix.template.render.slow | Долгая сборка шаблонов страниц  | P2 | bitrix   | pro   |

---

## 9) 1С-Битрикс / Агенты и фоновые задания

| testCode                   | Описание                         |  P | Источник | Тариф |
| -------------------------- | -------------------------------- | -: | -------- | ----- |
| bitrix.agents.long         | Длительные выполнения агентов    | P2 | bitrix   | pro   |
| bitrix.agents.failures     | Ошибки при выполнении агентов    | P1 | bitrix   | pro   |
| bitrix.agents.too.frequent | Слишком частый запуск агентов    | P2 | bitrix   | pro   |
| bitrix.cron.not.configured | Не настроен запуск по расписанию | P2 | bitrix   | pro   |
| bitrix.jobs.overlap        | Наложение фоновых заданий        | P2 | bitrix   | pro   |

---

## 10) 1С-Битрикс / Конфигурация и окружение

| testCode                       | Описание                                        |  P | Источник | Тариф |
| ------------------------------ | ----------------------------------------------- | -: | -------- | ----- |
| bitrix.php.version.unsupported | Версия интерпретатора не поддерживается         | P1 | bitrix   | pro   |
| bitrix.core.version.outdated   | Устаревшая версия платформы                     | P2 | bitrix   | pro   |
| bitrix.debug.enabled.prod      | Включены режимы отладки на бою                  | P1 | bitrix   | pro   |
| bitrix.display.errors.on       | Вывод ошибок включён на бою                     | P1 | bitrix   | pro   |
| bitrix.cache.storage.misconfig | Неверные хранилища кэша                         | P2 | bitrix   | pro   |
| bitrix.session.handler.default | Обработчик сессий по умолчанию                  | P3 | bitrix   | pro   |
| bitrix.security.module.off     | Отключены параметры безопасности платформы      | P1 | bitrix   | pro   |
| bitrix.timezone.mismatch       | Неверный часовой пояс проекта                   | P3 | bitrix   | pro   |
| bitrix.modules.outdated        | Необновлённые модули с критичными исправлениями | P1 | bitrix   | pro   |
| bitrix.mail.queue.errors       | Ошибки очереди почтовых событий                 | P3 | bitrix   | pro   |

---

## 11) Стабильность и доступность

| testCode                    | Описание                            |  P | Источник | Тариф |
| --------------------------- | ----------------------------------- | -: | -------- | ----- |
| http.errors.5xx.rate        | Доля ответов сервера с кодами 5xx   | P0 | cloud    | pro   |
| http.errors.404.rate        | Доля ответов 404                    | P2 | cloud    | free  |
| http.redirect.loop.detected | Обнаружены циклы перенаправлений    | P0 | cloud    | free  |
| http.unreachable.resources  | Недоступные ресурсы на страницах    | P1 | cloud    | free  |
| http.slow\.bulk.ttfb        | Большая доля страниц с высоким TTFB | P1 | cloud    | free  |

---

## 12) Конверсионная аналитика и атрибуция (минимум MVP)

| testCode                   | Описание                                               |  P | Источник | Тариф |
| -------------------------- | ------------------------------------------------------ | -: | -------- | ----- |
| an.utm.capture.missing     | Не собираются метки источников трафика                 | P1 | bitrix   | pro   |
| an.order.utm.missing       | Заказы без привязки к источнику                        | P1 | bitrix   | pro   |
| an.direct.api.disconnected | Не подключён кабинет рекламы «Яндекс.Директ»           | P1 | cloud    | pro   |
| an.attribution.loss.high   | Высокая потеря атрибуции между сессиями                | P2 | bitrix   | pro   |
| an.roi.coverage.low        | Недостаточное покрытие данными для расчёта окупаемости | P2 | cloud    | pro   |

---

### Примечания по применению

* **P0** — блокирующие проблемы; **P1** — критичные; **P2** — важные; **P3** — улучшения.
* **Источник**: `cloud` — внешнее сканирование и метрики; `bitrix` — локальные проверки модуля.
* **Тариф**: `free` — попадает в лид-магнит и базовый отчёт; расширенные проверки — `pro`/`agency`.

Если требуется, конвертирую этот перечень в набор `*.yml` по нашей `schema.json` и добавлю стартовые веса в `weights/1.0.yml`.
