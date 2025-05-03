#!/usr/bin/env node

/**
 * MySQL Seed Data Script
 *
 * This script populates the MySQL database with sample data for testing purposes.
 * It creates users (admins and authors), categories, tags, articles, and all related data.
 *
 * Usage: node scripts/mysql-seed-data.js
 */

const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const { setupMySqlDatabase } = require('./mysql-direct-setup');

async function generateSampleData() {
  console.log("Starting MySQL sample data generation...");

  // Get MySQL connection details from environment variables
  const config = {
    host: process.env.MYSQL_HOST || 'localhost',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'blog_db',
    port: process.env.MYSQL_PORT ? parseInt(process.env.MYSQL_PORT) : 3306
  };
  
  let connection;
  
  try {
    // Ensure database and tables exist first
    await setupMySqlDatabase();
    
    // Connect to the database
    connection = await mysql.createConnection({
      host: config.host,
      user: config.user,
      password: config.password,
      database: config.database,
      port: config.port
    });
    
    console.log("Connected to database, generating sample data...");
    
    // Function to hash passwords
    const hashPassword = async (password) => {
      const salt = await bcrypt.genSalt(10);
      return bcrypt.hash(password, salt);
    };
    
    // Helper function to generate a slug from a title
    const generateSlug = (text) => {
      return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
    };
    
    // Clear existing data to avoid conflicts
    await connection.query("SET FOREIGN_KEY_CHECKS = 0");
    await connection.query("TRUNCATE TABLE notifications");
    await connection.query("TRUNCATE TABLE comments");
    await connection.query("TRUNCATE TABLE article_co_authors");
    await connection.query("TRUNCATE TABLE article_tags");
    await connection.query("TRUNCATE TABLE article_categories");
    await connection.query("TRUNCATE TABLE assets");
    await connection.query("TRUNCATE TABLE articles");
    await connection.query("TRUNCATE TABLE tags");
    await connection.query("TRUNCATE TABLE categories");
    await connection.query("TRUNCATE TABLE users");
    await connection.query("SET FOREIGN_KEY_CHECKS = 1");
    
    // ==================== Create Users ====================
    console.log("Creating users (admins and authors)...");
    
    // Admin users
    const adminPassword = await hashPassword('password123');
    const admins = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        bio: 'Main administrator of the blog system',
        can_publish: true,
      },
      {
        name: 'John Admin',
        email: 'john@example.com',
        password: adminPassword,
        role: 'admin',
        bio: 'Secondary administrator and content manager',
        can_publish: true,
      }
    ];
    
    // Author users
    const authorPassword = await hashPassword('password123');
    const authors = [
      {
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        password: authorPassword,
        role: 'author',
        bio: 'Science and technology writer with expertise in AI and machine learning',
        can_publish: true,
      },
      {
        name: 'Michael Chen',
        email: 'michael@example.com',
        password: authorPassword,
        role: 'author',
        bio: 'Business and economics writer focusing on global markets',
        can_publish: false,
      },
      {
        name: 'Priya Sharma',
        email: 'priya@example.com',
        password: authorPassword,
        role: 'author',
        bio: 'Health and wellness expert with medical background',
        can_publish: true,
      },
      {
        name: 'Javier Rodriguez',
        email: 'javier@example.com',
        password: authorPassword,
        role: 'author',
        bio: 'Political correspondent and international affairs analyst',
        can_publish: false,
      },
      {
        name: 'Emma Wilson',
        email: 'emma@example.com',
        password: authorPassword,
        role: 'author',
        bio: 'Culture and arts writer specializing in film and literature',
        can_publish: true,
      }
    ];
    
    // Insert all users
    const allUsers = [...admins, ...authors];
    for (const user of allUsers) {
      await connection.query(
        `INSERT INTO users (name, email, password, role, bio, can_publish) VALUES (?, ?, ?, ?, ?, ?)`,
        [user.name, user.email, user.password, user.role, user.bio, user.can_publish]
      );
    }
    console.log(`Created ${allUsers.length} users (${admins.length} admins, ${authors.length} authors)`);
    
    // ==================== Create Categories ====================
    console.log("Creating categories...");
    const categories = [
      {
        name: 'Technology',
        slug: 'technology',
        description: 'Latest news and trends in technology',
      },
      {
        name: 'Business',
        slug: 'business',
        description: 'Business strategies, market analysis and economic trends',
      },
      {
        name: 'Health',
        slug: 'health',
        description: 'Tips and information about health and wellness',
      },
      {
        name: 'Politics',
        slug: 'politics',
        description: 'Political developments and analysis',
      },
      {
        name: 'Culture',
        slug: 'culture',
        description: 'Arts, entertainment, and cultural phenomena',
      },
      {
        name: 'Science',
        slug: 'science',
        description: 'Scientific discoveries and research',
      },
      {
        name: 'Education',
        slug: 'education',
        description: 'Educational trends, policies, and resources',
      },
      {
        name: 'Career Development',
        slug: 'career-development',
        description: 'Career advice, professional growth, and workplace trends',
      }
    ];
    
    for (const category of categories) {
      await connection.query(
        `INSERT INTO categories (name, slug, description) VALUES (?, ?, ?)`,
        [category.name, category.slug, category.description]
      );
    }
    console.log(`Created ${categories.length} categories`);
    
    // ==================== Create Tags ====================
    console.log("Creating tags...");
    const tags = [
      { name: 'AI', slug: 'ai' },
      { name: 'Machine Learning', slug: 'machine-learning' },
      { name: 'Blockchain', slug: 'blockchain' },
      { name: 'Startup', slug: 'startup' },
      { name: 'Mental Health', slug: 'mental-health' },
      { name: 'Nutrition', slug: 'nutrition' },
      { name: 'Global Politics', slug: 'global-politics' },
      { name: 'Film', slug: 'film' },
      { name: 'Literature', slug: 'literature' },
      { name: 'Climate Change', slug: 'climate-change' },
      { name: 'Space', slug: 'space' },
      { name: 'Productivity', slug: 'productivity' },
      { name: 'Leadership', slug: 'leadership' },
      { name: 'Future Trends', slug: 'future-trends' }
    ];
    
    for (const tag of tags) {
      await connection.query(
        `INSERT INTO tags (name, slug) VALUES (?, ?)`,
        [tag.name, tag.slug]
      );
    }
    console.log(`Created ${tags.length} tags`);
    
    // ==================== Create Articles ====================
    console.log("Creating articles...");
    
    // Fetch user IDs for reference
    const [userRows] = await connection.query("SELECT id, name, role FROM users");
    const users = userRows.map(row => ({ id: row.id, name: row.name, role: row.role }));
    const authorUsers = users.filter(user => user.role === 'author');
    const adminUsers = users.filter(user => user.role === 'admin');
    
    // Fetch category IDs for reference
    const [categoryRows] = await connection.query("SELECT id, name FROM categories");
    const categoryMap = {};
    categoryRows.forEach(row => { categoryMap[row.name] = row.id; });
    
    // Fetch tag IDs for reference
    const [tagRows] = await connection.query("SELECT id, name FROM tags");
    const tagMap = {};
    tagRows.forEach(row => { tagMap[row.name] = row.id; });
    
    // Sample article data
    const articles = [
      {
        title: 'The Future of Artificial Intelligence',
        content: '<p>Artificial Intelligence (AI) continues to evolve at a rapid pace. Recent breakthroughs in machine learning and neural networks have pushed the boundaries of what was once thought possible.</p><p>In this article, we explore the latest developments in AI and what they might mean for various industries, from healthcare to finance.</p><h2>Machine Learning Advancements</h2><p>Machine learning algorithms are becoming increasingly sophisticated, capable of processing vast amounts of data and identifying patterns that human analysts might miss. This has led to breakthroughs in areas such as medical diagnosis, where AI systems can now detect certain conditions with greater accuracy than human doctors.</p><h2>Ethical Considerations</h2><p>As AI systems become more powerful, questions of ethics and governance become increasingly important. How do we ensure that AI systems make decisions that align with human values? How do we prevent algorithmic bias? These questions are at the forefront of AI research and policy discussions.</p><h2>The Future Landscape</h2><p>The future of AI is likely to be characterized by greater integration into our daily lives, with more sophisticated virtual assistants, autonomous vehicles, and smart homes. We may also see AI play a greater role in addressing global challenges such as climate change and public health.</p><p>However, this future also comes with challenges, including potential job displacement and questions about privacy and security. Navigating these challenges will require thoughtful policy-making and an ongoing dialogue between technologists, policymakers, and the public.</p>',
        excerpt: 'Explore the latest developments in artificial intelligence and what they might mean for various industries and society as a whole.',
        authorId: authorUsers[0].id, // Sarah Johnson
        status: 'published',
        published: true,
        publishedAt: new Date().toISOString(),
        featuredImage: '/uploads/ai-future.jpg',
        metaTitle: 'The Future of Artificial Intelligence | Latest Trends and Developments',
        metaDescription: 'Explore the latest developments in AI and what they mean for industries and society in the coming years.',
        keywords: JSON.stringify(['AI', 'Future Technology', 'Machine Learning', 'Neural Networks']),
        viewCount: 250,
        categories: ['Technology', 'Science'],
        tags: ['AI', 'Machine Learning', 'Future Trends'],
        coAuthors: [authorUsers[1].id] // Michael Chen
      },
      {
        title: 'Understanding Global Supply Chain Challenges',
        content: '<p>Global supply chains have faced unprecedented challenges in recent years, from the COVID-19 pandemic to geopolitical tensions.</p><p>In this comprehensive analysis, we examine the key factors affecting global supply chains and strategies for building resilience.</p><h2>Pandemic Disruptions</h2><p>The COVID-19 pandemic exposed vulnerabilities in global supply chains that many businesses had not previously considered. Lockdowns, border closures, and labor shortages created bottlenecks and delays that rippled throughout the global economy.</p><h2>Geopolitical Factors</h2><p>Rising tensions between major economic powers have also played a role in supply chain disruptions. Trade disputes, tariffs, and sanctions have forced businesses to reconsider their sourcing strategies and supply chain configurations.</p><h2>Building Resilience</h2><p>In response to these challenges, businesses are implementing various strategies to build more resilient supply chains. These include diversifying suppliers, nearshoring or reshoring production, increasing inventory buffers, and investing in digital technologies for better visibility and predictive analytics.</p><p>While these strategies can help mitigate risks, they often come with trade-offs in terms of cost and efficiency. Finding the right balance requires a careful assessment of risks and business priorities.</p>',
        excerpt: 'An analysis of the major disruptions affecting global supply chains and strategies for building resilience in an uncertain world.',
        authorId: authorUsers[1].id, // Michael Chen
        status: 'published',
        published: true,
        publishedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        featuredImage: '/uploads/supply-chain.jpg',
        metaTitle: 'Global Supply Chain Challenges | Analysis and Solutions',
        metaDescription: 'Learn about the major disruptions affecting global supply chains and strategies for building resilience.',
        keywords: JSON.stringify(['Supply Chain', 'Global Trade', 'Business Resilience', 'Logistics']),
        viewCount: 180,
        categories: ['Business'],
        tags: ['Global Politics', 'Leadership'],
        coAuthors: []
      },
      {
        title: 'Nutrition Myths Debunked by Science',
        content: '<p>The field of nutrition is often plagued by myths and misconceptions that can lead people down paths that aren\'t supported by scientific evidence.</p><p>This article examines some of the most common nutrition myths and what the science actually says.</p><h2>Myth 1: Carbs Are Bad for You</h2><p>The idea that carbohydrates are inherently unhealthy has gained popularity in recent years, but the science paints a more nuanced picture. Whole, unprocessed sources of carbohydrates provide essential nutrients and fiber that are important for health. The problem lies more with refined and processed carbohydrates, which can contribute to health issues when consumed in excess.</p><h2>Myth 2: Fat Is the Enemy</h2><p>For decades, dietary fat was demonized as the primary culprit in obesity and heart disease. However, research has shown that healthy fats, such as those found in avocados, nuts, and olive oil, are important for various bodily functions and can actually promote heart health.</p><h2>Myth 3: Eating Small, Frequent Meals Boosts Metabolism</h2><p>Many people believe that eating small, frequent meals throughout the day keeps the metabolism running at a higher rate. However, research suggests that meal frequency has minimal impact on metabolic rate or weight loss. What matters more is the total caloric intake and the quality of the food consumed.</p><p>By understanding the science behind these and other nutrition myths, individuals can make more informed decisions about their diets and overall health.</p>',
        excerpt: 'Separating fact from fiction: A science-based examination of common nutrition myths that may be affecting your health choices.',
        authorId: authorUsers[2].id, // Priya Sharma
        status: 'published',
        published: true,
        publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        featuredImage: '/uploads/nutrition.jpg',
        metaTitle: 'Common Nutrition Myths Debunked by Science | Health Facts',
        metaDescription: 'Learn the truth behind common nutrition myths and make better informed decisions about your diet and health.',
        keywords: JSON.stringify(['Nutrition', 'Diet Myths', 'Healthy Eating', 'Food Science']),
        viewCount: 320,
        categories: ['Health'],
        tags: ['Nutrition', 'Mental Health'],
        coAuthors: [authorUsers[0].id] // Sarah Johnson
      },
      {
        title: 'The Changing Landscape of International Relations',
        content: '<p>International relations are undergoing significant transformations in the 21st century, with shifts in power dynamics, emerging challenges, and evolving institutions.</p><p>This analysis explores key trends shaping the global order and their implications for diplomacy and global governance.</p><h2>Power Shifts</h2><p>The global distribution of power is shifting, with the rise of countries like China, India, and Brazil challenging the traditional Western-dominated international order. This multipolar world presents both opportunities and challenges for international cooperation and conflict resolution.</p><h2>Transnational Challenges</h2><p>Many of the most pressing challenges facing the world today, from climate change to terrorism to pandemics, transcend national borders and require coordinated international responses. These transnational issues are reshaping how states interact and cooperate with one another.</p><h2>Institutional Evolution</h2><p>International institutions such as the United Nations, World Trade Organization, and regional organizations are adapting to these changing realities, albeit at different paces and with varying degrees of success. Reform efforts are ongoing, but face significant political and practical obstacles.</p><p>Understanding these evolving dynamics is essential for policymakers, diplomats, and citizens seeking to navigate an increasingly complex global landscape.</p>',
        excerpt: 'An analysis of the shifting power dynamics, emerging challenges, and evolving institutions shaping international relations in the 21st century.',
        authorId: authorUsers[3].id, // Javier Rodriguez
        status: 'review',
        published: false,
        featuredImage: '/uploads/international-relations.jpg',
        metaTitle: 'The Changing Landscape of International Relations | Global Analysis',
        metaDescription: 'Explore the shifting power dynamics and emerging challenges shaping international relations in the 21st century.',
        keywords: JSON.stringify(['International Relations', 'Global Politics', 'Diplomacy', 'World Order']),
        viewCount: 0,
        categories: ['Politics'],
        tags: ['Global Politics', 'Leadership'],
        coAuthors: []
      },
      {
        title: 'Cinema\'s Digital Revolution: How Technology is Transforming Filmmaking',
        content: '<p>The art and industry of filmmaking has undergone a profound transformation over the past two decades, driven by rapid advances in digital technology.</p><p>This article explores how these changes have affected every aspect of cinema, from production to distribution to audience experience.</p><h2>Production Innovations</h2><p>Digital cameras have democratized filmmaking, making high-quality equipment more accessible and affordable. Software for editing, visual effects, and animation has similarly evolved, enabling filmmakers to realize their visions in ways that were once technically or financially impossible.</p><h2>Changing Distribution Models</h2><p>The rise of streaming platforms has revolutionized how films reach audiences, challenging the traditional theatrical release model and creating new opportunities for independent and international cinema. This shift has implications for how films are financed, marketed, and consumed.</p><h2>The Viewer Experience</h2><p>From 3D and IMAX to virtual reality and interactive storytelling, technology is creating new possibilities for immersive cinematic experiences. At the same time, most people now watch films on personal devices, raising questions about what constitutes a "cinematic" experience.</p><p>While these technological changes have brought many benefits, they also raise concerns about preservation, access, and the future of the theatrical experience. As cinema continues to evolve, finding the right balance between innovation and tradition remains a key challenge.</p>',
        excerpt: 'Explore how digital technology has transformed every aspect of filmmaking, from production techniques to distribution models to the audience experience.',
        authorId: authorUsers[4].id, // Emma Wilson
        status: 'draft',
        published: false,
        featuredImage: '/uploads/digital-cinema.jpg',
        metaTitle: 'Cinema\'s Digital Revolution | The Transformation of Filmmaking',
        metaDescription: 'Discover how digital technology has revolutionized the art and business of filmmaking over the past two decades.',
        keywords: JSON.stringify(['Film', 'Digital Cinema', 'Movie Technology', 'Streaming']),
        viewCount: 0,
        categories: ['Culture', 'Technology'],
        tags: ['Film', 'Technology', 'Future Trends'],
        coAuthors: [authorUsers[3].id] // Javier Rodriguez
      },
      {
        title: 'Latest Trends in Educational Technology',
        content: '<p>Educational technology continues to evolve rapidly, with new tools and approaches transforming how teachers teach and students learn.</p><p>This article examines some of the most significant recent developments in edtech and their potential impact on education at all levels.</p><h2>Personalized Learning Platforms</h2><p>Adaptive learning systems use artificial intelligence to tailor educational content and activities to individual students' needs, abilities, and learning styles. These platforms collect data on student performance and adjust the difficulty and type of content accordingly, providing a more personalized learning experience.</p><h2>Immersive Technologies</h2><p>Virtual reality (VR) and augmented reality (AR) are creating new possibilities for immersive, experiential learning. From virtual field trips to complex scientific simulations, these technologies can make abstract concepts more concrete and engage students in ways that traditional methods cannot.</p><h2>Collaborative Tools</h2><p>Digital collaboration tools have become increasingly sophisticated, enabling students to work together seamlessly across distances and time zones. These platforms facilitate project-based learning and help students develop the collaboration skills that are crucial in the modern workplace.</p><p>While these technologies offer exciting possibilities, their effective implementation requires thoughtful integration into curriculum, adequate teacher training, and attention to issues of equity and access. The most successful educational technology initiatives are those that focus first on pedagogical goals and then select appropriate technologies to support those goals.</p>',
        excerpt: 'An overview of the most important recent developments in educational technology and their potential to transform teaching and learning.',
        authorId: adminUsers[0].id, // Admin User
        status: 'review',
        published: false,
        featuredImage: '/uploads/edtech.jpg',
        metaTitle: 'Latest Trends in Educational Technology | EdTech Innovations',
        metaDescription: 'Explore the most significant recent developments in educational technology and their potential impact on teaching and learning.',
        keywords: JSON.stringify(['EdTech', 'Education', 'Learning Technology', 'Digital Learning']),
        viewCount: 0,
        categories: ['Education', 'Technology'],
        tags: ['Technology', 'Future Trends'],
        coAuthors: [authorUsers[2].id] // Priya Sharma
      },
      {
        title: 'Building a Career in Data Science',
        content: '<p>Data science has emerged as one of the most in-demand and lucrative career fields of the 21st century.</p><p>This comprehensive guide provides practical advice for those looking to enter or advance in this exciting and rapidly evolving field.</p><h2>Essential Skills</h2><p>Successful data scientists typically need a combination of technical and non-technical skills. On the technical side, these include programming (especially Python and/or R), statistics and probability, data wrangling and visualization, machine learning, and database knowledge. Equally important are skills like critical thinking, problem-solving, communication, and domain expertise in the industry where you apply data science.</p><h2>Education and Certifications</h2><p>While many data scientists have advanced degrees in fields like computer science, statistics, or mathematics, there are multiple pathways into the field. Bootcamps, online courses, certifications, and self-directed learning can all be viable options, especially when combined with practical project experience that demonstrates your capabilities.</p><h2>Building a Portfolio</h2><p>In data science, showing is often more powerful than telling. Building a portfolio of projects that showcase your skills and problem-solving approach can be one of the most effective ways to break into the field. These projects can involve public datasets, competitions on platforms like Kaggle, or contributions to open-source projects.</p><p>As with any career, persistence and continuous learning are key to success in data science. The field is constantly evolving, with new techniques, tools, and applications emerging regularly. Staying curious and adaptable will serve you well in this dynamic and rewarding profession.</p>',
        excerpt: 'A practical guide to launching and building a successful career in data science, from essential skills to education options to portfolio development.',
        authorId: authorUsers[1].id, // Michael Chen
        status: 'published',
        published: true,
        publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
        featuredImage: '/uploads/data-science-career.jpg',
        metaTitle: 'Building a Career in Data Science | Professional Guide',
        metaDescription: 'Learn how to launch and advance a successful career in data science with this comprehensive professional guide.',
        keywords: JSON.stringify(['Data Science', 'Career Development', 'Tech Jobs', 'Professional Skills']),
        viewCount: 420,
        categories: ['Career Development', 'Technology'],
        tags: ['AI', 'Leadership', 'Productivity'],
        coAuthors: []
      }
    ];
    
    // Insert articles and their relationships
    for (const article of articles) {
      const slug = generateSlug(article.title);
      
      // Insert the article
      const [result] = await connection.query(
        `INSERT INTO articles (title, slug, content, excerpt, author_id, status, published, featured_image, 
          meta_title, meta_description, keywords, view_count, 
          published_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
        [article.title, slug, article.content, article.excerpt, article.authorId, 
         article.status, article.published, article.featuredImage, 
         article.metaTitle, article.metaDescription, article.keywords, article.viewCount,
         article.publishedAt]
      );
      
      const articleId = result.insertId;
      
      // Add categories
      for (const categoryName of article.categories) {
        const categoryId = categoryMap[categoryName];
        if (categoryId) {
          await connection.query(
            `INSERT INTO article_categories (article_id, category_id) VALUES (?, ?)`,
            [articleId, categoryId]
          );
        }
      }
      
      // Add tags
      for (const tagName of article.tags) {
        const tagId = tagMap[tagName];
        if (tagId) {
          await connection.query(
            `INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)`,
            [articleId, tagId]
          );
        }
      }
      
      // Add co-authors
      for (const coAuthorId of article.coAuthors) {
        await connection.query(
          `INSERT INTO article_co_authors (article_id, user_id) VALUES (?, ?)`,
          [articleId, coAuthorId]
        );
      }
    }
    
    console.log(`Created ${articles.length} articles with their relationships`);
    
    // ==================== Create Comments ====================
    console.log("Creating comments...");
    
    // Get published article IDs
    const [publishedArticles] = await connection.query(
      "SELECT id, title FROM articles WHERE published = 1"
    );
    
    // Sample comments
    const commentsSamples = [
      {
        content: "This is an excellent article! Very informative and well-written.",
        authorName: "John Reader",
        authorEmail: "john.reader@example.com",
        isApproved: true
      },
      {
        content: "I have a question about one of the points you made. Could you elaborate more on that?",
        authorName: "Curious Reader",
        authorEmail: "curious@example.com",
        isApproved: true
      },
      {
        content: "Thanks for addressing this important topic. I've been looking for clear information on this.",
        authorName: "Grateful Reader",
        authorEmail: "grateful@example.com",
        isApproved: true
      },
      {
        content: "I disagree with some of your points. Here's why...",
        authorName: "Critical Thinker",
        authorEmail: "critical@example.com",
        isApproved: true
      },
      {
        content: "Have you considered the implications of this for related fields?",
        authorName: "Academic Reader",
        authorEmail: "academic@example.com",
        isApproved: true
      },
      {
        content: "This comment is awaiting moderation.",
        authorName: "New Commenter",
        authorEmail: "new@example.com",
        isApproved: false
      }
    ];
    
    // Add comments to published articles
    let commentCount = 0;
    for (const article of publishedArticles) {
      // Add 2-4 random comments per article
      const numComments = Math.floor(Math.random() * 3) + 2;
      for (let i = 0; i < numComments; i++) {
        const comment = commentsSamples[Math.floor(Math.random() * commentsSamples.length)];
        
        const [result] = await connection.query(
          `INSERT INTO comments (content, author_name, author_email, article_id, is_approved, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, NOW(), NOW())`,
          [comment.content, comment.authorName, comment.authorEmail, article.id, comment.isApproved]
        );
        
        const commentId = result.insertId;
        commentCount++;
        
        // Add a reply to some comments (50% chance)
        if (Math.random() > 0.5) {
          const reply = {
            content: "Thank you for your comment! I appreciate your feedback.",
            authorName: article.title.includes("AI") ? "Sarah Johnson" : "Article Author",
            authorEmail: "author@example.com",
            isApproved: true
          };
          
          await connection.query(
            `INSERT INTO comments (content, author_name, author_email, article_id, parent_id, is_approved, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())`,
            [reply.content, reply.authorName, reply.authorEmail, article.id, commentId, reply.isApproved]
          );
          
          // Update reply count for the parent comment
          await connection.query(
            `UPDATE comments SET reply_count = reply_count + 1 WHERE id = ?`,
            [commentId]
          );
          
          commentCount++;
        }
      }
    }
    
    console.log(`Created ${commentCount} comments`);
    
    // ==================== Create Notifications ====================
    console.log("Creating notifications...");
    
    // Get article and user information for notifications
    const [articleInfo] = await connection.query(
      "SELECT id, author_id, title FROM articles"
    );
    
    const notificationTypes = [
      {
        type: 'article_published',
        title: 'Article Published',
        messageTemplate: 'Your article "{title}" has been published.'
      },
      {
        type: 'article_approved',
        title: 'Article Approved',
        messageTemplate: 'Your article "{title}" has been approved for publication.'
      },
      {
        type: 'article_rejected',
        title: 'Article Needs Revision',
        messageTemplate: 'Your article "{title}" requires some revisions before publication.'
      },
      {
        type: 'comment_received',
        title: 'New Comment Received',
        messageTemplate: 'Someone commented on your article "{title}".'
      }
    ];
    
    let notificationCount = 0;
    
    // Create 2-3 notifications for each author
    for (const user of authorUsers) {
      // Get articles by this author
      const authorArticles = articleInfo.filter(a => a.author_id === user.id);
      if (authorArticles.length === 0) continue;
      
      // Create 2-3 random notifications
      const numNotifications = Math.floor(Math.random() * 2) + 2;
      for (let i = 0; i < numNotifications; i++) {
        const article = authorArticles[Math.floor(Math.random() * authorArticles.length)];
        const notificationType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        
        const message = notificationType.messageTemplate.replace('{title}', article.title);
        
        await connection.query(
          `INSERT INTO notifications (user_id, type, title, message, article_id, read, created_at)
           VALUES (?, ?, ?, ?, ?, ?, NOW())`,
          [user.id, notificationType.type, notificationType.title, message, article.id, Math.random() > 0.5 ? 1 : 0]
        );
        
        notificationCount++;
      }
    }
    
    console.log(`Created ${notificationCount} notifications`);
    
    console.log("\nSample data generation completed successfully!");
    console.log("\nYou can now log in with the following credentials:");
    console.log("Admin: admin@example.com / password123");
    console.log("Author: sarah@example.com / password123");
    
  } catch (error) {
    console.error("Error during sample data generation:", error);
  } finally {
    if (connection) {
      await connection.end();
      console.log("Database connection closed");
    }
  }
}

// Run the function if this script is called directly
if (require.main === module) {
  generateSampleData().catch(error => {
    console.error("Failed to generate sample data:", error);
    process.exit(1);
  });
}

module.exports = { generateSampleData };
