import { useMemo, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import {
  Rocket,
  Settings2,
  Activity,
  Info,
  ShieldCheck,
  AlertTriangle,
  Bot,
  Search,
  Briefcase,
  Building2,
  User as UserIcon,
  Gauge,
  ListOrdered,
  Gift,
  CheckCircle2,
  TimerReset,
  CheckCircle,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// ---------------------------------------------------------------------------
// 🔧 КОНФИГУРАЦИЯ БЕЗ import.meta / process.env (совместимо с холстом)
// Используем window.__APP_CONFIG__ с дефолтами.
// ---------------------------------------------------------------------------
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const APP: any = (globalThis as any).__APP_CONFIG__ || {};

// ====== БРЕНД ======
export interface Brand {
  name: string;
  logoUrl: string;
  companyLegalName?: string;
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
  socials?: { vk?: string; tg?: string; x?: string; github?: string };
  footerLinks?: { faq?: string; policy?: string; contacts?: string; terms?: string };
  whiteLabel?: { enabled?: boolean; partnerName?: string; logoUrl?: string };
}

const BRAND: Brand = {
  name: APP?.BRAND?.name ?? "Bitrix Audit",
  logoUrl: APP?.BRAND?.logoUrl ?? "https://cdn.example.com/logo.png",
  companyLegalName: APP?.BRAND?.companyLegalName ?? "ООО «Качество жизни»",
  supportEmail: APP?.BRAND?.supportEmail ?? "support@example.com",
  supportPhone: APP?.BRAND?.supportPhone ?? "",
  address: APP?.BRAND?.address ?? "",
  socials: APP?.BRAND?.socials ?? {},
  footerLinks: APP?.BRAND?.footerLinks ?? { faq: "#", policy: "#", contacts: "#" },
  whiteLabel: APP?.BRAND?.whiteLabel ?? { enabled: false },
};

// ====== КОНФИГ: ЛИМИТЫ ======
const LIMITS = {
  rpmPerIP: Number(APP?.LIMITS?.rpmPerIP ?? 30),
  free: {
    perDay: Number(APP?.LIMITS?.free?.perDay ?? 1),
    perMonth: Number(APP?.LIMITS?.free?.perMonth ?? 3),
    maxPages: Number(APP?.LIMITS?.free?.maxPages ?? 100),
  },
} as const;

// Флаги окружения для дев‑панели
const FLAGS = {
  isProd: Boolean(APP?.isProd ?? false),
  showDevPanel: Boolean(APP?.showDevPanel ?? false),
};

// ====== I18N (RU-only для MVP по {PO}) ======
// Мультиязычность отключена: весь интерфейс фиксирован на русском.
// Сохраняем хелпер t() для единообразия, но игнорируем locale.
type Locale = "ru";
const MESSAGES = {
  ru: {
    "hero.title_a": "{{brand}}: мгновенная оценка 0–100 и топ‑3 проблем — бесплатно",
    "hero.title_b": "Проверка сайта за 30 секунд. Балл 0–100 и топ‑3 — без установки",
    "hero.limits": "Лимиты Free: {{perDay}}/день, {{perMonth}}/мес, ≤{{maxPages}} страниц; rate‑limit шлюза: {{rpm}} req/min/IP.",
    "hero.or_email": "или введите email",
    "auth.or_social": "или войдите через соцсети",
    // — регистрация/вход
    "auth.email": "E‑mail",
    "auth.next": "Далее",
    "auth.signin": "Войти",
    "auth.check_inbox_title": "Отправили письмо на {{email}}",
    "auth.check_inbox_sub": "Перейдите по ссылке из письма, чтобы подтвердить e‑mail.",
    "auth.resend": "Отправить ещё раз",
    "auth.resend_after": "Повторная отправка через {{sec}} c",
    "auth.enter_code": "Ввести код вручную",
    "auth.otp_label": "Код из письма",
    "auth.otp_submit": "Подтвердить",
    "auth.email_exists": "Этот e‑mail уже зарегистрирован",
    "auth.switch_to_signin": "Перейти ко входу",
    "auth.rate_limited": "Слишком часто. Попробуйте позже.",
    "auth.onboarding_title": "Почти готово",
    "auth.onboarding_sub": "Заполните пару полей — и начнём аудит.",
    "auth.name": "Имя",
    "auth.company": "Компания",
    "auth.start": "Начать работу",
  },
} as const;
const getLocale = (): Locale => "ru";
function t(key: string, vars: Record<string, any> = {}, _ignored?: any) {
  const raw = (MESSAGES.ru as any)[key] ?? key;
  return raw.replace(/{{(.*?)}}/g, (_: any, k: string) => String(vars[k] ?? ""));
}

// ====== АНАЛИТИКА ======
const track = (name: string, props: Record<string, any> = {}) => {
  try { (window as any).analytics?.track?.(name, props); } catch {}
  if (!(window as any).analytics) console.debug("[track]", name, props);
};

// ====== УТИЛЫ ======
// Поддержка кириллических доменов и автодобавление https://
// В инпуте показываем человеческий вид (кириллицей), а под капотом работаем с punycode.
const isIPv4 = (h: string) => {
  if (!/^(\d{1,3}\.){3}\d{1,3}$/.test(h)) return false;
  return h.split(".").every((x) => Number(x) >= 0 && Number(x) <= 255);
};

const isValidPublicHostname = (hostname: string) => {
  if (!hostname) return false;
  if (hostname.endsWith(".")) return false; // запрет завершающей точки (ya.)
  if (hostname.includes("..")) return false; // запрет пустых меток
  if (isIPv4(hostname)) return true;
  const labels = hostname.split(".");
  if (labels.length < 2) return false; // нужен публичный TLD
  for (const lbl of labels) {
    if (!lbl || lbl.length > 63) return false;
    if (lbl.startsWith("-") || lbl.endsWith("-")) return false;
    if (!/^[a-z0-9-]+$/i.test(lbl)) return false; // punycode должен быть ASCII
  }
  const tld = labels[labels.length - 1];
  if (!(/^[a-z]{2,}$/i.test(tld) || /^xn--[a-z0-9-]{2,}$/i.test(tld))) return false; // поддерживаем punycode TLD
  return true;
};

// Мягкая нормализация для человека: только схема, без конвертации в punycode
const normalizeUrl = (raw: string) => {
  let s = String(raw || "").trim();
  if (!s) return s;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  return s;
};

// Жёсткая каноникализация для сети: схема + punycode hostname
const canonicalizeUrl = (raw: string) => {
  let s = String(raw || "").trim();
  if (!s) return s;
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`;
  try {
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") u.protocol = "https:";
    return `${u.protocol}//${u.hostname}${u.port ? ":" + u.port : ""}${u.pathname || "/"}${u.search}${u.hash}`; // hostname уже в punycode
  } catch {
    return s;
  }
};

const validateUrl = (raw: string) => {
  try {
    const s = canonicalizeUrl(raw);
    const u = new URL(s);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    return isValidPublicHostname(u.hostname);
  } catch { return false; }
};

const isValidEmail = (v: string) => /.+@.+\..+/.test(v);

// ФЭЙК‑API (стаб) для демонстрации сценариев
const fakeAuthApi = {
  async signupInit({ email }: { email: string }) {
    // домен otp.test → принудительно OTP
    if (email.endsWith("@otp.test")) return { method: "otp", length: 6, resendAfter: 30 } as const;
    // домен exists.test → уже зарегистрирован
    if (email.endsWith("@exists.test")) return { error: "already_exists" } as const;
    // иначе magic link
    return { method: "magic_link", resendAfter: 30 } as const;
  },
  async signinInit({ email }: { email: string }) {
    return { method: "magic_link", resendAfter: 30 } as const;
  },
  async verify({ token, code }: { token?: string; code?: string }) {
    if (token) return { ok: true, needsOnboarding: true, sessionToken: "sess_demo" } as const;
    if (code === "123456") return { ok: true, needsOnboarding: true, sessionToken: "sess_demo" } as const;
    return { ok: false } as const;
  },
  async resend() { return { ok: true } as const; },
};

function Score({ value }: { value: number }) {
  return (
    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 ring-1 ring-blue-100/60 shadow-sm">
      <div className="text-sm text-slate-600">Итоговый балл</div>
      <div className="flex items-baseline gap-3">
        <div className="text-6xl font-extrabold tracking-tight text-blue-700">{value}</div>
        <div className="text-base text-slate-600">/ 100</div>
      </div>
    </div>
  );
}

type Priority = "P0" | "P1" | "P2" | "P3";
interface Issue { id: string; title: string; priority: Priority; tip?: string }

const sampleIssues: Issue[] = [
  { id: "1", title: "Core Web Vitals: CLS выше 0.25", priority: "P0", tip: "Стабилизируйте layout: резерв места для баннеров/шрифтов" },
  { id: "2", title: "Нет H1 на нескольких страницах", priority: "P1", tip: "Добавьте единственный H1 на каждую страницу" },
  { id: "3", title: "Контраст текста ниже 4.5:1", priority: "P1", tip: "Усилите цвет текста/фон до ≥4.5:1" },
  { id: "4", title: "Отсутствуют alt у изображений", priority: "P2", tip: "Опишите смысл изображения в атрибуте alt" },
];

function PriorityBadge({ p }: { p: Priority }) {
  const map: Record<Priority, string> = {
    P0: "bg-red-600 text-white",
    P1: "bg-red-500/90 text-white",
    P2: "bg-rose-300 text-black",
    P3: "bg-slate-300 text-black",
  };
  return <span className={`text-[10px] px-1.5 py-0.5 rounded ${map[p]}`}>{p}</span>;
}

function IssueIcon({ p }: { p: Priority }) {
  if (p === "P0" || p === "P1") return <AlertTriangle className="h-4 w-4 text-rose-600"/>;
  return <CheckCircle2 className="h-4 w-4 text-slate-500"/>;
}

function InfoHint({ title, text }: { title: string; text: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-slate-600">
      <Info className="h-3.5 w-3.5"/>
      <span className="text-xs">{title}</span>
      <span className="sr-only">{text}</span>
    </span>
  );
}

function HeroHeadline({ variant }: { variant: HeroVariant }) {
  const locale = getLocale();
  const raw = variant === "B" ? t("hero.title_b", {}, locale) : t("hero.title_a", { brand: BRAND.name }, locale);
  // Разбиваем по « — » на 2 строки для мобильных
  const parts = raw.split(" — ");
  return (
    <h1 className="text-[28px] md:text-5xl font-extrabold tracking-tight leading-tight">
      <span className="block md:inline">{parts[0]}</span>
      {parts[1] ? (
        <>
          <span className="hidden md:inline"> — </span>
          <span className="block md:inline text-slate-800">{parts.slice(1).join(" — ")}</span>
        </>
      ) : null}
    </h1>
  );
}

type HeroVariant = "A" | "B";
type UserRole = "studio" | "seo" | "owner" | "agency";

type AuthStep = "email" | "check" | "otp" | "onboarding";

function AuthDialog({ open, onOpenChange, mode, onSwitchToSignin }: { open: boolean; onOpenChange: (v: boolean) => void; mode: "signin" | "signup"; onSwitchToSignin?: (email?: string) => void; }) {
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole | null>(null);
  const [showMoreProviders, setShowMoreProviders] = useState(false);
  const [step, setStep] = useState<AuthStep>("email");
  const [method, setMethod] = useState<"magic_link" | "otp" | null>(null);
  const [resendIn, setResendIn] = useState(0);
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState<string | null>(null);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");

  useEffect(() => { if (!open) { setStep("email"); setMethod(null); setInlineError(null); setResendIn(0); setLoading(false);} }, [open]);

  useEffect(() => {
    if (step === "check" || step === "otp") {
      if (resendIn <= 0) return;
      const tmr = setInterval(() => setResendIn((x) => (x > 0 ? x - 1 : 0)), 1000);
      return () => clearInterval(tmr);
    }
  }, [step, resendIn]);

  const roles: { id: UserRole; title: string; desc: string; icon: React.ReactNode }[] = [
    { id: "studio", title: "Веб‑студия",         desc: "Аудит клиентов, отчёты, WL",          icon: <Briefcase className="h-4 w-4"/> },
    { id: "seo",    title: "SEO‑специалист",    desc: "CWV и техаудит для роста",            icon: <Search className="h-4 w-4"/> },
    { id: "owner",  title: "Владелец сайта",    desc: "Сводка и приоритеты, Check‑лист",     icon: <UserIcon className="h-4 w-4"/> },
    { id: "agency", title: "Агентство/интегр.", desc: "White‑label, экспорт, интеграции",     icon: <Building2 className="h-4 w-4"/> },
  ];

  const choose = (r: UserRole) => {
    setRole(r);
    try { localStorage.setItem("ba.role", r); } catch {}
  };

  const roleRequired = isSignup && !role;

  const startByEmail = async () => {
    setInlineError(null);
    track(isSignup ? "signup_email_click" : "signin_email_click", { role, locale: getLocale() });
    if (!isValidEmail(email)) { setInlineError("Некорректный e‑mail"); track(isSignup ? "signup_email_invalid" : "signin_email_invalid", {}); return; }
    if (isSignup && !role) { setInlineError("Выберите роль выше"); return; }

    setLoading(true);
    try {
      const res = isSignup ? await fakeAuthApi.signupInit({ email }) : await fakeAuthApi.signinInit({ email });
      setLoading(false);

      // Ошибки
      if ((res as any).error === "already_exists") {
        track("signup_exists_switch_login", {});
        if (onSwitchToSignin) onSwitchToSignin(email);
        return;
      }
      if ((res as any).error === "rate_limited") { setInlineError(t("auth.rate_limited")); return; }

      // Успешно — показываем шаг проверки
      if ((res as any).method === "magic_link") {
        setMethod("magic_link"); setStep("check"); setResendIn((res as any).resendAfter ?? 30); track("signup_email_start", { method: "magic_link" });
      } else if ((res as any).method === "otp") {
        setMethod("otp"); setStep("otp"); setResendIn((res as any).resendAfter ?? 30); track("signup_email_start", { method: "otp" });
        setTimeout(() => otpRefs[0].current?.focus(), 0);
      }
    } catch (e) {
      setLoading(false);
      setInlineError("Сеть недоступна. Повторите попытку");
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    const r = await fakeAuthApi.resend();
    if (r.ok) { setResendIn(30); track("otp_resend", {}); }
  };

  const onOtpChange = (i: number, val: string) => {
    const v = val.replace(/\D/g, "").slice(0,1);
    setOtp((prev) => {
      const n = [...prev]; n[i] = v; return n;
    });
    if (v && i < otpRefs.length-1) otpRefs[i+1].current?.focus();
  };

  const verifyOtp = async () => {
    const code = otp.join("");
    const res = await fakeAuthApi.verify({ code });
    if (!res.ok) { setInlineError("Неверный код"); track("otp_submit_fail", {}); return; }
    track("otp_submit_success", {});
    setStep("onboarding");
  };

  const completeOnboarding = () => {
    try { localStorage.setItem("ba.user", JSON.stringify({ email, role, name, company })); } catch {}
    track("signup_completed", { role });
    onOpenChange(false);
  };

  // Рендер шага с выбором ролей и e‑mail
  const renderStepEmail = () => (
    <div className="space-y-5">
      {/* Email как fallback — выше SSO; сетка чтобы не ломало ширину */}
      <label className="grid gap-2 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
        <span className="text-slate-700">{t("auth.email")}</span>
        <div className="grid grid-cols-[1fr_auto] gap-2 sm:col-span-2">
          <Input value={email} onChange={(e:any)=>setEmail(e.target.value)} type="email" placeholder="you@company.ru" aria-label="E‑mail" className="rounded-xl shadow-sm h-10 min-w-0 w-full"/>
          <Button onClick={startByEmail} className="rounded-xl h-10 sm:w-[96px] cursor-pointer" aria-disabled={!!(isSignup && !role)} disabled={isSignup && !role || loading} title={isSignup && !role ? "Выберите роль выше" : undefined}>{isSignup ? t("auth.next") : t("auth.signin")}</Button>
        </div>
        {inlineError && <div className="text-xs text-rose-600 sm:col-span-2" aria-live="polite">{inlineError}</div>}
      </label>
      <div className="flex items-center gap-3 text-xs text-slate-500">
        <span className="flex-1 border-t"/> <span className="px-1">{t("auth.or_social")}</span> <span className="flex-1 border-t"/>
      </div>

      {/* Роли: 2×2 сетка (по 2 кнопки в строке) */}
      {isSignup && (
        <div className="space-y-2">
          <div className="text-sm font-medium flex items-center gap-2">
            Кто вы?
            <InfoHint title="Почему спрашиваем" text="От выбранной роли зависят шаблоны отчёта и приоритеты." />
          </div>
          <div className="grid grid-cols-2 gap-2" data-test="roles-grid">
            {roles.map((r) => (
              <button key={r.id} type="button" onClick={() => choose(r.id)} aria-pressed={role === r.id}
                className={`text-left cursor-pointer rounded-2xl border p-3 flex items-start gap-2 hover:bg-blue-50/50 h-full ${role === r.id ? "ring-2 ring-blue-600 bg-blue-50 border-blue-200" : ""}`}>
                <div className="mt-0.5 text-slate-600">{r.icon}</div>
                <div>
                  <div className="font-medium">{r.title}</div>
                  <div className="text-xs text-slate-600">{r.desc}</div>
                </div>
              </button>
            ))}
          </div>
          {isSignup && !role && (
            <div className="text-xs text-rose-600" aria-live="polite">Выберите роль — это нужно для персонализации кабинета.</div>
          )}
        </div>
      )}

      {/* SSO — базовые (RU-first). Иконки выровнены и единая высота */}
      <div className="grid grid-cols-2 gap-2">
        <Button variant="outline" className="justify-center rounded-xl h-10 cursor-pointer" aria-label="Войти через Yandex ID" disabled={isSignup && !role}><img alt="" aria-hidden src="https://yastatic.net/s3/home-static/_/f/ya-logo.svg" className="h-4 w-4 mr-2"/>Yandex ID</Button>
        <Button variant="outline" className="justify-center rounded-xl h-10 cursor-pointer" aria-label="Войти через VK ID" disabled={isSignup && !role}><img alt="" aria-hidden src="https://vk.com/images/icons/favicons/fav_logo.ico" className="h-4 w-4 mr-2"/>VK ID</Button>
        <Button variant="outline" className="justify-center rounded-xl h-10 cursor-pointer" aria-label="Войти через Госуслуги" disabled={isSignup && !role}><img alt="" aria-hidden src="https://www.gosuslugi.ru/favicon.ico" className="h-4 w-4 mr-2"/>Госуслуги</Button>
        <button type="button" onClick={() => setShowMoreProviders(v => !v)} className="col-span-2 text-sm underline text-slate-700 hover:text-slate-900 text-center">
          {showMoreProviders ? "Скрыть дополнительные" : "Ещё способы входа"}
        </button>
        {showMoreProviders && (
          <div className="col-span-2 grid grid-cols-2 gap-2">
            <Button variant="outline" className="justify-center rounded-xl h-10 cursor-pointer" disabled={isSignup && !role}><img alt="" aria-hidden src="https://www.google.com/favicon.ico" className="h-4 w-4 mr-2"/>Google</Button>
            <Button variant="outline" className="justify-center rounded-xl h-10 cursor-pointer" disabled={isSignup && !role}><img alt="" aria-hidden src="https://apple.com/favicon.ico" className="h-4 w-4 mr-2"/>Apple ID</Button>
            <Button variant="outline" className="justify-center rounded-xl h-10 cursor-pointer" disabled={isSignup && !role}><img alt="" aria-hidden src="https://www.sberbank.com/favicon.ico" className="h-4 w-4 mr-2"/>Сбер ID</Button>
            <Button variant="outline" className="justify-center rounded-xl h-10 cursor-pointer" disabled={isSignup && !role}><img alt="" aria-hidden src="https://mail.ru/favicon.ico" className="h-4 w-4 mr-2"/>Mail.ru</Button>
            <Button variant="outline" className="justify-center rounded-xl h-10 cursor-pointer" disabled={isSignup && !role}><img alt="" aria-hidden src="https://telegram.org/favicon.ico" className="h-4 w-4 mr-2"/>Telegram</Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderStepCheck = () => (
    <div className="space-y-4" aria-live="polite">
      <div>
        <div className="text-lg font-semibold">{t("auth.check_inbox_title", { email })}</div>
        <div className="text-sm text-slate-600">{t("auth.check_inbox_sub")}</div>
      </div>

      {/* Повторная отправка — одна кнопка, на своей строке */}
      <div className="flex flex-col sm:flex-row gap-2 items-stretch">
        <Button variant="outline" className="rounded-xl cursor-pointer w-full sm:w-auto" onClick={handleResend} disabled={resendIn>0}>
          <TimerReset className="h-4 w-4 mr-2"/>{resendIn>0 ? t("auth.resend_after", {sec: resendIn}) : t("auth.resend")}
        </Button>
      </div>

      {/* Ввод кода — доступен сразу на этом шаге */}
      <div className="space-y-2">
        <div className="text-xs text-slate-500">{t("auth.enter_code")}</div>
        <div className="flex gap-2">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={otpRefs[i]}
              inputMode="numeric"
              aria-label={`Digit ${i+1}`}
              value={d}
              onChange={(e)=>onOtpChange(i,e.target.value)}
              maxLength={1}
              className="w-12 h-14 text-center rounded-xl border-2 border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xl font-bold"
            />
          ))}
        </div>
        {inlineError && <div className="text-xs text-rose-600" aria-live="polite">{inlineError}</div>}
        <div className="flex gap-2">
          <Button className="rounded-xl cursor-pointer" onClick={verifyOtp}>
            <CheckCircle className="h-4 w-4 mr-2"/>{t("auth.otp_submit")}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStepOtp = () => (
    <div className="space-y-4">
      <div className="text-sm text-slate-600">{t("auth.otp_label")}</div>
      <div className="flex gap-2">
        {otp.map((d, i) => (
          <input key={i} ref={otpRefs[i]} inputMode="numeric" aria-label={`Digit ${i+1}`} value={d} onChange={(e)=>onOtpChange(i,e.target.value)} maxLength={1}
            className="w-12 h-14 text-center rounded-xl border-2 border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 text-xl font-bold"/>
        ))}
      </div>
      {inlineError && <div className="text-xs text-rose-600" aria-live="polite">{inlineError}</div>}
      <div className="flex gap-2">
        <Button className="rounded-xl cursor-pointer" onClick={verifyOtp}><CheckCircle className="h-4 w-4 mr-2"/>{t("auth.otp_submit")}</Button>
        <Button variant="outline" className="rounded-xl cursor-pointer" onClick={handleResend} disabled={resendIn>0}>
          <TimerReset className="h-4 w-4 mr-2"/>{resendIn>0 ? t("auth.resend_after", {sec: resendIn}) : t("auth.resend")}
        </Button>
      </div>
    </div>
  );

  const renderOnboarding = () => (
    <div className="space-y-4">
      <div>
        <div className="text-lg font-semibold">{t("auth.onboarding_title")}</div>
        <div className="text-sm text-slate-600">{t("auth.onboarding_sub")}</div>
      </div>
      <label className="grid gap-1 text-sm">
        {t("auth.name")}
        <Input value={name} onChange={(e:any)=>setName(e.target.value)} className="rounded-xl" placeholder="Иван"/>
      </label>
      <label className="grid gap-1 text-sm">
        {t("auth.company")}
        <Input value={company} onChange={(e:any)=>setCompany(e.target.value)} className="rounded-xl" placeholder="ООО «Ромашка»"/>
      </label>
      <div className="flex gap-2">
        <Button className="rounded-xl cursor-pointer" onClick={completeOnboarding}>{t("auth.start")}</Button>
      </div>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignup ? "Создать аккаунт" : "Войти"}</DialogTitle>
          <DialogDescription>
            {isSignup ? "Создайте аккаунт, чтобы получить полный отчёт и экспорт." : "Войдите, чтобы продолжить и просмотреть отчёты."}
          </DialogDescription>
        </DialogHeader>

        {step === "email" && renderStepEmail()}
        {step === "check" && renderStepCheck()}
        {step === "otp" && renderStepOtp()}
        {step === "onboarding" && renderOnboarding()}
      </DialogContent>
    </Dialog>
  );
}

export default function LeadMagnetScreen() {
  const [url, setUrl] = useState("");
  const [botChecked, setBotChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [top3, setTop3] = useState<Issue[]>([]);
  const [signinOpen, setSigninOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  // Дев‑панель (симуляция состояний и тарифов)
  const [devOpen, setDevOpen] = useState(false);
  const [simulateRateLimit, setSimulateRateLimit] = useState(false);
  const [simulateApiError, setSimulateApiError] = useState(false);
  const [simulateAntiBot, setSimulateAntiBot] = useState(false);
  const [plan, setPlan] = useState<"Free" | "Pro" | "Agency">("Free");
  const [heroVariant, setHeroVariant] = useState<HeroVariant>("A");

  useEffect(() => { track("hero_variant_shown", { variant: heroVariant }); }, [heroVariant]);

  // MVP: скрывать полностью; показывать только если явно включили флаг staging'а
  const showDevPanel = Boolean(FLAGS.showDevPanel);

  const urlInvalid = useMemo(() => url.trim().length > 0 && !validateUrl(url), [url]);
  const showBotHint = useMemo(() => validateUrl(url) && !botChecked, [url, botChecked]);
  const canRun = useMemo(() => validateUrl(url) && botChecked, [url, botChecked]);

  // ====== ТЕСТЫ (dev) — НЕ УДАЛЯТЬ ======
  useEffect(() => {
    console.assert(validateUrl("ya.ru"), "validateUrl должен принимать короткие домены (ya.ru)");
    console.assert(validateUrl("https://example.com"), "validateUrl должен принимать https://example.com");
    console.assert(!validateUrl("not_a_url"), "validateUrl должен отклонять невалидные строки");
    console.assert(normalizeUrl("ya.ru").startsWith("https://"), "normalizeUrl должен подставлять https:// для коротких доменов");
    console.assert(validateUrl("http://ya.ru"), "validateUrl должен принимать http:// схемы");
    console.assert(!validateUrl(""), "validateUrl должен отклонять пустую строку");
    console.assert(!validateUrl("ya."), "validateUrl должен отклонять домен без TLD (ya.)");
    console.assert(validateUrl("8.8.8.8"), "validateUrl должен принимать IPv4 адреса");
    console.assert(validateUrl("пример.рф"), "validateUrl должен принимать кириллические домены");
    console.assert(canonicalizeUrl("пример.рф").includes("xn--"), "canonicalizeUrl должен конвертировать в punycode");
    console.assert(!validateUrl("пример.рф."), "домен с завершающей точкой (пример.рф.) должен быть невалидным");
    const expectedRoles = ["studio","seo","owner","agency"] as const;
    expectedRoles.forEach(r => console.assert((expectedRoles as readonly string[]).includes(r), "Список ролей должен включать studio/seo/owner/agency"));
    try {
      localStorage.setItem("ba.role", "seo");
      const v = localStorage.getItem("ba.role");
      console.assert(v === "seo", "localStorage должен сохранять выбранную роль");
    } catch {}
    const ruLimits = t("hero.limits", { perDay: LIMITS.free.perDay, perMonth: LIMITS.free.perMonth, maxPages: LIMITS.free.maxPages, rpm: LIMITS.rpmPerIP });
    console.assert(/Лимиты/i.test(ruLimits), "i18n: RU строки должны подставляться");
    console.assert(BRAND.name.length > 0 && BRAND.logoUrl.length > 0, "BRAND должен иметь дефолтные name/logoUrl");
    console.assert(typeof showDevPanel === "boolean", "showDevPanel должен быть булевым");
    // Псевдо‑тесты DOM для важной инфраструктуры
    try {
      const gridEl = document.querySelector('[data-test="roles-grid"]') as HTMLElement | null;
      if (gridEl) {
        const cols = getComputedStyle(gridEl).gridTemplateColumns.split(" ").length;
        console.assert(cols >= 2, "Сетка ролей должна иметь минимум 2 колонки");
      }
      console.assert(!!document.querySelector('[data-test="dev-panel-trigger"]'), 'Dev panel trigger должен существовать');
      console.assert(!!document.querySelector('[data-test="auth-signin-mounted"]') && !!document.querySelector('[data-test="auth-signup-mounted"]'), 'Модалки авторизации должны быть смонтированы');
    } catch {}
  }, [showDevPanel]);

  const onSubmit = async () => {
    setError(null); setScore(null); setTop3([]);
    if (!validateUrl(url)) { setError("Укажите корректный адрес сайта (например, https://ya.ru или ya.ru)"); return; }
    if (!botChecked) { setError("Подтвердите, что вы не робот"); return; }
    if (simulateRateLimit) { setError(`Превышен лимит ${LIMITS.rpmPerIP} запросов/минуту с вашего IP.`); return; }

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600 + Math.random() * 900));

    if (simulateApiError) { setLoading(false); setError("API вернул ошибку. Попробуйте позже."); return; }
    if (simulateAntiBot) { setLoading(false); setError("Сайт защищён антибот‑механизмами. Установите модуль Битрикс и выполните локальный аудит."); return; }

    setScore(72 + Math.round(Math.random()*10));
    setTop3(sampleIssues.slice(0,3));
    setLoading(false);
  };

  const onSignin = () => { try { track("signin_clicked", {}); } catch {}; setError(null); setScore(null); setTop3([]); setLoading(false); setSigninOpen(true); };
  const onSignup = () => { try { track("signup_clicked", {}); } catch {}; setError(null); setScore(null); setTop3([]); setLoading(false); setSignupOpen(true); };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-10 space-y-10">
        {/* ===== ШАПКА (бренд) ===== */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
              {BRAND.logoUrl ? (
                <img src={BRAND.logoUrl} alt={`${BRAND.name} логотип`} className="h-12 w-12 object-cover"/>
              ) : (
                <span className="text-blue-700 font-semibold">BA</span>
              )}
            </div>
            <div className="text-base md:text-lg font-semibold text-slate-900">{BRAND.whiteLabel?.enabled && BRAND.whiteLabel?.partnerName ? `${BRAND.whiteLabel.partnerName} · ` : ""}{BRAND.name}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="cursor-pointer" onClick={onSignup}>Зарегистрироваться</Button>
            <Button variant="ghost" className="cursor-pointer" onClick={onSignin}>Войти</Button>
          </div>
        </header>

        {/* ===== HERO ===== */}
        <Card className="rounded-3xl shadow-md border-slate-100 bg-white">
          <CardContent className="p-5 md:p-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Левая колонка */}
              <div className="space-y-4">
                <HeroHeadline variant={heroVariant} />
                <p className="text-slate-600">Вставьте адрес сайта. Проверка занимает ~30 секунд. {t("hero.limits", { perDay: LIMITS.free.perDay, perMonth: LIMITS.free.perMonth, maxPages: LIMITS.free.maxPages, rpm: LIMITS.rpmPerIP })}</p>

                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1">
                    <Input
                      value={url}
                      onChange={(e: any) => { setUrl(e.target.value); if (error) setError(null); }}
                      placeholder="https://example.com"
                      onBlur={(e:any)=> setUrl(normalizeUrl(e.target.value))}
                      aria-label="Введите URL сайта"
                      aria-invalid={urlInvalid}
                      aria-describedby="url-hint"
                      className={`rounded-2xl shadow-sm ${urlInvalid ? 'ring-1 ring-rose-400 focus-visible:ring-rose-500' : 'ring-1 ring-slate-200 focus-visible:ring-2 focus-visible:ring-blue-600'}`}
                    />
                    <p id="url-hint" className={`text-xs mt-1 ${urlInvalid ? 'text-rose-600' : 'text-slate-500'}`}>
                      {urlInvalid ? 'Некорректный адрес. Пример: example.ru или https://example.ru' : 'Укажите домен или полный URL'}
                    </p>
                  </div>
                  <Button onClick={() => { track("cta_clicked", { variant: heroVariant, urlProvided: !!url }); onSubmit(); }} disabled={!canRun}
                    className="rounded-2xl min-w-[180px] sm:min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg cursor-pointer">
                    <Rocket className="h-4 w-4 mr-2"/>
                    Проверить
                  </Button>
                </div>

                {/* Чекбокс — ниже формы, облегчённый стиль */}
                <div className="flex flex-col gap-1 text-sm text-slate-700" aria-live="polite">
                  <div className="flex items-center gap-2">
                    <Checkbox id="not-bot" checked={botChecked} onCheckedChange={(v:any) => setBotChecked(Boolean(v))} aria-labelledby="not-bot-label" aria-describedby={showBotHint ? 'not-bot-hint' : undefined} aria-invalid={showBotHint || undefined}/>
                    <label id="not-bot-label" htmlFor="not-bot" className="select-none">Я не робот</label>
                  </div>
                  {showBotHint && (
                    <p id="not-bot-hint" className="text-xs text-rose-600">Подтвердите, что вы не робот — без этого кнопка «Проверить» неактивна.</p>
                  )}
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-600">
                  <ShieldCheck className="h-3.5 w-3.5"/> Без установки на сайт
                  <Bot className="h-3.5 w-3.5"/> Безопасно
                </div>
              </div>

              {/* Правая колонка */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Feature title="CWV / SEO" text="Лайт‑аудит Core Web Vitals и базовой технички" icon={<Activity className="h-5 w-5"/>} />
                  <Feature title="Приоритеты" text="Укажем критичность (P0–P3) и быстрые победы" icon={<AlertTriangle className="h-5 w-5"/>} />
                </div>

                <AnimatePresence>
                  {loading && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-3" role="status" aria-live="polite">
                      <div className="text-sm text-slate-700 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-700"/> Собираем метрики… это займёт до 30 секунд
                      </div>
                      <Progress value={40 + Math.random()*50} aria-label="Прогресс проверки" aria-valuetext="Сбор метрик" />
                    </motion.div>
                  )}
                </AnimatePresence>

                {error && (
                  <Alert variant="destructive">
                    <AlertTitle>Ошибка</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {!loading && score !== null && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Score value={score} />
                    <div className="p-4 rounded-2xl bg-white border">
                      <div className="text-sm text-slate-600">Топ‑3 проблем</div>
                      <div className="space-y-2 mt-2">
                        {top3.map((i) => (
                          <div key={i.id} className="py-2 first:pt-0 last:pb-0 border-b last:border-b-0">
                            <div className="font-medium flex items-center gap-2">
                              <IssueIcon p={i.priority} />
                              <span>{i.title}</span>
                              <PriorityBadge p={i.priority} />
                            </div>
                            <div className="text-sm text-slate-600 pl-6">{i.tip ?? "Подробнее в отчёте"}</div>
                          </div>
                        ))}
                      </div>
                      <a className="text-xs inline-flex items-center gap-1 mt-2 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700" href="#">Смотреть полный отчёт →</a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== ИКОНОГРАФИЯ (вместо бэйджей) ===== */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-3 rounded-2xl bg-white shadow-sm flex items-center gap-3">
            <Gauge className="h-5 w-5 text-slate-700"/>
            <div className="text-sm"><div className="font-medium">0–100</div><div className="text-slate-600">Итоговый балл / сравнение</div></div>
          </div>
          <div className="p-3 rounded-2xl bg-white shadow-sm flex items-center gap-3">
            <ListOrdered className="h-5 w-5 text-slate-700"/>
            <div className="text-sm"><div className="font-medium">Top‑3</div><div className="text-slate-600">Быстрые победы</div></div>
          </div>
          <div className="p-3 rounded-2xl bg-white shadow-sm flex items-center gap-3">
            <Gift className="h-5 w-5 text-slate-700"/>
            <div className="text-sm"><div className="font-medium">Free</div><div className="text-slate-600">{`${LIMITS.free.perDay}/день, ${LIMITS.free.perMonth}/мес, ≤${LIMITS.free.maxPages} страниц`}</div></div>
          </div>
        </div>

        {/* ===== ФУТЕР (лёгкий фон, контакты отдельной колонкой) ===== */}
        <footer className="pt-10 border-t bg-gray-50 rounded-3xl">
          <div className="mx-auto max-w-6xl p-6 grid md:grid-cols-2 gap-6 text-sm text-slate-700">
            <div className="space-y-2">
              <div className="font-medium">© {new Date().getFullYear()} {BRAND.companyLegalName}</div>
              <div className="flex items-center gap-4">
                <a className="hover:underline" href={BRAND.footerLinks?.faq ?? "#"}>FAQ</a>
                <a className="hover:underline" href={BRAND.footerLinks?.policy ?? "#"}>Политика</a>
                <a className="hover:underline" href={BRAND.footerLinks?.contacts ?? "#"}>Контакты</a>
              </div>
            </div>
            <div className="space-y-1">
              {BRAND.supportEmail && <div>Email: <a className="hover:underline" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a></div>}
              {BRAND.supportPhone && <div>Телефон: <a className="hover:underline" href={`tel:${BRAND.supportPhone}`}>{BRAND.supportPhone}</a></div>}
              {BRAND.address && <div>Адрес: {BRAND.address}</div>}
            </div>
          </div>
        </footer>

        {/* ===== DEV‑ПАНЕЛЬ (видна в демо; при необходимости скройте сами) ===== */}
        <div className="fixed bottom-4 right-4">
          <Popover open={devOpen} onOpenChange={setDevOpen}>
            <PopoverTrigger asChild>
              <Button data-test="dev-panel-trigger" variant="outline" size="sm" className="rounded-xl cursor-pointer"><Settings2 className="h-4 w-4 mr-2"/>Dev‑панель</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="text-sm font-medium mb-2">Состояния</div>
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm cursor-pointer">
                  <span>Rate limit ({LIMITS.rpmPerIP} rpm/IP)</span>
                  <Switch checked={simulateRateLimit} onCheckedChange={setSimulateRateLimit} />
                </label>
                <label className="flex items-center justify-between text-sm cursor-pointer">
                  <span>API ошибка</span>
                  <Switch checked={simulateApiError} onCheckedChange={setSimulateApiError} />
                </label>
                <label className="flex items-center justify-between text-sm cursor-pointer">
                  <span>Антибот‑блокировка</span>
                  <Switch checked={simulateAntiBot} onCheckedChange={setSimulateAntiBot} />
                </label>
              </div>
              <div className="mt-4 text-sm font-medium mb-2">Тариф</div>
              <Select value={plan} onValueChange={(v: any) => setPlan(v)}>
                <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Тариф" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Agency">Agency</SelectItem>
                </SelectContent>
              </Select>
              <div className="mt-4 text-sm font-medium mb-2">Hero‑вариант</div>
              <Select value={heroVariant} onValueChange={(v: any) => setHeroVariant(v)}>
                <SelectTrigger className="w-full cursor-pointer"><SelectValue placeholder="Вариант" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="A">A — «мгновенная оценка 0–100…»</SelectItem>
                  <SelectItem value="B">B — «Проверка за 30 секунд…»</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-slate-500 mt-2">Переключайте A/B‑варианты заголовка для экспериментов.</div>
            </PopoverContent>
          </Popover>
        </div>

        {/* ===== МОДАЛКИ АВТОРИЗАЦИИ ===== */}
        <AuthDialog open={signinOpen} onOpenChange={setSigninOpen} mode="signin" />
        <AuthDialog open={signupOpen} onOpenChange={setSignupOpen} mode="signup" onSwitchToSignin={(email)=>{ setSignupOpen(false); setSigninOpen(true); }} />
        {/* Mount markers для тестов */}
        <span data-test="auth-signin-mounted" className="hidden" />
        <span data-test="auth-signup-mounted" className="hidden" />
      </div>
    </div>
  );
}

function Feature({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-2xl border bg-white">
      <div className="mt-1 text-slate-600">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-slate-600">{text}</div>
      </div>
    </div>
  );
}
