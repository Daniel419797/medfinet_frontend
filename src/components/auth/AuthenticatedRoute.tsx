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
  const { user, currentMembership, sessionReady, sessionError } =
    useContext(UserContext);
  const location = useLocation();

  if (!sessionReady) {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 text-sm font-medium text-slate-600">
        Restoring your secure session...
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  if (sessionError) {
    return (
      <div
        role="alert"
        className="mx-auto mt-20 max-w-lg rounded-xl border border-red-200 bg-red-50 p-6 text-red-800"
      >
        {sessionError}
      </div>
    );
  }
  if (!currentMembership) {
    return allowWithoutMembership ? children : <Navigate to="/onboarding" replace />;
  }
  if (roles && !roles.includes(currentMembership.role)) {
    return <Navigate to={roleHomePath(currentMembership.role)} replace />;
  }
  return children;
}
