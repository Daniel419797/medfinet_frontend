import {
  Baby,
  Bell,
  Broadcast,
  Buildings,
  ChartLineUp,
  CloudSun,
  CreditCard,
  Devices,
  Fingerprint,
  FirstAidKit,
  Gauge,
  HandCoins,
  Heartbeat,
  LinkSimple,
  PlugsConnected,
  Power,
  Robot,
  Scales,
  ShieldCheck,
  Syringe,
  Translate,
  UserGear,
  UsersThree,
  Warning,
} from "@phosphor-icons/react";
import { useContext, useMemo } from "react";
import { Outlet } from "react-router-dom";
import { AppShell, type ShellNavigationGroup } from "../components/shell/AppShell";
import { useBlockchain } from "../contexts/BlockchainContext";
import UserContext from "../contexts/UserContext";

export default function AdminLayout() {
  const { user } = useContext(UserContext);
  const { featureEnabled } = useBlockchain();
  const anchorsEnabled = featureEnabled("anchors");
  const donationsEnabled = featureEnabled("donations");
  const escrowEnabled = featureEnabled("escrow");

  const navigation = useMemo<ShellNavigationGroup[]>(
    () => [
      {
        label: "Operations",
        icon: Heartbeat,
        items: [
          { label: "Operational overview", path: "/admin/dashboard", icon: Gauge, exact: true },
          { label: "Clinical records", path: "/admin/clinical", icon: FirstAidKit },
          { label: "Vaccines & certificates", path: "/admin/vaccines", icon: Syringe },
          { label: "Vaccine schedules", path: "/admin/schedules", icon: Syringe },
          { label: "Climate response", path: "/admin/climate", icon: CloudSun },
          { label: "USSD operations", path: "/admin/ussd", icon: Broadcast },
        ],
      },
      {
        label: "People and identity",
        icon: UsersThree,
        items: [
          { label: "Team and access", path: "/admin/users", icon: UserGear },
          { label: "Caregivers", path: "/admin/caregivers", icon: UsersThree },
          { label: "Identity integrity", path: "/admin/identity-integrity", icon: Fingerprint },
          { label: "Child records", path: "/admin/clinical", icon: Baby },
        ],
      },
      {
        label: "Facilities and devices",
        icon: Buildings,
        items: [
          { label: "Facilities and programmes", path: "/admin/resources", icon: Buildings },
          { label: "NFC operations", path: "/admin/nfc", icon: CreditCard },
          { label: "Trusted devices", path: "/admin/devices", icon: Devices },
          { label: "Safety and consent", path: "/admin/safety", icon: ShieldCheck },
        ],
      },
      {
        label: "Data and governance",
        icon: Scales,
        items: [
          { label: "Analytics and reports", path: "/admin/analytics", icon: ChartLineUp },
          { label: "FHIR and DHIS2", path: "/admin/api", icon: PlugsConnected },
          { label: "Mapping assist", path: "/admin/ai/mapping", icon: PlugsConnected },
          { label: "Data governance", path: "/admin/governance", icon: Scales },
          ...(anchorsEnabled ? [{ label: "Blockchain evidence", path: "/admin/blockchain", icon: LinkSimple }] : []),
          { label: "Languages", path: "/admin/localization", icon: Translate },
          { label: "AI localization", path: "/admin/ai/localization", icon: Translate },
        ],
      },
      {
        label: "AI services",
        icon: Robot,
        items: [
          { label: "Duplicate detection", path: "/admin/ai/duplicates", icon: Fingerprint },
          { label: "Reward anomalies", path: "/admin/ai/rewards", icon: Warning },
        ],
      },
      ...((donationsEnabled || escrowEnabled)
        ? [{
            label: "Finance",
            icon: HandCoins,
            items: [
              ...(donationsEnabled ? [{ label: "Donations", path: "/admin/donations", icon: HandCoins }] : []),
              ...(escrowEnabled ? [{ label: "Escrow", path: "/admin/escrow", icon: CreditCard }] : []),
              { label: "Credentials", path: "/admin/credentials", icon: CreditCard },
            ],
          }]
        : [{
            label: "Finance",
            icon: HandCoins,
            items: [{ label: "Credentials", path: "/admin/credentials", icon: CreditCard }],
          }]),
      {
        label: "Organization",
        icon: Power,
        items: [
          ...(user?.role === "OWNER"
            ? [{ label: "Organization status", path: "/admin/organization", icon: Power }]
            : []),
          { label: "Rewards and merchants", path: "/admin/rewards", icon: CreditCard },
          { label: "Notifications", path: "/admin/notifications", icon: Bell },
        ],
      },
    ],
    [anchorsEnabled, donationsEnabled, escrowEnabled, user?.role],
  );

  return (
    <AppShell
      navigation={navigation}
      homePath="/admin/dashboard"
      portalLabel="Administration"
      notificationPath="/admin/notifications"
    >
      <Outlet />
    </AppShell>
  );
}
