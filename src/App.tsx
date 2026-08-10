import { Navigate, Route, Routes } from "react-router-dom";
import { lazy, Suspense } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { AuthenticatedRoute } from "./components/auth/AuthenticatedRoute";
import { WorkspaceRedirect } from "./components/auth/WorkspaceRedirect";
import { OfflineSyncCoordinator } from "./components/offline/OfflineSyncCoordinator";
import {
  CLINICAL_READ_ROLES,
  CLINICAL_WRITE_ROLES,
} from "./utils/clinicalAccess";
import AuthLayout from "./layouts/AuthLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import HealthWorkerLayout from "./layouts/HealthWorkerLayout";
import AdminLayout from "./layouts/AdminLayout";
const LandingPage = lazy(() => import("./pages/landing/LandingPage"));
const Login = lazy(() => import("./pages/auth/Login"));
const Register = lazy(() => import("./pages/auth/Register"));
const PasswordRecovery = lazy(() => import("./pages/auth/PasswordRecovery"));
const PasswordReset = lazy(() => import("./pages/auth/PasswordReset"));
const OrganizationOnboarding = lazy(
  () => import("./pages/auth/OrganizationOnboarding"),
);
const Dashboard = lazy(() => import("./pages/dashboard/Dashboard"));
const ChildProfiles = lazy(() => import("./pages/immunization/ChildProfiles"));
const VaccinationHistory = lazy(
  () => import("./pages/immunization/VaccinationHistory"),
);
const NotificationsPage = lazy(
  () => import("./pages/common/NotificationsPage"),
);
const AccountWorkspace = lazy(() => import("./pages/common/AccountWorkspace"));
const ClinicalOperations = lazy(
  () => import("./pages/clinical/ClinicalOperations"),
);
const HealthWorkerDashboard = lazy(
  () => import("./pages/health-worker/HealthWorkerDashboard"),
);
const OperationalOverview = lazy(
  () => import("./admin/pages/OperationalOverview"),
);
const UserManagement = lazy(() => import("./admin/pages/UserManagement"));
const CaregiverAdministration = lazy(
  () => import("./admin/pages/CaregiverAdministration"),
);
const AnalyticsReports = lazy(() => import("./admin/pages/AnalyticsReports"));
const UssdOperations = lazy(() => import("./admin/pages/UssdOperations"));
const OrganizationResources = lazy(
  () => import("./admin/pages/OrganizationResources"),
);
const ClimateOperations = lazy(() => import("./admin/pages/ClimateOperations"));
const RewardsOperations = lazy(() => import("./admin/pages/RewardsOperations"));
const NotificationAdministration = lazy(
  () => import("./admin/pages/NotificationAdministration"),
);
const GovernanceAdministration = lazy(
  () => import("./admin/pages/GovernanceAdministration"),
);
const LocalizationAdministration = lazy(
  () => import("./admin/pages/LocalizationAdministration"),
);
const IntegrationAdministration = lazy(
  () => import("./admin/pages/IntegrationAdministration"),
);
const NfcProvisioningPage = lazy(
  () => import("./pages/nfc/NfcProvisioningPage"),
);
const DeviceAdministration = lazy(
  () => import("./admin/pages/DeviceAdministration"),
);
const SafetyAdministration = lazy(
  () => import("./admin/pages/SafetyAdministration"),
);
const VaccineScheduleAdministration = lazy(
  () => import("./admin/pages/VaccineScheduleAdministration"),
);
const IdentityIntegrityAdministration = lazy(
  () => import("./admin/pages/IdentityIntegrityAdministration"),
);
const ResponseWorklists = lazy(
  () => import("./pages/climate/ResponseWorklists"),
);
const OfflineSync = lazy(() => import("./pages/offline/OfflineSync"));
const NfcScannerPage = lazy(() => import("./pages/nfc/NfcScannerPage"));
const NfcClinicalRecordPage = lazy(() =>
  import("./pages/nfc/NfcChildWorkflowPage").then((module) => ({
    default: module.NfcClinicalRecordPage,
  })),
);
const NfcVaccinationPage = lazy(() =>
  import("./pages/nfc/NfcChildWorkflowPage").then((module) => ({
    default: module.NfcVaccinationPage,
  })),
);
const NfcEmergencyPage = lazy(() =>
  import("./pages/nfc/NfcChildWorkflowPage").then((module) => ({
    default: module.NfcEmergencyPage,
  })),
);
const BlockchainEvidence = lazy(
  () => import("./admin/pages/BlockchainEvidence"),
);
const MerchantWorkspace = lazy(
  () => import("./pages/merchant/MerchantWorkspace"),
);
const AuditWorkspace = lazy(() => import("./pages/audit/AuditWorkspace"));
const OrganizationLifecycle = lazy(
  () => import("./admin/pages/OrganizationLifecycle"),
);
const CaregiverRewards = lazy(() => import("./pages/rewards/CaregiverRewards"));
const CaregiverPrivacy = lazy(() => import("./pages/privacy/CaregiverPrivacy"));
const AiAssistant = lazy(() => import("./admin/pages/AiAssistant"));
const AiTimelineSummary = lazy(() => import("./admin/pages/AiTimelineSummary"));
const AiDuplicates = lazy(() => import("./admin/pages/AiDuplicates"));
const AiRewardAnomalies = lazy(() => import("./admin/pages/AiRewardAnomalies"));
const AiMappingAssist = lazy(() => import("./admin/pages/AiMappingAssist"));
const AiLocalizationAssist = lazy(() => import("./admin/pages/AiLocalizationAssist"));
const DonationFlow = lazy(() => import("./admin/pages/DonationFlow"));
const EscrowDashboard = lazy(() => import("./admin/pages/EscrowDashboard"));
const CredentialManagement = lazy(() => import("./admin/pages/CredentialManagement"));

