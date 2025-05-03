/**
 * Example Blog List Component for React TypeScript Website
 * 
 * This component demonstrates how to display a list of blog articles
 * fetched from the blog system API.
 */

import React, { useEffect, useState } from 'react';
import { fetchArticles } from './api-utils';

// Define article type
interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage: string;
  publishedAt: string;
  author: {
    name: string;
  };
  categories: Array<{
    name: string;
    slug: string;
  }>;
}

const BlogList: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch articles when component mounts
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchArticles();
        setArticles(data);
        setError(null);
      } catch (err) {
        setError('Failed to load blog articles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, []);

  if (loading) {
    return <div className="blog-list-loading">Loading articles...</div>;
  }

  if (error) {
    return <div className="blog-list-error">{error}</div>;
  }

  return (
    <div className="blog-list-container">
      <h2 className="blog-list-title">Latest Articles</h2>
      
      <div className="blog-list-grid">
        {articles.map((article) => (
          <article key={article.id} className="blog-card">
            {article.featuredImage && (
              <div className="blog-card-image">
                <img 
                  src={article.featuredImage.startsWith('http') 
                    ? article.featuredImage 
                    : `${process.env.REACT_APP_BLOG_API_URL}${article.featuredImage}`
                  } 
                  alt={article.title} 
                />
              </div>
            )}
            
            <div className="blog-card-content">
              <h3 className="blog-card-title">
                <a href={`/blog/${article.slug}`}>{article.title}</a>
              </h3>
              
              {article.categories && article.categories.length > 0 && (
                <div className="blog-card-categories">
                  {article.categories.map(category => (
                    <span key={category.slug} className="blog-category-tag">
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
              
              <p className="blog-card-excerpt">{article.excerpt}</p>
              
              <div className="blog-card-meta">
                <span className="blog-card-author">By {article.author?.name || 'Unknown'}</span>
                <span className="blog-card-date">
                  {new Date(article.publishedAt).toLocaleDateString()}
                </span>
              </div>
              
              <a href={`/blog/${article.slug}`} className="blog-card-link">
                Read More
              </a>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default BlogList;
