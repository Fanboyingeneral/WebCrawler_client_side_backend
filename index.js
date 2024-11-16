// client_backend/index.js
const express = require('express');
const sessionRoutes = require('./routes/sessionRoutes');
const crawlRoutes = require('./routes/crawlRoutes');
const {registerSession} = require('./controllers/sessionController');
const startCrawlScheduler = require('./utils/scheduler');
const { processCrawlQueue } = require('./controllers/crawlController');

const app = express();
const PORT = 6000; // Client backend port

// Middleware
app.use(express.json({ limit: '50mb' })); // Adjust the limit as needed
app.use(express.urlencoded({ limit: '50mb', extended: true }));


// Routes
app.use('/api/session', sessionRoutes);
app.use('/api/crawl', crawlRoutes);



// Start server
app.listen(PORT, () => {
    
    console.log(`Client backend server running on port ${PORT}`);
        // Wait 50 seconds before executing the remaining steps
        setTimeout(() => {
            console.log('Initializing after 50 seconds delay...');
            registerSession(); // Register a new session
            startCrawlScheduler(); // Start the crawl scheduler
            processCrawlQueue(); // Process the crawl queue
        }, 50000); // 50 seconds delay
});
