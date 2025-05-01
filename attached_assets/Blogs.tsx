import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Search, Calendar, User, Tag } from 'lucide-react';
import { blogs } from '@/data/mockData';
import { Link } from 'wouter';

const Blogs = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Extract unique categories from blogs
  const allCategories = [...new Set(blogs.flatMap(blog => blog.categories))];
  
  // Filter blogs based on search query and category
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = 
      blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      blog.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      categoryFilter === 'all' || 
      blog.categories.includes(categoryFilter);
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="font-garamond text-4xl font-bold text-[#CC0033] mb-3">Blog</h1>
          <div className="w-24 h-1 bg-[#DB5527] mx-auto mb-6"></div>
          <p className="font-montserrat text-lg text-[#333A3D] max-w-3xl mx-auto">Insightful articles and scholarly reflections from our faculty and research community.</p>
        </div>
        
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search articles..."
                className="pl-9 border-[#CC0033]/30 focus:border-[#CC0033] focus:ring-[#CC0033]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="w-full md:w-64">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {allCategories.map((category, index) => (
                    <SelectItem key={index} value={category}>{category}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Featured Article (first blog) */}
          {filteredBlogs.length > 0 && (
            <div className="mb-10">
              <Card className="overflow-hidden">
                <div className="md:flex">
                  <div className="md:flex-shrink-0 h-64 md:h-auto md:w-1/2 overflow-hidden">
                    <img 
                      src={filteredBlogs[0].image} 
                      alt={filteredBlogs[0].title} 
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <CardContent className="p-8 md:w-1/2">
                    <div className="flex items-center mb-4">
                      <img 
                        src={filteredBlogs[0].author.avatar} 
                        alt={filteredBlogs[0].author.name} 
                        className="w-10 h-10 rounded-full object-cover mr-3" 
                      />
                      <div>
                        <h3 className="font-medium text-sm">{filteredBlogs[0].author.name}</h3>
                        <div className="flex items-center text-xs text-[#333A3D]/70">
                          <Calendar className="h-3 w-3 mr-1" />
                          {filteredBlogs[0].date}
                        </div>
                      </div>
                    </div>
                    
                    <h2 className="font-garamond text-2xl md:text-3xl font-bold text-[#333A3D] mb-3">{filteredBlogs[0].title}</h2>
                    <p className="font-montserrat text-[#333A3D]/80 mb-4">{filteredBlogs[0].excerpt}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-6">
                      {filteredBlogs[0].categories.map((category, index) => (
                        <span key={index} className="inline-block bg-[#FFEDD2] text-[#81204D] text-xs px-2 py-1 rounded">
                          {category}
                        </span>
                      ))}
                    </div>
                    
                    <Link href={`/blogs/${filteredBlogs[0].slug}`}>
                      <a className="inline-block bg-[#CC0033] text-white hover:bg-[#CC0033]/90 font-montserrat text-sm font-medium py-2 px-4 rounded-md transition duration-300">
                        Read Full Article
                      </a>
                    </Link>
                  </CardContent>
                </div>
              </Card>
            </div>
          )}
          
          {/* Rest of the blog articles */}
          {filteredBlogs.length > 1 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredBlogs.slice(1).map((blog, index) => (
                <Card key={blog.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={blog.image} 
                      alt={blog.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                  <CardContent className="p-6">
                    <div className="flex items-center mb-3">
                      <img 
                        src={blog.author.avatar} 
                        alt={blog.author.name} 
                        className="w-8 h-8 rounded-full object-cover mr-2" 
                      />
                      <span className="text-xs font-montserrat text-[#333A3D]/70">{blog.author.name}</span>
                      <span className="mx-2 text-xs text-[#333A3D]/50">•</span>
                      <span className="text-xs font-montserrat text-[#333A3D]/70">{blog.date}</span>
                    </div>
                    <h3 className="font-garamond text-xl font-bold mb-2 text-[#333A3D]">{blog.title}</h3>
                    <p className="font-montserrat text-sm text-[#333A3D]/80 mb-4">{blog.excerpt}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {blog.categories.map((category, index) => (
                        <span key={index} className="inline-block bg-[#FFEDD2] text-[#81204D] text-xs px-2 py-1 rounded">
                          {category}
                        </span>
                      ))}
                    </div>
                    
                    <Link href={`/blogs/${blog.slug}`}>
                      <a className="text-[#CC0033] hover:text-[#DB5527] font-medium text-sm">
                        Read Full Article →
                      </a>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-lg text-[#333A3D]/70">No articles matching your search criteria.</p>
              <Button 
                variant="outline" 
                className="mt-4 border-[#CC0033] text-[#CC0033]"
                onClick={() => {
                  setSearchQuery('');
                  setCategoryFilter('all');
                }}
              >
                Clear Filters
              </Button>
            </div>
          ) : null}
          
          {/* Sample full article view for demonstration */}
          {filteredBlogs.length > 0 && searchQuery && filteredBlogs.length === 1 && (
            <div className="mt-10">
              <Separator className="mb-8" />
              
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center mb-6">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-1 text-[#CC0033]" />
                    <span className="text-sm font-medium mr-4">{filteredBlogs[0].author.name}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1 text-[#CC0033]" />
                    <span className="text-sm">{filteredBlogs[0].date}</span>
                  </div>
                  <div className="flex items-center ml-4">
                    <Tag className="h-4 w-4 mr-1 text-[#CC0033]" />
                    <span className="text-sm">{filteredBlogs[0].categories.join(', ')}</span>
                  </div>
                </div>
                
                <h1 className="font-garamond text-3xl font-bold text-[#333A3D] mb-6">{filteredBlogs[0].title}</h1>
                
                <div 
                  className="prose prose-sm md:prose max-w-none font-montserrat"
                  dangerouslySetInnerHTML={{ __html: filteredBlogs[0].content }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Blogs;
