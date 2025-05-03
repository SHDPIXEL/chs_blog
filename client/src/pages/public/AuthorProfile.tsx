import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Helmet } from "react-helmet-async";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, BookOpen, Link as LinkIcon } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";
import { getInitials } from "@/lib/avatarUtils";
import { format } from "date-fns";
import { SocialLinksDisplay } from "@/components/ui/social-links-editor";

const BlogCard = ({ blog }: { blog: any }) => {
  return (
    <Card className="overflow-hidden h-full flex flex-col">
      {blog.featuredImage && (
        <div className="aspect-video overflow-hidden">
          <img
            src={blog.featuredImage}
            alt={blog.title}
            className="w-full h-full object-cover transition-transform hover:scale-105"
          />
        </div>
      )}
      <CardContent className="p-4 flex-1 flex flex-col">
        <div className="space-y-2 flex-1">
          <div className="flex gap-2">
            {blog.categories?.slice(0, 1).map((category: any) => (
              <Badge
                key={category.id}
                variant="outline"
                className="bg-slate-100"
              >
                {category.name}
              </Badge>
            ))}
          </div>
          <h3 className="font-semibold text-lg line-clamp-2">
            <Link href={`/blogs/${blog.id}`}>
              <a className="hover:text-blue-600 transition-colors">
                {blog.title}
              </a>
            </Link>
          </h3>
          <p className="text-muted-foreground text-sm line-clamp-2">
            {blog.excerpt ||
              blog.content.substring(0, 120).replace(/<[^>]*>?/gm, "")}
            ...
          </p>
        </div>
        <div className="mt-4 pt-4 border-t text-sm text-muted-foreground">
          <div className="flex items-center justify-between">
            <span>
              {format(
                new Date(blog.publishedAt || blog.createdAt),
                "MMM d, yyyy",
              )}
            </span>
            <span>{Math.ceil(blog.content.length / 1000)} min read</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AuthorProfile: React.FC = () => {
  const [, params] = useRoute("/authors/:id");
  const authorId = params?.id ? parseInt(params.id) : 0;

  // Fetch author profile data
  const { data, isLoading, error } = useQuery({
    queryKey: [`/api/authors/${authorId}/public`],
    enabled: !!authorId,
    refetchOnWindowFocus: false,
  });

  // Loading state
  if (isLoading) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
          </div>
        </div>
      </PublicLayout>
    );
  }

  // Error or not found state
  if (error || !data) {
    return (
      <PublicLayout>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">
              Author not found
            </h1>
            <p className="mt-4 text-gray-600">
              The author you're looking for does not exist or has been removed.
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

  const { author, articles, totalArticles } = data;
  const {
    own: ownArticles = [],
    coAuthored: coAuthoredArticles = [],
    all: allArticles = [],
  } = articles || {};

  return (
    <PublicLayout>
      <Helmet>
        <title>{author.name} - Author Profile | CHC</title>
        <meta
          name="description"
          content={`${author.name}'s profile and articles`}
        />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back button */}
        <div className="mb-8">
          <Link href="/blogs">
            <Button variant="outline" className="flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Blogs</span>
            </Button>
          </Link>
        </div>

        {/* Banner image */}
        <div className="relative h-48 w-full rounded-lg bg-gray-100 overflow-hidden mb-10 shadow-md">
          {author.bannerUrl ? (
            <img
              src={author.bannerUrl}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-rose-400 to-purple-500">
              <span className="text-white text-lg font-medium">
                {author.name || "Author"}
              </span>
            </div>
          )}
        </div>

        {/* Author profile section */}
        <div className="mb-10">
          <div className="flex flex-col sm:flex-row">
            {/* Avatar and basic info */}
            <div className="sm:w-1/3 mb-6 sm:mb-0">
              <div className="flex flex-col items-center sm:items-start">
                <Avatar className="h-32 w-32 mb-4 ring-4 ring-white -mt-12 relative z-10 shadow-md">
                  <AvatarImage src={author.avatarUrl} alt={author.name} />
                  <AvatarFallback className="text-3xl">
                    {getInitials(author.name)}
                  </AvatarFallback>
                </Avatar>

                <h1 className="text-3xl font-bold">{author.name}</h1>
                <div className="flex flex-wrap gap-3 items-center my-3">
                  <Badge variant="secondary" className="px-3 py-1">
                    {author.role}
                  </Badge>
                </div>

                <div className="text-muted-foreground flex items-center gap-1 mt-1">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">
                    Joined {format(new Date(author.createdAt), "MMMM yyyy")}
                  </span>
                </div>
                <div className="text-muted-foreground flex items-center gap-1 mt-1">
                  <BookOpen className="h-4 w-4" />
                  <span className="text-sm">{totalArticles} Articles</span>
                </div>

                {/* Social Links */}
                {author.socialLinks && (
                  <div className="mt-4">
                    <SocialLinksDisplay value={author.socialLinks} />
                  </div>
                )}
              </div>
            </div>

            {/* Bio and additional info */}
            <div className="sm:w-2/3">
              <Card>
                <CardHeader>
                  <CardTitle>About Me</CardTitle>
                </CardHeader>
                <CardContent>
                  {author.bio ? (
                    <p className="text-gray-700">{author.bio}</p>
                  ) : (
                    <p className="text-gray-500 italic">
                      This author hasn't added a bio yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Author's articles */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">{author.name}'s Articles</h2>

          {/* Tabs for switching between authored and co-authored articles */}
          <div className="border-b mb-8">
            <div className="flex space-x-8">
              <button
                className={`pb-2 font-medium text-lg border-b-2 border-rose-600 text-gray-900`}
              >
                All Articles ({allArticles.length})
              </button>
            </div>
          </div>

          {allArticles.length > 0 ? (
            <div className="space-y-12">
              {/* Main author articles */}
              {ownArticles.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Articles by {author.name}
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {ownArticles.map((article: any) => (
                      <BlogCard key={`own-${article.id}`} blog={article} />
                    ))}
                  </div>
                </div>
              )}

              {/* Co-authored articles */}
              {coAuthoredArticles.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-4">
                    Co-Authored Articles
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coAuthoredArticles.map((article: any) => (
                      <BlogCard key={`co-${article.id}`} blog={article} />
                    ))}
                  </div>
                </div>
              )}

              {totalArticles > allArticles.length && (
                <div className="mt-10 text-center">
                  <p className="text-gray-600 mb-4">
                    Showing {allArticles.length} of {totalArticles} articles
                  </p>
                  <Button>Load More Articles</Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12 border rounded-lg">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900">
                No articles yet
              </h3>
              <p className="text-gray-500 mt-2">
                {author.name} hasn't published any articles yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  );
};

export default AuthorProfile;
