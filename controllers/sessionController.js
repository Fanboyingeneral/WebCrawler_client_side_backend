// client_side_backend/controllers/sessionController.js
const axios = require('axios'); // To send the HTTP request to the main backend
const sessionManager = require('../utils/sessionManager');
const server_backend_url = process.env.SERVER_BACKEND_URL; 

// Controller function to register a new session
exports.registerSession = async () => {
    try {
        // Send a POST request to the main backend to register a new session
        const response = await axios.post(`${server_backend_url}/api/session/register`);

        const sessionId = response.data.session_id;
        sessionManager.setSessionId(sessionId);
        // Log the session ID or do something with it
        console.log('Session ID:', response.data.session_id);
    } catch (error) {
        console.error('Error registering session:', error);
    }
};
