// Function to add a message to the chat interface
function addMessage(messageText, senderType) {
  // 1. Create a new <div> element called messageDiv to hold the message.
  const messageDiv = document.createElement('div');
  // 2. Add two CSS classes to messageDiv: 'message' and senderType ('user' or 'bot').
  messageDiv.classList.add('message', senderType);
  // 3. Replace newline characters in messageText with <br> and set as HTML content.
  messageDiv.innerHTML = messageText.replace(/\n/g, '<br>');
  // 4. Get the container element with ID 'messages' and save as "messagesContainer".
  const messagesContainer = document.getElementById('messages');
  // 5. Add messageDiv to the messages container.
  messagesContainer.appendChild(messageDiv);
  // 6. Scroll to bottom:
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// When the page loads, show a welcome message from the bot
document.addEventListener("DOMContentLoaded", function () {
  addMessage(
    'Hello, I am your intelligent books recommendation chatbot "01Books".\nGive me a keyword!\n\nExample: Mathematics',
    'bot'
  );
});

// Add a click event listener to the send button
document.getElementById("send-button").addEventListener("click", sendMessage);

// Function to handle sending a user message
function sendMessage() {
  // Get the user's input and trim whitespace
  const userInput = document.getElementById("user-input").value.trim();
  if (userInput) {
  // Add the user's message to the chat
  addMessage(userInput, "user");
  // Clear the input box
  document.getElementById("user-input").value = "";

  // Get book recommendations from the internet
  getBookRecommendation(userInput).then((response) => {
    // Add the bot's response to the chat
    addMessage(response, "bot");
  });
  }
}

// Function to get book (music) recommendations from iTunes API
async function getBookRecommendation(query) {
  try {
  /* 1. Create the web address to search iTunes for music */
  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&limit=5`;

  /* 2. Ask iTunes for music about the topic */
  const response = await fetch(url);

  /* 3. Check if iTunes responded correctly */
  if (!response.ok) {
    throw new Error(`Music search failed: ${response.status}`);
  }

  /* 4. Turn the answer into something we can read */
  const data = await response.json();

  /* 5. Check if we found any music */
  if (!data.results || data.results.length === 0) {
    return "No music found for that topic. Try a different word!";
  }

  /* 6. Start building our music recommendations */
  let message = "Music from iTunes:<br><br>";

  /* 7. Show the first 5 songs */
  data.results.slice(0, 5).forEach((song) => {
    const title = song.trackName || "Unknown Song";
    const artist = song.artistName || "Unknown Artist";
    const album = song.collectionName || "Unknown Album";
    const price = song.trackPrice ? `$${song.trackPrice}` : "Price not available";
    const preview = song.previewUrl || "#";
    const artwork = song.artworkUrl100 || "";

    // Add artwork image if available
    message += `${artwork ? `<img src="${artwork}" style="width:60px;height:auto;float:left;margin-right:10px;">` : ""}`;
    // Add song title
    message += `<strong>${title}</strong><br>`;
    // Add artist name
    message += `by ${artist}<br>`;
    // Add album name
    message += `Album: ${album}<br>`;
    // Add price
    message += `${price}<br>`;
    // Add preview link if available
    if (preview !== "#") {
    message += `<a href="${preview}" target="_blank">Preview</a><br>`;
    }
    // Clear float for next item
    message += `<div style="clear:both;"></div><br>`;
  });

  return message;
  } catch (error) {
  // Log error and return a friendly message
  console.error("Error searching music:", error);
  return "Sorry, I couldn't search for music right now. Please try again!";
  }
}