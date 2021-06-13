function socket(io, app) {
  io.on('connection', function (socket) {
    socket.emit('connected');

    socket.on('join-room', function (url) {
      console.log(`user connected on ${url}`);
      socket.join(url);
    });

    socket.on('msg', function ({ room, content }) {
      socket.to(room).emit('msg', content);
    });

    socket.on('disconnect', function () {
      console.log('user disconnected');
    });
  });
}

module.exports = socket;
