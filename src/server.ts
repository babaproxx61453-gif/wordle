import "./lib/error-capture";
import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

// Bellek üstündeki odalar veritabanı
const rooms: Record<string, any> = {};

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json" }
  });
}

// Oda bulma yardımcı fonksiyonu (Büyük/küçük harf duyarsız ve esnek eşleşme)
function findRoom(lookupKey: string) {
  if (!lookupKey) return null;
  const decodedKey = decodeURIComponent(lookupKey).trim();
  return Object.values(rooms).find((r: any) => 
    String(r.id) === decodedKey || 
    String(r.code) === decodedKey ||
    String(r.code).toLowerCase() === decodedKey.toLowerCase()
  );
}

async function handleApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;

  if (path === '/api/rooms/create' && method === 'POST') {
    const body = await request.json() as any;
    const { playerId, name, code } = body;
    const roomId = Date.now().toString();
    
    rooms[roomId] = {
      id: roomId,
      code: code,
      player1_id: playerId,
      player1_name: name,
      player2_id: null,
      player2_name: null,
      status: 'setting',
      turn: 1,
      player1_word: null,
      player2_word: null,
      guesses: []
    };

    return jsonResponse({ success: true, code: code, roomId: roomId });
  }

  if (path === '/api/rooms/join' && method === 'POST') {
    const body = await request.json() as any;
    const { code, playerId, name } = body;
    const room = findRoom(code);
    
    if (!room) {
      return jsonResponse({ error: 'Oda bulunamadı.' }, 404);
    }

    if (room.player1_id === playerId) {
      return jsonResponse({ success: true, code: room.code });
    }

    if (!room.player2_id) {
      room.player2_id = playerId;
      room.player2_name = name;
    }

    return jsonResponse({ success: true, code: room.code });
  }

  if (path === '/api/rooms/state' && method === 'GET') {
    const lookupKey = url.searchParams.get('code') || url.searchParams.get('roomId');
    const room = findRoom(lookupKey!);
    
    if (!room) {
      return jsonResponse({ error: 'Oda bulunamadı.' }, 404);
    }

    return jsonResponse(room);
  }

  if (path === '/api/rooms/submit-word' && method === 'POST') {
    const body = await request.json() as any;
    const { roomId, playerId, word } = body;
    const room: any = findRoom(roomId);
    
    if (!room) return jsonResponse({ error: 'Oda bulunamadı.' }, 404);

    if (room.player1_id === playerId) {
      room.player1_word = word;
      room.player1_word_set = true;
    } else if (room.player2_id === playerId) {
      room.player2_word = word;
      room.player2_word_set = true;
    }

    if (room.player1_word_set && room.player2_word_set) {
      room.status = 'playing';
      room.turn = 1;
    }

    return jsonResponse({ success: true });
  }

  if (path === '/api/rooms/submit-guess' && method === 'POST') {
    const body = await request.json() as any;
    const { roomId, playerId, guess } = body;
    const room: any = findRoom(roomId);
    
    if (!room) return jsonResponse({ error: 'Oda bulunamadı.' }, 404);

    const playerNum = room.player1_id === playerId ? 1 : room.player2_id === playerId ? 2 : 0;
    if (!room.guesses) room.guesses = [];

    const targetWord = playerNum === 1 ? room.player2_word : room.player1_word;
    const targetChars = targetWord ? targetWord.split("") : [];
    const guessChars = (guess as string).split("");
    const resultArr = ["absent", "absent", "absent", "absent", "absent"];
    
    const targetLetterCount: any = {};
    targetChars.forEach((ch: string) => {
      targetLetterCount[ch] = (targetLetterCount[ch] || 0) + 1;
    });

    guessChars.forEach((ch, i) => {
      if (ch === targetChars[i]) {
        resultArr[i] = "correct";
        targetLetterCount[ch]--;
      }
    });

    guessChars.forEach((ch, i) => {
      if (resultArr[i] !== "correct" && targetLetterCount[ch] > 0) {
        resultArr[i] = "present";
        targetLetterCount[ch]--;
      }
    });

    room.guesses.push({
      id: Date.now().toString(),
      room_id: room.id,
      player_num: playerNum,
      guess: guess,
      result: resultArr.join(","),
      created_at: new Date().toISOString()
    });

    room.turn = room.turn === 1 ? 2 : 1;
    return jsonResponse({ success: true });
  }

  if (path === '/api/rooms/revealed-words' && method === 'GET') {
    const roomId = url.searchParams.get('roomId');
    const room: any = findRoom(roomId!);
    
    if (!room) return jsonResponse({ error: 'Oda bulunamadı.' }, 404);

    return jsonResponse({
      player1_word: room.player1_word || '?????',
      player2_word: room.player2_word || '?????'
    });
  }

  if (path === '/api/rooms/restart' && method === 'POST') {
    const body = await request.json() as any;
    const { roomId } = body;
    const room: any = findRoom(roomId);
    
    if (!room) return jsonResponse({ error: 'Oda bulunamadı.' }, 404);

    room.status = 'setting';
    room.player1_word_set = false;
    room.player2_word_set = false;
    room.player1_word = null;
    room.player2_word = null;
    room.guesses = [];

    return jsonResponse({ success: true });
  }

  return null;
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    try {
      const apiResponse = await handleApiRequest(request);
      if (apiResponse) {
        return apiResponse;
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};