import Link from "next/link";
import { ChevronRight, LucideIcon } from "lucide-react";
import { ReactNode } from "react";
import { Switch } from "@/components/ui/switch";

export function ProfileSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div>
      <h2 className="px-1 font-body text-xs font-semibold uppercase tracking-wide text-text-grey">
        {title}
      </h2>
      <div className="mt-2 divide-y divide-navy/10 rounded-xl border border-navy/10 bg-white">
        {children}
      </div>
    </div>
  );
}

export function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="font-body text-sm text-text-grey">{label}</span>
      <span className="font-body text-sm font-medium text-navy">{value}</span>
    </div>
  );
}

export function LinkRow({ label, href }: { label: string; href: string }) {
  return (
    <Link href={href} className="flex items-center justify-between px-4 py-3">
      <span className="font-body text-sm text-navy">{label}</span>
      <ChevronRight size={16} className="text-text-grey" />
    </Link>
  );
}

export function ToggleRow({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="font-body text-sm text-navy">{label}</span>
      <Switch checked={checked} onCheckedChange={onCheckedChange} label={label} />
    </div>
  );
}

interface DangerRowProps {
  icon: LucideIcon;
  label: string;
  href?: string;
  onClick?: () => void;
}

export function DangerRow({ icon: Icon, label, href, onClick }: DangerRowProps) {
  const content = (
    <>
      <Icon size={16} />
      <span className="font-body text-sm font-medium">{label}</span>
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="flex items-center gap-2 px-4 py-3 text-red-600"
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-center gap-2 px-4 py-3 text-left text-red-600"
    >
      {content}
    </button>
  );
}
