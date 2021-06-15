function socket(io, app) {
  io.on('connection', function (socket) {
    socket.emit('connected');

    socket.on('join-room', function (url) {
      // console.log(`user connected on ${url}`);
      socket.join(url);
    });

    socket.on('msg', function ({ room, content, username = '' }) {
      socket.to(room).emit('msg', {
        username,
        content,
        timestamp: Date.now().toString(),
      });
    });

    socket.on('disconnect', function () {
      // console.log('user disconnected');
    });
  });
}

module.exports = socket;
