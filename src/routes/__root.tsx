import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "../components/site-header";
import { SiteFooter } from "../components/site-footer";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      // Başlık: En güçlü hedef kelimelerimizi içeriyor
      { title: "Kelime Düellosu - Sıra Tabanlı Türkçe Wordle Oyunu | Kiral Oyun" },
      // Açıklama: Arama sonuçlarında görünecek, tıklama çekecek metin
      { 
        name: "description", 
        content: "Arkadaşlarınla canlı yarışabileceğin sıra tabanlı Türkçe Wordle oyunu. Kelime Düellosu ile kelime bilgini kanıtla, tek kişilik veya çok oyunculu modda kral oyun deneyimini yaşa!" 
      },
      // Anahtar Kelimeler: Hedeflediğin tüm kelimeleri buraya ekledik
      {
        name: "keywords",
        content: "kelime duellosu, wordle, kiral oyun, kral oyun, türkçe wordle, iki kişilik wordle, online kelime oyunu"
      },
      // Sosyal Medya Paylaşımları (Open Graph)
      { property: "og:title", content: "Kelime Düellosu - Sıra Tabanlı Türkçe Wordle Oyunu | Kiral Oyun" },
      { 
        property: "og:description", 
        content: "Arkadaşlarınla canlı yarışabileceğin sıra tabanlı Türkçe Wordle oyunu. Kelime Düellosu ile kelime bilgini kanıtla, tek kişilik veya çok oyunculu modda kral oyun deneyimini yaşa!" 
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Kelime Düellosu - Sıra Tabanlı Türkçe Wordle Oyunu | Kiral Oyun" },
      { name: "twitter:description", content: "Arkadaşlarınla sıra tabanlı Türkçe kelime düellosu. Bir oda kur, kodu paylaş ve tahmin savaşı başlasın." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/88abefbc-c79a-41f8-b106-508b5b056146/id-preview-8c16a81a--94fb706b-4a51-41a2-b111-1682192fce79.lovable.app-1784386452063.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/88abefbc-c79a-41f8-b106-508b5b056146/id-preview-8c16a81a--94fb706b-4a51-41a2-b111-1682192fce79.lovable.app-1784386452063.png" },
      // Google Search Console Doğrulama Kodu (Bunu aynen koruduk)
      { name: "google-site-verification", content: "EdCzcMeQiIyHKMd6Gv5DXbKovAgplHXEzUQ43Is_vnk" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      // Tarayıcı sekmesindeki gri dünyayı kendi logonla değiştiren satır:
      { rel: "icon", href: "/favicon.png", type: "image/png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700&family=Nunito:wght@400;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col">
        <SiteHeader />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <div className="flex-1">
          <Outlet />
        </div>
        <SiteFooter />
      </div>
    </QueryClientProvider>
  );
}
