import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, X, User } from "lucide-react";

// Profil ve diğer sayfaların link listesi
const navItems: Array<{ to: string; label: string }> = [
  { to: "/", label: "Giriş" },
  { to: "/oyunlar", label: "Oyunlar" },
  { to: "/nasil-oynanir", label: "Nasıl Oynanır" },
  { to: "/hakkimizda", label: "Hakkımızda" },
  { to: "/iletisim", label: "İletişim" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        {/* Logo ve Başlık */}
        <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
          <img
            src="/logo.png"
            alt="Kelime Düellosu logosu"
            className="h-7 w-7 sm:h-8 sm:w-8 object-contain drop-shadow"
          />
          <span className="text-sm sm:text-base font-semibold tracking-wide">
            Kelime Düellosu
          </span>
        </Link>

        {/* Masaüstü Menüsü */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-md hover:bg-secondary/50 transition"
              activeOptions={{ exact: true }}
              activeProps={{ className: "text-foreground bg-secondary/60" }}
            >
              {item.label}
            </Link>
          ))}

          {/* YENİ: Profil Butonu */}
          <Link
            to="/profile"
            className="ml-2 px-3 py-1.5 text-sm font-semibold text-primary-foreground bg-primary hover:opacity-90 rounded-lg transition flex items-center gap-1.5 shadow-sm"
            activeProps={{ className: "ring-2 ring-ring" }}
          >
            <User className="h-4 w-4" />
            Profil
          </Link>
        </nav>

        {/* Mobil Hamburger Menü Butonu */}
        <button
          type="button"
          aria-label={open ? "Menüyü kapat" : "Menüyü aç"}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-md border border-border/50 bg-secondary/40 text-foreground hover:bg-secondary/70 transition"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobil Açılır Menü */}
      {open && (
        <div className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur">
          <nav className="mx-auto max-w-6xl px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className="px-3 py-2 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/50 transition"
                activeOptions={{ exact: true }}
                activeProps={{ className: "text-foreground bg-secondary/60" }}
              >
                {item.label}
              </Link>
            ))}

            {/* YENİ: Mobil Profil Linki */}
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="mt-2 px-3 py-2.5 rounded-md text-sm font-bold text-primary-foreground bg-primary hover:opacity-90 transition flex items-center justify-center gap-2"
            >
              <User className="h-4 w-4" />
              Profilim
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}