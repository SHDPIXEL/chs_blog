import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { Helmet } from 'react-helmet-async';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import PublicLayout from '@/components/layout/PublicLayout';

// Demo images for placeholder
const demoImages = [
  '/uploads/96af7ed8-cd23-4f38-b2ed-9e03a54bc72b.png',
  '/uploads/08a69f11-51da-491a-a8d4-cedebb5f3d90.png',
  '/uploads/d03cc5f2-2997-4bde-9ebe-80894b10adbd.png',
  '/uploads/e51dde8b-a72e-4c15-b668-d0e6d9aae7ec.png',
];

const Blogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Fetch published articles
  const { data: articles = [], isLoading, error } = useQuery({
    queryKey: ['/api/articles/published'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/articles/published');
        if (!res.ok) throw new Error('Failed to fetch articles');
        return await res.json();
      } catch (error) {
        console.error('Error fetching articles:', error);
        return [];
      }
    }
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
    queryFn: async () => {
      try {
        const res = await fetch('/api/categories');
        if (!res.ok) throw new Error('Failed to fetch categories');
        return await res.json();
      } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
      }
    }
  });

  // For demo purposes, create some mock content if no articles exist
  const demoArticles = React.useMemo(() => {
    if (articles.length > 0) return articles;
    
    return [
      {
        id: 1,
        title: 'The Evolution of Ethics in Indian Philosophy',
        excerpt: 'Exploring the transformation of ethical frameworks from classical Sanskrit texts to contemporary Indian philosophical discourse.',
        createdAt: new Date().toISOString(),
        featuredImage: demoImages[0],
        author: { name: 'Dr. Rajesh Mehta', avatarUrl: null },
        categories: [{ id: 1, name: 'Philosophy' }, { id: 2, name: 'Ethics' }]
      },
      {
        id: 2,
        title: 'Narrative Techniques in Modern Indian Literature',
        excerpt: 'Analyzing storytelling innovations in contemporary Indian literature through cultural and historical contexts.',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        featuredImage: demoImages[1],
        author: { name: 'Dr. Priya Joshi', avatarUrl: null },
        categories: [{ id: 3, name: 'Literature' }, { id: 4, name: 'Cultural Studies' }]
      },
      {
        id: 3,
        title: 'Cultural Heritage and Digital Preservation',
        excerpt: 'Examining methodologies and challenges in digitizing and preserving heritage for future generations.',
        createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        featuredImage: demoImages[2],
        author: { name: 'Dr. Arjun Singh', avatarUrl: null },
        categories: [{ id: 5, name: 'Digital Humanities' }, { id: 6, name: 'Cultural Heritage' }]
      },
      {
        id: 4,
        title: 'The Philosophy of Language in Nyāya Tradition',
        excerpt: 'Investigating classical Indian theories of meaning, reference, and linguistic cognition.',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        featuredImage: demoImages[3],
        author: { name: 'Dr. Vikram Rathore', avatarUrl: null },
        categories: [{ id: 1, name: 'Philosophy' }, { id: 7, name: 'Linguistics' }]
      },
    ];
  }, [articles]);

  // Filter articles based on search term and category
  const filteredArticles = React.useMemo(() => {
    return demoArticles.filter((article) => {
      const matchesSearch = 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (article.excerpt && article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = 
        categoryFilter === 'all' || 
        (article.categories && article.categories.some(cat => cat.id.toString() === categoryFilter));
      
      return matchesSearch && matchesCategory;
    });
  }, [demoArticles, searchTerm, categoryFilter]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long', 
      day: 'numeric'
    });
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>Blog | Academic Research Center</title>
      </Helmet>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-rose-600 mb-4">Blog</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Insightful articles and scholarly reflections from our faculty and research community.
          </p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <Input
              type="text"
              placeholder="Search articles..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="w-full sm:w-64">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {/* Actual categories */}
                {categories.map((category: any) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
                {/* Demo categories if no actual categories exist */}
                {categories.length === 0 && [
                  { id: 1, name: 'Philosophy' },
                  { id: 2, name: 'Ethics' },
                  { id: 3, name: 'Literature' },
                  { id: 4, name: 'Cultural Studies' },
                  { id: 5, name: 'Digital Humanities' },
                  { id: 6, name: 'Cultural Heritage' },
                  { id: 7, name: 'Linguistics' }
                ].map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Main Content */}
        {isLoading ? (
          <div className="flex justify-center my-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            An error occurred while fetching articles.
          </div>
        ) : (
          <>
            {/* Featured Article (First Article) */}
            {filteredArticles.length > 0 && (
              <div className="mb-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="relative h-[300px] md:h-auto overflow-hidden rounded-lg bg-gray-100">
                    <img 
                      src={filteredArticles[0].featuredImage || '/placeholder-image.jpg'} 
                      alt={filteredArticles[0].title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-300 mr-2">
                        <img 
                          src={filteredArticles[0].author?.avatarUrl || '/placeholder-avatar.jpg'} 
                          alt={filteredArticles[0].author?.name || 'Author'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {filteredArticles[0].author?.name || 'Anonymous'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(filteredArticles[0].createdAt.toString())}
                        </p>
                      </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {filteredArticles[0].title}
                    </h2>
                    <p className="text-gray-600 mb-4">
                      {filteredArticles[0].excerpt || 'No excerpt available for this article.'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {filteredArticles[0].categories?.map((category: any) => (
                        <Badge key={category.id} variant="outline" className="bg-gray-100">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blogs/${filteredArticles[0].id}`}>
                      <Button className="w-[140px] bg-rose-600 hover:bg-rose-700">
                        Read Full Article
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Article Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArticles.slice(1).map((article: any) => (
                <Card key={article.id} className="overflow-hidden border-none shadow-md">
                  <div className="h-48 overflow-hidden bg-gray-100">
                    <img 
                      src={article.featuredImage || '/placeholder-image.jpg'} 
                      alt={article.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center mb-2">
                      <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-300 mr-2">
                        <img 
                          src={article.author?.avatarUrl || '/placeholder-avatar.jpg'} 
                          alt={article.author?.name || 'Author'} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {article.author?.name || 'Anonymous'} • {formatDate(article.createdAt.toString())}
                      </p>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {article.title}
                    </h3>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {article.excerpt || 'No excerpt available for this article.'}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {article.categories?.slice(0, 2).map((category: any) => (
                        <Badge key={category.id} variant="outline" className="text-xs bg-gray-100">
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                    <Link href={`/blogs/${article.id}`}>
                      <Button variant="link" className="pl-0 text-rose-600 hover:text-rose-700">
                        Read Full Article →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredArticles.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-gray-500">No articles found matching your criteria.</p>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
};

export default Blogs;