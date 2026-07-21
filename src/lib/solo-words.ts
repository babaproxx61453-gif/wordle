// Türkçe kelime havuzu — tekli oyun modu için harf uzunluğu ve zorluk kademeleri.
// Türkçe karakterler tek harf sayılır (Ç, Ğ, İ, I, Ö, Ş, Ü) — hepsi Unicode'da
// zaten tek code point olduğundan basit spread ile doğru sayılır.
//
// 5, 6 ve 7 harfli modların ÜÇÜ de artık kolay/orta/zor zorluk kademesine sahip.
// Tüm listeler Node.js'te harf-uzunluğu ve tekrar (duplicate) kontrolünden
// geçirilerek doğrulandı.

export type Difficulty = "kolay" | "orta" | "zor";
export type WordLength = 5 | 6 | 7;

// Harf bölücü: Türkçe harflerin tamamı önceden birleşik (precomposed) tek
// code point olduğu için basit spread yeterli ve tutarlıdır. Önceki sürümde
// burada Intl.Collator().compare("i","I") sonucuna göre dallanan bir kontrol
// vardı — bu, Cloudflare Workers gibi kısıtlı ICU desteğine sahip runtime'larda
// tarayıcıdan FARKLI sonuç verebilir ve kelime havuzlarının yanlış
// filtrelenmesine yol açabilirdi. Ortamdan bağımsız olması için kaldırıldı.
function getLetters(word: string): string[] {
  return [...word];
}

const RAW_5: Record<Difficulty, string[]> = {
  kolay: [
    "KİTAP", "KALEM", "MASAL", "BALIK", "ÇİÇEK", "ÇOCUK", "KÖPEK", "BAHÇE",
    "TAVUK", "DENİZ", "GÜNEŞ", "ARABA", "SAYFA", "MUTLU", "SEVGİ", "TATLI",
    "PASTA", "ŞEKER", "KAHVE", "ORMAN", "NEHİR", "BULUT", "CEKET", "TABAK",
    "KAŞIK", "ÇATAL", "KOMŞU", "BEBEK", "SİLGİ", "GELİN", "DAMAT", "ELMAS",
    "YEMEK", "KAPAK", "KUMAŞ", "YOLCU", "YAKIN", "BURUN", "ÖRDEK", "BADEM",
    "KADER", "KEDER", "YARIŞ", "ZİRVE", "DUVAR", "ÇANTA", "RADYO", "SEHPA",
    "ASLAN", "TİLKİ", "ŞAHİN", "SİNEK", "ÇAYIR", "IRMAK", "DOLAP",
    "PERDE", "KAĞIT", "LAMBA", "FENER", "KİLİM", "SEPET", "MAKAS",
    "ÇİLEK", "LİMON", "KİRAZ", "VİŞNE", "SOĞAN", "İNSAN", "DÜNYA", "ZAMAN",
    "AKŞAM", "SABAH", "YÜREK", "BEYAZ", "SİYAH", "YEŞİL", "ÇAMUR", "DÜDÜK",
    "TAVAN", "TABAN", "MERAK", "KURAL", "SICAK", "KAÇAK", "KÜREK",
    "SİMİT", "TUZLU", "KAYIK", "BİZİM", "KUZEN", "HIZLI", "YAVAŞ",
  ],
  orta: [
    "DALGA", "FİDAN", "KUZEY", "GÜNEY", "MEZAR", "NAMAZ", "REÇEL", "TASMA",
    "VİTES", "DÖŞEK", "YAKUT", "ZEMİN", "GÜMÜŞ", "TÜNEL", "HAVUZ", "FIRIN",
    "KADEH", "MANTO", "NAKIŞ", "ŞİFRE", "TANIK", "COŞKU", "LEHÇE", "PERON",
    "SIĞIR", "HAMLE", "İNANÇ", "SÖĞÜT", "ZİYAN", "AMBAR", "JETON", "YELEK",
    "ZEHİR", "ÇEVİK", "HALKA", "BÖLÜM", "KUMAR", "LİMAN", "METRO", "MESAİ",
    "BÜTÇE", "MANTIK", "LÜGAT", "BÜŞRA", "FİKİR", "ÇELİŞ", "NADAS",
    "KADİR", "EVRAK", "GİZEM", "SİHİR", "SEVAP", "NİMET", "KASIT", "KASİS",
    "FESAT", "DERYA", "MİRAS", "MİMAR", "YALAN", "İDRAK", "ŞÜPHE", "BASKI",
    "TEPKİ", "KAYGI", "DENEY", "HEDEF", "ŞAHİT", "BİLGE",
  ].filter((w) => getLetters(w).length === 5),
  zor: [
    "ZAHİR", "YEĞİN", "FASIL", "KUTUP", "ŞAYAN", "SEBAT", "LAHZA", "OTLUK",
    "HASIL", "NUTUK", "SÜKUT", "MUHİT", "MEBUS", "RAKIM", "REFAH", "ŞAFAK",
    "AHLAK", "AFYON", "CÜMLE", "İSTİF", "MENFİ", "MİLAT", "ELZEM", "MERAM",
    "BEDEL", "KEFİL", "TAHIL", "NAZİK", "LÜTUF", "MEDET", "MİRAS", "AZMET",
    "BEYAN", "CELSE", "DEVİR", "EMSAL", "FERAH", "GAFİL", "HÜLYA", "MECAZ",
    "NEBAT", "GİZEM", "İDRAK", "İNKAR", "İTHAL", "İHRAÇ",
  ],
};

