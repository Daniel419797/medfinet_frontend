import { supabase } from "./supabaseClient";

const AUTH_TOKEN_KEY = "medfinet_auth_token";
const REFRESH_TOKEN_KEY = "medfinet_refresh_token";

function getStorage() {
  const candidates = [
    typeof globalThis !== "undefined" ? (globalThis as typeof globalThis & { localStorage?: Storage }).localStorage : undefined,
    typeof window !== "undefined" ? window.localStorage : undefined,
  ];
  const usable = candidates.find((candidate) => candidate && typeof candidate.getItem === "function" && typeof candidate.setItem === "function" && typeof candidate.removeItem === "function");
  if (usable) {
    return usable;
  }
  const memory = new Map<string, string>();
  return {
    getItem: (key: string) => memory.get(key) ?? null,
    setItem: (key: string, value: string) => {
      memory.set(key, value);
    },
    removeItem: (key: string) => {
      memory.delete(key);
    },
    clear: () => {
      memory.clear();
    },
  } as Storage;
}

const storage = getStorage();

function readToken() {
  return storage.getItem(AUTH_TOKEN_KEY);
}

export function persistToken(token: string | null, refreshToken?: string | null) {
  if (token) storage.setItem(AUTH_TOKEN_KEY, token);
  else storage.removeItem(AUTH_TOKEN_KEY);
  if (refreshToken) storage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  else storage.removeItem(REFRESH_TOKEN_KEY);
}

export type AuthSession = {
  accessToken: string;
  refreshToken?: string | null;
  expiresIn?: number;
  user?: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
};

export const medfinetAuthApi = {
  getStoredToken() {
    return readToken();
  },
  clearSession() {
    persistToken(null, null);
  },
  async login(input: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: input.email,
      password: input.password,
    });
    if (error) {
      throw new Error(error.message);
    }
    const session = data.session;
    persistToken(session?.access_token || null, session?.refresh_token || null);
    return {
      accessToken: session?.access_token || "",
      refreshToken: session?.refresh_token || null,
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
          }
        : undefined,
    } as AuthSession;
  },
  async register(input: { email: string; password: string; name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: input.name ? { name: input.name } : undefined,
      },
    });
    if (error) {
      throw new Error(error.message);
    }
    const session = data.session;
    if (session?.access_token) {
      persistToken(session.access_token, session.refresh_token || null);
    }
    return {
      accessToken: session?.access_token || "",
      refreshToken: session?.refresh_token || null,
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
          }
        : undefined,
    } as AuthSession;
  },
  async recoverPassword(email: string, redirectTo?: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`,
    });
    if (error) {
      throw new Error(error.message);
    }
  },
  async resetPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) {
      throw new Error(error.message);
    }
    const user = data.user;
    const token = readToken();
    return {
      accessToken: token || "",
      user: user
        ? {
            id: user.id,
            email: user.email,
            user_metadata: user.user_metadata,
          }
        : undefined,
    } as AuthSession;
  },
  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error || !data.session) {
      const storedToken = readToken();
      if (!storedToken) return null;
      return null;
    }
    const session = data.session;
    persistToken(session.access_token, session.refresh_token || null);
    return {
      id: session.user.id,
      email: session.user.email,
      user_metadata: session.user.user_metadata,
    };
  },
  async logout() {
    try {
      await supabase.auth.signOut();
    } finally {
      persistToken(null, null);
    }
  },
};

export default medfinetAuthApi;

