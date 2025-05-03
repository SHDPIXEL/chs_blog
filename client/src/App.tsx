import React, { Suspense } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";

import Redirect from "@/components/utils/Redirect";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { AssetManagerProvider } from "@/context/AssetManagerContext";
import AssetManager from "@/components/assets/AssetManager";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import AdminDashboard from "@/pages/admin/Dashboard";
import AuthorManagement from "@/pages/admin/AuthorManagement";
import AddAuthor from "@/pages/admin/AddAuthor";
import BlogManagement from "@/pages/admin/BlogManagement";
import BlogApprovals from "@/pages/admin/BlogApprovals";
import AdminNewBlog from "@/pages/admin/NewBlog";
import AdminEditBlog from "@/pages/admin/EditBlog";
import AdminMyBlogs from "@/pages/admin/MyBlogs";
import AdminProfilePage from "@/pages/admin/Profile";
import AuthorDashboard from "@/pages/author/Dashboard";
import AuthorProfilePage from "@/pages/author/Profile";
import AuthorBlogs from "@/pages/author/Blogs";
import NewBlog from "@/pages/author/NewBlog";
import EditBlog from "@/pages/author/EditBlog";
import ViewBlog from "@/pages/ViewBlog";
import NotFound from "@/pages/not-found";
import BlogPreview from "@/pages/preview/BlogPreview";
import GuestStyleBlogPreview from "@/pages/preview/GuestStyleBlogPreview";

// Public blog pages
import Blogs from "./pages/public/Blogs";
import BlogDetail from "./pages/public/BlogDetail";
import PublicAuthorProfile from "./pages/public/AuthorProfile";
import TestPage from "./pages/public/TestPage";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Blogs} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/blog/:id/:slug?" component={ViewBlog} />

      <Route path="/blogs/:id/:slug" component={BlogDetail} />
      <Route path="/authors/:id" component={PublicAuthorProfile} />
      <Route path="/test-blog" component={TestPage} />

      <Route path="/blogs" component={() => <Redirect to="/" />} />
      <Route path="/login" component={() => <Redirect to="/auth/login" />} />

      {/* Protected admin routes */}

      <ProtectedRoute
        path="/admin/dashboard"
        component={AdminDashboard}
        role="admin"
      />
      <ProtectedRoute
        path="/admin/authors"
        component={AuthorManagement}
        role="admin"
      />
      <ProtectedRoute
        path="/admin/authors/add"
        component={AddAuthor}
        role="admin"
      />
      <ProtectedRoute
        path="/admin/blogs"
        component={BlogManagement}
        role="admin"
      />
      <ProtectedRoute
        path="/admin/blogs/new"
        component={AdminNewBlog}
        role="admin"
      />
      <ProtectedRoute
        path="/admin/blog-approvals"
        component={BlogApprovals}
        role="admin"
      />
      <ProtectedRoute
        path="/admin/my-blogs"
        component={AdminMyBlogs}
        role="admin"
      />
      <ProtectedRoute
        path="/admin/blogs/:id"
        component={AdminEditBlog}
        role="admin"
      />
      <ProtectedRoute
        path="/admin/profile"
        component={AdminProfilePage}
        role="admin"
      />

      {/* Protected author routes */}
      <ProtectedRoute
        path="/author/dashboard"
        component={AuthorDashboard}
        role="author"
      />
      <ProtectedRoute
        path="/author/profile"
        component={AuthorProfilePage}
        role="author"
      />
      <ProtectedRoute
        path="/author/blogs"
        component={AuthorBlogs}
        role="author"
      />
      <ProtectedRoute
        path="/author/blogs/new"
        component={NewBlog}
        role="author"
      />
      <ProtectedRoute
        path="/author/blogs/:id"
        component={EditBlog}
        role="author"
      />

      {/* Blog Preview Route - accessible to both admin and author */}
      <ProtectedRoute
        path="/preview/blogs/:id"
        component={GuestStyleBlogPreview}
        role="any"
      />

      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AssetManagerProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
            <AssetManager />
          </TooltipProvider>
        </AssetManagerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
