document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('send-btn');
    const userQueryInput = document.getElementById('user-query');
    const chatMessages = document.getElementById('chat-messages');
    const logContent = document.getElementById('log-content');
    const clearLogBtn = document.getElementById('clear-log-btn');
    const themeSwitch = document.getElementById('checkbox');

    // Function to toggle dark mode
    function toggleDarkMode(isDarkMode) {
        if (isDarkMode) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Event listener for the theme switch
    themeSwitch.addEventListener('change', () => {
        const isDarkMode = themeSwitch.checked;
        toggleDarkMode(isDarkMode);
        // Save preference to local storage
        localStorage.setItem('darkMode', isDarkMode);
    });

    // Check for saved dark mode preference
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    themeSwitch.checked = savedDarkMode;
    toggleDarkMode(savedDarkMode);

    // Function to add a message to the chat
    function addChatMessage(message, sender = 'user') {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message', `${sender}-message`);
        messageElement.textContent = message;
        chatMessages.appendChild(messageElement);
        chatMessages.scrollTop = chatMessages.scrollHeight; // Scroll to bottom
    }

    // Function to add a log entry
    function addLog(message) {
        const logEntry = document.createElement('div');
        const timestamp = new Date().toLocaleTimeString();
        logEntry.textContent = `[${timestamp}] ${message}`;
        logContent.appendChild(logEntry);
        logContent.scrollTop = logContent.scrollHeight; // Scroll to bottom
    }

    // Handle sending a message
    function sendMessage() {
        const query = userQueryInput.value.trim();
        if (query) {
            addChatMessage(query, 'user');
            addLog(`User query: "${query}"`);
            userQueryInput.value = '';

            // Send query to the RAG backend
            fetch('http://localhost:5000/api/rag', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query }),
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                // Assuming the backend returns a JSON with a 'response' key
                const ragResponse = data.response;
                addChatMessage(ragResponse, 'rag');
                addLog('RAG response received.');
            })
            .catch(error => {
                console.error('Error fetching RAG response:', error);
                addLog(`Error: ${error.message}`);
                addChatMessage('Sorry, there was an error communicating with the RAG model.', 'rag');
            });
        }
    }

    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    userQueryInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    clearLogBtn.addEventListener('click', () => {
        logContent.innerHTML = '';
        addLog('Logs cleared.');
    });

    // Initial log
    addLog('RAG Communicator initialized.');
}); 