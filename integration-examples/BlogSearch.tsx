/**
 * Example Blog Search Component for React TypeScript Website
 * 
 * This component demonstrates how to implement a search functionality
 * that queries the blog system API.
 */

import React, { useState } from 'react';
import { searchArticles } from './api-utils';

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

interface SearchFilters {
  query?: string;
  categoryId?: number;
  tag?: string;
  page?: number;
  limit?: number;
}

const BlogSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({ page: 1, limit: 10 });
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalResults, setTotalResults] = useState<number>(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const searchFilters = { ...filters, query: searchTerm };
      const result = await searchArticles(searchFilters);
      
      setArticles(result.articles || []);
      setTotalResults(result.total || 0);
      setError(null);
    } catch (err) {
      setError('Search failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (name: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const loadMore = () => {
    if (loading) return;
    
    const nextPage = (filters.page || 1) + 1;
    handleFilterChange('page', nextPage);
    
    // Trigger search with new page
    handleSearch(new Event('submit') as any);
  };

  return (
    <div className="blog-search-container">
      <h2 className="blog-search-title">Search Articles</h2>
      
      <form onSubmit={handleSearch} className="blog-search-form">
        <div className="blog-search-input-group">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for articles..."
            className="blog-search-input"
          />
          <button type="submit" className="blog-search-button" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </div>
        
        <div className="blog-search-filters">
          <select 
            value={filters.categoryId || ''}
            onChange={(e) => handleFilterChange('categoryId', e.target.value ? Number(e.target.value) : undefined)}
            className="blog-category-filter"
          >
            <option value="">All Categories</option>
            {/* Add your category options here */}
          </select>
          
          <input
            type="text"
            value={filters.tag || ''}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            placeholder="Filter by tag"
            className="blog-tag-filter"
          />
          
          <select
            value={filters.limit}
            onChange={(e) => handleFilterChange('limit', Number(e.target.value))}
            className="blog-limit-filter"
          >
            <option value="5">5 per page</option>
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
          </select>
        </div>
      </form>
      
      {error && <div className="blog-search-error">{error}</div>}
      
      <div className="blog-search-results">
        <div className="blog-search-results-info">
          {articles.length > 0 ? (
            <p>Showing {articles.length} of {totalResults} results</p>
          ) : (
            <p>{loading ? 'Searching...' : 'No articles found'}</p>
          )}
        </div>
        
        <div className="blog-search-results-grid">
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
                
                <p className="blog-card-excerpt">{article.excerpt}</p>
                
                <div className="blog-card-meta">
                  <span className="blog-card-author">By {article.author?.name || 'Unknown'}</span>
                  <span className="blog-card-date">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        {articles.length > 0 && articles.length < totalResults && (
          <button 
            onClick={loadMore} 
            className="blog-load-more-button"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More'}
          </button>
        )}
      </div>
    </div>
  );
};

export default BlogSearch;
