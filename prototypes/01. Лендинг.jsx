import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ShieldAlert,
  ShieldCheck,
  Rocket,
  Activity,
  Timer,
  Settings2,
  ExternalLink,
  Sparkles,
  Star,
  HelpCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ====== БРЕНД ======
const BRAND = {
  name: "Bitrix Audit",
  logoUrl: "/mnt/data/58ac67d0-48be-4c07-a07c-5e72254fcc20.png", // замените на CDN/публичный URL при внедрении
};

// ====== УТИЛЫ ======
const normalizeUrl = (raw: string) => {
  let s = raw.trim();
  if (!/^https?:\/\//i.test(s)) s = `https://${s}`; // поддержка коротких адресов: ya.ru, kachestvozhizni.ru
  return s;
};

const validateUrl = (raw: string) => {
  try {
    const s = normalizeUrl(raw);
    const u = new URL(s);
    return !!u.hostname && u.hostname.includes(".");
  } catch {
    return false;
  }
};

function Score({ value }: { value: number }) {
  return (
    <div className="p-4 rounded-xl bg-white/80 border">
      <div className="text-sm text-slate-600">Итоговый балл</div>
      <div className="flex items-baseline gap-2">
        <div className="text-4xl font-bold text-blue-700">{value}</div>
        <div className="text-slate-500">/100</div>
      </div>
      <Progress value={value} className="mt-3" aria-label="Общий балл" />
      <div className="mt-2 text-xs text-slate-500">Скоринг по методике «100 − Σ(штрафов)».</div>
    </div>
  );
}

// ====== ТИПЫ ======
 type Priority = "P0" | "P1" | "P2" | "P3";
 interface Issue { id: string; title: string; priority: Priority; }

const sampleIssues: Issue[] = [
  { id: "1", title: "Core Web Vitals: CLS выше 0.25", priority: "P0" },
  { id: "2", title: "Нет H1 на нескольких страницах", priority: "P1" },
  { id: "3", title: "Контраст текста ниже 4.5:1", priority: "P1" },
  { id: "4", title: "Отсутствуют alt у изображений", priority: "P2" },
];

function PriorityBadge({ p }: { p: Priority }) {
  const map: Record<Priority, string> = {
    P0: "bg-red-600 text-white",
    P1: "bg-red-500/90 text-white",
    P2: "bg-rose-300 text-black",
    P3: "bg-slate-300 text-black",
  };
  return <Badge className={`${map[p]} font-medium`}>{p}</Badge>;
}

function Eyebrow() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs">
      <Badge className="bg-blue-600 text-white">Бесплатно</Badge>
      <span className="text-slate-600">Без установки и доступа к CMS</span>
    </div>
  );
}

function InfoHint({ title, text }: { title: string; text: string }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button aria-label={`Подробнее: ${title}`} className="inline-flex items-center justify-center h-5 w-5 rounded-full border text-slate-600 hover:bg-slate-50">
          <HelpCircle className="h-3.5 w-3.5" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 text-sm">
        <div className="font-medium mb-1">{title}</div>
        <div className="text-slate-600">{text}</div>
      </PopoverContent>
    </Popover>
  );
}

function TrustBar() {
  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600">
      <div className="inline-flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-blue-700"/> AES‑256 • Данные под защитой
        <InfoHint title="AES‑256" text="Шифрование на стороне клиента и сервера. Ключи не храним. Экспорт передаётся по presigned‑URL c TTL."/>
      </div>
      <div className="inline-flex items-center gap-2">
        <Star className="h-4 w-4 text-blue-700"/> WCAG 2.1 AA
        <InfoHint title="WCAG 2.1 AA" text="Контраст ≥4.5:1, клавиатура, фокус‑кольца, alt‑тексты. План апгрейда до 2.2 AA в R2."/>
      </div>
      <div className="inline-flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-rose-600"/> Приоритеты P0–P3
        <InfoHint title="Приоритизация" text="P0 — критично, далее P1–P3. Методика скоринга: 100 − сумма штрафов. Помогает фокусироваться на важном."/>
      </div>
    </div>
  );
}

