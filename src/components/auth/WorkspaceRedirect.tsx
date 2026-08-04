import { useContext } from "react";
import { Navigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { roleHomePath } from "../../utils/roleNavigation";

export function WorkspaceRedirect() {
  const { currentMembership } = useContext(UserContext);
  return <Navigate to={roleHomePath(currentMembership?.role)} replace />;
}
