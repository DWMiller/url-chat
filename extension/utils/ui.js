export const UI = {
  showError(message) {
    const messages = document.getElementById('messages');
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    messages.appendChild(errorDiv);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  },

  showLoading() {
    const messages = document.getElementById('messages');
    messages.classList.add('loading');
  },

  hideLoading() {
    const messages = document.getElementById('messages');
    messages.classList.remove('loading');
  },

  disableInput() {
    const input = document.getElementById('message-input');
    const button = document.getElementById('message-send');
    input.disabled = true;
    button.disabled = true;
  },

  enableInput() {
    const input = document.getElementById('message-input');
    const button = document.getElementById('message-send');
    input.disabled = false;
    button.disabled = false;
  }
}; 