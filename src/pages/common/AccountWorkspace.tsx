import { useContext } from "react";
import { ArrowLeft, LogOut, ShieldCheck } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { roleHomePath } from "../../utils/roleNavigation";
import UserProfile from "./UserProfile";

export default function AccountWorkspace() {
  const { currentMembership, logout } = useContext(UserContext);
  const navigate = useNavigate();

  const workspacePath = roleHomePath(currentMembership?.role);

  async function signOut() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link to={workspacePath} className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-cyan-700" />
            <div>
              <p className="font-bold">Medfinet account</p>
              <p className="text-xs text-slate-500">
                Identity and delivery preferences
              </p>
            </div>
          </Link>
          <div className="flex flex-wrap gap-2">
            <Link
              to={workspacePath}
              className="rounded-lg border px-3 py-2 text-sm font-semibold"
            >
              <ArrowLeft className="mr-2 inline h-4 w-4" />
              Workspace
            </Link>
            <button
              type="button"
              onClick={() => void signOut()}
              className="rounded-lg border px-3 py-2 text-sm font-semibold text-red-700"
            >
              <LogOut className="mr-2 inline h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </header>
      <div className="px-4 py-8 sm:px-6">
        <UserProfile />
      </div>
    </div>
  );
}
