//TODO - Handle all open rooms simultaneously
// Handle new/leaving urls
// optional inclusion of query params/sub paths
// sanitize text content

let url = '';
let urlCode = '';

const messages = {};

const socket = io('http://24.36.81.134:3000/');

socket.on('connect', function () {
  console.log('Client connected');

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    let _url = tabs[0].url;
    url = _url;
    urlCode = btoa(url);

    socket.emit('join-room', url);

    document.getElementById('header').innerText = `Web chat for ${url}`;

    messages[urlCode] = [];
    // console.log({ messages });

    chrome.storage.local.get([urlCode], function (result) {
      restoreMessages(result[urlCode]);
      // console.log('Value currently is ' + result.key);
    });
  });
});

socket.on('msg', function (msg) {
  appendMessage({
    msg,
  });
  saveMessage({ msg });
});

const form = document.getElementById('message-form');
form.addEventListener('submit', function (e) {
  e.preventDefault();
  const inputElement = document.getElementById('message-input');
  const msg = inputElement.value;
  socket.emit('msg', { room: url, content: msg });

  appendMessage({ msg, self: true });
  saveMessage({ msg, self: true });

  inputElement.value = '';
});

// ---------------- //

function saveMessage({ msg, self = false }) {
  messages[urlCode].push({ msg, self });
  console.log({ messages });
  chrome.storage.local.set({ [urlCode]: messages[urlCode] });
}

function restoreMessages(messages) {
  console.log(messages);
  messages.forEach(appendMessage);
}

function appendMessage({ msg, self = false }) {
  const list = document.getElementById('messages');
  const item = document.createElement('LI');

  if (self) {
    item.classList.add('self');
  }

  item.appendChild(document.createTextNode(msg));
  list.appendChild(item);

  list.scrollTop = list.scrollHeight;
}
// var popupWindow = window.open(
//   chrome.extension.getURL("normal_popup.html"),
//   "exampleName",
//   "width=400,height=400"
// );
// window.close(); // close the Chrome extension pop-up