function ReportPreview() {
  // Визуал как в ранней версии (скелетоны), но с информативными чипами‑лейблами
  const chips = [
    { label: "Сводка 0–100", tone: "border-blue-600 text-blue-700" },
    { label: "CWV: LCP/INP/CLS", tone: "border-blue-600 text-blue-700" },
    { label: "Техника", tone: "border-slate-400 text-slate-700" },
    { label: "Доступность", tone: "border-slate-400 text-slate-700" },
    { label: "Контент/SEO", tone: "border-slate-400 text-slate-700" },
    { label: "UX", tone: "border-slate-400 text-slate-700" },
    { label: "Backlog P0–P3", tone: "border-rose-600 text-rose-700" },
  ];
  return (
    <div className="relative p-1 rounded-2xl bg-gradient-to-r from-blue-600 to-rose-600">
      <div className="rounded-xl bg-white p-4">
        <div className="text-sm text-slate-600 mb-2">Превью полного отчёта</div>
        {/* Чипы‑легенда (информативность) */}
        <div className="flex flex-wrap gap-2 mb-3">
          {chips.map(c => (
            <span key={c.label} className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border ${c.tone}`}>{c.label}</span>
          ))}
        </div>
        {/* Скелетоны (визуал «как раньше») */}
        <div className="grid gap-2 opacity-85">
          {[1,2,3,4,5].map((n) => (
            <div key={n} className="flex items-center justify-between p-2 rounded-lg border">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-rose-500"/>
                <div className="h-3 w-40 bg-slate-100 rounded"/>
              </div>
              <div className="h-3 w-16 bg-slate-100 rounded"/>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-500">Демо‑данные. Финальный отчёт доступен после регистрации и запуска полного аудита.</div>
      </div>
    </div>
  );
}

function AuthDialog({ open, onOpenChange, mode }: { open: boolean; onOpenChange: (v: boolean) => void; mode: "signin" | "signup" }) {
  const isSignup = mode === "signup";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignup ? "Регистрация" : "Вход"}</DialogTitle>
          <DialogDescription>
            {isSignup ? "Создайте аккаунт, чтобы получить полный отчёт и экспорт." : "Войдите, чтобы продолжить и просмотреть отчёты."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            {/* Соц‑провайдеры 2025 RU */}
            <Button variant="outline" className="justify-center"><img alt="Google" src="https://www.google.com/favicon.ico" className="h-4 w-4 mr-2"/>Google</Button>
            <Button variant="outline" className="justify-center"><img alt="Yandex" src="https://yastatic.net/s3/home-static/_/f/ya-logo.svg" className="h-4 w-4 mr-2"/>Yandex ID</Button>
            <Button variant="outline" className="justify-center"><img alt="VK" src="https://vk.com/images/icons/favicons/fav_logo.ico" className="h-4 w-4 mr-2"/>VK ID</Button>
            <Button variant="outline" className="justify-center"><img alt="Gosuslugi" src="https://www.gosuslugi.ru/favicon.ico" className="h-4 w-4 mr-2"/>Госуслуги</Button>
            <Button variant="outline" className="justify-center"><img alt="Sber ID" src="https://www.sberbank.com/favicon.ico" className="h-4 w-4 mr-2"/>Сбер ID</Button>
            <Button variant="outline" className="justify-center"><img alt="Mail.ru" src="https://mail.ru/favicon.ico" className="h-4 w-4 mr-2"/>Mail.ru</Button>
            <Button variant="outline" className="justify-center"><img alt="Apple" src="https://www.apple.com/favicon.ico" className="h-4 w-4 mr-2"/>Apple ID</Button>
            <Button variant="outline" className="justify-center"><img alt="Telegram" src="https://web.telegram.org/favicon.ico" className="h-4 w-4 mr-2"/>Telegram</Button>
          </div>

          <div className="relative text-center text-xs text-slate-500 my-1">
            <span className="px-2 bg-white">или</span>
          </div>

          <label className="grid gap-1 text-sm">
            E‑mail
            <div className="flex gap-2">
              <Input type="email" placeholder="you@company.ru" aria-label="E‑mail"/>
              <Button>{isSignup ? "Далее" : "Войти"}</Button>
            </div>
          </label>

          <label className="grid gap-1 text-sm">
            Телефон
            <div className="flex gap-2">
              <Input type="tel" placeholder="+7 (___) ___‑__‑__" aria-label="Телефон"/>
              <Button variant="outline">Получить код</Button>
            </div>
          </label>

          <div className="text-xs text-slate-500">
            Нажимая кнопку, вы соглашаетесь с условиями сервиса и политикой обработки персональных данных.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ====== ГЛАВНЫЙ КОМПОНЕНТ ======
export default function LeadMagnetScreen() {
  // Форма
  const [url, setUrl] = useState("");
  const [botChecked, setBotChecked] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Результат
  const [loading, setLoading] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  const [top3, setTop3] = useState<Issue[]>([]);

  // Дев‑панель (симуляция состояний и тарифов)
  const [devOpen, setDevOpen] = useState(false);
  const [simulateRateLimit, setSimulateRateLimit] = useState(false);
  const [simulateApiError, setSimulateApiError] = useState(false);
  const [simulateAntiBot, setSimulateAntiBot] = useState(false);
  const [plan, setPlan] = useState<"Free" | "Pro" | "Agency">("Free");

  // Модальные окна
  const [signinOpen, setSigninOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  const canRun = useMemo(() => url.trim().length > 0 && botChecked, [url, botChecked]);

  const onSubmit = async () => {
    setError(null);
    setScore(null);
    setTop3([]);

    if (!validateUrl(url)) {
      setError("Укажите корректный адрес сайта (например, https://ya.ru или ya.ru)");
      return;
    }
    if (!botChecked) {
      setError("Подтвердите, что вы не робот");
      return;
    }
    if (simulateRateLimit) {
      setError("Превышен лимит 30 запросов/минуту с вашего IP. Попробуйте позже или зарегистрируйтесь.");
      return;
    }
    if (simulateAntiBot) {
      setError("Сайт защищён антибот‑механизмами. Установите модуль Битрикс и выполните локальный аудит.");
      return;
    }

    setLoading(true);

    // Симуляция ответа API PSI (~1.5–2.5 c)
    await new Promise((r) => setTimeout(r, 1600 + Math.random() * 900));

    if (simulateApiError) {
      setLoading(false);
      setError("API временно недоступно. Попробуйте позже.");
      return;
    }

    // Генерация результата
    const s = 64 + Math.round(Math.random() * 28); // 64..92
    const issues = [...sampleIssues]
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    setScore(s);
    setTop3(issues);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-rose-50">
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-10 space-y-8">
        {/* ===== ШАПКА (бренд Bitrix Audit) ===== */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden">
              {BRAND.logoUrl ? (
                <img src={BRAND.logoUrl} alt={`${BRAND.name} логотип`} className="h-9 w-9 object-cover"/>
              ) : (
                <span className="text-white font-semibold">BA</span>
              )}
            </div>
            <div className="text-base font-semibold text-slate-800">{BRAND.name}</div>
          </div>
          <nav className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-slate-700"><a href="/pricing">Цены</a></Button>
            <Button variant="ghost" size="sm" className="text-slate-700" onClick={() => setSigninOpen(true)}>Вход</Button>
            <Button size="sm" className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setSignupOpen(true)}>Зарегистрироваться</Button>
          </nav>
        </header>

        {/* ===== HERO ===== */}
        <section className="grid gap-8 md:grid-cols-12 items-start">
          <div className="md:col-span-7 space-y-5">
            <Eyebrow />
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">
              {BRAND.name}: мгновенная оценка <span className="text-blue-700">0–100</span> и топ‑3 проблем — <span className="text-rose-600">бесплатно</span>
            </h1>
            <p className="text-slate-600">Вставьте адрес сайта. Проверка занимает ~30 секунд. Лимиты: 30 req/min/IP.</p>

            <Card className="rounded-2xl shadow-lg border-blue-100/60">
              <CardContent className="p-4 md:p-6 space-y-4">
                <div className="flex flex-col gap-3 md:flex-row">
                  <div className="flex-1">
                    <label htmlFor="url" className="sr-only">URL сайта</label>
                    <Input
                      id="url"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      placeholder="https://example.com или example.com"
                      aria-label="Введите URL сайта"
                      className="focus-visible:ring-blue-600"
                    />
                  </div>
                  <Button onClick={onSubmit} disabled={!canRun || loading} className="md:w-[200px] bg-blue-600 hover:bg-blue-700 text-white">
                    <Rocket className="h-4 w-4 mr-2"/>
                    Проверить
                  </Button>
                </div>

                <label className="flex items-center gap-2 text-sm text-slate-700">
                  <Checkbox checked={botChecked} onCheckedChange={(v) => setBotChecked(Boolean(v))} aria-label="Я не робот" />
                  Я не робот (reCAPTCHA)
                </label>

                {error && (
                  <Alert variant="destructive" className="rounded-xl border-red-200">
                    <ShieldAlert className="h-4 w-4" />
                    <AlertTitle>Не получилось</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <AnimatePresence>
                  {loading && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="space-y-3">
                      <div className="text-sm text-slate-700 flex items-center gap-2">
                        <Activity className="h-4 w-4 text-blue-700"/> Собираем метрики… это займёт до 30 секунд
                      </div>
                      <Progress value={40 + Math.random()*50} />
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant="outline" className="border-blue-600 text-blue-700">Без регистрации для быстрой оценки</Badge>
                  <Badge variant="outline" className="border-rose-600 text-rose-700">Не требуется доступ к CMS</Badge>
                  <Badge variant="outline" className="border-slate-400 text-slate-700">Free‑лимит: 1/день, 3/мес, ≤100 страниц</Badge>
                </div>

              </CardContent>
            </Card>

            <TrustBar />
          </div>

          <aside className="md:col-span-5 space-y-4">
            <ReportPreview />
            {(score !== null) && (
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Результат проверки</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Score value={score!} />
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white" asChild>
                    <a href="/signup">Сделать полный аудит</a>
                  </Button>
                  <div className="text-xs text-slate-600">Полный отчёт содержит детальный список проблем и рекомендации.
                  </div>
                </CardContent>
              </Card>
            )}
          </aside>
        </section>

        {/* ===== ТОП‑3 ПРОБЛЕМ ===== */}
        {(score !== null) && (
          <section className="grid gap-6 md:grid-cols-12">
            <div className="md:col-span-12">
              <Card className="rounded-2xl shadow-sm">
                <CardHeader>
                  <CardTitle className="text-base">Топ‑3 проблемы</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {top3.map((i) => (
                    <div key={i.id} className="flex items-start justify-between gap-3 p-3 rounded-xl border bg-white">
                      <div>
                        <div className="font-medium flex items-center gap-2">
                          {i.title}
                          <PriorityBadge p={i.priority} />
                        </div>
                        <div className="text-sm text-slate-600">Короткая рекомендация доступна в полном отчёте.</div>
                      </div>
                      <a className="text-xs inline-flex items-center gap-1 px-2 py-1 rounded-md bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700" href="/signup">
                        Подробнее в отчёте <ExternalLink className="h-3.5 w-3.5"/>
                      </a>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* ===== ДЕВ‑ПАНЕЛЬ ===== */}
        <div className="fixed bottom-4 right-4">
          <Popover open={devOpen} onOpenChange={setDevOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-2xl"><Settings2 className="h-4 w-4 mr-2"/>Dev-панель</Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="text-sm font-medium mb-2">Состояния</div>
              <div className="space-y-2">
                <label className="flex items-center justify-between text-sm">
                  <span>Rate limit (30 rpm/IP)</span>
                  <Switch checked={simulateRateLimit} onCheckedChange={setSimulateRateLimit} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>API ошибка</span>
                  <Switch checked={simulateApiError} onCheckedChange={setSimulateApiError} />
                </label>
                <label className="flex items-center justify-between text-sm">
                  <span>Антибот‑блокировка</span>
                  <Switch checked={simulateAntiBot} onCheckedChange={setSimulateAntiBot} />
                </label>
              </div>
              <div className="mt-4 text-sm font-medium mb-2">Тариф</div>
              <Select value={plan} onValueChange={(v: any) => setPlan(v)}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Тариф" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Free">Free</SelectItem>
                  <SelectItem value="Pro">Pro</SelectItem>
                  <SelectItem value="Agency">Agency</SelectItem>
                </SelectContent>
              </Select>
              <div className="text-xs text-slate-500 mt-2">На главной тариф влияет подсказки и CTA. Экспорт доступен после регистрации.</div>
            </PopoverContent>
          </Popover>
        </div>

        {/* ===== МОДАЛКИ АВТОРИЗАЦИИ ===== */}
        <AuthDialog open={signinOpen} onOpenChange={setSigninOpen} mode="signin" />
        <AuthDialog open={signupOpen} onOpenChange={setSignupOpen} mode="signup" />

        {/* ===== ФУТЕР ===== */}
        <footer className="pt-10 border-t">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-sm text-slate-600">
            <div>© {new Date().getFullYear()} ООО «Качество жизни»</div>
            <div className="flex items-center gap-4">
              <a className="hover:underline" href="#">FAQ</a>
              <a className="hover:underline" href="#">Политика</a>
              <a className="hover:underline" href="#">Контакты</a>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}

function Feature({ title, text, icon }: { title: string; text: string; icon: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border bg-white">
      <div className="mt-1 text-slate-600">{icon}</div>
      <div>
        <div className="font-medium">{title}</div>
        <div className="text-sm text-slate-600">{text}</div>
      </div>
    </div>
  );
}
