import { Navigate, createFileRoute } from "@tanstack/react-router";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useCurrentAccount, useDisconnectWallet, useSuiClient } from "@mysten/dapp-kit";
import { PageShell } from "../components/landing/PageShell";
import { loadProfile, saveProfile } from "../lib/profile";

export const Route = createFileRoute("/profile")({
  component: ProfilePage,
});

function formatMicroBalance(raw: bigint): string {
  const units = raw / 1_000_000n;
  const micros = raw % 1_000_000n;
  const decimals = (micros / 1_000n).toString().padStart(3, "0");
  return `${units.toString()}.${decimals}`;
}

function ProfilePage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutate: disconnect, isPending: isDisconnecting } = useDisconnectWallet();
  const [name, setName] = useState("");
  const [avatarDataUrl, setAvatarDataUrl] = useState<string | undefined>(undefined);
  const [status, setStatus] = useState("");
  const [aurumBalance, setAurumBalance] = useState("0.000");
  const [saurumBalance, setSaurumBalance] = useState("0.000");

  const VITE_ENV =
    (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
  const AURUM_TYPE =
    VITE_ENV.VITE_AURUM_COIN_TYPE ??
    `${VITE_ENV.VITE_MAGMOS_PACKAGE_ID ?? "0xe12b3253116bc30fc1f039edcf6bb6ff6f2e93b6a03852e4a021c86b8304194e"}::aurum::AURUM`;
  const SAURUM_TYPE =
    VITE_ENV.VITE_SAURUM_COIN_TYPE ??
    `${VITE_ENV.VITE_MAGMOS_PACKAGE_ID ?? "0xe12b3253116bc30fc1f039edcf6bb6ff6f2e93b6a03852e4a021c86b8304194e"}::saurum::SAURUM`;

  useEffect(() => {
    if (!account?.address) return;
    const profile = loadProfile(account.address);
    setName(profile?.name ?? "");
    setAvatarDataUrl(profile?.avatarDataUrl);
  }, [account?.address]);

  useEffect(() => {
    const loadBalances = async () => {
      if (!account?.address) return;
      try {
        const [aurumCoins, saurumCoins] = await Promise.all([
          client.getCoins({ owner: account.address, coinType: AURUM_TYPE }),
          client.getCoins({ owner: account.address, coinType: SAURUM_TYPE }),
        ]);
        const aurumTotal = aurumCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
        const saurumTotal = saurumCoins.data.reduce((sum, coin) => sum + BigInt(coin.balance), 0n);
        setAurumBalance(formatMicroBalance(aurumTotal));
        setSaurumBalance(formatMicroBalance(saurumTotal));
      } catch {
        setAurumBalance("0.000");
        setSaurumBalance("0.000");
      }
    };
    void loadBalances();
  }, [AURUM_TYPE, SAURUM_TYPE, account?.address, client]);

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

  if (!account?.address) return <Navigate to="/" />;

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
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="rounded-xl border border-black/10 p-4">
            <p className="text-sm text-black/50">AURUM balance</p>
            <p className="text-xl font-semibold text-black mt-1">{aurumBalance}</p>
          </div>
          <div className="rounded-xl border border-black/10 p-4">
            <p className="text-sm text-black/50">sAURUM balance</p>
            <p className="text-xl font-semibold text-black mt-1">{saurumBalance}</p>
          </div>
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
