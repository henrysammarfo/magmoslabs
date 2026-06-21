import { createFileRoute } from "@tanstack/react-router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { ConnectButton, useCurrentAccount, useDisconnectWallet } from "@mysten/dapp-kit";
import { PageShell } from "../components/landing/PageShell";
import { loadProfile, saveProfile } from "../lib/profile";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function ProfilePage() {
  const account = useCurrentAccount();
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectWallet();
  const [name, setName] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!account?.address) return;
    const profile = loadProfile(account.address);
    setName(profile?.name ?? "");
    setAvatarDataUrl(profile?.avatarDataUrl);
  }, [account?.address]);

  const shortAddress = useMemo(() => {
    if (!account?.address) return "";
    return `${account.address.slice(0, 10)}...${account.address.slice(-6)}`;
  }, [account?.address]);

  const onAvatarUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const raw = typeof reader.result === "string" ? reader.result : undefined;
      setAvatarDataUrl(raw);
      setStatus("Avatar selected. Save profile to apply.");
    };
    reader.readAsDataURL(file);
  };

  const onSave = () => {
    if (!account?.address) {
      setStatus("Connect wallet first.");
      return;
    }
    const cleanName = name.trim();
    saveProfile(account.address, { name: cleanName || "Forgekeeper", avatarDataUrl });
    setStatus("Profile saved.");
  };

  if (!account?.address) {
    return (
      <PageShell eyebrow="Profile" title="Connect wallet to manage your profile">
        <section className="bg-white rounded-2xl border border-black/5 p-8 flex items-center justify-between gap-6">
          <p className="text-black/60">Profile settings are tied to your connected wallet.</p>
          <ConnectButton connectText="Open Wallet" />
        </section>
      </PageShell>
    );
  }

  return (
    <PageShell
      eyebrow="Profile"
      title="Your account profile"
      description="Set a display name and avatar. Dashboard welcome message will use this name."
    >
      <section className="bg-white rounded-2xl border border-black/5 p-8 space-y-6 max-w-2xl">
        <div className="flex items-center gap-4">
          {avatarDataUrl ? (
            <img
              src={avatarDataUrl}
              alt="Profile avatar"
              className="w-16 h-16 rounded-full object-cover border border-black/10"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-black/5 border border-black/10 flex items-center justify-center text-black/50">
              {name.trim().slice(0, 1).toUpperCase() || "?"}
            </div>
          )}
          <div>
            <p className="font-medium text-black">{shortAddress}</p>
            <p className="text-sm text-black/50">Connected wallet</p>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-black/60">Display name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter your name"
            className="w-full rounded-xl border border-black/10 px-4 py-3"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm text-black/60">Avatar image</label>
          <input type="file" accept="image/*" onChange={onAvatarUpload} />
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onSave}
            className="rounded-full bg-black text-white px-6 py-3 font-medium"
          >
            Save profile
          </button>
          <button
            type="button"
            onClick={() => disconnect()}
            disabled={isDisconnecting}
            className="rounded-full border border-black/15 px-6 py-3 font-medium text-black"
          >
            {isDisconnecting ? "Disconnecting..." : "Disconnect wallet"}
          </button>
        </div>
        {status ? <p className="text-sm text-black/60">{status}</p> : null}
      </section>
    </PageShell>
  );
}
