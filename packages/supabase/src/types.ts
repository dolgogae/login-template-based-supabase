export type AuthProvider = "google" | "apple" | "kakao" | "naver";

export interface EnabledProviders {
  google: boolean;
  apple: boolean;
  kakao: boolean;
  naver: boolean;
}

export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  provider: AuthProvider;
  createdAt: string;
}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}
