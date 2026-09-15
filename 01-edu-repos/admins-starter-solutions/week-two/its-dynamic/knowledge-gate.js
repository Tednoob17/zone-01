// Exercise 2: Creating the Message Display Function
function addMessage(messageText, senderType) {
  // 1. Create a new <div> element called messageDiv to hold the message
  const messageDiv = document.createElement('div');
  
  // 2. Add two CSS classes to messageDiv: 'message' and senderType ('user' or 'bot')
  messageDiv.classList.add('message', senderType);
  
  // 3. Replace newline characters in messageText with <br> and set as HTML content
  messageDiv.innerHTML = messageText.replace(/\n/g, '<br>');
  
  // 4. Get the container element with ID 'messages' and save as "messagesContainer"
  const messagesContainer = document.getElementById('messages');
  
  // 5. Add messageDiv to the messages container
  messagesContainer.appendChild(messageDiv);
  
  // 6. Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Exercise 3: Adding the Welcome Message
document.addEventListener("DOMContentLoaded", function () {
  // Call addMessage() with welcome message
  addMessage("Hello, I am your intelligent books recommendation chatbot \"01Books\".\nGive me a keyword!\n\nExample: Mathematics", 'bot');
});

// Exercise 4: Handling User Messages
document.getElementById("send-button").addEventListener("click", sendMessage);

function sendMessage() {
  const userInput = document.getElementById("user-input").value.trim();

  if (userInput) {
    // Call addMessage function to display the user's message
    addMessage(userInput, 'user');
    
    // Clear the input field by setting its value to an empty string
    document.getElementById("user-input").value = '';
  }
}

// Optional: Allow sending message with Enter key
document.getElementById("user-input").addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    sendMessage();
  }
});