let sessionId = null; // Variable to store the session ID

module.exports = {
    setSessionId: (id) => {
        sessionId = id; // Setter function
    },
    getSessionId: () => {
        return sessionId; // Getter function
    },
};
