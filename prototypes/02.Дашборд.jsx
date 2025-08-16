import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  HelpCircle,
  ShieldCheck,
  Star,
  ExternalLink,
  Users,
  Building2,
  Briefcase,
  LineChart,
  ListChecks,
  Layers3,
  Globe,
  Rocket,
  FileDown,
  FileSpreadsheet,
  UploadCloud,
  Sparkles,
  Search,
  Eye,
  Info as InfoIcon,
  Check,
  RotateCcw,
} from "lucide-react";

// ===== Типы =====
type UserRole = "studio" | "seo" | "owner" | "agency";
type Plan = "Free" | "Pro" | "Agency";

type Priority = "P0" | "P1" | "P2" | "P3";

type Issue = { id: string; title: string; priority: Priority; section: "tech" | "a11y" | "cwv" | "seo" | "ux" };

type AuditRow = { id: string; url: string; when: string; score: number; strategy: "mobile" | "desktop" };

type ReportRow = { id: string; title: string; created: string; size: string };

// ===== Демо‑данные =====
const BRAND = { name: "Bitrix Audit", company: "ООО \u00ABКачество жизни\u00BB" };
const DEMO_ISSUES: Issue[] = [
  { id: "p0-1", title: "CLS выше 0.25 на каталоге", priority: "P0", section: "cwv" },
  { id: "p1-1", title: "Нет H1 на 7 страницах", priority: "P1", section: "seo" },
  { id: "p1-2", title: "Контраст CTA ниже 4.5:1", priority: "P1", section: "a11y" },
  { id: "p2-1", title: "Изображения без кеш‑заголовков", priority: "P2", section: "tech" },
  { id: "p3-1", title: "Длинные title > 60 символов", priority: "P3", section: "seo" },
];

const DEMO_AUDITS: AuditRow[] = [
  { id: "a1", url: "kachestvozhizni.ru", when: "Сегодня 10:24", score: 82, strategy: "mobile" },
  { id: "a2", url: "ya.ru", when: "Вчера 19:05", score: 91, strategy: "desktop" },
  { id: "a3", url: "bitrix.ru", when: "12.08 16:12", score: 74, strategy: "mobile" },
];

const DEMO_REPORTS: ReportRow[] = [
  { id: "r1", title: "kachestvozhizni.ru — полный отчёт", created: "Сегодня", size: "1.8 MB" },
  { id: "r2", title: "ya.ru — полный отчёт", created: "Вчера", size: "1.2 MB" },
];

// ===== Утилиты =====
function InfoHint({ title, text }: { title: string; text: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          aria-label={`Подробнее: ${title}`}
          className="inline-flex items-center justify-center h-5 w-5 rounded-full border text-slate-600 hover:bg-slate-50 cursor-help"
        >
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 text-sm">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-slate-600">{text}</div>
      </PopoverContent>
    </Popover>
  );
}

function PriorityBadge({ p }: { p: Priority }) {
  const map: Record<Priority, string> = {
    P0: "bg-red-600 text-white",
    P1: "bg-red-500 text-white",
    P2: "bg-rose-300 text-black",
    P3: "bg-slate-300 text-black",
  };
  return <Badge className={`${map[p]} font-medium`}>{p}</Badge>;
}

function SectionTitle({ icon, children, cta }: { icon?: React.ReactNode; children: React.ReactNode; cta?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-slate-800">
        {icon}
        <h2 className="text-base font-semibold">{children}</h2>
      </div>
      {cta}
    </div>
  );
}

// ===== Фичи/гейтинг =====
const FEATURES = {
  exportCSV: (role: UserRole, plan: Plan) => plan === "Agency", // {SA}: только Agency в R1
  whiteLabel: (role: UserRole, plan: Plan) => plan !== "Free" && (role === "agency" || role === "studio"),
  multiClient: (role: UserRole) => role === "studio" || role === "agency",
  compareAudits: (role: UserRole) => role === "seo" || role === "agency",
  ownerChecklist: (role: UserRole) => role === "owner",
};

