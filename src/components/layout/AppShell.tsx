import { Outlet, Link } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StaleBanner } from "@/components/status/StaleBanner";
import { Nav } from "./Nav";
import { Footer } from "./Footer";

export function AppShell() {
  return (
    <TooltipProvider delayDuration={150}>
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-screen-2xl items-center justify-between gap-4 px-4 py-2.5">
          <Link to="/" className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-semibold tracking-tight">Kalshi Dashboard</span>
          </Link>
          <Nav />
        </div>
      </header>
      <StaleBanner />
      <main className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-5">
        <Outlet />
      </main>
      <Footer />
    </div>
    </TooltipProvider>
  );
}
