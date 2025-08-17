import { useState } from "react";
import { Button } from "@/components/ui/button";

// Единая шапка и подвал для страниц платформы «Bitrix Audit»
// Без import.meta/process.env — конфиг берём из window.__APP_CONFIG__
// RU‑only (MVP) — {PO}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const APP: any = (globalThis as any).__APP_CONFIG__ || {};

export interface Brand {
  name: string;
  logoUrl: string;
  companyLegalName?: string;
  supportEmail?: string;
  supportPhone?: string;
  address?: string;
  footerLinks?: { terms?: string; policy?: string; contacts?: string };
}

export const BRAND: Brand = {
  name: APP?.BRAND?.name ?? "Bitrix Audit",
  logoUrl: APP?.BRAND?.logoUrl ?? "https://cdn.example.com/logo.png",
  companyLegalName: APP?.BRAND?.companyLegalName ?? "ООО «Качество жизни»",
  supportEmail: APP?.BRAND?.supportEmail ?? "support@example.com",
  supportPhone: APP?.BRAND?.supportPhone ?? "",
  address: APP?.BRAND?.address ?? "",
  footerLinks: APP?.BRAND?.footerLinks ?? { terms: "#", policy: "#", contacts: "#" },
};

export type NavItem = { href: string; label: string };
export const NAV: NavItem[] = [
  { href: "/faq", label: "FAQ" },
  { href: "/pricing", label: "Цены" },
  { href: "/audits", label: "Аудиты" },
  { href: "/reports", label: "Отчёты" },
  { href: "/backlog", label: "Бэклог" },
  { href: "/integrations", label: "Интеграции" },
  { href: "/settings", label: "Настройки" },
  { href: "/contacts", label: "Контакты" },
  { href: "/policy", label: "Политика" },
];

export function Header({ onSignin, onSignup }: { onSignin?: () => void; onSignup?: () => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <header className="flex items-center justify-between">
      <a href="/" className="flex items-center gap-4 focus:outline-none focus:ring-2 focus:ring-blue-600 rounded-xl">
        <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
          {BRAND.logoUrl ? (
            <img src={BRAND.logoUrl} alt={`${BRAND.name} логотип`} className="h-12 w-12 object-cover" />
          ) : (
            <span className="text-blue-700 font-semibold">BA</span>
          )}
        </div>
        <div className="text-base md:text-lg font-semibold text-slate-900">{BRAND.name}</div>
      </a>

      {/* Навигация desktop */}
      <nav className="hidden md:flex items-center gap-3" aria-label="Главная навигация">
        {NAV.map((i) => (
          <a key={i.href} href={i.href} className="px-3 py-2 rounded-lg text-sm text-slate-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-600">
            {i.label}
          </a>
        ))}
      </nav>

      {/* Авторизация */}
      <div className="hidden md:flex items-center gap-2">
        <Button variant="ghost" className="cursor-pointer" onClick={onSignup}>Зарегистрироваться</Button>
        <Button variant="ghost" className="cursor-pointer" onClick={onSignin}>Войти</Button>
      </div>

      {/* Mobile toggle */}
      <div className="md:hidden">
        <button
          type="button"
          aria-expanded={menuOpen}
          aria-label="Меню"
          className="px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          onClick={() => setMenuOpen((v) => !v)}
        >
          Меню
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute left-0 right-0 top-[64px] z-40 md:hidden px-4">
          <div className="rounded-2xl border bg-white shadow-xl p-3">
            <nav className="grid gap-1" aria-label="Мобильная навигация">
              {NAV.map((i) => (
                <a key={i.href} href={i.href} className="px-3 py-2 rounded-lg text-sm text-slate-800 hover:bg-blue-50">
                  {i.label}
                </a>
              ))}
            </nav>
            <div className="flex gap-2 mt-2">
              <Button className="flex-1 rounded-xl" variant="outline" onClick={onSignup}>Зарегистрироваться</Button>
              <Button className="flex-1 rounded-xl" onClick={onSignin}>Войти</Button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-12 pt-10 border-t bg-gray-50 rounded-3xl">
      <div className="mx-auto max-w-6xl p-6 grid md:grid-cols-2 gap-6 text-sm text-slate-700">
        <div className="space-y-2">
          <div className="font-medium">© {new Date().getFullYear()} {BRAND.companyLegalName}</div>
          <div className="flex items-center gap-4">
            <a className="hover:underline" href={BRAND.footerLinks?.terms ?? "#"}>Конфиденциальность</a>
            <a className="hover:underline" href={BRAND.footerLinks?.policy ?? "#"}>Политика</a>
            <a className="hover:underline" href={BRAND.footerLinks?.contacts ?? "#"}>Контакты</a>
          </div>
        </div>
        <div className="space-y-1">
          {BRAND.supportEmail && (
            <div>
              Email: <a className="hover:underline" href={`mailto:${BRAND.supportEmail}`}>{BRAND.supportEmail}</a>
            </div>
          )}
          {BRAND.supportPhone && (
            <div>
              Телефон: <a className="hover:underline" href={`tel:${BRAND.supportPhone}`}>{BRAND.supportPhone}</a>
            </div>
          )}
          {BRAND.address && <div>Адрес: {BRAND.address}</div>}
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children, onSignin, onSignup }: { children: React.ReactNode; onSignin?: () => void; onSignup?: () => void }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="mx-auto max-w-6xl p-4 md:p-6 lg:p-10">
        <Header onSignin={onSignin} onSignup={onSignup} />
        <main className="mt-8">{children}</main>
        <Footer />
      </div>
    </div>
  );
}
