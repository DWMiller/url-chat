require('dotenv').config({ path: 'variables.env' });
const express = require('express');
const cors = require('cors');
const socket = require('./socket');

const app = express();

// Simplified CORS configuration
app.use(cors({
  origin: '*',  // Allow all origins for testing
  methods: ['GET', 'POST']
}));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

const port = process.env.PORT || 3000;

// Graceful shutdown handling
let server;
async function startServer() {
  try {
    server = app.listen(port, () => {
      console.log(`Server running on port ${server.address().port}`);
      console.log(`Environment: ${process.env.NODE_ENV}`);
      console.log(`Started at: ${new Date().toISOString()}`);
    });

    const io = require('socket.io')(server, {
      cors: {
        origin: '*',  // Allow all origins for testing
        methods: ['GET', 'POST']
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    socket(io, app);

    process.on('SIGTERM', () => gracefulShutdown());
    process.on('SIGINT', () => gracefulShutdown());
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown() {
  console.log('Starting graceful shutdown...');
  
  if (server) {
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });

    // Force close after 30 seconds
    setTimeout(() => {
      console.error('Could not close connections in time, forcefully shutting down');
      process.exit(1);
    }, 30000);
  }
}

startServer().catch(error => {
  console.error('Startup error:', error);
  process.exit(1);
});
