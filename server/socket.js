function socket(io, app) {
  // Middleware for logging and connection handling
  io.use((socket, next) => {
    const handshake = socket.handshake;
    console.log(`New connection attempt from ${handshake.address}`);
    next();
  });

  io.on('connection', function (socket) {
    console.log(`Client connected: ${socket.id}`);
    socket.emit('connected');

    socket.on('join-room', function (url) {
      try {
        socket.join(url);
        console.log(`Client ${socket.id} joined room: ${url}`);
      } catch (error) {
        console.error(`Error joining room: ${error.message}`);
      }
    });

    socket.on('msg', function ({ room, content, username = '' }) {
      try {
        if (!room || !content) {
          throw new Error('Invalid message format');
        }

        const message = {
          username,
          content,
          timestamp: Date.now().toString(),
        };

        socket.to(room).emit('msg', message);
        console.log(`Message sent to room ${room} from ${username}`);
      } catch (error) {
        console.error(`Error sending message: ${error.message}`);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', function () {
      console.log(`Client disconnected: ${socket.id}`);
    });

    socket.on('error', function (error) {
      console.error(`Socket error: ${error.message}`);
    });
  });
}

module.exports = socket;
