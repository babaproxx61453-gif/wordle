// server.js (RAM Tabanlı & Saf Socket.io / Express Sunucusu)
import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// --- VERİTABANI YERİNE RAM BELLEK (DİZİLER VE NESNELER) ---
const rooms = {}; // Tüm odaları ve durumlarını burada tutacağız
const users = []; // Basit kayıt/giriş için kullanıcılar

// --- SOCKET.IO EVENT (CANLI BAĞLANTI) YÖNETİMİ ---
io.on('connection', (socket) => {
  console.log(`🔌 Bir oyuncu bağlandı: ${socket.id}`);

  socket.on('join_room_socket', (roomCode) => {
    socket.join(roomCode);
    console.log(`📌 Oyuncu ${socket.id}, ${roomCode} odasına katıldı.`);
  });

  socket.on('room_updated', (roomCode) => {
    io.to(roomCode).emit('refresh_room_state');
  });

  socket.on('disconnect', () => {
    console.log(`❌ Oyuncu ayrıldı: ${socket.id}`);
  });
});

// --- AUTH API'LERİ (RAM ÜZERİNDEN) ---
app.post('/api/register', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });

  const existing = users.find(u => u.username === username);
  if (existing) return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });

  const newUser = { id: Date.now(), username, password };
  users.push(newUser);
  res.json({ message: 'Kayıt başarılı!', userId: newUser.id });
});

app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);
  if (!user) return res.status(400).json({ error: 'Kullanıcı adı veya şifre hatalı!' });

  res.json({ message: 'Giriş başarılı!', user: { id: user.id, username: user.username } });
});

// --- ODA & MULTIPLAYER API'LERİ (RAM ÜZERİNDEN) ---
app.post('/api/rooms/create', (req, res) => {
  const { playerId, name, code } = req.body;
  
  rooms[code] = {
    id: Date.now(),
    code,
    status: 'waiting',
    player1_id: playerId,
    player1_name: name,
    player2_id: null,
    player2_name: null,
    guesses: []
  };

  res.json({ code, roomId: rooms[code].id });
});

app.post('/api/rooms/join', (req, res) => {
  const { code, playerId, name } = req.body;
  const room = rooms[code];

  if (!room) return res.status(404).json({ error: 'Oda bulunamadı.' });

  if (room.player1_id === playerId || room.player2_id === playerId) {
    return res.json({ code: room.code });
  }

  if (room.player2_id) return res.status(400).json({ error: 'Oda dolu.' });

  room.player2_id = playerId;
  room.player2_name = name;
  room.status = 'setting';

  io.to(code).emit('refresh_room_state');
  res.json({ code: room.code });
});

app.get('/api/rooms/state', (req, res) => {
  const { code, playerId } = req.query;
  const room = rooms[code];

  if (!room) return res.json({ room: null, guesses: [], full: false });

  const isMember = playerId && (room.player1_id === playerId || room.player2_id === playerId);
  const openForJoin = !room.player2_id;

  if (!isMember && !openForJoin) {
    return res.json({
      room: { ...room, player1_name: null, player2_name: null },
      guesses: [],
      full: true,
    });
  }

  res.json({ room, guesses: room.guesses, full: false });
});

// Render'ın vereceği dinamik portu dinlemesi için process.env.PORT kullanıyoruz
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend & Socket.io sunucusu ${PORT} portunda çalışıyor!`);
});