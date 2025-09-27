import { NavLink } from "react-router-dom";
import React from "react";

type IconProps = React.SVGProps<SVGSVGElement>;

function BallIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 6l3 2-1 3-2 1-2-1-1-3 3-2Z" stroke="currentColor" strokeWidth="1.2" />
      <path d="M12 6v12M6.5 9l4.5 3M17.5 9l-4.5 3M8 16l4-2 4 2" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}
function UserIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}
function TrophyIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" {...props}>
      <path d="M7 7h10v2a5 5 0 0 1-10 0V7Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9 19h6M12 14v5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M17 7h3a3 3 0 0 1-3 3M7 7H4a3 3 0 0 0 3 3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

const TABS = [
  { to: "/matches", label: "Matches", Icon: BallIcon },
  { to: "/profile", label: "Profile", Icon: UserIcon },
  { to: "/leaderboard", label: "Leaderboard", Icon: TrophyIcon },
] as const;

export default function BottomNav() {
  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-zinc-900/80"
    >
      <ul className="mx-auto grid max-w-md grid-cols-3">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                [
                  "flex flex-col items-center justify-center gap-1 py-2 text-xs",
                  isActive
                    ? "text-blue-600 dark:text-blue-400 font-medium"
                    : "text-zinc-500 hover:text-zinc-700 dark:text-zinc-400",
                ].join(" ")
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className="h-6 w-6" aria-hidden="true" />
                  <span>{label}</span>
                  <span
                    className={[
                      "block h-0.5 w-8 rounded-full transition-opacity",
                      isActive ? "opacity-100 bg-current" : "opacity-0",
                    ].join(" ")}
                    aria-hidden="true"
                  />
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
      {/* iOS safe-area padding */}
      <div className="pb-[max(env(safe-area-inset-bottom),0px)]" />
    </nav>
  );
}