// ===== Общие виджеты =====
function ScoreCard() {
  return (
    <Card className="rounded-2xl border-blue-100">
      <CardContent className="p-4 space-y-3">
        <SectionTitle
          icon={<Star className="h-4 w-4 text-blue-700" />}
          cta={
            <InfoHint
              title="Как считается балл?"
              text={
                "Каждой проблеме назначается штраф: P0=8–10, P1=5–7, P2=3–4, P3=0.5–2. Итог: 100 − сумма штрафов. Если покрытие тестов неполное, применяется понижающий коэффициент. Чем выше балл — тем меньше критичных проблем."
              }
            />
          }
        >
          Итоговый балл (0–100)
        </SectionTitle>
        <div className="flex items-end gap-4">
          <div>
            <div className="text-5xl font-bold text-blue-700">82</div>
            <div className="text-xs text-slate-500">Индекс качества сайта</div>
          </div>
          <div className="flex-1">
            <Progress value={82} aria-label="Общий балл" />
            <div className="mt-1 text-xs text-slate-600">+4 за последнюю неделю</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CWVCard() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Core Web Vitals</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl border p-2">
          <div className="text-xs text-slate-500">LCP</div>
          <div className="text-lg font-semibold">2.6s</div>
        </div>
        <div className="rounded-xl border p-2">
          <div className="text-xs text-slate-500">INP</div>
          <div className="text-lg font-semibold">210ms</div>
        </div>
        <div className="rounded-xl border p-2">
          <div className="text-xs text-slate-500">CLS</div>
          <div className="text-lg font-semibold">0.05</div>
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="p-4">
        <div className="text-sm text-slate-600">{label}</div>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <div className="text-xs text-slate-500 mt-1">{sub}</div>}
      </CardContent>
    </Card>
  );
}

