const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  }
});

const { addUserToARoom, getCurrentUser } = require('./utils/users');

io.on('connection', (socket) => {
  socket.on('join room', ({ username, room }) => {
    const user = addUserToARoom(socket.id, username, room);

    socket.join(user.room);

    socket.emit('message', { username: 'Chatbot', message: `Bem-vindo, ${username}.` });

    socket.broadcast.to(user.room).emit('message', { username: 'Chatbot', message: `${user.username} entrou na sala.` });
  });

  socket.on('message', ({ username, message }) => {
    const user = getCurrentUser(socket.id);

    io.to(user.room).emit('message', { username, message });
  });

  socket.on('disconnect', () => {
    const user = getCurrentUser(socket.id);

    socket.leave(user.room);

    io.to(user.room).emit('message', { username: 'Chatbot', message: `${user.username} saiu da sala.` });
  });
});

const port = 8080 || process.env.PORT;

server.listen(port);