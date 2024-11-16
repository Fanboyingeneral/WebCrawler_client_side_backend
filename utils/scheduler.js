const { getPendingCrawls } = require('../controllers/crawlController');

const startCrawlScheduler = () => {
    console.log('Starting crawl scheduler...');

    // Run the function every 60 seconds
    setInterval(async () => {
        try {
            console.log('Fetching pending crawls...');
            // Call the getPendingCrawls function
            await getPendingCrawls();
        } catch (error) {
            console.error('Error during scheduled fetch of pending crawls:', error);
        }
    }, 60 * 1000); // 60,000 ms = 1 minute
};

module.exports = startCrawlScheduler;
