import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Search, Calendar, User, Tag } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PublicLayout from "@/components/layout/PublicLayout";

// Default placeholder image
const placeholderImage = "/uploads/96af7ed8-cd23-4f38-b2ed-9e03a54bc72b.png";

const Blogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Fetch published articles
  const {
    data: articles = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["/api/articles/published"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/articles/published");
        if (!res.ok) throw new Error("Failed to fetch articles");
        return await res.json();
      } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
      }
    },
  });

  // Fetch categories for filter
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/categories");
        if (!res.ok) throw new Error("Failed to fetch categories");
        return await res.json();
      } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
      }
    },
  });

  // Filter articles based on search term and category
  const filteredArticles = React.useMemo(() => {
    return articles.filter((article: any) => {
      const matchesSearch =
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (article.excerpt &&
          article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesCategory =
        categoryFilter === "all" ||
        (article.categories &&
          article.categories.some(
            (cat: any) => cat.id.toString() === categoryFilter,
          ));

      return matchesSearch && matchesCategory;
    });
  }, [articles, searchTerm, categoryFilter]);

  function formatDate(dateString: string) {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return (
    <PublicLayout>
      <Helmet>
        <title>Blog | Academic Research Center</title>
      </Helmet>

      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="font-serif text-4xl font-bold text-[#CC0033] mb-3">
              Blog
            </h1>
            <div className="w-24 h-1 bg-[#DB5527] mx-auto mb-6"></div>
            <p className="font-sans text-lg text-[#333A3D] max-w-3xl mx-auto">
              Insightful articles and scholarly reflections from our faculty and
              research community.
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search articles..."
                  className="pl-9 border-[#CC0033]/30 focus:border-[#CC0033] focus:ring-[#CC0033]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full md:w-64">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
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
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#CC0033]"></div>
              </div>
            ) : error ? (
              <div className="text-center text-red-500">
                An error occurred while fetching articles.
              </div>
            ) : (
              <>
                {/* Featured Article (First Article) */}
                {filteredArticles.length > 0 && (
                  <div className="mb-10">
                    <Link
                      href={`/blogs/${filteredArticles[0].id}/${filteredArticles[0].slug}`}
                    >
                      <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 group">
                        <div className="md:flex">
                          <div className="md:flex-shrink-0 h-64 md:h-auto md:w-1/2 overflow-hidden">
                            <img
                              src={
                                filteredArticles[0].featuredImage ||
                                placeholderImage
                              }
                              alt={filteredArticles[0].title}
                              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                          <CardContent className="p-8 md:w-1/2">
                            <div className="flex items-center mb-4">
                              <img
                                src={
                                  filteredArticles[0].author?.avatarUrl ||
                                  placeholderImage
                                }
                                alt={
                                  filteredArticles[0].author?.name || "Author"
                                }
                                className="w-10 h-10 rounded-full object-cover mr-3"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    placeholderImage;
                                }}
                              />
                              <div>
                                <h3 className="font-medium text-sm">
                                  {filteredArticles[0].author?.name ||
                                    "Anonymous"}
                                  {filteredArticles[0].coAuthors &&
                                    filteredArticles[0].coAuthors.length > 0 &&
                                    " and others"}
                                </h3>
                                <div className="flex items-center text-xs text-[#333A3D]/70">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(
                                    filteredArticles[0].createdAt.toString(),
                                  )}
                                </div>
                              </div>
                            </div>

                            <h2 className="font-serif text-2xl md:text-3xl font-bold text-[#333A3D] mb-3 group-hover:text-[#CC0033] transition-colors duration-300">
                              {filteredArticles[0].title}
                            </h2>
                            <p className="font-sans text-[#333A3D]/80 mb-4">
                              {filteredArticles[0].excerpt ||
                                "No excerpt available for this article."}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-6">
                              {filteredArticles[0].categories?.map(
                                (category: any) => (
                                  <span
                                    key={category.id}
                                    className="inline-block bg-[#FFEDD2] text-[#81204D] text-xs px-2 py-1 rounded"
                                  >
                                    {category.name}
                                  </span>
                                ),
                              )}
                            </div>

                            <div className="inline-block bg-[#CC0033] text-white hover:bg-[#CC0033]/90 font-sans text-sm font-medium py-2 px-4 rounded-md transition duration-300">
                              Read Full Article
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </Link>
                  </div>
                )}

                {/* Rest of the blog articles */}
                {filteredArticles.length > 1 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredArticles.slice(1).map((article: any) => (
                      <Link
                        key={article.id}
                        href={`/blogs/${article.id}/${article.slug}`}
                      >
                        <Card className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 h-full group">
                          <div className="h-48 overflow-hidden">
                            <img
                              src={article.featuredImage || placeholderImage}
                              alt={article.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  placeholderImage;
                              }}
                            />
                          </div>
                          <CardContent className="p-6">
                            <div className="flex items-center mb-3">
                              <img
                                src={
                                  article.author?.avatarUrl || placeholderImage
                                }
                                alt={article.author?.name || "Author"}
                                className="w-8 h-8 rounded-full object-cover mr-2"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).src =
                                    placeholderImage;
                                }}
                              />
                              <span className="text-xs font-sans text-[#333A3D]/70">
                                {article.author?.name || "Anonymous"}
                                {article.coAuthors &&
                                  article.coAuthors.length > 0 &&
                                  " and others"}
                              </span>
                              <span className="mx-2 text-xs text-[#333A3D]/50">
                                •
                              </span>
                              <span className="text-xs font-sans text-[#333A3D]/70">
                                {formatDate(article.createdAt.toString())}
                              </span>
                            </div>
                            <h3 className="font-serif text-xl font-bold mb-2 text-[#333A3D] group-hover:text-[#CC0033] transition-colors duration-300">
                              {article.title}
                            </h3>
                            <p className="font-sans text-sm text-[#333A3D]/80 mb-4 line-clamp-2">
                              {article.excerpt ||
                                "No excerpt available for this article."}
                            </p>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {article.categories
                                ?.slice(0, 2)
                                .map((category: any) => (
                                  <span
                                    key={category.id}
                                    className="inline-block bg-[#FFEDD2] text-[#81204D] text-xs px-2 py-1 rounded"
                                  >
                                    {category.name}
                                  </span>
                                ))}
                            </div>

                            <div className="text-[#CC0033] font-medium text-sm">
                              Read Full Article →
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : filteredArticles.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-lg text-[#333A3D]/70">
                      No articles matching your search criteria.
                    </p>
                    <Button
                      variant="outline"
                      className="mt-4 border-[#CC0033] text-[#CC0033]"
                      onClick={() => {
                        setSearchTerm("");
                        setCategoryFilter("all");
                      }}
                    >
                      Clear Filters
                    </Button>
                  </div>
                ) : null}

                {/* Single article view for when there's exactly one match */}
                {filteredArticles.length === 1 && searchTerm && (
                  <div className="mt-10">
                    <Separator className="mb-8" />

                    <div className="max-w-3xl mx-auto">
                      <div className="flex items-center mb-6">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1 text-[#CC0033]" />
                          <span className="text-sm font-medium mr-4">
                            {filteredArticles[0].author?.name || "Anonymous"}
                            {filteredArticles[0].coAuthors &&
                              filteredArticles[0].coAuthors.length > 0 &&
                              " and others"}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1 text-[#CC0033]" />
                          <span className="text-sm">
                            {formatDate(
                              filteredArticles[0].createdAt.toString(),
                            )}
                          </span>
                        </div>
                        {filteredArticles[0].categories &&
                          filteredArticles[0].categories.length > 0 && (
                            <div className="flex items-center ml-4">
                              <Tag className="h-4 w-4 mr-1 text-[#CC0033]" />
                              <span className="text-sm">
                                {filteredArticles[0].categories
                                  .map((cat: any) => cat.name)
                                  .join(", ")}
                              </span>
                            </div>
                          )}
                      </div>

                      <h1 className="font-serif text-3xl font-bold text-[#333A3D] mb-6">
                        {filteredArticles[0].title}
                      </h1>

                      <div
                        className="prose prose-sm md:prose max-w-none font-sans"
                        dangerouslySetInnerHTML={{
                          __html:
                            filteredArticles[0].content ||
                            "<p>Full content not available in preview mode.</p>",
                        }}
                      />
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

export default Blogs;