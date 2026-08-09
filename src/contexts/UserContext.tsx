import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { User } from "../types";
import {
  medfinetSessionApi,
  type OrganizationMembership,
} from "../services/medfinetSessionApi";
import { medfinetAuthApi } from "../services/medfinetAuthApi";
import { isMedfinetConnectivityError } from "../services/medfinetApiClient";
import {
  cacheOfflineSession,
  readOfflineSession,
  removeOfflineSession,
} from "../services/offlineSessionStore";
import { supabase } from "../services/supabaseClient";
import { BlockchainProvider } from "./BlockchainContext";

interface UserContextType {
  user: User | null;
  organizationId: string | null;
  memberships: OrganizationMembership[];
  currentMembership: OrganizationMembership | null;
  sessionReady: boolean;
  sessionError: string | null;
  logout: () => Promise<void>;
  setOrganizationId: (id: string) => void;
  refreshSession: () => Promise<void>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  organizationId: null,
  memberships: [],
  currentMembership: null,
  sessionReady: false,
  sessionError: null,
  logout: async () => undefined,
  setOrganizationId: () => undefined,
  refreshSession: async () => undefined,
});

function sessionUser(
  sessionUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  },
  role: string,
): User {
  const metadata = sessionUser.user_metadata || {};
  const displayName =
    typeof metadata.name === "string"
      ? metadata.name
      : typeof metadata.full_name === "string"
        ? metadata.full_name
        : sessionUser.email?.split("@")[0] || "Medfinet user";

  return {
    id: sessionUser.id,
    name: displayName,
    email: sessionUser.email || "",
    role,
    avatar:
      typeof metadata.avatar_url === "string" ? metadata.avatar_url : undefined,
  };
}

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organizationId, setOrganizationIdState] = useState<string | null>(null);
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);

  const refreshSession = useCallback(async () => {
    setSessionReady(false);
    setSessionError(null);

    try {
      const userSession = await medfinetAuthApi.getSession();
      if (!userSession) {
        setUser(null);
        setMemberships([]);
        setOrganizationIdState(null);
        return;
      }

      let available: OrganizationMembership[];
      try {
        available = await medfinetSessionApi.organizations();
        try {
          await cacheOfflineSession(userSession.id, available);
        } catch (cacheError) {
          console.warn(
            "Unable to prepare this session for offline access",
            cacheError,
          );
        }
      } catch (error) {
        if (navigator.onLine && !isMedfinetConnectivityError(error)) {
          throw error;
        }
        const cached = await readOfflineSession(userSession.id);
        if (!cached) {
          throw new Error(
            "Reconnect to Medfinet to renew this device's offline access.",
          );
        }
        available = cached.memberships;
      }
      const savedId = localStorage.getItem("medfinet_org_id");
      const selected =
        available.find((entry) => entry.organization.id === savedId) ||
        available.find((entry) => entry.organization.status === "ACTIVE") ||
        available[0] ||
        null;

      setMemberships(available);
      setOrganizationIdState(selected?.organization.id || null);
      setUser(sessionUser(userSession, selected?.role || "UNASSIGNED"));

      if (selected) {
        localStorage.setItem("medfinet_org_id", selected.organization.id);
      } else {
        localStorage.removeItem("medfinet_org_id");
      }
    } catch (error) {
      setSessionError(
        error instanceof Error
          ? error.message
          : "Unable to restore your session",
      );
      setUser(null);
      setMemberships([]);
      setOrganizationIdState(null);
    } finally {
      setSessionReady(true);
    }
  }, []);

  useEffect(() => {
    void refreshSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void refreshSession();
    });

    return () => subscription.unsubscribe();
  }, [refreshSession]);

  const currentMembership = useMemo(
    () =>
      memberships.find((entry) => entry.organization.id === organizationId) ||
      null,
    [memberships, organizationId],
  );

  const setOrganizationId = (id: string) => {
    const membership = memberships.find(
      (entry) => entry.organization.id === id,
    );
    if (!membership) return;

    setOrganizationIdState(id);
    localStorage.setItem("medfinet_org_id", id);
    setUser((current) =>
      current ? { ...current, role: membership.role } : current,
    );
  };

  const logout = async () => {
    const subjectId = user?.id;
    await medfinetAuthApi.logout();
    if (subjectId) {
      await removeOfflineSession(subjectId).catch((cacheError: unknown) => {
        console.warn("Unable to clear the offline session cache", cacheError);
      });
    }
    localStorage.removeItem("medfinet_org_id");
    setUser(null);
    setMemberships([]);
    setOrganizationIdState(null);
  };

  const content =
    user && organizationId ? (
      <BlockchainProvider>{children}</BlockchainProvider>
    ) : (
      children
    );

  return (
    <UserContext.Provider
      value={{
        user,
        organizationId,
        memberships,
        currentMembership,
        sessionReady,
        sessionError,
        logout,
        setOrganizationId,
        refreshSession,
      }}
    >
      {content}
    </UserContext.Provider>
  );
};

export default UserContext;
