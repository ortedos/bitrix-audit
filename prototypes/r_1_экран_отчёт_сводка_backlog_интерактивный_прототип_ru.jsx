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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Download,
  FileDown,
  FileText,
  Filter,
  ShieldAlert,
  Search,
  Link as LinkIcon,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";

/*
  Экран отчёта R1.
  Источники требований (комментарии):
  - Value prop в шапке LM и скоринг 0–100 {PO}{BA}
  - Экспорт: PDF — Pro/Agency; CSV — только Agency; presigned-URL TTL 24 ч {BA}{SA}
  - White-label в R1: логотип + контакты (email, phone, site) {PO}{BA}{SA}
  - Категоризация и приоритизация P0–P3; методика «100 − Σ(штрафов)» {BA}{Researcher}
  - Интеграции: PSI сейчас; GSC/Я.Вебмастер — пустые состояния с CTA {PO}{BA}{SA}
  - Доступность R1: WCAG 2.1 AA {SA}
*/

// Типы данных
type Priority = "P0" | "P1" | "P2" | "P3";

type Category = "Тех" | "Контент" | "UX" | "SEO";

interface Issue {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  category: Category;
  impact: number; // 1..10
  howToFix: string;
  links?: { label: string; href: string }[];
}

interface ReportData {
  brand: {
    logoUrl?: string;
    contacts: { email?: string; phone?: string; site?: string };
  };
  site: string;
  date: string;
  plan: "Free" | "Pro" | "Agency";
  score: number; // 0..100
  kpi: { p0: number; p1: number; p2: number; p3: number };
  integrations: { gscConnected: boolean; yandexConnected: boolean };
  issues: Issue[];
}

const mock: ReportData = {
  brand: {
    contacts: { email: "owner@client.co", phone: "+7 (999) 000-00-00", site: "client.co" },
  },
  site: "https://example-shop.ru",
  date: new Date().toLocaleDateString("ru-RU"),
  plan: "Pro", // измените на "Agency" чтобы увидеть CSV
  score: 78,
  kpi: { p0: 2, p1: 5, p2: 7, p3: 10 },
  integrations: { gscConnected: false, yandexConnected: false },
  issues: [
    {
      id: "1",
      title: "Core Web Vitals: CLS выше 0.25",
      description: "Критический сдвиг макета влияет на UX и SEO.",
      priority: "P0",
      category: "Тех",
      impact: 10,
      howToFix:
        "Зарезервируйте размеры для изображений/баннеров; отложите загрузку не-критических шрифтов; используйте content-visibility.",
      links: [
        { label: "Рекомендации Google", href: "https://web.dev/cls/" },
      ],
    },
    {
      id: "2",
      title: "Нет H1 на нескольких страницах",
      description: "Снижается понятность и SEO-структура.",
      priority: "P1",
      category: "Контент",
      impact: 7,
      howToFix:
        "Добавьте единственный H1 с ключевой темой страницы; избегайте множественных H1.",
      links: [{ label: "HTML Заголовки", href: "https://developer.mozilla.org/docs/Web/HTML/Element/Heading_Elements" }],
    },
    {
      id: "3",
      title: "Контраст текста ниже 4.5:1",
      description: "Проблема доступности, влияет на чтение.",
      priority: "P1",
      category: "UX",
      impact: 6,
      howToFix:
        "Увеличьте контраст до ≥4.5:1 для обычного текста и ≥3:1 для крупных элементов.",
    },
    {
      id: "4",
      title: "Отсутствует alt у изображений товара",
      description: "Доступность и SEO изображе ний ухудшены.",
      priority: "P2",
      category: "Контент",
      impact: 4,
      howToFix: "Добавьте описательные alt-атрибуты с ключевым контентом, без переспама.",
    },
    {
      id: "5",
      title: "Медленная загрузка поисковой страницы",
      description: "Потеря пользователей с intent'ом поиска.",
      priority: "P0",
      category: "Тех",
      impact: 9,
      howToFix: "Используйте SSR/кэш; оптимизируйте запросы; уменьшите JS-бандл.",
    },
    {
      id: "6",
      title: "Дубли title в карточках товара",
      description: "Понижает CTR в выдаче и мешает индексации.",
      priority: "P2",
      category: "SEO",
      impact: 5,
      howToFix: "Генерируйте уникальные title по шаблону: Название — Категория — Бренд.",
    },
    {
      id: "7",
      title: "Неочевидный фокус для клавиатуры",
      description: "Нарушение WCAG 2.1 AA.",
      priority: "P3",
      category: "UX",
      impact: 2,
      howToFix: "Добавьте видимый focus-ring для интерактивных элементов.",
    },
  ],
};

const priorityOrder: Record<Priority, number> = { P0: 0, P1: 1, P2: 2, P3: 3 };

function PriorityBadge({ p }: { p: Priority }) {
  const map: Record<Priority, string> = {
    P0: "bg-red-600 text-white",
    P1: "bg-orange-500 text-white",
    P2: "bg-amber-400 text-black",
    P3: "bg-slate-300 text-black",
  };
  return <Badge className={`${map[p]} font-medium`}>{p}</Badge>;
}

