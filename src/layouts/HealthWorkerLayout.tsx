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
import { Outlet } from "react-router-dom";
import { AppShell, type ShellNavigationGroup } from "../components/shell/AppShell";

const navigation: ShellNavigationGroup[] = [
  {
    label: "Care delivery",
    icon: Heartbeat,
    items: [
      { label: "Today's overview", path: "/health-worker/dashboard", icon: Gauge, exact: true },
      { label: "Clinical records", path: "/health-worker/clinical", icon: FirstAidKit },
      { label: "NFC scan and cards", path: "/health-worker/nfc", icon: CreditCard },
      { label: "AI assistant", path: "/health-worker/ai/assistant", icon: Robot },
      { label: "AI timeline", path: "/health-worker/ai/timeline", icon: Clock },
    ],
  },
  {
    label: "Field operations",
    icon: CloudSun,
    items: [
      { label: "Climate response", path: "/health-worker/climate", icon: CloudSun },
      { label: "Offline sync", path: "/health-worker/offline", icon: WifiSlash },
    ],
  },
  {
    label: "Account",
    icon: UserCircle,
    items: [{ label: "My account", path: "/account", icon: UserCircle }],
  },
];

export default function HealthWorkerLayout() {
  return (
    <AppShell navigation={navigation} homePath="/health-worker/dashboard" portalLabel="Care delivery">
      <Outlet />
    </AppShell>
  );
}
