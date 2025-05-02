// ESM module - import syntax required
import fetch from 'node-fetch';

// Configuration
const BASE_URL = 'http://localhost:5000';
const ADMIN_EMAIL = 'admin@example.com';
const ADMIN_PASSWORD = 'password123';
const ARTICLE_ID = 4; // ID of an existing article to update
const SCHEDULED_TIME = new Date(Date.now() + 5 * 60000).toISOString(); // 5 minutes from now

// Add type: module to package.json
async function run() {
  try {
    console.log('Starting test of scheduled publishing flow');
    console.log(`Scheduling article ${ARTICLE_ID} to publish at ${SCHEDULED_TIME}`);
    
    // Step 1: Login to get auth token
    console.log('\n1. Logging in as admin...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
      }),
    });
    
    if (!loginResponse.ok) {
      throw new Error(`Login failed: ${await loginResponse.text()}`);
    }
    
    const loginData = await loginResponse.json();
    const token = loginData.token;
    console.log('Login successful, got auth token');
    
    // Step 2: Schedule the article to be published
    console.log('\n2. Scheduling article to be published...');
    const scheduleResponse = await fetch(`${BASE_URL}/api/admin/articles/${ARTICLE_ID}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        status: 'published',
        scheduledPublishAt: SCHEDULED_TIME,
        remarks: 'This article is scheduled for future publishing'
      }),
    });
    
    if (!scheduleResponse.ok) {
      throw new Error(`Scheduling failed: ${await scheduleResponse.text()}`);
    }
    
    const scheduledArticle = await scheduleResponse.json();
    console.log('Article scheduling response:', JSON.stringify(scheduledArticle, null, 2));
    
    // Step 3: Get the article to verify its status
    console.log('\n3. Verifying article status...');
    const getArticleResponse = await fetch(`${BASE_URL}/api/articles/${ARTICLE_ID}/full`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    
    if (!getArticleResponse.ok) {
      throw new Error(`Getting article failed: ${await getArticleResponse.text()}`);
    }
    
    const articleData = await getArticleResponse.json();
    console.log('Article current status:', articleData.article.status);
    console.log('Article published flag:', articleData.article.published);
    console.log('Article scheduledPublishAt:', articleData.article.scheduledPublishAt);
    
    console.log('\nTest complete!');
    console.log('The article should be automatically published by the scheduler at the scheduled time.');
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

run();