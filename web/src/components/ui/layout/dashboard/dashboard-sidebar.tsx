import { DashboardAccountSettingsLink } from "./dashboard-account-settings-link";
import { DashboardSidebarGreeting } from "./dashboard-sidebar-greeting";
import { DashboardSidebarLogout } from "./dashboard-sidebar-logout";
import { DashboardNavLinkList } from "./dashboard-nav-link-list";

type DashboardSidebarProps = {
  email: string;
};

export function DashboardSidebar({ email }: DashboardSidebarProps) {
  return (
    <aside
      className="fixed top-18 bottom-4 left-4 z-30 hidden w-64 flex-col rounded-xl border border-border/80 bg-surface-0/90 p-3 shadow-lg backdrop-blur-md md:flex"
      aria-label="Dashboard navigation"
    >
      <DashboardSidebarGreeting email={email} />
      <div className="mt-3 flex min-h-0 flex-1 flex-col gap-2">
        <DashboardNavLinkList />
        <DashboardAccountSettingsLink />
      </div>
      <div className="mt-3 border-t border-border/60 pt-3">
        <DashboardSidebarLogout />
      </div>
    </aside>
  );
}