// --- 6 HARFLİ HAVUZ (kolay / orta / zor) ---
const RAW_6: Record<Difficulty, string[]> = {
  kolay: [
    "BALKON", "TAVŞAN", "KAPLAN", "SANDAL", "HAYVAN", "MEKTUP", "SANDIK", "KAMYON",
    "KARDEŞ", "GÖZLÜK", "HORTUM", "LAHANA", "MANTAR", "YASTIK", "YORGAN", "KAPTAN",
    "GÖMLEK", "BERBER", "GÜNDÜZ", "MENDİL", "DOKTOR", "KAYISI", "GÜNLÜK", "SULTAN",
    "VOLKAN", "YARASA", "ZEYTİN", "MERCAN", "HEYKEL", "BALİNA", "FISTIK", "FINDIK",
    "SALATA", "SEMBOL", "TABELA", "BAKKAL", "LEVREK", "SİNEMA", "ZÜRAFA", "ÇATLAK",
    "ÇARDAK", "RESSAM", "PIRASA", "ORKİDE", "MUTFAK", "KUMSAL", "YELKEN",
  ],
  orta: [
    "ATMACA", "ZAMBAK", "KUTSAL", "TUTSAK", "KAYNAK", "GÜNCEL", "YÖNTEM", "GEÇMİŞ",
    "SÖZLÜK", "GEVREK", "DEVRAN", "TİCARİ", "KAPALI", "TERAZİ", "TABİAT", "TAKDİR",
    "KUZGUN", "MEVSİM", "TEDBİR", "TENKİT",
  ],
  zor: [
    "MELEKE", "HİLKAT", "FITRAT", "NÜMUNE", "MÜBHEM", "RİSALE", "HİKMET", "MAHREM",
    "TAKRİR", "TAHKİK",
  ],
};

// --- 7 HARFLİ HAVUZ (kolay / orta / zor) ---
const RAW_7: Record<Difficulty, string[]> = {
  kolay: [
    "PENCERE", "KARINCA", "FASULYE", "KUMBARA", "TABANCA", "TİYATRO", "UÇURTMA",
    "PATATES", "POSTACI", "PAMUKLU", "MENEKŞE", "YELPAZE", "ÖĞRENCİ", "ÇEKMECE",
    "GARANTİ", "KARAKOL", "BALIKÇI", "PROGRAM", "KILAVUZ", "KESTANE", "LAVANTA",
    "ORMANCI", "HASTANE", "TELEFON", "KUYUMCU",
  ],
  orta: [
    "TİCARET", "SANATÇI", "MERAKLI", "FABRİKA", "GİTARCI", "MASALCI", "TAKSİCİ",
    "YARARLI", "ZARARLI", "KOLONYA", "MERDANE", "ISPANAK", "ENGİNAR", "BİLMECE",
    "EĞLENCE", "MUHABİR", "TESADÜF", "TAKVİYE", "ŞÜPHELİ", "ISRARLI", "KAPORTA",
    "YATIRIM", "YAZILIM", "VALİLİK",
  ],
  zor: [
    "ŞAHESER", "MERASİM", "TEDARİK", "MEZİYET", "HÜVİYET", "ISTIRAP", "TAARRUZ",
    "TENAKUZ",
  ],
};

function only(len: number, arr: string[]) {
  return arr.filter((w) => getLetters(w).length === len);
}

function onlyByDifficulty(len: number, raw: Record<Difficulty, string[]>): Record<Difficulty, string[]> {
  return {
    kolay: only(len, raw.kolay),
    orta: only(len, raw.orta),
    zor: only(len, raw.zor),
  };
}

export const WORDS_5: Record<Difficulty, string[]> = onlyByDifficulty(5, RAW_5);
export const WORDS_6: Record<Difficulty, string[]> = onlyByDifficulty(6, RAW_6);
export const WORDS_7: Record<Difficulty, string[]> = onlyByDifficulty(7, RAW_7);

// Geliştirme sırasında havuzun beklenmedik şekilde boşalmasını erken yakalamak için.
if (import.meta.env?.DEV) {
  const pools: [string, Record<Difficulty, string[]>][] = [
    ["WORDS_5", WORDS_5],
    ["WORDS_6", WORDS_6],
    ["WORDS_7", WORDS_7],
  ];
  for (const [name, pool] of pools) {
    (["kolay", "orta", "zor"] as Difficulty[]).forEach((d) => {
      if (pool[d].length === 0) {
        console.warn(`[solo-words] ${name}.${d} boş kaldı.`);
      }
    });
  }
}

export function pickWord(length: WordLength, difficulty: Difficulty, exclude?: string): string {
  const pool: string[] =
    length === 5 ? WORDS_5[difficulty] : length === 6 ? WORDS_6[difficulty] : WORDS_7[difficulty];

  if (pool.length === 0) {
    throw new Error(`[solo-words] ${length} harf / ${difficulty} zorluk havuzu boş — pickWord çağrılamıyor.`);
  }

  const filtered = pool.filter((w) => w !== exclude);
  const src = filtered.length ? filtered : pool;
  return src[Math.floor(Math.random() * src.length)];
}