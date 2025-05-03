export type UserRole = "admin" | "author";

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  avatarUrl?: string | null;
  bio?: string | null;
  bannerUrl?: string | null;
  socialLinks?: string | null;
  canPublish?: boolean;
}

export interface AuthResponse {
  user: User & { can_publish?: boolean }; // Include the snake_case version for backwards compatibility
  token: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (data: LoginFormData) => Promise<void>;
  register: (data: RegisterFormData) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  refreshUserData: () => Promise<User | null>; // Add the refresh function
}

export interface AdminStats {
  totalUsers: number;
  totalPosts: number;
  pageViews: number;
  comments: number;
}

export interface ActivityItem {
  id: number;
  type: string;
  user?: string;
  role?: string;
  title?: string;
  timestamp: string;
}

export interface AdminDashboardData {
  stats: AdminStats;
  recentActivity: ActivityItem[];
}

export interface AuthorStats {
  published: number;
  drafts: number;
  totalViews: number;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  authorId: number;
  published: boolean;
  status?: string;
  createdAt: string;
  updatedAt: string;
  viewCount?: number;
  commentCount?: number;
  featuredImage?: string;
  excerpt?: string;
  slug: string;
}

export interface AuthorDashboardData {
  stats: AuthorStats;
  articles: Article[];
}
