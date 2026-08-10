import {
  CloudSun,
  CreditCard,
  FirstAidKit,
  Gauge,
  Heartbeat,
  Robot,
  Clock,
  UserCircle,
  WifiSlash,
} from "@phosphor-icons/react";
import { useContext, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { AppShell, type ShellNavigationGroup } from "../components/shell/AppShell";
import UserContext from "../contexts/UserContext";

export default function HealthWorkerLayout() {
  const { currentMembership } = useContext(UserContext);
  const role = currentMembership?.role;

  const { navigation, portalLabel } = useMemo<{
    navigation: ShellNavigationGroup[];
    portalLabel: string;
  }>(() => {
    const account: ShellNavigationGroup = {
      label: "Account",
      icon: UserCircle,
      items: [{ label: "My account", path: "/account", icon: UserCircle }],
    };

    if (role === "NUTRITION_WORKER") {
      return {
        portalLabel: "Nutrition care",
        navigation: [
          {
            label: "Nutrition care",
            icon: Heartbeat,
            items: [
              {
                label: "Today's overview",
                path: "/health-worker/dashboard",
                icon: Gauge,
                exact: true,
              },
              {
                label: "Growth & nutrition",
                path: "/health-worker/clinical",
                icon: FirstAidKit,
              },
              {
                label: "Offline sync",
                path: "/health-worker/offline",
                icon: WifiSlash,
              },
            ],
          },
          account,
        ],
      };
    }

    if (role === "EMERGENCY_COORDINATOR") {
      return {
        portalLabel: "Emergency response",
        navigation: [
          {
            label: "Emergency response",
            icon: CloudSun,
            items: [
              {
                label: "Today's overview",
                path: "/health-worker/dashboard",
                icon: Gauge,
                exact: true,
              },
              {
                label: "Climate response",
                path: "/health-worker/climate",
                icon: CloudSun,
              },
              {
                label: "NFC emergency scan",
                path: "/health-worker/nfc",
                icon: CreditCard,
              },
              {
                label: "Offline sync",
                path: "/health-worker/offline",
                icon: WifiSlash,
              },
            ],
          },
          account,
        ],
      };
    }

    return {
      portalLabel: "Care delivery",
      navigation: [
        {
          label: "Care delivery",
          icon: Heartbeat,
          items: [
            {
              label: "Today's overview",
              path: "/health-worker/dashboard",
              icon: Gauge,
              exact: true,
            },
            {
              label: "Clinical records",
              path: "/health-worker/clinical",
              icon: FirstAidKit,
            },
            {
              label: "NFC scan and cards",
              path: "/health-worker/nfc",
              icon: CreditCard,
            },
            {
              label: "AI assistant",
              path: "/health-worker/ai/assistant",
              icon: Robot,
            },
            {
              label: "AI timeline",
              path: "/health-worker/ai/timeline",
              icon: Clock,
            },
            {
              label: "Offline sync",
              path: "/health-worker/offline",
              icon: WifiSlash,
            },
          ],
        },
        account,
      ],
    };
  }, [role]);

  return (
    <AppShell
      navigation={navigation}
      homePath="/health-worker/dashboard"
      portalLabel={portalLabel}
    >
      <Outlet />
    </AppShell>
  );
}
