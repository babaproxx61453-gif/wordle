import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  isTurkishWord,
  isValidWord,
  trUpper,
} from "./game";

const ROOM_CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
function genCode(): string {
  let out = "";
  for (let i = 0; i < 5; i++)
    out += ROOM_CODE_CHARS[Math.floor(Math.random() * ROOM_CODE_CHARS.length)];
  return out;
}

const playerIdSchema = z.string();
const nameSchema = z.string().trim().min(1).max(40);
const codeSchema = z.string().trim().min(4).max(12);
const roomIdSchema = z.string();
const wordSchema = z.string().trim();
const optionalPlayerIdSchema = playerIdSchema.optional();

async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const backendUrl = "https://kelime-backend-pl8m.onrender.com";
  const baseUrl = `${backendUrl}/api`;

  const res = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const contentType = res.headers.get("content-type");
  if (!contentType || !contentType.includes("application/json")) {
    const text = await res.text();
    throw new Error(`Sunucu hatası (${res.status}): API adresi yanlış veya sunucu yanıt vermiyor.`);
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "İşlem başarısız.");
  return data;
}

export const createRoom = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ playerId: playerIdSchema, name: nameSchema }).parse(d)
  )
  .handler(async ({ data }) => {
    try {
      const result = await apiFetch("/rooms/create", {
        method: "POST",
        body: JSON.stringify({
          playerId: data.playerId,
          name: data.name,
          code: genCode(),
        }),
      });
      return { code: result.code };
    } catch (err: any) {
      throw new Error(err.message || "Oda oluşturulamadı");
    }
  });

export const joinRoom = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ code: codeSchema, playerId: playerIdSchema, name: nameSchema })
      .parse(d)
  )
  .handler(async ({ data }) => {
    try {
      const code = trUpper(data.code);
      const result = await apiFetch("/rooms/join", {
        method: "POST",
        body: JSON.stringify({
          code,
          playerId: data.playerId,
          name: data.name,
        }),
      });
      return { code: result.code };
    } catch (err: any) {
      throw new Error(err.message || "Katılınamadı");
    }
  });

export const submitWord = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        roomId: roomIdSchema,
        playerId: playerIdSchema,
        word: wordSchema,
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const word = trUpper(data.word);
    if (!isValidWord(word)) throw new Error("Geçersiz kelime");
    if (!(await isTurkishWord(word)))
      throw new Error("Bu kelime Türkçe sözlükte yok");

    return await apiFetch("/rooms/submit-word", {
      method: "POST",
      body: JSON.stringify({
        roomId: data.roomId,
        playerId: data.playerId,
        word,
      }),
    });
  });

export const submitGuess = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({
        roomId: roomIdSchema,
        playerId: playerIdSchema,
        guess: wordSchema,
        result: z.string().optional(),
      })
      .parse(d)
  )
  .handler(async ({ data }) => {
    const guess = trUpper(data.guess);
    if (!isValidWord(guess)) throw new Error("Geçersiz tahmin");
    if (!(await isTurkishWord(guess)))
      throw new Error("Bu kelime Türkçe sözlükte yok");

    return await apiFetch("/rooms/submit-guess", {
      method: "POST",
      body: JSON.stringify({
        roomId: data.roomId,
        playerId: data.playerId,
        guess,
        result: data.result || "absent,absent,absent,absent,absent",
      }),
    });
  });

export const restartRoom = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z.object({ roomId: roomIdSchema, playerId: playerIdSchema }).parse(d)
  )
  .handler(async ({ data }) => {
    return await apiFetch("/rooms/restart", {
      method: "POST",
      body: JSON.stringify(data),
    });
  });

export const getRevealedWords = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ roomId: roomIdSchema }).parse(d))
  .handler(async ({ data }) => {
    return await apiFetch(`/rooms/revealed-words?roomId=${data.roomId}`);
  });

export const getRoomState = createServerFn({ method: "GET" })
  .inputValidator((d) =>
    z.object({ code: codeSchema, playerId: optionalPlayerIdSchema }).parse(d)
  )
  .handler(async ({ data }) => {
    const code = trUpper(data.code.trim());
    return await apiFetch(
      `/rooms/state?code=${encodeURIComponent(code)}&playerId=${data.playerId || ""}`
    );
  });