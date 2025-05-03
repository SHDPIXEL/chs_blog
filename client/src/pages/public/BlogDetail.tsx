import React, { useState, useEffect, useRef, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link, useLocation } from "wouter";
import { Helmet } from "react-helmet-async";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Share2, Eye } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { CommentsList } from "@/components/comments/CommentsList";
import { ContentRenderer } from "@/components/blog/ContentRenderer";
import { getInitials } from "@/lib/avatarUtils";

const BlogDetail: React.FC = () => {
  const [match, params] = useRoute("/blogs/:id/:slug");
  const [location, setLocation] = useLocation();
  const articleId = parseInt(params?.id || "0");
  const urlSlug = params?.slug || "";
  const [readingProgress, setReadingProgress] = useState(0);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch article details
  const {
    data: article,
    isLoading,
    error,
  } = useQuery({
    queryKey: [`/api/articles/${articleId}/public`],
    queryFn: async () => {
      try {
        const res = await fetch(`/api/articles/${articleId}/public`);
        if (!res.ok) throw new Error("Failed to fetch article");
        return await res.json();
      } catch (error) {
        console.error("Error fetching article:", error);
        return null;
      }
    },
  });

  const throttle = useCallback((func: Function, delay: number) => {
    let lastCall = 0;
    return (...args: any[]) => {
      const now = Date.now();
      if (now - lastCall < delay) return;
      lastCall = now;
      return func(...args);
    };
  }, []);

  // Combined useEffect for reading progress and slug redirection
  useEffect(() => {
    // Reading progress calculation
    const calculateReadingProgress = () => {
      if (!contentRef.current) return;

      const element = contentRef.current;
      const totalHeight = element.scrollHeight;
      const windowHeight = window.innerHeight;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const contentBox = element.getBoundingClientRect();
      const contentStart = contentBox.top + scrollTop - 100;
      const contentBottom = contentStart + totalHeight;
      let progress = 0;

      if (totalHeight > 0) {
        if (scrollTop < contentStart) {
          progress = 0;
        } else if (scrollTop >= contentBottom - windowHeight) {
          progress = 100;
        } else {
          progress =
            ((scrollTop - contentStart) / (totalHeight - windowHeight + 200)) *
            100;
        }
      }

      const smoothedProgress = Math.min(Math.max(progress, 0), 100);
      if (Math.abs(smoothedProgress - readingProgress) > 0.5) {
        setReadingProgress(smoothedProgress);
      }
    };

    const handleScroll = throttle(calculateReadingProgress, 16);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    calculateReadingProgress();

    // Slug redirection
    if (article?.article) {
      const articleSlug = generateSlug(article.article.title);
      if (urlSlug !== articleSlug) {
        setLocation(`/blogs/${articleId}/${articleSlug}`);
      }
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [article, articleId, urlSlug, readingProgress, throttle, setLocation]);

  // If loading or error
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (error || !article) {
    return (
      <PublicLayout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Article not found
            </h1>
            <p className="mt-4 text-gray-600">
              The article you're looking for does not exist or has been removed.
            </p>
            <Link href="/blogs">
              <Button className="mt-8 bg-rose-600 hover:bg-rose-700">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blogs
              </Button>
            </Link>
          </div>
        </div>
      </PublicLayout>
    );
  }

  const {
    article: articleData,
    categories = [],
    tags = [],
    coAuthors = [],
  } = article;

  // Determine the proper article slug from the article title
  const articleSlug = generateSlug(articleData.title);

  // Create the canonical URL with the correct format (blog/id/slug)
  const canonicalUrl = `${window.location.origin}/blogs/${articleId}/${articleSlug}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <PublicLayout>
      <Helmet>
        <title>
          {articleData.title} | Centre for Human Sciences | Rishihood University
        </title>
        <meta name="description" content={articleData.excerpt} />
        <meta name="author" content={articleData.author?.name} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:url" content={canonicalUrl} />
        <meta name="robots" content="index, follow" />
        {articleData.keywords && (
          <meta name="keywords" content={articleData.keywords.join(", ")} />
        )}
        <meta property="og:title" content={articleData.title} />
        <meta property="og:description" content={articleData.excerpt} />
        <meta property="og:type" content="article" />
        {articleData.featuredImage && (
          <meta
            property="og:image"
            content={
              articleData.featuredImage.startsWith("http")
                ? articleData.featuredImage
                : `${window.location.origin}${articleData.featuredImage}`
            }
          />
        )}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: articleData.title,
            description: articleData.excerpt,
            image: articleData.featuredImage
              ? articleData.featuredImage.startsWith("http")
                ? articleData.featuredImage
                : `${window.location.origin}${articleData.featuredImage}`
              : null,
            datePublished: articleData.createdAt,
            dateModified: articleData.updatedAt,
            author: {
              "@type": "Person",
              name: articleData.author?.name,
              url: articleData.author?.id
                ? `${window.location.origin}/authors/${articleData.author.id}?name=${encodeURIComponent(articleData.author.name || "")}`
                : null,
            },
            publisher: {
              "@type": "Organization",
              name: "Centre for Human Sciences, Rishihood University",
              logo: {
                "@type": "ImageObject",
                url: `${window.location.origin}/logo.png`,
              },
            },
            keywords: tags.map((tag: { name: string }) => tag.name).join(", "),
            articleSection: categories
              .map((cat: { name: string }) => cat.name)
              .join(", "),
            ...(coAuthors.length > 0
              ? {
                  coAuthors: coAuthors.map(
                    (coAuthor: { id: number; name: string }) => ({
                      "@type": "Person",
                      name: coAuthor.name,
                      url: `${window.location.origin}/authors/${coAuthor.id}?name=${encodeURIComponent(coAuthor.name || "")}`,
                    }),
                  ),
                }
              : {}),
          })}
        </script>
      </Helmet>

      {/* Enhanced Reading Progress Bar - Fixed at the top */}
      <div className="fixed top-0 left-0 right-0 h-1.5 bg-gray-200 z-50 shadow-sm">
        <div
          className="h-full bg-gradient-to-r from-rose-600 to-rose-500 transition-all duration-200 ease-in-out will-change-transform"
          style={{
            width: `${readingProgress}%`,
            transform: `translateZ(0)`, // Force hardware acceleration for smoother animations
            backgroundSize: "200% 100%",
            boxShadow:
              readingProgress > 0 ? "0 0 10px rgba(204, 0, 51, 0.5)" : "none",
          }}
          aria-hidden="true"
        />
      </div>

      <div
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
        ref={contentRef}
      >
        {/* Back button */}
        <div className="mb-8">
          <Link href="/blogs">
            <Button variant="outline" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blogs</span>
            </Button>
          </Link>
        </div>

        {/* Article header */}
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex items-center gap-3 mb-4">
            {categories.map((category: { id: number; name: string }) => (
              <Badge
                key={category.id}
                variant="outline"
                className="bg-gray-100"
              >
                {category.name}
              </Badge>
            ))}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            {articleData.title}
          </h1>

          <div className="flex items-center mb-8">
            <Avatar className="h-12 w-12 mr-4">
              <AvatarImage
                src={articleData.author?.avatarUrl}
                alt={articleData.author?.name}
              />
              <AvatarFallback>
                {articleData.author?.name
                  ? getInitials(articleData.author.name)
                  : "A"}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/authors/${articleData.author?.id}?name=${articleData.author?.name}`}
                >
                  <p className="font-medium hover:text-blue-600 transition-colors cursor-pointer">
                    {articleData.author?.name || "Anonymous"}
                  </p>
                </Link>
                {coAuthors.length > 0 && (
                  <div className="flex -space-x-2 ml-2">
                    {coAuthors.slice(0, 3).map(
                      (
                        coAuthor: {
                          id: number;
                          name: string;
                          avatarUrl?: string;
                        },
                        index: number,
                      ) => (
                        <Avatar
                          key={index}
                          className="h-6 w-6 border-2 border-white"
                        >
                          <AvatarImage
                            src={coAuthor.avatarUrl}
                            alt={coAuthor.name}
                          />
                          <AvatarFallback className="text-xs">
                            {getInitials(coAuthor.name)}
                          </AvatarFallback>
                        </Avatar>
                      ),
                    )}
                    {coAuthors.length > 3 && (
                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-xs border-2 border-white">
                        +{coAuthors.length - 3}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <span>{formatDate(articleData.createdAt.toString())}</span>
                <span className="mx-2">•</span>
                <span>
                  {Math.ceil(articleData.content.length / 1000)} min read
                </span>
                {coAuthors.length > 0 && (
                  <>
                    <span className="mx-2">•</span>
                    <span>{coAuthors.length + 1} authors</span>
                  </>
                )}
                <span className="mx-2">•</span>
                <span className="flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {Intl.NumberFormat().format(articleData.viewCount || 0)} views
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Featured image */}
        {articleData.featuredImage && (
          <div className="max-w-4xl mx-auto mb-12 rounded-lg overflow-hidden">
            <img
              src={articleData.featuredImage}
              alt={articleData.title}
              className="w-full h-[400px] object-cover"
            />
          </div>
        )}

        {/* Excerpt if available */}
        {articleData.excerpt && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold mb-2">Excerpt</h3>
              <p className="text-gray-700 italic">{articleData.excerpt}</p>
            </div>
          </div>
        )}

        {/* Article content */}
        <div className="max-w-4xl mx-auto">
          <ContentRenderer
            content={articleData.content}
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700"
          />

          {/* Tags */}
          {tags.length > 0 && (
            <div className="mt-12 flex flex-wrap gap-2">
              {tags.map((tag: { id: number; name: string }) => (
                <Badge key={tag.id} variant="secondary">
                  #{tag.name}
                </Badge>
              ))}
            </div>
          )}

          {/* Article actions */}
          <div className="mt-12 flex justify-between items-center py-4 border-t border-b">
            <div className="flex gap-6">
              <Button
                variant="ghost"
                className="flex items-center gap-1"
                onClick={() =>
                  document
                    .getElementById("comments-section")
                    ?.scrollIntoView({ behavior: "smooth" })
                }
              >
                <MessageSquare className="h-5 w-5" />
                <span>Comment</span>
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon">
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Author info */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">
              About the {coAuthors.length > 0 ? "Authors" : "Author"}
            </h2>

            {/* Main Author Card */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col sm:flex-row gap-6">
                  <Avatar className="h-20 w-20">
                    <AvatarImage
                      src={articleData.author?.avatarUrl}
                      alt={articleData.author?.name}
                    />
                    <AvatarFallback className="text-lg">
                      {articleData.author?.name
                        ? getInitials(articleData.author.name)
                        : "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-bold">
                        {articleData.author?.name || "Anonymous"}
                      </h3>
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-800"
                      >
                        Main Author
                      </Badge>
                    </div>
                    <p className="text-gray-700 mb-4">
                      {articleData.author?.bio ||
                        "Academic researcher and writer specializing in philosophy and ethics."}
                    </p>
                    <Link
                      href={`/authors/${articleData.author?.id}?name=${articleData.author?.name}`}
                    >
                      <Button variant="outline">View Profile</Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Co-Authors Cards */}
            {coAuthors.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {coAuthors.map(
                  (coAuthor: {
                    id: number;
                    name: string;
                    bio?: string;
                    avatarUrl?: string;
                  }) => (
                    <Card key={coAuthor.id}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <Avatar className="h-16 w-16">
                            <AvatarImage
                              src={coAuthor.avatarUrl}
                              alt={coAuthor.name}
                            />
                            <AvatarFallback>
                              {getInitials(coAuthor.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="font-bold">{coAuthor.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">
                              {coAuthor.bio ||
                                "Contributing researcher and academic."}
                            </p>
                            <Link href={`/authors/${coAuthor.id}`}>
                              <Button
                                variant="ghost"
                                className="text-xs px-2 py-1 h-auto"
                              >
                                View Profile
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ),
                )}
              </div>
            )}
          </div>

          {/* Comments section */}
          <div id="comments-section" className="mt-16">
            <CommentsList articleId={articleId} />
          </div>
        </div>
      </div>
    </PublicLayout>
  );
};

// Helper function to generate slugs from text
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

export default BlogDetail;
