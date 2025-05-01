import { processScheduledArticles } from '../jobs/scheduledPublishing';
import { log } from '../vite';

/**
 * Scheduler service to run background jobs at regular intervals
 */
export class SchedulerService {
  private scheduledJobsIntervals: { [key: string]: NodeJS.Timeout } = {};
  private isRunning: boolean = false;

  constructor() {}

  /**
   * Start the scheduler service
   */
  public start(): void {
    if (this.isRunning) {
      log('Scheduler service is already running', 'scheduler');
      return;
    }

    this.isRunning = true;
    log('Starting scheduler service', 'scheduler');

    // Schedule the publishing job to run every minute
    this.scheduleJob('publishScheduledArticles', async () => {
      const result = await processScheduledArticles();
      if (result.published > 0) {
        log(`Published ${result.published} scheduled article(s)`, 'scheduler');
      }
    }, 60 * 1000); // Run every minute
  }

  /**
   * Stop the scheduler service
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    // Clear all scheduled intervals
    Object.keys(this.scheduledJobsIntervals).forEach(jobId => {
      clearInterval(this.scheduledJobsIntervals[jobId]);
      delete this.scheduledJobsIntervals[jobId];
    });

    this.isRunning = false;
    log('Scheduler service stopped', 'scheduler');
  }

  /**
   * Schedule a job to run at a specific interval
   * @param jobId Unique identifier for the job
   * @param jobFunction The function to execute
   * @param interval Interval in milliseconds
   */
  private scheduleJob(jobId: string, jobFunction: () => Promise<void>, interval: number): void {
    // Create a wrapper that catches any errors so the interval continues running
    const safeJobFunction = async () => {
      try {
        await jobFunction();
      } catch (error) {
        log(`Error in scheduled job ${jobId}: ${error}`, 'scheduler');
      }
    };

    // Run once immediately
    safeJobFunction();

    // Schedule to run at the given interval
    this.scheduledJobsIntervals[jobId] = setInterval(safeJobFunction, interval);
    log(`Scheduled job "${jobId}" to run every ${interval / 1000} seconds`, 'scheduler');
  }
}

// Create a singleton instance
export const scheduler = new SchedulerService();