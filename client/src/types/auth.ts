export type UserRole = 'admin' | 'author';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
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
  createdAt: string;
  updatedAt: string;
}

export interface AuthorDashboardData {
  stats: AuthorStats;
  articles: Article[];
}
