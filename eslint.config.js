import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist"] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: [
      "src/{main,NfcApp,App}.{ts,tsx}",
      "src/admin/pages/{AnalyticsReports,BlockchainEvidence,CaregiverAdministration,ClimateOperations,DeviceAdministration,GovernanceAdministration,IdentityIntegrityAdministration,IntegrationAdministration,LocalizationAdministration,NotificationAdministration,OperationalOverview,OrganizationLifecycle,OrganizationResources,RewardsOperations,SafetyAdministration,UssdOperations,UserManagement,VaccineScheduleAdministration}.tsx",
      "src/components/auth/**/*.{ts,tsx}",
      "src/components/common/**/*.{ts,tsx}",
      "src/components/health-worker/Sidebar.tsx",
      "src/components/offline/**/*.{ts,tsx}",
      "src/components/pwa/**/*.{ts,tsx}",
      "src/contexts/{ThemeContext,UserContext}.tsx",
      "src/hooks/{useMedfinetApi,useOnlineStatus}.ts",
      "src/layouts/{AdminLayout,AuthLayout,DashboardLayout,HealthWorkerLayout}.tsx",
      "src/pages/auth/{Login,OrganizationOnboarding,PasswordRecovery,PasswordReset,Register}.tsx",
      "src/pages/climate/**/*.tsx",
      "src/pages/clinical/**/*.tsx",
      "src/pages/common/{AccountWorkspace,NotificationsPage,UserProfile}.tsx",
      "src/pages/dashboard/Dashboard.tsx",
      "src/pages/health-worker/HealthWorkerDashboard.tsx",
      "src/pages/immunization/{ChildProfiles,VaccinationHistory}.tsx",
      "src/pages/landing/LandingPage.tsx",
      "src/pages/nfc/**/*.tsx",
      "src/pages/offline/**/*.tsx",
      "src/pages/{audit,merchant,privacy,rewards}/**/*.tsx",
      "src/services/{medfinet*,nfcDeviceKeyStore,supabaseClient}.{ts,tsx}",
      "src/services/{nfcOfflineStore,offlineQueueStore,offlineSessionStore,offlineSyncService,pwaBackgroundSync,secureOfflineStore}.{ts,tsx}",
      "src/test/**/*.{ts,tsx}",
      "src/utils/supabaseClient.ts",
      "src/utils/roleNavigation{,.test}.ts",
      "vitest.config.ts",
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
);
