import { useContext, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Activity,
  CloudSun,
  CreditCard,
  Home,
  LogOut,
  Menu,
  Moon,
  Shield,
  Sun,
  X,
  WifiOff,
  UserRound,
} from "lucide-react";
import UserContext from "../../contexts/UserContext";
import { useTheme } from "../../contexts/ThemeContext";
import { OrganizationSwitcher } from "../common/OrganizationSwitcher";

const navItems = [
  { name: "Dashboard", path: "/health-worker/dashboard", icon: Home },
  { name: "Clinical records", path: "/health-worker/clinical", icon: Activity },
  { name: "NFC scan and cards", path: "/health-worker/nfc", icon: CreditCard },
  { name: "Climate response", path: "/health-worker/climate", icon: CloudSun },
  { name: "Offline sync", path: "/health-worker/offline", icon: WifiOff },
  { name: "My account", path: "/account", icon: UserRound },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useContext(UserContext);
  const { theme, toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const content = (
    <div className="flex h-full flex-col bg-white dark:bg-neutral-800">
      <div className="border-b p-5">
        <Link
          to="/health-worker/dashboard"
          onClick={close}
          className="flex items-center"
        >
          <Shield className="mr-3 h-8 w-8 text-primary-600" />
          <div>
            <p className="font-bold">MedFiNet</p>
            <p className="text-xs text-slate-500">Health worker portal</p>
          </div>
        </Link>
        <div className="mt-4">
          <OrganizationSwitcher />
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {navItems.map(({ name, path, icon: Icon }) => (
          <Link
            key={path}
            to={path}
            onClick={close}
            className={`flex items-center rounded-lg px-3 py-2.5 text-sm font-semibold ${location.pathname === path ? "bg-primary-50 text-primary-700" : "text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"}`}
          >
            <Icon className="mr-3 h-5 w-5" />
            {name}
          </Link>
        ))}
      </nav>
      <div className="border-t p-4">
        <div className="mb-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-700">
          <p className="truncate text-sm font-semibold">{user?.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">
            {user?.role.replaceAll("_", " ")}
          </p>
        </div>
        <button
          onClick={toggleTheme}
          className="flex w-full items-center rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 dark:text-slate-300"
        >
          {theme === "light" ? (
            <Moon className="mr-3 h-4 w-4" />
          ) : (
            <Sun className="mr-3 h-4 w-4" />
          )}
          Change theme
        </button>
        <button
          onClick={() => void logout().then(() => navigate("/login"))}
          className="mt-1 flex w-full items-center rounded-lg px-3 py-2 text-sm text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
  return (
    <>
      <button
        type="button"
        aria-label="Open navigation"
        onClick={() => setOpen(true)}
        className="fixed left-3 top-3 z-40 rounded-lg border bg-white p-2 shadow md:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/40 md:hidden"
          onClick={close}
        >
          <aside
            className="h-full w-80 max-w-[85vw]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              aria-label="Close navigation"
              onClick={close}
              className="absolute left-[270px] top-3 z-10 p-2"
            >
              <X />
            </button>
            {content}
          </aside>
        </div>
      )}
      <aside className="hidden h-screen w-64 shrink-0 border-r md:block">
        {content}
      </aside>
    </>
  );
}
