import { useContext, useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import UserContext from "./contexts/UserContext";
import { AuthenticatedRoute } from "./components/auth/AuthenticatedRoute";
import { OfflineSyncCoordinator } from "./components/offline/OfflineSyncCoordinator";
import AuthLayout from "./layouts/AuthLayout";
import NfcTapLanding from "./pages/nfc/NfcTapLanding";
import NfcProvisioningPage from "./pages/nfc/NfcProvisioningPage";
import NfcScannerPage from "./pages/nfc/NfcScannerPage";
import OfflineSync from "./pages/offline/OfflineSync";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import PasswordRecovery from "./pages/auth/PasswordRecovery";
import PasswordReset from "./pages/auth/PasswordReset";
import OrganizationOnboarding from "./pages/auth/OrganizationOnboarding";
import {
  NfcClinicalRecordPage,
  NfcEmergencyPage,
  NfcVaccinationPage,
} from "./pages/nfc/NfcChildWorkflowPage";
import { roleHomePath } from "./utils/roleNavigation";

const fieldRoles = [
  "OWNER",
  "ADMIN",
  "HEALTH_WORKER",
  "NUTRITION_WORKER",
  "EMERGENCY_COORDINATOR",
] as const;

function FullApplicationRedirect() {
  const location = useLocation();
  const destination = `${location.pathname}${location.search}${location.hash}`;
  useEffect(() => {
    window.location.replace(destination);
  }, [destination]);
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-600">
      Opening your Medfinet workspace...
    </div>
  );
}

function PwaWorkspaceRedirect() {
  const { currentMembership } = useContext(UserContext);
  const role = currentMembership?.role;
  if (role && fieldRoles.some((fieldRole) => fieldRole === role)) {
    return <Navigate to="/nfc/scanner" replace />;
  }
  return <Navigate to={roleHomePath(role)} replace />;
}

export default function NfcApp() {
  return (
    <ThemeProvider>
      <UserProvider>
        <OfflineSyncCoordinator />
        <Routes>
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
                <PwaWorkspaceRedirect />
              </AuthenticatedRoute>
            }
          />
          <Route path="/nfc/tap/:publicId" element={<NfcTapLanding />} />
          <Route
            path="/nfc/scanner"
            element={
              <AuthenticatedRoute roles={[...fieldRoles]}>
                <NfcScannerPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/nfc/provision"
            element={
              <AuthenticatedRoute roles={["OWNER", "ADMIN"]}>
                <NfcProvisioningPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/nfc/offline"
            element={
              <AuthenticatedRoute roles={[...fieldRoles]}>
                <OfflineSync />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/nfc/children/:childId/clinical"
            element={
              <AuthenticatedRoute roles={[...fieldRoles]}>
                <NfcClinicalRecordPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/nfc/children/:childId/vaccination"
            element={
              <AuthenticatedRoute roles={[...fieldRoles]}>
                <NfcVaccinationPage />
              </AuthenticatedRoute>
            }
          />
          <Route
            path="/nfc/children/:childId/emergency"
            element={
              <AuthenticatedRoute roles={[...fieldRoles]}>
                <NfcEmergencyPage />
              </AuthenticatedRoute>
            }
          />
          <Route path="/dashboard" element={<FullApplicationRedirect />} />
          <Route path="/health-worker/*" element={<FullApplicationRedirect />} />
          <Route path="/admin/*" element={<FullApplicationRedirect />} />
          <Route path="/merchant" element={<FullApplicationRedirect />} />
          <Route path="/audit" element={<FullApplicationRedirect />} />
          <Route path="*" element={<Navigate to="/nfc/scanner" replace />} />
        </Routes>
      </UserProvider>
    </ThemeProvider>
  );
}
