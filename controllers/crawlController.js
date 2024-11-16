const axios = require('axios');
const sessionManager = require('../utils/sessionManager');

const server_backend_url = process.env.SERVER_BACKEND_URL;
const client_crawler_engine_url = process.env.CLIENT_CRAWLER_ENGINE_URL;

// Queue to store pending crawl requests
const crawlQueue = [];

// Fetch pending crawls from the server and add them to the queue
exports.getPendingCrawls = async () => {
    try {
        const sessionId = sessionManager.getSessionId();

        if (!sessionId) {
            console.error('Session ID not available. Please register first.');
            return;
        }

        // Fetch pending crawls from the server
        const response = await axios.get(`${server_backend_url}/api/session/get-pending-crawls?session_id=${sessionId}`);
        const pendingCrawls = response.data.crawls;

        if (pendingCrawls.length === 0) {
            console.log('No pending crawls found.');
            return;
        }

        // Add each crawl request to the queue with required properties
        pendingCrawls.forEach((crawl) => {
            crawlQueue.push({
                _id: crawl._id, // Include crawl ID for updating status later
                url: crawl.url,
                maxUrls: crawl.maxUrls,
                respectRobotFlag: crawl.respectRobotFlag !== undefined ? crawl.respectRobotFlag : true, // Default to true
            });
        });

        // Extract crawl IDs and update their status to "In Progress"
        const crawlIds = pendingCrawls.map((crawl) => crawl._id);
        await updateCrawlStatus(crawlIds);

        console.log('Crawl requests added to queue:', crawlQueue);
    } catch (error) {
        console.error('Error fetching pending crawls:', error);
    }
};

// Update the status of crawl requests on the server
const updateCrawlStatus = async (crawlIds) => {
    try {
        await axios.post(`${server_backend_url}/api/session/update-crawl-status`, {
            crawlIds,
            status: 'in_progress',
        });
        console.log('Crawl status updated to "in_progress" for IDs:', crawlIds);
    } catch (error) {
        console.error('Error updating crawl status:', error);
        throw new Error('Failed to update crawl status');
    }
};

// Continuously process crawl requests from the queue
const processCrawlQueue = async () => {
    while (true) {
        if (crawlQueue.length === 0) {
            console.log('Crawl queue is empty. Waiting...');
            await sleep(5000); // Wait for 5 seconds before checking again
            continue;
        }

        // Get the next crawl request from the queue
        const currentCrawl = crawlQueue.shift(); // Removes and returns the first element in the queue
        console.log('Processing crawl request:', currentCrawl);

        try {

            // Send the crawl request to the crawler_engine backend
            const crawlerEngineResponse = await axios.post(`${client_crawler_engine_url}/crawl`, {
                url: currentCrawl.url,
                maxUrls: currentCrawl.maxUrls,
                respectRobotFlag: currentCrawl.respectRobotFlag,
            });

            const scrapedData = crawlerEngineResponse.data;
            console.log('Scraped data received:', scrapedData);

            // Send the scraped data and status back to the server backend
            await axios.post(`${server_backend_url}/api/session/update-crawl-result`, {
                crawlId: currentCrawl._id,
                status: 'completed',
                data: scrapedData,
                url: currentCrawl.url,
                maxUrls: currentCrawl.maxUrls,
            });

            console.log(`Crawl request ${currentCrawl._id} marked as completed.`);
        } catch (error) {
            console.error('Error during crawl request processing:', error);

            // Handle failure: Send failure status back to the server backend
            await axios.post(`${server_backend_url}/api/session/update-crawl-result`, {
                crawlId: currentCrawl._id,
                status: 'failed',
                error: error.message,
                data: null,
                url: currentCrawl.url,
                maxUrls: currentCrawl.maxUrls,
            });

            console.log(`Crawl request ${currentCrawl._id} marked as failed.`);
        }
    }
};

// Utility function to introduce a delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Export the crawlQueue and processCrawlQueue for use in other parts of the client_backend
exports.crawlQueue = crawlQueue;
exports.processCrawlQueue = processCrawlQueue;
