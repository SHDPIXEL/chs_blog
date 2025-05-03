/**
 * Example Category Navigation Component for React TypeScript Website
 * 
 * This component displays a navigation menu for blog categories
 * fetched from the blog system API.
 */

import React, { useEffect, useState } from 'react';
import { fetchCategories } from './api-utils';

// Define category type
interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
}

const CategoryNavigation: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch categories when component mounts
    const loadCategories = async () => {
      try {
        setLoading(true);
        const data = await fetchCategories();
        setCategories(data);
        setError(null);
      } catch (err) {
        setError('Failed to load categories');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  if (loading) {
    return <div className="categories-loading">Loading categories...</div>;
  }

  if (error) {
    return <div className="categories-error">{error}</div>;
  }

  if (categories.length === 0) {
    return <div className="categories-empty">No categories available</div>;
  }

  return (
    <nav className="categories-navigation">
      <h3 className="categories-heading">Blog Categories</h3>
      <ul className="categories-list">
        <li className="category-item">
          <a href="/blog" className="category-link all-categories">All Articles</a>
        </li>
        {categories.map((category) => (
          <li key={category.id} className="category-item">
            <a 
              href={`/blog/category/${category.slug}`} 
              className="category-link"
              title={category.description}
            >
              {category.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default CategoryNavigation;
