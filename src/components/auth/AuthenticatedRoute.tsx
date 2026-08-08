import { useContext, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import type { OrganizationRole } from "../../services/medfinetSessionApi";
import { roleHomePath } from "../../utils/roleNavigation";

export function AuthenticatedRoute({
  children,
  roles,
  allowWithoutMembership = false,
}: {
  children: ReactNode;
  roles?: OrganizationRole[];
  allowWithoutMembership?: boolean;
}) {
  const { user, currentMembership, sessionReady, sessionError, refreshSession } =
    useContext(UserContext);
  const location = useLocation();

  if (!sessionReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-600">
        Restoring your secure session...
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 px-6">
        <div
          role="alert"
          className="w-full max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-red-900"
        >
          <h1 className="text-lg font-bold">Unable to restore your workspace</h1>
          <p className="mt-2 text-sm">{sessionError}</p>
          <button
            type="button"
            onClick={() => void refreshSession()}
            className="mt-4 rounded-lg bg-red-700 px-4 py-2.5 text-sm font-semibold text-white"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (!currentMembership) {
    return allowWithoutMembership ? children : <Navigate to="/onboarding" replace />;
  }

  if (roles && !roles.includes(currentMembership.role)) {
    return <Navigate to={roleHomePath(currentMembership.role)} replace />;
  }

  return children;
}
