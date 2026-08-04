import {
  Baby,
  Bell,
  FileLock,
  Gift,
  House,
  UserCircle,
} from "@phosphor-icons/react";
import { useContext, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { AppShell, type ShellNavigationGroup } from "../components/shell/AppShell";
import UserContext from "../contexts/UserContext";

export default function DashboardLayout() {
  const { user } = useContext(UserContext);
  const navigation = useMemo<ShellNavigationGroup[]>(
    () => [
      {
        label: "Family health",
        icon: House,
        items: [
          { label: "Home", path: "/dashboard", icon: House, exact: true },
          { label: "Child profiles", path: "/profiles", icon: Baby },
          { label: "Messages", path: "/notifications", icon: Bell },
        ],
      },
      ...(user?.role === "CAREGIVER"
        ? [
            {
              label: "Benefits and privacy",
              icon: Gift,
              items: [
                { label: "Rewards", path: "/rewards", icon: Gift },
                { label: "Privacy requests", path: "/privacy", icon: FileLock },
              ],
            },
          ]
        : []),
      {
        label: "Account",
        icon: UserCircle,
        items: [{ label: "My account", path: "/account", icon: UserCircle }],
      },
    ],
    [user?.role],
  );

  return (
    <AppShell navigation={navigation} homePath="/dashboard" portalLabel="Family health" notificationPath="/notifications">
      <Outlet />
    </AppShell>
  );
}
