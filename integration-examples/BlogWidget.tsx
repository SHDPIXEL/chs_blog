/**
 * Example Blog Widget Component for React TypeScript Website
 * 
 * This widget displays the latest blog posts and can be embedded
 * on any page of your main website.
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
}

interface BlogWidgetProps {
  count?: number;
  title?: string;
  showExcerpt?: boolean;
  showImage?: boolean;
}

const BlogWidget: React.FC<BlogWidgetProps> = ({
  count = 3,
  title = 'Latest Blog Posts',
  showExcerpt = true,
  showImage = true,
}) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch articles when component mounts
    const loadArticles = async () => {
      try {
        setLoading(true);
        const data = await fetchArticles();
        // Take only the specified number of articles
        setArticles(data.slice(0, count));
        setError(null);
      } catch (err) {
        setError('Failed to load blog articles');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticles();
  }, [count]);

  if (loading) {
    return <div className="blog-widget-loading">Loading latest posts...</div>;
  }

  if (error) {
    return <div className="blog-widget-error">{error}</div>;
  }

  if (articles.length === 0) {
    return <div className="blog-widget-empty">No posts available</div>;
  }

  return (
    <div className="blog-widget">
      <h3 className="blog-widget-title">{title}</h3>
      
      <div className="blog-widget-list">
        {articles.map((article) => (
          <div key={article.id} className="blog-widget-item">
            {showImage && article.featuredImage && (
              <div className="blog-widget-image">
                <a href={`/blog/${article.slug}`}>
                  <img 
                    src={article.featuredImage.startsWith('http') 
                      ? article.featuredImage 
                      : `${process.env.REACT_APP_BLOG_API_URL}${article.featuredImage}`
                    } 
                    alt={article.title} 
                  />
                </a>
              </div>
            )}
            
            <div className="blog-widget-content">
              <h4 className="blog-widget-post-title">
                <a href={`/blog/${article.slug}`}>{article.title}</a>
              </h4>
              
              {showExcerpt && (
                <p className="blog-widget-excerpt">{article.excerpt}</p>
              )}
              
              <div className="blog-widget-date">
                {new Date(article.publishedAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="blog-widget-footer">
        <a href="/blog" className="blog-widget-more-link">View All Posts</a>
      </div>
    </div>
  );
};

export default BlogWidget;
