/**
 * Example Blog Detail Component for React TypeScript Website
 * 
 * This component demonstrates how to display a single blog article
 * fetched from the blog system API.
 */

import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Assuming you're using React Router
import { fetchArticleBySlug } from './api-utils';

// Define article type
interface Article {
  id: number;
  title: string;
  slug: string;
  content: string;
  featuredImage: string;
  publishedAt: string;
  author: {
    name: string;
    bio: string;
  };
  categories: Array<{
    name: string;
    slug: string;
  }>;
  tags: Array<{
    name: string;
    slug: string;
  }>;
}

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch article when component mounts or slug changes
    const loadArticle = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const data = await fetchArticleBySlug(slug);
        setArticle(data);
        setError(null);
      } catch (err) {
        setError('Failed to load article');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadArticle();
  }, [slug]);

  if (loading) {
    return <div className="blog-detail-loading">Loading article...</div>;
  }

  if (error || !article) {
    return <div className="blog-detail-error">{error || 'Article not found'}</div>;
  }

  return (
    <div className="blog-detail-container">
      <header className="blog-detail-header">
        <h1 className="blog-detail-title">{article.title}</h1>
        
        <div className="blog-detail-meta">
          <div className="blog-detail-author">By {article.author?.name || 'Unknown'}</div>
          <div className="blog-detail-date">
            {new Date(article.publishedAt).toLocaleDateString()}
          </div>
        </div>
        
        {article.categories && article.categories.length > 0 && (
          <div className="blog-detail-categories">
            {article.categories.map(category => (
              <span key={category.slug} className="blog-category-tag">
                {category.name}
              </span>
            ))}
          </div>
        )}
      </header>
      
      {article.featuredImage && (
        <div className="blog-detail-featured-image">
          <img 
            src={article.featuredImage.startsWith('http') 
              ? article.featuredImage 
              : `${process.env.REACT_APP_BLOG_API_URL}${article.featuredImage}`
            } 
            alt={article.title} 
          />
        </div>
      )}
      
      <div 
        className="blog-detail-content"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />
      
      {article.tags && article.tags.length > 0 && (
        <div className="blog-detail-tags">
          <h3>Tags:</h3>
          <div className="blog-tags-list">
            {article.tags.map(tag => (
              <span key={tag.slug} className="blog-tag">
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      )}
      
      {article.author && article.author.bio && (
        <div className="blog-detail-author-bio">
          <h3>About the Author</h3>
          <p>{article.author.bio}</p>
        </div>
      )}
    </div>
  );
};

export default BlogDetail;
