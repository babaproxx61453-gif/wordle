// server.js
import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
app.use(cors());
app.use(express.json());

// HTTP Sunucusu ve Socket.io Kurulumu
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*', // Canlıya aldığımızda frontend domain'ini vereceğiz
    methods: ['GET', 'POST']
  }
});

// MySQL Veritabanı Bağlantısı
const db = await mysql.createConnection({
  host: 'localhost',
  user: 'root',      // Kendi MySQL kullanıcı adın
  password: 'root',  // Kendi MySQL şifren
  database: 'kelime_duellosu',
});

console.log('✅ MySQL Veritabanına başarıyla bağlandı!');

// --- SOCKET.IO EVENT (CANLI BAĞLANTI) YÖNETİMİ ---
io.on('connection', (socket) => {
  console.log(`🔌 Bir oyuncu bağlandı: ${socket.id}`);

  // Oyuncuyu belirli bir odaya dahil etme
  socket.on('join_room_socket', (roomCode) => {
    socket.join(roomCode);
    console.log(`📌 Oyuncu ${socket.id}, ${roomCode} odasına soket olarak katıldı.`);
  });

  // Ooda durumunda bir değişiklik olduğunda odadaki herkese sinyal gönderme
  socket.on('room_updated', (roomCode) => {
    io.to(roomCode).emit('refresh_room_state');
  });

  socket.on('disconnect', () => {
    console.log(`❌ Oyuncu ayrıldı: ${socket.id}`);
  });
});

// --- AUTH API'LERİ ---

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });

  try {
    const [existing] = await db.execute('SELECT id FROM users WHERE username = ?', [username]);
    if (existing.length > 0) return res.status(400).json({ error: 'Bu kullanıcı adı zaten alınmış.' });

    const [result] = await db.execute('INSERT INTO users (username, password) VALUES (?, ?)', [username, password]);
    res.json({ message: 'Kayıt başarılı!', userId: result.insertId });
  } catch (err) {
    console.error('Kayıt Hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Kullanıcı adı ve şifre zorunludur.' });

  try {
    const [rows] = await db.execute('SELECT id, username FROM users WHERE username = ? AND password = ?', [username, password]);
    if (rows.length === 0) return res.status(400).json({ error: 'Kullanıcı adı veya şifre hatalı!' });

    res.json({ message: 'Giriş başarılı!', user: rows[0] });
  } catch (err) {
    console.error('Giriş Hatası:', err);
    res.status(500).json({ error: 'Sunucu hatası oluştu.' });
  }
});

// --- ODA & MULTIPLAYER API'LERİ ---

app.post('/api/rooms/create', async (req, res) => {
  const { playerId, name, code } = req.body;
  try {
    const [result] = await db.execute(
      'INSERT INTO rooms (code, status, player1_id, player1_name) VALUES (?, "waiting", ?, ?)',
      [code, playerId, name]
    );
    const roomId = result.insertId;
    await db.execute('INSERT INTO room_secrets (room_id) VALUES (?)', [roomId]);

    res.json({ code, roomId });
  } catch (err) {
    console.error('Oda Oluşturma Hatası:', err);
    res.status(500).json({ error: 'Oda oluşturulamadı.' });
  }
});

app.post('/api/rooms/join', async (req, res) => {
  const { code, playerId, name } = req.body;
  try {
    const [rows] = await db.execute('SELECT * FROM rooms WHERE code = ?', [code]);
    if (rows.length === 0) return res.status(404).json({ error: 'Oda bulunamadı.' });

    const room = rows[0];

    if (room.player1_id === playerId || room.player2_id === playerId) {
      return res.json({ code: room.code });
    }

    if (room.player2_id) return res.status(400).json({ error: 'Oda dolu.' });

    await db.execute(
      'UPDATE rooms SET player2_id = ?, player2_name = ?, status = "setting" WHERE id = ?',
      [playerId, name, room.id]
    );

    // Odaya yeni biri katıldığını soket ile odadakilere bildir
    io.to(code).emit('refresh_room_state');

    res.json({ code: room.code });
  } catch (err) {
    console.error('Odaya Katılma Hatası:', err);
    res.status(500).json({ error: 'Odaya katılınamadı.' });
  }
});

app.get('/api/rooms/state', async (req, res) => {
  const { code, playerId } = req.query;
  try {
    const [rows] = await db.execute('SELECT * FROM rooms WHERE code = ?', [code]);
    if (rows.length === 0) return res.json({ room: null, guesses: [], full: false });

    const room = rows[0];
    const isMember = playerId && (room.player1_id === playerId || room.player2_id === playerId);
    const openForJoin = !room.player2_id;

    if (!isMember && !openForJoin) {
      return res.json({
        room: { ...room, player1_name: null, player2_name: null },
        guesses: [],
        full: true,
      });
    }

    let guesses = [];
    if (isMember) {
      const [gRows] = await db.execute('SELECT * FROM guesses WHERE room_id = ? ORDER BY created_at ASC', [room.id]);
      guesses = gRows;
    }

    res.json({ room, guesses, full: false });
  } catch (err) {
    console.error('Oda Durumu Hatası:', err);
    res.status(500).json({ error: 'Oda durumu alınamadı.' });
  }
});

const PORT = 5000;
// app.listen yerine httpServer.listen kullanıyoruz!
httpServer.listen(PORT, () => {
  console.log(`🚀 Backend & Socket.io sunucusu http://localhost:5000 adresinde çalışıyor!`);
});