function CategoryBadge({ c }: { c: Category }) {
  const map: Record<Category, string> = {
    "Тех": "border-slate-300",
    "Контент": "border-emerald-300",
    "UX": "border-indigo-300",
    "SEO": "border-cyan-300",
  };
  return <Badge variant="outline" className={`bg-white ${map[c]}`}>{c}</Badge>;
}

function WLHeader({ brand }: ReportData) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">{brand.logoUrl ? <img src={brand.logoUrl} alt="Логотип" className="h-10 w-10 rounded-full object-cover"/> : "WL"}</div>
        <div className="leading-tight">
          <div className="font-semibold">Отчёт по сайту</div>
          <div className="text-sm text-slate-500">{brand.contacts.email} • {brand.contacts.phone} • {brand.contacts.site}</div>
        </div>
      </div>
      <div className="text-right text-sm text-slate-500">
        Дата: {mock.date}
      </div>
    </div>
  );
}

export default function ReportScreen() {
  const [data, setData] = useState<ReportData>(mock);
  const [query, setQuery] = useState("");
  const [selectedPriorities, setSelectedPriorities] = useState<Priority[]>(["P0", "P1", "P2", "P3"]);
  const [categoryTab, setCategoryTab] = useState<Category | "Все">("Все");
  const [sort, setSort] = useState<"priority" | "impact" | "category">("priority");
  const [dense, setDense] = useState(false);

  const filtered = useMemo(() => {
    let items = data.issues.filter((i) => selectedPriorities.includes(i.priority));
    if (categoryTab !== "Все") items = items.filter((i) => i.category === categoryTab);
    if (query.trim()) {
      const q = query.toLowerCase();
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    if (sort === "priority") items.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority] || b.impact - a.impact);
    if (sort === "impact") items.sort((a, b) => b.impact - a.impact || priorityOrder[a.priority] - priorityOrder[b.priority]);
    if (sort === "category") items.sort((a, b) => a.category.localeCompare(b.category) || priorityOrder[a.priority] - priorityOrder[b.priority]);
    return items;
  }, [data, query, selectedPriorities, categoryTab, sort]);

  const canPDF = data.plan === "Pro" || data.plan === "Agency";
  const canCSV = data.plan === "Agency";

  return (
    <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-8 space-y-6">
      {/* White-label шапка (логотип + контакты) {PO}{BA}{SA} */}
      <WLHeader {...data} />

      {/* Сводка */}
      <Card className="shadow-sm rounded-2xl">
        <CardHeader className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-xl">Сводка отчёта</CardTitle>
          <div className="flex items-center gap-2">
            <Select value={data.plan} onValueChange={(v: "Free"|"Pro"|"Agency") => setData({ ...data, plan: v })}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Тариф" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Free">Free</SelectItem>
                <SelectItem value="Pro">Pro</SelectItem>
                <SelectItem value="Agency">Agency</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" disabled={!canPDF} title={canPDF ? "Скачать PDF" : "Доступно на Pro/Agency"}>
              <FileDown className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" size="sm" disabled={!canCSV} title={canCSV ? "Скачать CSV" : "Только для Agency"}>
              <FileText className="mr-2 h-4 w-4" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-12">
          <div className="md:col-span-5 lg:col-span-4 p-4 rounded-xl bg-slate-50">
            <div className="text-sm text-slate-500 mb-1">Итоговый балл</div>
            <div className="flex items-baseline gap-3">
              <div className="text-4xl font-bold">{data.score}</div>
              <div className="text-slate-500">/100</div>
            </div>
            <Progress value={data.score} className="mt-3" aria-label="Общий балл" />
            <div className="mt-4 text-xs text-slate-500">Скоринг по методике «100 − Σ(штрафов)». {"{BA}{Researcher}"}</div>
          </div>
          <div className="md:col-span-7 lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-3">
            <KpiCard label="P0" value={data.kpi.p0} hint="Критичные"/>
            <KpiCard label="P1" value={data.kpi.p1} hint="Высокий"/>
            <KpiCard label="P2" value={data.kpi.p2} hint="Средний"/>
            <KpiCard label="P3" value={data.kpi.p3} hint="Низкий"/>
          </div>
        </CardContent>
      </Card>

      {/* Интеграции: пустое состояние с CTA {PO}{BA}{SA} */}
      {!data.integrations.gscConnected && (
        <Alert className="rounded-2xl">
          <ShieldAlert className="h-4 w-4" />
          <AlertTitle>Интеграции не подключены</AlertTitle>
          <AlertDescription>
            Для показа органического трафика и топ-страниц подключите Google Search Console.
            <Button size="sm" className="ml-2">Подключить GSC</Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Фильтры и поиск */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4"/>Фильтры</Button>
            </PopoverTrigger>
            <PopoverContent className="w-64">
              <div className="text-sm font-medium mb-2">Приоритет</div>
              {(["P0","P1","P2","P3"] as Priority[]).map(p => (
                <label key={p} className="flex items-center gap-2 py-1">
                  <Checkbox
                    checked={selectedPriorities.includes(p)}
                    onCheckedChange={(checked) => {
                      setSelectedPriorities(prev => checked ? [...prev, p] : prev.filter(x => x !== p));
                    }}
                    aria-label={`Фильтр по ${p}`}
                  />
                  <PriorityBadge p={p} />
                </label>
              ))}
              <div className="mt-3 text-sm font-medium mb-2">Компактный режим</div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Сжать строки</span>
                <Switch checked={dense} onCheckedChange={setDense} aria-label="Компактный режим" />
              </div>
            </PopoverContent>
          </Popover>
          <Select value={sort} onValueChange={(v: any) => setSort(v)}>
            <SelectTrigger className="w-[200px]"><SelectValue placeholder="Сортировка" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="priority">По приоритету</SelectItem>
              <SelectItem value="impact">По влиянию</SelectItem>
              <SelectItem value="category">По категории</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-slate-400"/>
          <Input
            placeholder="Поиск по проблемам..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-[260px]"
            aria-label="Поиск по списку проблем"
          />
        </div>
      </div>

      {/* Табуляция по категориям */}
      <Tabs value={categoryTab} onValueChange={(v: any) => setCategoryTab(v)}>
        <TabsList className="grid grid-cols-5 w-full md:w-auto">
          <TabsTrigger value="Все">Все</TabsTrigger>
          <TabsTrigger value="Тех">Тех</TabsTrigger>
          <TabsTrigger value="Контент">Контент</TabsTrigger>
          <TabsTrigger value="UX">UX</TabsTrigger>
          <TabsTrigger value="SEO">SEO</TabsTrigger>
        </TabsList>
        <TabsContent value={categoryTab} className="mt-4">
          <Card className="rounded-2xl shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Backlog (сорт: {sort === "priority" ? "приоритет" : sort === "impact" ? "влияние" : "категория"})</CardTitle>
            </CardHeader>
            <CardContent>
              <IssuesTable items={filtered} dense={dense} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Сноски */}
      <div className="text-xs text-slate-500">
        * Экспорт PDF доступен на Pro/Agency; CSV — только для Agency. Presigned URL, TTL 24 ч. {"{BA}{SA}"}
      </div>
    </div>
  );
}

