const jwt = require('jsonwebtoken');
const User = require('../models/User');

const setupSocket = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Нэвтрэх эрхгүй'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      if (!user) return next(new Error('Хэрэглэгч олдсонгүй'));
      socket.user = user;
      next();
    } catch {
      next(new Error('Токен хүчингүй'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id.toString();
    socket.join(`user:${userId}`);
    console.log(`🔌 Socket холбогдлоо: ${socket.user.firstName} (${socket.user.role})`);

    socket.on('appointment:viewing', ({ doctorId, date }) => {
      socket.to(`doctor:${doctorId}`).emit('appointment:someone-viewing', { date });
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Socket салагдлаа: ${socket.user.firstName}`);
    });
  });
};

module.exports = setupSocket;
