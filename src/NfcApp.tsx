import { Navigate, Route, Routes } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";
import { UserProvider } from "./contexts/UserContext";
import { AuthenticatedRoute } from "./components/auth/AuthenticatedRoute";
import NfcTapLanding from "./pages/nfc/NfcTapLanding";
import NfcProvisioningPage from "./pages/nfc/NfcProvisioningPage";
import NfcScannerPage from "./pages/nfc/NfcScannerPage";
import {
  NfcClinicalRecordPage,
  NfcEmergencyPage,
  NfcVaccinationPage,
} from "./pages/nfc/NfcChildWorkflowPage";

const fieldRoles = [
  "OWNER",
  "ADMIN",
  "HEALTH_WORKER",
  "NUTRITION_WORKER",
  "EMERGENCY_COORDINATOR",
] as const;

export default function NfcApp() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Routes>
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
          <Route path="*" element={<Navigate to="/nfc/scanner" replace />} />
        </Routes>
      </UserProvider>
    </ThemeProvider>
  );
}
