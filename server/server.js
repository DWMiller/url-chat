// import environmental variables from our variables.env file
require('dotenv').config({ path: 'variables.env' });

const cors = require('cors');
const express = require('express');

const socket = require('./socket');

const app = express();

// if (app.env === 'development') {
/* Development Error Handler - Prints stack trace */
// app.use(logger());
// }

app.use(cors());

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(
    `Express Running → PORT ${
      server.address().port
    } -> Started at: ${new Date()}`
  );
});

const io = require('socket.io')(server, {
  cors: {
    // origin: 'http://localhost:3000', //TODO - env variable
    credentials: true,
    methods: ['GET', 'POST'],
  },
});

socket(io, app);
