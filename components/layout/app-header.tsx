import Link from "next/link";
import { ArrowLeft, Menu } from "lucide-react";
import { ReactNode } from "react";

interface AppHeaderProps {
  title: string;
  leftIcon?: "menu" | "back";
  backHref?: string;
  rightHref?: string;
  rightIcon?: ReactNode;
}

export function AppHeader({
  title,
  leftIcon = "menu",
  backHref = "/dashboard",
  rightHref,
  rightIcon,
}: AppHeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-navy/10 bg-white px-4 py-4">
      {leftIcon === "back" ? (
        <Link href={backHref} aria-label="Back" className="text-navy">
          <ArrowLeft size={22} />
        </Link>
      ) : (
        <button type="button" aria-label="Menu" className="text-navy">
          <Menu size={22} />
        </button>
      )}

      <h1 className="font-heading text-lg font-semibold text-navy">
        {title}
      </h1>

      {rightHref && rightIcon ? (
        <Link href={rightHref} aria-label="Notifications" className="text-navy">
          {rightIcon}
        </Link>
      ) : (
        <span className="w-[22px]" aria-hidden="true" />
      )}
    </header>
  );
}
