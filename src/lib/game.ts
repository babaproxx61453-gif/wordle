
// Turkish Wordle-like helpers
export const WORD_LEN = 5; // sadece geriye dönük uyumluluk / varsayılan değer için
export const MAX_GUESSES = 5;

// Turkish alphabet (uppercase)
export const TR_LETTERS = "ABCÇDEFGĞHIİJKLMNOÖPRSŞTUÜVYZ".split("");

export type LetterResult = "correct" | "present" | "absent";
export type WordLength = 5 | 6 | 7;

// Uppercase using Turkish locale so i -> İ and ı -> I.
export function trUpper(s: string): string {
  return s.toLocaleUpperCase("tr-TR");
}
export function trLower(s: string): string {
  return s.toLocaleLowerCase("tr-TR");
}

// Split a Turkish string into single visible letters (code point based).
// Not: Türkçe harflerin tamamı (Ç, Ğ, İ, I, Ö, Ş, Ü) tek bir Unicode code point
// olduğundan basit spread yeterli ve platformdan bağımsızdır (Intl.Collator'a
// ihtiyaç yok — Cloudflare Workers gibi kısıtlı ICU ortamlarında farklı
// davranabilecek bir bağımlılığı ortadan kaldırır).
export function letters(word: string): string[] {
  return [...trUpper(word)];
}

// Basic shape check: N Turkish letters (varsayılan 5). Does NOT verify the word exists.
export function isValidWord(w: string, expectedLen: number = WORD_LEN): boolean {
  const ls = letters(w);
  if (ls.length !== expectedLen) return false;
  return ls.every((ch) => TR_LETTERS.includes(ch));
}

// Dictionary check: word must exist in the Turkish word list for the given length.
// Şu an sadece 5 harfli sözlük mevcut; 6/7 harfli modlar solo-words.ts'teki
// sabit kelime havuzunu kullanıyor, bu yüzden bu fonksiyon opsiyonel kalıyor.
export async function isTurkishWord(w: string, expectedLen: number = 5): Promise<boolean> {
  if (!isValidWord(w, expectedLen)) return false;
  if (expectedLen !== 5) return true; // 6/7 harf için ayrı sözlük yok, şekil kontrolü yeterli
  const { TR_WORDS_5 } = await import("./tr-words");
  return TR_WORDS_5.has(trUpper(w));
}

// Wordle evaluation with dynamic length handling (5, 6 veya 7 harf — target'ın
// uzunluğuna göre otomatik ayarlanır). Bu, uygulamadaki TEK doğrulama fonksiyonu
// olmalı; solo.tsx dahil her yer bunu çağırmalı ki mantık iki yerde ayrışıp
// senkronizasyon bozulmasın.
export function evaluateGuess(guess: string, target: string): LetterResult[] {
  const g = letters(guess);
  const t = letters(target);
  const len = t.length; // 5, 6 veya 7 — dinamik

  const res: LetterResult[] = new Array(len).fill("absent");
  const remaining: Record<string, number> = {};

  // 1. Aşama: Tam eşleşen (yeşil) harfler
  for (let i = 0; i < len; i++) {
    if (g[i] === t[i]) {
      res[i] = "correct";
    } else {
      remaining[t[i]] = (remaining[t[i]] ?? 0) + 1;
    }
  }

  // 2. Aşama: Yanlış yerdeki (sarı) harfler
  for (let i = 0; i < len; i++) {
    if (res[i] === "correct") continue;
    const c = g[i];
    if ((remaining[c] ?? 0) > 0) {
      res[i] = "present";
      remaining[c]--;
    }
  }

  return res;
}

export function serializeResult(r: LetterResult[]): string {
  return r.map((x) => (x === "correct" ? "G" : x === "present" ? "Y" : "X")).join("");
}
export function parseResult(s: string): LetterResult[] {
  return [...s].map((c) => (c === "G" ? "correct" : c === "Y" ? "present" : "absent"));
}

export function isAllCorrect(r: LetterResult[]): boolean {
  return r.length > 0 && r.every((x) => x === "correct");
}

export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let out = "";
  for (let i = 0; i < 5; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export function getPlayerId(): string {
  if (typeof window === "undefined") return "";
  const KEY = "wd_player_id";
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}