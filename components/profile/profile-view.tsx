"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  DangerRow,
  DetailRow,
  LinkRow,
  ProfileSection,
  ToggleRow,
} from "@/components/profile/profile-rows";
import { MOCK_USER, getInitials } from "@/lib/mock-user";

export function ProfileView() {
  const router = useRouter();
  const [twoFactor, setTwoFactor] = useState(true);
  const [push, setPush] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [logoutOpen, setLogoutOpen] = useState(false);

  function handleLogout() {
    setLogoutOpen(false);
    router.push("/login");
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center gap-5 rounded-2xl border border-navy/10 bg-white p-6">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-orange font-heading text-xl font-semibold text-white">
          {getInitials(MOCK_USER.fullName)}
        </span>
        <div>
          <h1 className="font-heading text-xl font-semibold text-navy">
            {MOCK_USER.fullName}
          </h1>
          <p className="font-body text-sm text-text-grey">
            {MOCK_USER.email}
          </p>
          <p className="font-body text-sm text-text-grey">
            {MOCK_USER.mobile}
          </p>
          <Badge variant="mint" className="mt-2">
            {MOCK_USER.role}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProfileSection title="Account Details">
          <DetailRow label="Full Name" value={MOCK_USER.fullName} />
          <DetailRow label="Email" value={MOCK_USER.email} />
          <DetailRow label="Mobile" value={MOCK_USER.mobile} />
          <DetailRow label="City" value={MOCK_USER.city} />
          <DetailRow label="Institution" value={MOCK_USER.institution} />
        </ProfileSection>

        <ProfileSection title="Security">
          <LinkRow label="Change Password" href="/profile/change-password" />
          <ToggleRow
            label="Two-Factor Auth"
            checked={twoFactor}
            onCheckedChange={setTwoFactor}
          />
        </ProfileSection>

        <ProfileSection title="Preferences">
          <ToggleRow
            label="Push Notifications"
            checked={push}
            onCheckedChange={setPush}
          />
          <ToggleRow
            label="Email Alerts"
            checked={emailAlerts}
            onCheckedChange={setEmailAlerts}
          />
          <ToggleRow
            label="SMS Alerts"
            checked={smsAlerts}
            onCheckedChange={setSmsAlerts}
          />
        </ProfileSection>

        <ProfileSection title="Support & Legal">
          <LinkRow label="Help Center" href="/support" />
          <LinkRow label="Terms of Service" href="/terms" />
          <LinkRow label="Privacy Policy" href="/privacy" />
          <DetailRow label="App Version" value="v2.4.1 (Stable)" />
        </ProfileSection>
      </div>

      <ProfileSection title="Danger Zone">
        <DangerRow
          icon={LogOut}
          label="Logout"
          onClick={() => setLogoutOpen(true)}
        />
        <DangerRow
          icon={Trash2}
          label="Delete Account"
          href="/profile/delete-account"
        />
      </ProfileSection>

      <ConfirmDialog
        open={logoutOpen}
        title="Log out of TripConsole?"
        description="You'll need to log in again to access your trips and account."
        confirmLabel="Log Out"
        destructive
        onConfirm={handleLogout}
        onCancel={() => setLogoutOpen(false)}
      />
    </div>
  );
}
