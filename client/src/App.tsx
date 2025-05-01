import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/use-auth";
import { AssetManagerProvider } from "@/context/AssetManagerContext";
import AssetManager from "@/components/assets/AssetManager";
import { ProtectedRoute } from "@/lib/protected-route";

// Pages
import Home from "@/pages/Home";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import AdminDashboard from "@/pages/admin/Dashboard";
import AuthorManagement from "@/pages/admin/AuthorManagement";
import BlogManagement from "@/pages/admin/BlogManagement";
import BlogApprovals from "@/pages/admin/BlogApprovals";
import AdminNewBlog from "@/pages/admin/NewBlog";
import AuthorDashboard from "@/pages/author/Dashboard";
import AuthorProfile from "@/pages/author/Profile";
import AuthorBlogs from "@/pages/author/Blogs";
import NewBlog from "@/pages/author/NewBlog";
import EditBlog from "@/pages/author/EditBlog";
import ViewBlog from "@/pages/ViewBlog";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />

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

      {/* Protected author routes */}
      <ProtectedRoute
        path="/author/dashboard"
        component={AuthorDashboard}
        role="author"
      />
      <ProtectedRoute
        path="/author/profile"
        component={AuthorProfile}
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
      <Route path="/blog/:id" component={ViewBlog} />

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
