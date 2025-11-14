// IBM Watson API Configuration
const SCORING_URL = "https://us-south.ml.cloud.ibm.com/ml/v4/deployments/d1a0e271-0546-481c-8138-094878deea41/ai_service_stream?version=2021-05-01";
const TOKEN_URL = "https://iam.cloud.ibm.com/identity/token";

let authToken = null;

// Function to get authentication token from IBM Cloud
async function getAuthToken() {
  const r = await fetch("https://iam.cloud.ibm.com/identity/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Accept": "application/json",
    },
    body: new URLSearchParams({
      grant_type: "urn:ibm:params:oauth:grant-type:apikey",
      apikey: process.env.IBM_API_KEY, // this reads your key from environment variables
    }),
  });

  if (!r.ok) {
    const errText = await r.text();
    throw new Error("Failed to get token: " + errText);
  }

  const data = await r.json();
  return data.access_token;
}


// Function to send message to chatbot
async function sendMessageToChatbot(userMessage) {
    try {
        // Get token if we don't have one
        if (!authToken) {
            await getAuthToken();
        }
        
        if (!authToken) {
            throw new Error("Failed to authenticate with IBM Watson");
        }
        
        const payload = {
            messages: [
                {
                    role: "user",
                    content: userMessage
                }
            ]
        };
        
        const response = await fetch(SCORING_URL, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Authorization": `Bearer ${authToken}`,
                "Content-Type": "application/json;charset=UTF-8"
            },
            body: JSON.stringify(payload)
        });
        
        if (!response.ok) {
            throw new Error(`Chatbot request failed with status ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error sending message to chatbot:", error);
        return { error: error.message };
    }
}

// Initialize chatbot widget
function initializeChatbot() {
    // Create chatbot container HTML
    const chatbotHTML = `
        <div id="chatbot-widget" class="chatbot-widget">
            <div class="chatbot-header">
                <h3>VoterAccess Assistant</h3>
            </div>
            <div id="chatbot-messages" class="chatbot-messages"></div>
            <div class="chatbot-input-area">
                <input 
                    type="text" 
                    id="chatbot-input" 
                    class="chatbot-input" 
                    placeholder="Ask me anything about voting..."
                    autocomplete="off"
                >
                <button id="chatbot-send" class="chatbot-send">Send</button>
            </div>
        </div>
    `;
    
    // Insert chatbot HTML into the content/group section if it exists, otherwise at end of body
    const contentGroup = document.querySelector('.content .group');
    if (contentGroup) {
        contentGroup.insertAdjacentHTML('beforebegin', chatbotHTML);
    } else {
        document.body.insertAdjacentHTML('beforeend', chatbotHTML);
    }
    
    // Get elements
    const widget = document.getElementById('chatbot-widget');
    const input = document.getElementById('chatbot-input');
    const sendBtn = document.getElementById('chatbot-send');
    const messagesContainer = document.getElementById('chatbot-messages');
    
    // Send message
    async function sendMessage() {
        const message = input.value.trim();
        if (!message) return;
        
        // Add user message to display
        addMessageToDisplay(message, 'user');
        input.value = '';
        
        // Show loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'chatbot-message bot-message loading';
        loadingDiv.textContent = 'Thinking...';
        messagesContainer.appendChild(loadingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Send to chatbot
        const response = await sendMessageToChatbot(message);
        
        // Remove loading indicator
        loadingDiv.remove();
        
        // Add bot response
        if (response.error) {
            addMessageToDisplay(`Sorry, I encountered an error: ${response.error}`, 'bot');
        } else if (response.messages && response.messages.length > 0) {
            const botMessage = response.messages[response.messages.length - 1].content;
            addMessageToDisplay(botMessage, 'bot');
        } else {
            addMessageToDisplay("I'm not sure how to respond to that. Please try again.", 'bot');
        }
    }
    
    // Add message to display
    function addMessageToDisplay(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chatbot-message ${sender}-message`;
        messageDiv.textContent = text;
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Event listeners for sending message
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Initialize chatbot when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeChatbot);
} else {
    initializeChatbot();
}