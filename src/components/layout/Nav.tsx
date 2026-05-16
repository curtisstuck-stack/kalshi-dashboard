import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const LINKS = [
  { to: "/", label: "Opportunities", end: true },
  { to: "/portfolio", label: "Portfolio" },
  { to: "/signals", label: "Signals" },
  { to: "/archive", label: "Archive" },
  { to: "/health", label: "Health" },
];

export function Nav() {
  return (
    <nav className="flex items-center gap-1">
      {LINKS.map((l) => (
        <NavLink
          key={l.to}
          to={l.to}
          end={l.end}
          className={({ isActive }) =>
            cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-secondary text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            )
          }
        >
          {l.label}
        </NavLink>
      ))}
    </nav>
  );
}
