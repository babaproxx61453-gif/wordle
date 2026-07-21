// src/lib/lovable-error-reporting.ts (veya dosyanın adı neyse)

export function reportLovableError(error: unknown, context: Record<string, unknown> = {}) {
  // Lovable hata takibi devre dışı bırakıldı.
  // İleride buraya kendi Sentry veya log sistemini kurabilirsin.
  console.error("Uygulama Hatası:", error, context);
}