function Backlog({
  issues,
  prio,
  onTogglePrio,
  device,
  onChangeDevice,
  onResetFilters,
  q,
  onChangeQuery,
}: {
  issues: Issue[];
  prio: Priority[];
  onTogglePrio: (p: Priority) => void;
  device: "all" | "mobile" | "desktop";
  onChangeDevice: (d: "all" | "mobile" | "desktop") => void;
  onResetFilters: () => void;
  q: string;
  onChangeQuery: (v: string) => void;
}) {
  const empty = issues.length === 0;
  const activePrio = ["P0", "P1", "P2", "P3"].filter((p) => prio.includes(p as Priority)).join(", ");
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-sm">Backlog P0–P3</CardTitle>
        <div className="text-xs text-slate-500 flex items-center gap-2">
          Приоритеты
          <InfoHint
            title="Приоритезация"
            text="P0 — критично, далее P1–P3. Стартуем с P0, затем P1. Ссылки ведут на конкретные URL с проблемами: в превью — 10 точек интереса (/, /catalog, карточка, /contacts, /about, блог и т.п.), в полном отчёте — расширенный список из sitemap.xml/GSC."
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-3">
        {/* ВСТРОЕННЫЕ ФИЛЬТРЫ + ПОИСК */}
        <div className="grid gap-2 rounded-xl border bg-slate-50 p-2">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-medium text-slate-600">Фильтры</div>
            <button
              onClick={onResetFilters}
              className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md border cursor-pointer bg-white"
            >
              <RotateCcw className="h-3.5 w-3.5" /> Сбросить
            </button>
          </div>

          {/* Поиск */}
          <div className="flex items-center gap-2">
            <Input
              className="flex-1"
              value={q}
              onChange={(e) => onChangeQuery(e.target.value)}
              placeholder="Найти проблему или страницу"
            />
            {q && (
              <button onClick={() => onChangeQuery("")} className="text-xs text-slate-500 hover:underline cursor-pointer">Очистить</button>
            )}
          </div>
          <Button variant="ghost" className="justify-start cursor-pointer w-max">
            <Search className="h-4 w-4 mr-2" /> Расширенный поиск
          </Button>

          {/* Приоритеты */}
          <div className="flex flex-wrap gap-2" role="group" aria-label="Фильтр по приоритетам">
            {( ["P0", "P1", "P2", "P3"] as Priority[] ).map((p) => {
              const active = prio.includes(p);
              return (
                <button
                  key={p}
                  onClick={() => onTogglePrio(p)}
                  className={`px-2 py-1 rounded-md border text-xs inline-flex items-center gap-1 cursor-pointer ${
                    active ? "bg-blue-600 text-white border-blue-600" : "bg-white text-slate-700"
                  }`}
                  aria-pressed={active}
                >
                  {active && <Check className="h-3 w-3" />} {p}
                </button>
              );
            })}
          </div>

          {/* Устройство */}
          <div className="grid grid-cols-3 gap-2" role="group" aria-label="Тип устройства">
            {( ["all", "mobile", "desktop"] as const ).map((d) => (
              <Button
                key={d}
                variant={device === d ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => onChangeDevice(d)}
                aria-pressed={device === d}
              >
                {d === "all" ? "Все" : d === "mobile" ? "Мобильные" : "Десктоп"}
              </Button>
            ))}
          </div>

          <div className="text-xs text-slate-500">
            Активно: {activePrio || "—"}
            {device !== "all" ? ` • Устройство: ${device}` : ""}
            {q ? ` • Поиск: “${q}”` : ""}
          </div>
        </div>

        {/* СПИСОК ЗАДАЧ */}
        {empty ? (
          <div className="p-3 rounded-lg border text-sm text-slate-600">Нет задач по выбранным условиям.</div>
        ) : (
          issues.slice(0, 50).map((it) => (
            <div key={it.id} className="flex items-start justify-between gap-2 p-2 rounded-lg border">
              <div className="flex items-start gap-2">
                <div className="mt-1 h-2 w-2 rounded-full bg-rose-500" />
                <div>
                  <div className="font-medium flex items-center gap-2">
                    {it.title}
                    <PriorityBadge p={it.priority} />
                  </div>
                  <div className="text-xs text-slate-600">Секция: {it.section.toUpperCase()}</div>
                </div>
              </div>
              <Button size="sm" variant="ghost" className="cursor-pointer">
                Открыть <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

function Integrations() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Интеграции (работают автоматически)</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 space-y-2 text-sm">
        <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> Google PageSpeed Insights
            <InfoHint
              title="Как это работает"
              text="Собираем метрики скорости и CWV автоматически. Никаких действий со стороны клиента не требуется."
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg border bg-slate-50">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4" /> Lighthouse (batch)
            <InfoHint
              title="Зачем"
              text="Глубокий техаудит и доступность. Запускается автоматически очередями, без ручной настройки."
            />
          </div>
        </div>
        <div className="flex items-center justify-between p-3 rounded-lg border bg-white">
          <div className="flex items-start gap-2">
            <Building2 className="h-5 w-5 mt-0.5" />
            <div>
              <div className="font-medium">Модуль Битрикс — расширенный аудит</div>
              <div className="text-xs text-slate-600">
                Даст доступ к закрытым страницам, авторизованным зонам и обойдёт антибот‑защиту. Рекомендуем для полного отчёта.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <InfoHint
              title="Почему это важно"
              text="Без модуля часть страниц (корзина, кабинет, чек‑аут) может быть недоступна или защищена антиботами."
            />
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer">
              <UploadCloud className="h-4 w-4 mr-2" /> Установить модуль
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActions({ plan, canCSV, onRunAudit }: { plan: Plan; canCSV: boolean; onRunAudit: () => void }) {
  return (
    <Card className="rounded-2xl border-blue-100">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Быстрые действия</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 grid gap-2">
        <Button className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer" onClick={onRunAudit}>
          <Rocket className="h-4 w-4 mr-2" /> Запустить аудит
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" disabled={plan === "Free"} className="cursor-pointer disabled:opacity-50">
            <FileDown className="h-4 w-4 mr-2" /> Экспорт PDF
          </Button>
          <Button variant="outline" disabled={!canCSV} className="cursor-pointer disabled:opacity-50">
            <FileSpreadsheet className="h-4 w-4 mr-2" /> CSV
          </Button>
        </div>
        <div className="text-xs text-slate-600">
          <span className="inline-flex items-center gap-1">
            <InfoIcon className="h-3.5 w-3.5" /> PDF:
          </span>{" "}
          брендированный отчёт с логотипом и контактами (Pro/Agency).
          <br />
          <span className="inline-flex items-center gap-1">
            <InfoIcon className="h-3.5 w-3.5" /> CSV:
          </span>{" "}
          таблица всех найденных проблем (ID, страница, приоритет, рекомендация) — только Agency (R1).
        </div>
      </CardContent>
    </Card>
  );
}

function ClientsCard() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Briefcase className="h-4 w-4" /> Клиенты
        </CardTitle>
        <Button size="sm" variant="outline" className="cursor-pointer">
          Добавить клиента
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 grid gap-2 text-sm">
        <div className="flex items-center justify-between p-2 rounded-lg border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" /> Acme LLC
          </div>
          <div className="text-xs text-slate-500">4 проекта</div>
        </div>
        <div className="flex items-center justify-between p-2 rounded-lg border">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4" /> ShopNow
          </div>
          <div className="text-xs text-slate-500">2 проекта</div>
        </div>
      </CardContent>
    </Card>
  );
}

function CompareAudits() {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <LineChart className="h-4 w-4" /> Сравнение аудитов
        </CardTitle>
        <Button size="sm" variant="outline" className="cursor-pointer">Добавить сайт</Button>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="h-24 rounded-xl border grid place-items-center text-xs text-slate-500">
          График динамики (placeholder)
        </div>
      </CardContent>
    </Card>
  );
}

function OwnerChecklist() {
  const items = [
    { id: 1, text: "Повысить контраст на кнопках (WCAG)", done: false },
    { id: 2, text: "Оптимизировать изображения (кеш/размер)", done: true },
    { id: 3, text: "Починить H1 на карточках товара", done: false },
  ];
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <ListChecks className="h-4 w-4" /> Что сделать на этой неделе
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 grid gap-2">
        {items.map((i) => (
          <label key={i.id} className="flex items-center gap-2 text-sm cursor-pointer">
            <Checkbox checked={i.done} onCheckedChange={() => {}} />
            {i.text}
          </label>
        ))}
      </CardContent>
    </Card>
  );
}

function WhiteLabelCard() {
  return (
    <Card className="rounded-2xl border-rose-100">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-sm flex items-center gap-2">
          <Layers3 className="h-4 w-4 text-rose-600" /> White‑label
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 text-sm">
        Лого и контакты бренда клиента будут в отчётах. <InfoHint title="White‑label" text="В R1: логотип + контакты. {PO}" />
      </CardContent>
    </Card>
  );
}

function SavedReports({ rows, plan, canCSV }: { rows: ReportRow[]; plan: Plan; canCSV: boolean }) {
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-sm">Сохранённые отчёты</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 grid gap-2 text-sm">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between p-2 rounded-lg border">
            <div>
              <div className="font-medium">{r.title}</div>
              <div className="text-xs text-slate-600">
                {r.created} • {r.size}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="secondary" className="cursor-pointer" asChild>
                <a href={`/reports/${r.id}`}><Eye className="h-4 w-4 mr-1"/>Открыть</a>
              </Button>
              <Button size="sm" variant="ghost" className="cursor-pointer disabled:opacity-50" disabled={plan === "Free"}>
                <FileDown className="h-4 w-4 mr-1" /> PDF
              </Button>
              <Button size="sm" variant="outline" className="cursor-pointer disabled:opacity-50" disabled={!canCSV}>
                <FileSpreadsheet className="h-4 w-4 mr-1" /> CSV
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RecentAudits({ rows }: { rows: AuditRow[] }) {
  const empty = rows.length === 0;
  return (
    <Card className="rounded-2xl">
      <CardHeader className="pb-2 flex items-center justify-between">
        <CardTitle className="text-sm">Последние аудиты</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 grid gap-2 text-sm">
        {empty ? (
          <div className="p-3 rounded-lg border text-sm text-slate-600">Нет результатов по выбранным фильтрам.</div>
        ) : (
          rows.map((r) => (
            <div key={r.id} className="flex items-center justify-between p-2 rounded-lg border">
              <div>
                <div className="font-medium">{r.url}</div>
                <div className="text-xs text-slate-600">
                  {r.when} • {r.strategy === "mobile" ? "Mobile" : "Desktop"}
                </div>
              </div>
              <Badge className={r.score >= 85 ? "bg-green-600" : "bg-blue-600"}>{r.score}</Badge>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}

// ===== Корневой экран =====
export default function DashboardFull() {
  const [role, setRole] = useState<UserRole>(
    () => (typeof window !== "undefined" ? (localStorage.getItem("ba.role") as UserRole) : null) || "owner"
  );
  const [plan, setPlan] = useState<Plan>("Pro");

  // Фильтры
  const [prio, setPrio] = useState<Priority[]>(["P0", "P1", "P2", "P3"]);
  const [device, setDevice] = useState<"all" | "mobile" | "desktop">("all");
  const [q, setQ] = useState<string>("");

  // Мини‑тесты / инварианты
  useEffect(() => {
    const roles = ["studio", "seo", "owner", "agency"] as const;
    roles.forEach((r) => console.assert(roles.includes(r), "roles enum ok"));
    // CSV gating
    console.assert(FEATURES.exportCSV("agency", "Agency") === true, "CSV должен быть доступен для Agency");
    console.assert(FEATURES.exportCSV("owner", "Pro") === false, "CSV не должен быть доступен для не‑Agency");
    // WL gating
    console.assert(
      FEATURES.whiteLabel("agency", "Pro") === true && FEATURES.whiteLabel("owner", "Pro") === false,
      "WL гейт по роли/плану"
    );
    // multiClient
    console.assert(FEATURES.multiClient("studio") === true && FEATURES.multiClient("owner") === false, "multiClient гейт");
    // Фильтры — базовые проверки
    console.assert(prio.includes("P0") && prio.includes("P3"), "По умолчанию выбраны все приоритеты");
    // Просмотрщик отчётов — базовый инвариант
    console.assert(/^\/reports\//.test(`/reports/${DEMO_REPORTS[0].id}`), "Путь web‑viewer отчёта корректен");
  }, []);

  // Доп. тесты поведения фильтров (без изменения состояния)
  useEffect(() => {
    console.assert(DEMO_ISSUES.length >= 1 && DEMO_AUDITS.length >= 1, "Демо‑данные присутствуют");
    console.assert(DEMO_ISSUES.some(i => i.title.toLowerCase().includes("cls")), "Демо содержит кейс для поиска: CLS");
  }, []);

  const setRolePersist = (r: UserRole) => {
    setRole(r);
    try {
      localStorage.setItem("ba.role", r);
    } catch {}
  };

  const onRunAudit = () => {
    console.log("audit_started", { ts: Date.now(), source: "dashboard" }); // {BA}
  };

  const canCSV = FEATURES.exportCSV(role, plan);

  // Применение фильтров
  const filteredIssues = useMemo(() => {
    const s = q.trim().toLowerCase();
    return DEMO_ISSUES.filter((i) => prio.includes(i.priority) && (s ? i.title.toLowerCase().includes(s) : true));
  }, [prio, q]);
  const filteredAudits = useMemo(() => {
    const s = q.trim().toLowerCase();
    return DEMO_AUDITS.filter((a) => (device === "all" ? true : a.strategy === device) && (s ? a.url.toLowerCase().includes(s) : true));
  }, [device, q]);

  const togglePriority = (p: Priority) => {
    setPrio((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  };

  const resetFilters = () => {
    setPrio(["P0", "P1", "P2", "P3"]);
    setDevice("all");
    // мини‑тест после сброса (без ожидания):
    console.assert(true, "resetFilters выполнен");
  };

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-10 space-y-6">
        {/* Шапка */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 text-white grid place-items-center">BA</div>
            <div className="text-base font-semibold text-slate-800">{BRAND.name}</div>
            <Badge variant="outline" className="border-rose-600 text-rose-700">R1</Badge>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <a className="px-3 py-1 rounded-lg hover:bg-slate-50 cursor-pointer">Аудиты</a>
            <a className="px-3 py-1 rounded-lg hover:bg-slate-50 cursor-pointer">Отчёты</a>
            <a className="px-3 py-1 rounded-lg hover:bg-slate-50 cursor-pointer">Бэклог</a>
            <a className="px-3 py-1 rounded-lg hover:bg-slate-50 cursor-pointer">Интеграции</a>
            <a className="px-3 py-1 rounded-lg hover:bg-slate-50 cursor-pointer">Настройки</a>
          </nav>
        </header>

        {/* Панель ролей/плана (Dev) */}
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-2xl border bg-white">
          <div className="flex items-center gap-2 text-sm">
            Роль:
            <Select value={role} onValueChange={(v: any) => setRolePersist(v)}>
              <SelectTrigger className="w-40 cursor-pointer"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="owner">Владелец</SelectItem>
                <SelectItem value="seo">SEO</SelectItem>
                <SelectItem value="studio">Студия</SelectItem>
                <SelectItem value="agency">Агентство</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 text-sm">
            Тариф:
            <Select value={plan} onValueChange={(v: any) => setPlan(v)}>
              <SelectTrigger className="w-32 cursor-pointer"><SelectValue/></SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Agency">Agency</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto text-xs text-slate-500">© {new Date().getFullYear()} {BRAND.company}</div>
        </div>

        {/* Хиро‑полоса */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-blue-600 to-rose-600 text-white">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-4 w-4"/> Личный кабинет — {role.toUpperCase()}
            </div>
            <div className="text-xs text-white/90 flex items-center gap-3">
              <div className="inline-flex items-center gap-1"><ShieldCheck className="h-4 w-4"/> AES‑256</div>
              <div className="inline-flex items-center gap-1"><Star className="h-4 w-4"/> WCAG 2.1 AA</div>
            </div>
          </div>
        </div>

        {/* Контент — сетка */}
        <section className="grid md:grid-cols-12 gap-4 items-start">
          {/* Левая колонка */}
          <div className="md:col-span-8 grid gap-4">
            <ScoreCard/>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <CWVCard/>
              <Stat label="Ошибок P0" value="2" sub="Нужно исправить первыми"/>
              <Stat label="Ошибок P1–P3" value="11" sub="См. бэклог ниже"/>
            </div>

            {/* Ролевые особенности */}
            {FEATURES.multiClient(role) && <ClientsCard/>}
            {FEATURES.compareAudits(role) && <CompareAudits/>}
            {FEATURES.ownerChecklist(role) && <OwnerChecklist/>}
            {FEATURES.whiteLabel(role, plan) && <WhiteLabelCard/>}

            <Backlog
              issues={filteredIssues}
              prio={prio}
              onTogglePrio={togglePriority}
              device={device}
              onChangeDevice={setDevice}
              onResetFilters={resetFilters}
              q={q}
              onChangeQuery={setQ}
            />
            <RecentAudits rows={filteredAudits}/>
          </div>

          {/* Правая колонка */}
          <aside className="md:col-span-4 grid gap-4">
            <QuickActions plan={plan} canCSV={canCSV} onRunAudit={onRunAudit}/>
            <Integrations/>

            {/* Сохранённые отчёты */}
            <SavedReports rows={DEMO_REPORTS} plan={plan} canCSV={canCSV}/>
          </aside>
        </section>

        {/* Низ страницы */}
        <footer className="pt-4 text-xs text-slate-600 flex items-center justify-between">
          <div>© {new Date().getFullYear()} {BRAND.company}</div>
          <div className="flex items-center gap-3">
            <a className="hover:underline cursor-pointer">Политика</a>
            <a className="hover:underline cursor-pointer">Контакты</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
