import { supabase } from "./supabaseClient";

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

function toAuthSession(
  session: {
    access_token: string;
    refresh_token?: string | null;
    expires_in?: number;
    user: {
      id: string;
      email?: string;
      user_metadata?: Record<string, unknown>;
    };
  } | null,
): AuthSession {
  return {
    accessToken: session?.access_token || "",
    refreshToken: session?.refresh_token || null,
    expiresIn: session?.expires_in,
    user: session
      ? {
          id: session.user.id,
          email: session.user.email,
          user_metadata: session.user.user_metadata,
        }
      : undefined,
  };
}

export const medfinetAuthApi = {
  async login(input: { email: string; password: string }) {
    const { data, error } = await supabase.auth.signInWithPassword(input);
    if (error) throw new Error(error.message);
    return toAuthSession(data.session);
  },

  async register(input: { email: string; password: string; name?: string }) {
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: input.name ? { name: input.name } : undefined,
      },
    });
    if (error) throw new Error(error.message);
    return toAuthSession(data.session);
  },

  async recoverPassword(email: string, redirectTo?: string) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: redirectTo || `${window.location.origin}/reset-password`,
    });
    if (error) throw new Error(error.message);
  },

  async resetPassword(password: string) {
    const { data, error } = await supabase.auth.updateUser({ password });
    if (error) throw new Error(error.message);

    const { data: sessionData } = await supabase.auth.getSession();
    return {
      ...toAuthSession(sessionData.session),
      user: data.user
        ? {
            id: data.user.id,
            email: data.user.email,
            user_metadata: data.user.user_metadata,
          }
        : undefined,
    } as AuthSession;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw new Error(error.message);
    if (!data.session) return null;

    return {
      id: data.session.user.id,
      email: data.session.user.email,
      user_metadata: data.session.user.user_metadata,
    };
  },

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw new Error(error.message);
  },
};

export default medfinetAuthApi;
