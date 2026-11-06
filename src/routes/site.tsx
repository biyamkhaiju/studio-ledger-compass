import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SiteShell } from "@/components/site/SiteChrome";

export const Route = createFileRoute("/site")({ component: SiteLayout });

function SiteLayout() {
  return <SiteShell><Outlet /></SiteShell>;
}
