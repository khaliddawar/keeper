// User and authentication type definitions
import { IntegrationType } from './index';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  timezone: string;
  preferences: UserPreferences;
  subscription: UserSubscription;
  integrations: UserIntegration[];
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// User preferences
export interface UserPreferences {
  theme: 'light' | 'dark' | 'system';
  language: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  timeFormat: '12h' | '24h';
  weekStartsOn: 0 | 1; // 0 = Sunday, 1 = Monday
  defaultNotebook: string;
  defaultTaskPriority: 'low' | 'medium' | 'high';
  defaultViewMode: 'list' | 'kanban' | 'calendar';
  notifications: NotificationPreferences;
  privacy: PrivacyPreferences;
  productivity: ProductivityPreferences;
}

// Notification preferences
export interface NotificationPreferences {
  email: {
    enabled: boolean;
    taskReminders: boolean;
    dueDateAlerts: boolean;
    weeklyDigest: boolean;
    systemUpdates: boolean;
  };
  telegram: {
    enabled: boolean;
    taskReminders: boolean;
    dueDateAlerts: boolean;
    dailyDigest: boolean;
    instantUpdates: boolean;
  };
  web: {
    enabled: boolean;
    taskReminders: boolean;
    dueDateAlerts: boolean;
    browserNotifications: boolean;
  };
}

// Privacy preferences
export interface PrivacyPreferences {
  dataRetention: {
    tasks: 'forever' | '1year' | '6months' | '3months';
    memories: 'forever' | '2years' | '1year' | '6months';
    analytics: 'forever' | '1year' | '6months' | 'none';
  };
  sharing: {
    allowTaskSharing: boolean;
    allowNotebookSharing: boolean;
    allowProductivityStats: boolean;
  };
  ai: {
    allowMemoryStorage: boolean;
    allowPersonalization: boolean;
    allowAnalytics: boolean;
  };
}

// Productivity preferences
export interface ProductivityPreferences {
  workingHours: {
    enabled: boolean;
    start: string; // HH:MM format
    end: string; // HH:MM format
    timezone: string;
  };
  focusMode: {
    enabled: boolean;
    duration: number; // in minutes
    breakReminders: boolean;
    blockDigitalDistractions: boolean;
  };
  goals: {
    dailyTaskGoal: number;
    weeklyTaskGoal: number;
    monthlyTaskGoal: number;
    trackProductivityMetrics: boolean;
  };
}

// User subscription
export interface UserSubscription {
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export enum SubscriptionPlan {
  FREE = 'free',
  BASIC = 'basic',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  PAST_DUE = 'past_due',
  CANCELED = 'canceled',
  INCOMPLETE = 'incomplete',
  TRIALING = 'trialing'
}

// User integrations
export interface UserIntegration {
  id: string;
  type: IntegrationType;
  status: IntegrationStatus;
  config: Record<string, any>;
  lastSyncAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}



export enum IntegrationStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  ERROR = 'error',
  PENDING_AUTH = 'pending_auth'
}

// Authentication types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  timezone?: string;
}

export interface ResetPasswordRequest {
  email: string;
}

export interface UpdatePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  timezone?: string;
}

export interface UpdatePreferencesRequest {
  preferences: Partial<UserPreferences>;
}

// Session management
export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  isAuthenticated: boolean;
}

// OAuth integration data
export interface OAuthIntegration {
  provider: 'google' | 'microsoft' | 'telegram';
  accessToken: string;
  refreshToken?: string;
  expiresAt?: Date;
  scope: string[];
  userInfo: Record<string, any>;
}

// Telegram-specific integration
export interface TelegramIntegration {
  botToken: string;
  chatId: string;
  username: string;
  firstName: string;
  lastName?: string;
  isActive: boolean;
  lastMessageAt?: Date;
  settings: {
    allowCommands: boolean;
    allowVoiceNotes: boolean;
    allowImageAnalysis: boolean;
    autoResponseEnabled: boolean;
    quietHours: {
      enabled: boolean;
      start: string; // HH:MM
      end: string; // HH:MM
    };
  };
}

// API response wrapper types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}
