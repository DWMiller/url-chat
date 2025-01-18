import CONFIG from '../config.js';
import { UI } from '../utils/ui.js';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    console.log('SocketService initialized');
  }

  connect() {
    if (this.socket) return;
    console.log('Attempting to connect to:', CONFIG.SOCKET_URL);

    UI.showLoading();
    UI.disableInput();

    this.socket = io(CONFIG.SOCKET_URL, {
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      timeout: 20000,
    });

    this.setupListeners();
  }

  setupListeners() {
    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.connected = true;
      UI.hideLoading();
      UI.enableInput();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.connected = false;
      UI.showError('Failed to connect to chat server. Retrying...');
      UI.disableInput();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected:', reason);
      this.connected = false;
      UI.showError('Disconnected from chat server. Reconnecting...');
      UI.disableInput();
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      UI.showError('An error occurred. Please try again.');
    });
  }

  joinRoom(url) {
    if (!this.connected) {
      console.log('Not connected, cannot join room');
      return;
    }
    console.log('Joining room:', url);
    this.socket.emit('join-room', url);
  }

  sendMessage(room, content, username) {
    if (!this.connected) {
      console.log('Not connected, cannot send message');
      return;
    }
    console.log('Sending message:', { room, content, username });
    this.socket.emit('msg', { room, content, username });
  }

  onMessage(callback) {
    this.socket.on('msg', callback);
  }

  onConnect(callback) {
    this.socket.on('connect', callback);
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
      console.log('Disconnected from server');
    }
  }
}

export const socketService = new SocketService(); 