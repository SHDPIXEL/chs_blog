import cron from 'node-cron';
import { processScheduledArticles } from '../jobs/scheduledPublishing';
import { log } from '../vite';

/**
 * Function to process scheduled articles with retry logic
 */
async function processWithRetry(retries: number, delay: number) {
  let attempt = 0;
  while (attempt < retries) {
    try {
      const result = await processScheduledArticles();
      if (result.published > 0) {
        log(`Published ${result.published} scheduled article(s)`, 'scheduler');
      }
      return; // Success, exit the loop
    } catch (error) {
      attempt++;
      log(`Error in attempt ${attempt}: ${error.message}`, 'scheduler');
      if (attempt >= retries) {
        log('Max retries reached, job failed permanently', 'scheduler');
        // Optionally alert, send notifications, or update a failure log table
      } else {
        log(`Retrying in ${delay / 1000} seconds...`, 'scheduler');
        await sleep(delay); // Wait before retrying
      }
    }
  }
}

/**
 * Sleep function to introduce delay between retries
 */
function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Start cron job that processes scheduled articles every minute
 */
export function startCronJobs() {
  // Run immediately on start
  const retries = 3; // Retry up to 3 times
  const delay = 3000; // Wait for 3 seconds between retries
  processWithRetry(retries, delay)
    .then(() => log('Initial run completed successfully', 'scheduler'))
    .catch((error) => log(`Initial run failed: ${error.message}`, 'scheduler'));

  // Schedule a job to run every minute
  cron.schedule('* * * * *', async () => {
    await processWithRetry(retries, delay);
  });
}
