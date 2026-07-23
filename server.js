// ===== Mera Chat App - Backend Server =====
// Ye server: usernames track karta hai, private (1-to-1) messaging karta hai,
// aur har user ko sirf uske apne conversation ka data bhejta hai.

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// username -> socket.id  (kaun online hai aur uska connection kaunsa hai)
const onlineUsers = new Map();
// socket.id -> username  (reverse lookup, disconnect ke time kaam aata hai)
const socketToUser = new Map();
// roomKey ("nameA__nameB" sorted) -> [{from, to, text, time}]  (har pair ki purani chat)
const chatHistory = new Map();

// Do naamon se ek unique, fixed room-key banata hai (chahe A->B ho ya B->A)
function getRoomKey(a, b) {
  return [a, b].sort().join('__');
}

function broadcastUserList() {
  io.emit('user-list', Array.from(onlineUsers.keys()));
}

io.on('connection', (socket) => {
  // Naya user apna naam set kar raha hai
  socket.on('set-name', (rawName) => {
    const name = (rawName || '').trim();

    if (!name) {
      socket.emit('name-error', 'Naam khali nahi ho sakta.');
      return;
    }
    if (onlineUsers.has(name)) {
      socket.emit('name-error', 'Ye username already online hai, doosra try karo.');
      return;
    }

    onlineUsers.set(name, socket.id);
    socketToUser.set(socket.id, name);

    socket.emit('name-accepted', name);
    broadcastUserList();
  });

  // Kisi specific user ke saath purani chat maango
  socket.on('get-history', ({ withUser }) => {
    const myName = socketToUser.get(socket.id);
    if (!myName || !withUser) return;

    const roomKey = getRoomKey(myName, withUser);
    const history = chatHistory.get(roomKey) || [];
    socket.emit('chat-history', { withUser, messages: history });
  });

  // Private message bhejna
  socket.on('private-message', ({ to, text }) => {
    const from = socketToUser.get(socket.id);
    const trimmedText = (text || '').trim();
    if (!from || !to || !trimmedText) return;

    const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const msg = { from, to, text: trimmedText, time, ts: Date.now() };

    const roomKey = getRoomKey(from, to);
    if (!chatHistory.has(roomKey)) chatHistory.set(roomKey, []);
    chatHistory.get(roomKey).push(msg);

    // Sender ko turant confirmation (uski apni screen pe dikhne ke liye)
    socket.emit('private-message', msg);

    // Agar receiver online hai to usko real-time turant bhej do (notification ke liye bhi yahi event)
    const receiverSocketId = onlineUsers.get(to);
    if (receiverSocketId && receiverSocketId !== socket.id) {
      io.to(receiverSocketId).emit('private-message', msg);
    }
  });

  // "typing..." dikhane ke liye (optional but useful)
  socket.on('typing', ({ to }) => {
    const from = socketToUser.get(socket.id);
    const receiverSocketId = onlineUsers.get(to);
    if (from && receiverSocketId) {
      io.to(receiverSocketId).emit('typing', { from });
    }
  });

  socket.on('disconnect', () => {
    const name = socketToUser.get(socket.id);
    if (name) {
      onlineUsers.delete(name);
      socketToUser.delete(socket.id);
      broadcastUserList();
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server chal raha hai: http://localhost:${PORT}`);
});
