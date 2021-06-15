// optional inclusion of query params/sub paths

let url = '';
let urlCode = '';
let username = '';

// console.log(window);
const messages = {};
// chrome.storage.local.clear();
const socket = io('http://24.36.81.134:3000/');

const messageInputElement = document.getElementById('message-input');

socket.on('connect', function () {
  console.log('Client connected');

  chrome.storage.local.get(['url'], function (result) {
    let _url = result.url;
    url = _url;
    urlCode = btoa(url);

    socket.emit('join-room', url);

    document.getElementById('site').innerText = `${url}`;

    messages[urlCode] = [];

    chrome.storage.local.get([urlCode], function (result) {
      restoreMessages(result[urlCode]);
    });

    chrome.storage.local.get('username', function (result) {
      if (result && result.username) {
        username = result.username;
      } else {
        username = `User #${getRandomString(6)}`;
        chrome.storage.local.set({ username: username });
      }

      showName(username);
    });
  });
});

socket.on('msg', function (msg) {
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
  socket.emit('msg', { room: url, ...msg });

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
  const item = document.createElement('LI');

  const contentElement = document.createElement('span');
  const timestampElement = document.createElement('span');
  const userElement = document.createElement('span');

  item.classList.add('shadow-sm');

  if (self) {
    item.classList.add('self');
  }

  contentElement.id = 'message-content';
  timestampElement.id = 'message-timestamp';
  userElement.id = 'message-user';

  contentElement.appendChild(document.createTextNode(content));
  timestampElement.appendChild(document.createTextNode(timestamp));
  userElement.appendChild(document.createTextNode(username));

  item.appendChild(contentElement);
  item.appendChild(timestampElement);
  item.appendChild(userElement);

  const isScrolledToEnd =
    Math.abs(list.scrollTop - Math.abs(list.scrollHeight - list.offsetHeight)) <
    10;

  list.appendChild(item);

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