function NotFound() {
  return (
    <main className="grid min-h-[60vh] place-items-center p-6 text-center">
      <div>
        <p className="text-sm font-bold text-cyan-700">404</p>
        <h1 className="mt-2 text-3xl font-bold">Page not found</h1>
        <p className="mt-2 text-slate-600">
          The requested Medfinet workspace does not exist or is not available to
          your role.
        </p>
      </div>
    </main>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <OfflineSyncCoordinator />
        <Suspense
          fallback={
            <div
              role="status"
              className="grid min-h-screen place-items-center text-sm font-semibold text-slate-600"
            >
              Loading secure workspace...
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route element={<AuthLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<PasswordRecovery />} />
              <Route path="/reset-password" element={<PasswordReset />} />
            </Route>
            <Route
              path="/onboarding"
              element={
                <AuthenticatedRoute allowWithoutMembership>
                  <OrganizationOnboarding />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/workspace"
              element={
                <AuthenticatedRoute>
                  <WorkspaceRedirect />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/account"
              element={
                <AuthenticatedRoute>
                  <AccountWorkspace />
                </AuthenticatedRoute>
              }
            />

            <Route
              element={
                <AuthenticatedRoute
                  roles={[
                    "OWNER",
                    "ADMIN",
                    "HEALTH_WORKER",
                    "NUTRITION_WORKER",
                    "EMERGENCY_COORDINATOR",
                    "CAREGIVER",
                  ]}
                >
                  <DashboardLayout />
                </AuthenticatedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profiles" element={<ChildProfiles />} />
              <Route
                path="/vaccination-history/:id"
                element={<VaccinationHistory />}
              />
              <Route path="/notifications" element={<NotificationsPage />} />
              <Route path="/profile" element={<Navigate to="/account" replace />} />
              <Route
                path="/rewards"
                element={
                  <AuthenticatedRoute roles={["CAREGIVER"]}>
                    <CaregiverRewards />
                  </AuthenticatedRoute>
                }
              />
              <Route
                path="/privacy"
                element={
                  <AuthenticatedRoute roles={["CAREGIVER"]}>
                    <CaregiverPrivacy />
                  </AuthenticatedRoute>
                }
              />
            </Route>

            <Route
              path="/health-worker/*"
              element={
                <AuthenticatedRoute
                  roles={[
                    "OWNER",
                    "ADMIN",
                    "HEALTH_WORKER",
                    "NUTRITION_WORKER",
                    "EMERGENCY_COORDINATOR",
                  ]}
                >
                  <HealthWorkerLayout />
                </AuthenticatedRoute>
              }
            >
              <Route index element={<Navigate to="clinical" replace />} />
              <Route path="dashboard" element={<HealthWorkerDashboard />} />
              <Route
                path="clinical"
                element={
                  <AuthenticatedRoute roles={[...CLINICAL_WRITE_ROLES]}>
                    <ClinicalOperations />
                  </AuthenticatedRoute>
                }
              />
              <Route path="climate" element={<ResponseWorklists />} />
              <Route path="offline" element={<OfflineSync />} />
              <Route path="nfc" element={<NfcScannerPage />} />
              <Route path="ai/assistant" element={<AiAssistant />} />
              <Route path="ai/timeline" element={<AiTimelineSummary />} />
              <Route
                path="nfc/children/:childId/clinical"
                element={
                  <AuthenticatedRoute roles={[...CLINICAL_READ_ROLES]}>
                    <NfcClinicalRecordPage />
                  </AuthenticatedRoute>
                }
              />
              <Route
                path="nfc/children/:childId/vaccination"
                element={
                  <AuthenticatedRoute roles={[...CLINICAL_WRITE_ROLES]}>
                    <NfcVaccinationPage />
                  </AuthenticatedRoute>
                }
              />
              <Route
                path="nfc/children/:childId/emergency"
                element={<NfcEmergencyPage />}
              />
            </Route>

            <Route
              path="/admin/login"
              element={<Navigate to="/login" replace />}
            />
            <Route
              path="/merchant"
              element={
                <AuthenticatedRoute roles={["MERCHANT"]}>
                  <MerchantWorkspace />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/audit"
              element={
                <AuthenticatedRoute roles={["AUDITOR"]}>
                  <AuditWorkspace />
                </AuthenticatedRoute>
              }
            />
            <Route
              path="/admin/*"
              element={
                <AuthenticatedRoute roles={["OWNER", "ADMIN"]}>
                  <AdminLayout />
                </AuthenticatedRoute>
              }
            >
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<OperationalOverview />} />
              <Route path="users" element={<UserManagement />} />
              <Route
                path="organization"
                element={
                  <AuthenticatedRoute roles={["OWNER"]}>
                    <OrganizationLifecycle />
                  </AuthenticatedRoute>
                }
              />
              <Route path="caregivers" element={<CaregiverAdministration />} />
              <Route path="clinical" element={<ClinicalOperations />} />
              <Route path="resources" element={<OrganizationResources />} />
              <Route path="analytics" element={<AnalyticsReports />} />
              <Route path="api" element={<IntegrationAdministration />} />
              <Route path="ussd" element={<UssdOperations />} />
              <Route path="nfc" element={<NfcProvisioningPage />} />
              <Route path="devices" element={<DeviceAdministration />} />
              <Route path="safety" element={<SafetyAdministration />} />
              <Route
                path="schedules"
                element={<VaccineScheduleAdministration />}
              />
              <Route
                path="identity-integrity"
                element={<IdentityIntegrityAdministration />}
              />
              <Route path="blockchain" element={<BlockchainEvidence />} />
              <Route path="climate" element={<ClimateOperations />} />
              <Route path="rewards" element={<RewardsOperations />} />
              <Route
                path="notifications"
                element={<NotificationAdministration />}
              />
              <Route path="governance" element={<GovernanceAdministration />} />
              <Route
                path="localization"
                element={<LocalizationAdministration />}
              />
              <Route path="ai/duplicates" element={<AiDuplicates />} />
              <Route path="ai/rewards" element={<AiRewardAnomalies />} />
              <Route path="ai/mapping" element={<AiMappingAssist />} />
              <Route path="ai/localization" element={<AiLocalizationAssist />} />
              <Route path="donations" element={<DonationFlow />} />
              <Route path="escrow" element={<EscrowDashboard />} />
              <Route path="credentials" element={<CredentialManagement />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </UserProvider>
    </ThemeProvider>
  );
}