function KpiCard({ label, value, hint }: { label: string; value: number; hint: string }) {
  return (
    <Card className="rounded-xl">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="rounded-lg">{label}</Badge>
          <div className="text-xs text-slate-500">{hint}</div>
        </div>
        <div className="mt-3 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function IssuesTable({ items, dense }: { items: Issue[]; dense: boolean }) {
  const [openRow, setOpenRow] = useState<string | null>(null);
  const Row = ({ i }: { i: Issue }) => {
    const isOpen = openRow === i.id;
    return (
      <>
        <TableRow className="cursor-pointer" onClick={() => setOpenRow(isOpen ? null : i.id)}>
          <TableCell className="w-[70px]"><PriorityBadge p={i.priority} /></TableCell>
          <TableCell className="min-w-[280px]">
            <div className="font-medium flex items-center gap-2">
              {i.title}
              <CategoryBadge c={i.category} />
            </div>
            {!dense && <div className="text-sm text-slate-500 line-clamp-1">{i.description}</div>}
          </TableCell>
          <TableCell className="w-[120px]">
            <div className="flex items-center gap-2" aria-label="Влияние">
              <AlertCircle className="h-4 w-4"/>
              <span className="font-medium">{i.impact}/10</span>
            </div>
          </TableCell>
          <TableCell className="w-[40px] text-right">
            {isOpen ? <ChevronUp className="h-4 w-4"/> : <ChevronDown className="h-4 w-4"/>}
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell colSpan={4} className="p-0 border-b-0">
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-slate-50"
                >
                  <div className="p-4 grid gap-3 md:grid-cols-12">
                    <div className="md:col-span-7">
                      <div className="text-sm text-slate-500 mb-1">Почему это важно</div>
                      <div className="text-sm">{i.description}</div>
                      <div className="text-sm text-slate-500 mt-3">Как исправить</div>
                      <div className="text-sm">{i.howToFix}</div>
                    </div>
                    <div className="md:col-span-5">
                      <div className="text-sm text-slate-500 mb-1">Ресурсы</div>
                      <div className="flex flex-wrap gap-2">
                        {i.links?.map((l) => (
                          <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="text-sm inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border hover:bg-slate-50">
                            <ExternalLink className="h-3.5 w-3.5"/> {l.label}
                          </a>
                        )) || <span className="text-sm text-slate-400">Нет ссылок</span>}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </TableCell>
        </TableRow>
      </>
    );
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[70px]">Приоритет</TableHead>
            <TableHead>Проблема</TableHead>
            <TableHead className="w-[120px]">Влияние</TableHead>
            <TableHead className="w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((i) => (
            <Row key={i.id} i={i} />
          ))}
          {items.length === 0 && (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-slate-500">Ничего не найдено по заданным фильтрам</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
