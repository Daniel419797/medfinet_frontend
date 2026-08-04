import {
  Bell,
  Buildings,
  CaretDoubleLeft,
  CaretDoubleRight,
  List,
  MagnifyingGlass,
  SignOut,
  ShieldCheck,
  X,
  type Icon,
} from "@phosphor-icons/react";
import {
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import UserContext from "../../contexts/UserContext";
import { Modal } from "../common/Modal";
import { OrganizationSwitcher } from "../common/OrganizationSwitcher";
import ThemeToggle from "../common/ThemeToggle";

type ShellIcon = Icon;

export type ShellNavigationItem = {
  label: string;
  path: string;
  icon: ShellIcon;
  exact?: boolean;
};

export type ShellNavigationGroup = {
  label: string;
  icon: ShellIcon;
  items: ShellNavigationItem[];
};

type AppShellProps = {
  navigation: ShellNavigationGroup[];
  homePath: string;
  portalLabel: string;
  notificationPath?: string;
  children: ReactNode;
};

function pathMatches(pathname: string, item: ShellNavigationItem) {
  return item.exact
    ? pathname === item.path
    : pathname === item.path || pathname.startsWith(`${item.path}/`);
}

export function AppShell({
  navigation,
  homePath,
  portalLabel,
  notificationPath,
  children,
}: AppShellProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, memberships, organizationId, logout } = useContext(UserContext);
  const routeGroup = Math.max(
    0,
    navigation.findIndex((group) =>
      group.items.some((item) => pathMatches(location.pathname, item)),
    ),
  );
  const [activeGroup, setActiveGroup] = useState(routeGroup);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  useEffect(() => setActiveGroup(routeGroup), [routeGroup]);
  useEffect(() => setMobileOpen(false), [location.pathname]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const activeMembership = memberships.find(
    (membership) => membership.organization.id === organizationId,
  );
  const organizationName =
    activeMembership?.organization.name || "Medfinet organization";
  const initials = (user?.name || "Medfinet User")
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const allItems = useMemo(
    () => navigation.flatMap((group) => group.items),
    [navigation],
  );
  const filteredItems = allItems.filter((item) =>
    item.label.toLowerCase().includes(query.trim().toLowerCase()),
  );

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    <div className="min-h-screen bg-[#f7f9fb] text-slate-800 dark:bg-slate-950 dark:text-slate-100">
      <header className="fixed inset-x-0 top-0 z-30 flex h-16 items-center border-b border-slate-200 bg-white/95 px-3 backdrop-blur md:left-16 dark:border-slate-800 dark:bg-slate-950/95">
        <button
          type="button"
          className="mf-icon-button mr-2 md:hidden"
          aria-label="Open navigation"
          onClick={() => setMobileOpen(true)}
        >
          <List size={22} />
        </button>
        <Link to={homePath} className="mr-4 flex min-w-0 items-center gap-2 md:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary-600 text-white">
            <ShieldCheck size={21} weight="duotone" />
          </span>
          <span className="font-extrabold text-slate-950 dark:text-white">Medfinet</span>
        </Link>
        <div className="hidden min-w-0 items-center gap-3 lg:flex">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-primary-50 text-primary-700 dark:bg-primary-950">
            <Buildings size={19} weight="duotone" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Organization</p>
            <p className="max-w-56 truncate text-sm font-bold text-slate-800 dark:text-slate-100">{organizationName}</p>
          </div>
          <OrganizationSwitcher />
        </div>
        <button
          type="button"
          onClick={() => setSearchOpen(true)}
          className="mx-auto hidden h-10 w-full max-w-md items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm text-slate-500 transition hover:border-slate-300 hover:bg-white sm:flex dark:border-slate-700 dark:bg-slate-900"
        >
          <MagnifyingGlass size={18} />
          <span className="min-w-0 flex-1 truncate">Search Medfinet workflows</span>
          <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-bold dark:border-slate-700 dark:bg-slate-800">Ctrl K</kbd>
        </button>
        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <ThemeToggle />
          {notificationPath && (
            <Link className="mf-icon-button relative" to={notificationPath} aria-label="Open notifications">
              <Bell size={21} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-950" />
            </Link>
          )}
          <Link to="/account" className="flex items-center gap-2 rounded-lg p-1.5 transition hover:bg-slate-100 dark:hover:bg-slate-800" aria-label="Open account settings">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary-700 text-xs font-extrabold text-white">{initials}</span>
            <span className="hidden min-w-0 xl:block">
              <span className="block max-w-44 truncate text-sm font-bold text-slate-900 dark:text-white">{user?.name}</span>
              <span className="block text-[11px] font-semibold capitalize text-slate-500">{user?.role.replaceAll("_", " ").toLowerCase()}</span>
            </span>
          </Link>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-16 flex-col bg-[#071d38] text-white md:flex">
        <Link to={homePath} aria-label="Medfinet home" className="grid h-16 place-items-center border-b border-white/10">
          <span className="grid h-9 w-9 place-items-center rounded-lg border border-primary-400/40 bg-primary-500/15 text-primary-200">
            <ShieldCheck size={21} weight="duotone" />
          </span>
        </Link>
        <nav aria-label="Workspace categories" className="flex flex-1 flex-col items-center gap-2 overflow-y-auto py-4">
          {navigation.map((group, index) => {
            const Icon = group.icon;
            const selected = index === activeGroup;
            return (
              <button
                key={group.label}
                type="button"
                title={group.label}
                aria-label={group.label}
                aria-pressed={selected}
                onClick={() => {
                  setActiveGroup(index);
                  setCollapsed(false);
                }}
                className={`grid h-10 w-10 place-items-center rounded-lg transition ${selected ? "bg-primary-600 text-white shadow-sm" : "text-slate-400 hover:bg-white/10 hover:text-white"}`}
              >
                <Icon size={21} />
              </button>
            );
          })}
        </nav>
        <button type="button" onClick={() => void handleLogout()} className="m-3 grid h-10 w-10 place-items-center rounded-lg text-slate-400 hover:bg-white/10 hover:text-white" aria-label="Sign out">
          <SignOut size={21} />
        </button>
      </aside>

      <aside className={`fixed bottom-0 left-16 top-0 z-20 hidden border-r border-slate-200 bg-[#0b2748] pt-16 text-slate-100 transition-[width] md:block dark:border-slate-800 ${collapsed ? "w-0 overflow-hidden" : "w-[232px]"}`}>
        <div className="flex h-full w-[232px] flex-col">
          <div className="px-4 pb-3 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{navigation[activeGroup]?.label}</p>
            <p className="mt-1 text-sm font-extrabold text-white">{portalLabel}</p>
          </div>
          <nav aria-label={`${navigation[activeGroup]?.label} navigation`} className="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
            {navigation[activeGroup]?.items.map((item) => {
              const Icon = item.icon;
              const current = pathMatches(location.pathname, item);
              return (
                <Link key={item.path} to={item.path} aria-current={current ? "page" : undefined} className={`flex min-h-10 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold transition ${current ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-white/8 hover:text-white"}`}>
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
          <button type="button" onClick={() => setCollapsed(true)} className="flex items-center gap-2 border-t border-white/10 px-4 py-4 text-xs font-bold text-slate-400 hover:text-white">
            <CaretDoubleLeft size={17} /> Collapse
          </button>
        </div>
      </aside>

      {collapsed && (
        <button type="button" aria-label="Expand navigation" onClick={() => setCollapsed(false)} className="fixed bottom-4 left-20 z-30 hidden h-10 w-10 place-items-center rounded-lg bg-[#0b2748] text-white shadow-lg md:grid">
          <CaretDoubleRight size={18} />
        </button>
      )}

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/55 md:hidden" onMouseDown={() => setMobileOpen(false)}>
          <aside className="h-full w-[min(88vw,340px)] overflow-y-auto bg-[#0b2748] text-white shadow-2xl" onMouseDown={(event) => event.stopPropagation()} aria-label="Mobile navigation">
            <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
              <Link to={homePath} className="font-extrabold">Medfinet</Link>
              <button type="button" className="grid h-10 w-10 place-items-center rounded-lg text-slate-300 hover:bg-white/10" aria-label="Close navigation" onClick={() => setMobileOpen(false)}><X size={22} /></button>
            </div>
            <nav className="space-y-5 p-4">
              {navigation.map((group) => (
                <section key={group.label}>
                  <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{group.label}</p>
                  <div className="space-y-1">
                    {group.items.map((item) => {
                      const Icon = item.icon;
                      const current = pathMatches(location.pathname, item);
                      return <Link key={item.path} to={item.path} aria-current={current ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 py-2 text-sm font-semibold ${current ? "bg-primary-600 text-white" : "text-slate-300 hover:bg-white/10"}`}><Icon size={20} />{item.label}</Link>;
                    })}
                  </div>
                </section>
              ))}
            </nav>
            <button type="button" onClick={() => void handleLogout()} className="m-4 flex min-h-11 w-[calc(100%-2rem)] items-center gap-3 rounded-lg border border-white/15 px-3 py-2 text-sm font-bold text-slate-200"><SignOut size={20} />Sign out</button>
          </aside>
        </div>
      )}

      <div className={`min-h-screen pt-16 transition-[padding] md:pl-16 ${collapsed ? "" : "md:pl-[296px]"}`}>
        <main className="min-w-0 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
      </div>

      <Modal open={searchOpen} onClose={() => { setSearchOpen(false); setQuery(""); }} title="Search Medfinet" description="Go directly to a workflow in your current workspace.">
        <label className="block text-sm font-bold text-slate-700 dark:text-slate-200">
          Search workflows
          <span className="relative mt-2 block">
            <MagnifyingGlass className="pointer-events-none absolute left-3 top-3.5 text-slate-400" size={18} />
            <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} className="w-full pl-10" placeholder="Try clinical records or devices" />
          </span>
        </label>
        <div className="mt-4 max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 dark:divide-slate-800 dark:border-slate-700">
          {filteredItems.map((item) => {
            const Icon = item.icon;
            return <Link key={item.path} to={item.path} onClick={() => { setSearchOpen(false); setQuery(""); }} className="flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800"><Icon size={19} className="text-primary-700" />{item.label}</Link>;
          })}
          {!filteredItems.length && <p className="p-6 text-center text-sm text-slate-500">No matching workflow.</p>}
        </div>
      </Modal>
    </div>
  );
}
