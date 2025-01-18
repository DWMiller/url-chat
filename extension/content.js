import CONFIG from './config.js';
import { socketService } from './services/socket.js';

let url = '';
let urlCode = '';
let username = '';
const messages = {};

const messageInputElement = document.getElementById('message-input');

// Initialize socket connection
console.log('Attempting to connect to socket server...');
socketService.connect();

// Setup connection handler
socketService.onConnect(() => {
  console.log('Socket connected successfully');
});

socketService.socket.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Setup connection handler
socketService.onConnect(function () {
  console.log('Client connected');

  chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
    if (tabs[0]) {
      url = tabs[0].url;
      urlCode = getRandomString(8);
      
      // Update UI
      document.getElementById('site').textContent = url;

      // Connect to socket and join room
      socketService.connect();
      socketService.onConnect(function() {
        console.log('Client connected, joining room for:', url);
        socketService.joinRoom(url);
      });

      // Get stored username if any
      chrome.storage.local.get(['username'], function(result) {
        if (result.username) {
          username = result.username;
          document.getElementById('name-value').textContent = username;
        }
      });
    }
  });
});

// Setup message handler
socketService.onMessage(function (msg) {
  appendMessage({ msg });
  saveMessage({ msg });
});

const form = document.getElementById('message-form');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const msg = {
    content: messageInputElement.value,
    username,
  };
  socketService.sendMessage(url, msg.content, msg.username);

  appendMessage({ msg, self: true });
  saveMessage({ msg, self: true });

  messageInputElement.value = '';
});

const nameForm = document.getElementById('name-form');
nameForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const inputElement = document.getElementById('name-input');
  username = inputElement.value;
  chrome.storage.local.set({ username: username });
  showName(username);
  messageInputElement.focus();
});

const nameChangeButton = document.getElementById('name-change');
nameChangeButton.addEventListener('click', () => {
  nameForm.classList.remove('hide');
  nameChangeButton.classList.add('hide');
  const inputElement = document.getElementById('name-input');
  inputElement.value = username;
  inputElement.focus();
});

// Add this after other initialization code
document.getElementById('name-current').addEventListener('click', function() {
  document.getElementById('name-form').classList.add('show');
  document.getElementById('name-input').focus();
});

// Update the name form submit handler
document.getElementById('name-form').addEventListener('submit', function(e) {
  e.preventDefault();
  const newName = document.getElementById('name-input').value.trim();
  if (newName) {
    username = newName;
    document.getElementById('name-value').textContent = username;
    chrome.storage.local.set({ username: username });
  }
  document.getElementById('name-form').classList.remove('show');
});

// Add click-outside handling to close the form
document.addEventListener('click', function(e) {
  const nameForm = document.getElementById('name-form');
  const nameCurrent = document.getElementById('name-current');
  if (!nameForm.contains(e.target) && !nameCurrent.contains(e.target)) {
    nameForm.classList.remove('show');
  }
});

// ---------------- //

function saveMessage({ msg, self = false }) {
  messages[urlCode].push({ msg, self });
  chrome.storage.local.set({ [urlCode]: messages[urlCode] });
}

function restoreMessages(messages) {
  if (messages && messages.length) {
    messages.forEach(appendMessage);
  }
}

function showName(name) {
  const nameElement = document.getElementById('name-value');
  nameElement.innerText = `${name}`;
  const nameFormElement = document.getElementById('name-form');
  nameFormElement.classList.add('hide');
  nameChangeButton.classList.remove('hide');
}

function appendMessage({ msg, self = false }) {
  const { content, timestamp, username } = msg;
  const list = document.getElementById('messages');
  
  // Create message container
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${self ? 'self' : ''}`;
  
  // Check if this message should be grouped
  const lastMessage = list.lastElementChild;
  if (lastMessage && 
      lastMessage.querySelector('.message-user').textContent === username) {
    messageDiv.classList.add('same-user');
  }

  // Create message bubble
  const bubble = document.createElement('div');
  bubble.className = 'message-bubble';
  bubble.textContent = content;

  // Create metadata container
  const meta = document.createElement('div');
  meta.className = 'message-meta';
  
  const userSpan = document.createElement('span');
  userSpan.className = 'message-user';
  userSpan.textContent = username;
  
  const timeSpan = document.createElement('span');
  timeSpan.className = 'message-time';
  timeSpan.textContent = new Date(parseInt(timestamp)).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  meta.appendChild(userSpan);
  meta.appendChild(timeSpan);
  
  messageDiv.appendChild(bubble);
  messageDiv.appendChild(meta);

  const isScrolledToEnd =
    Math.abs(list.scrollTop - (list.scrollHeight - list.offsetHeight)) < 10;

  list.appendChild(messageDiv);

  if (isScrolledToEnd) {
    list.scrollTop = list.scrollHeight;
  }
}

function getRandomString(
  length = 1,
  randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
) {
  var result = '';
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

// Cleanup on window unload
window.addEventListener('unload', () => {
  socketService.disconnect();
});

