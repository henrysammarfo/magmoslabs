import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PageShell } from "../components/landing/PageShell";

export const Route = createFileRoute("/saurum")({
  head: () => ({
    meta: [
      { title: "sAURUM — Yield-Accruing Index Token" },
      {
        name: "description",
        content:
          "sAURUM is an accumulation index token. Its value rises every block as the Magmos protocol routes yield from Scallop, DeepBook, and Aftermath.",
      },
      { property: "og:title", content: "sAURUM — Yield-Accruing Index Token" },
      { property: "og:description", content: "Stake AURUM. Watch the index rise. Unstake anytime." },
    ],
    links: [{ rel: "canonical", href: "/saurum" }],
  }),
  component: SaurumPage,
});

const stats = [
  { k: "Current index", v: "1.1247" },
  { k: "30d APY", v: "12.4%" },
  { k: "TVL staked", v: "$18.6M" },
  { k: "Holders", v: "4,212" },
];

const VITE_ENV =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const USDC_TYPE =
  VITE_ENV.VITE_USDC_COIN_TYPE ??
  "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC";
const SAURUM_TYPE =
  VITE_ENV.VITE_SAURUM_COIN_TYPE ??
  `${VITE_ENV.VITE_MAGMOS_PACKAGE_ID ?? "0xe12b3253116bc30fc1f039edcf6bb6ff6f2e93b6a03852e4a021c86b8304194e"}::saurum::SAURUM`;
const MAGMOS_PACKAGE_ID =
  VITE_ENV.VITE_MAGMOS_PACKAGE_ID ??
  "0xe12b3253116bc30fc1f039edcf6bb6ff6f2e93b6a03852e4a021c86b8304194e";
const TREASURY_ID =
  VITE_ENV.VITE_MAGMOS_TREASURY_ID ??
  "0xa86b7f83bc7ab07b8ae3641b06c7db74e067dc0872022ba0b43dac1704b3f3b6";
const VAULT_ID =
  VITE_ENV.VITE_MAGMOS_VAULT_ID ??
  "0x12b4a476a0a1e82816f2907117a041cfda0f447165f15926d340c83228483776";

function parseAmountToMicro(input: string): bigint {
  const value = Number(input);
  if (!Number.isFinite(value) || value <= 0) throw new Error("Enter an amount greater than 0.");
  return BigInt(Math.floor(value * 1_000_000));
}

function SaurumPage() {
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction, isPending } = useSignAndExecuteTransaction();
  const [refineAmount, setRefineAmount] = useState("1");
  const [status, setStatus] = useState<string>("");
  const isConnected = Boolean(account?.address);
  const actionDisabled = !isConnected || isPending;
  const accountShort = useMemo(
    () => (account?.address ? `${account.address.slice(0, 8)}...${account.address.slice(-6)}` : ""),
    [account?.address],
  );

  const runRefine = async () => {
    try {
      if (!account?.address) throw new Error("Connect wallet first.");
      setStatus("Preparing refine transaction...");
      const amount = parseAmountToMicro(refineAmount);
      const { data: coins } = await client.getCoins({ owner: account.address, coinType: SAURUM_TYPE });
      const coin = coins.find((c) => BigInt(c.balance) >= amount);
      if (!coin) throw new Error("Insufficient sAURUM balance.");

      const tx = new Transaction();
      const saurum = tx.splitCoins(tx.object(coin.coinObjectId), [tx.pure.u64(amount)]);
      const aurum = tx.moveCall({
        target: `${MAGMOS_PACKAGE_ID}::saurum::refine`,
        typeArguments: [USDC_TYPE],
        arguments: [tx.object(VAULT_ID), tx.object(TREASURY_ID), saurum],
      });
      tx.transferObjects([aurum], account.address);
      const result = await signAndExecuteTransaction({ transaction: tx });
      setStatus(`Refine submitted: ${result.digest}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Refine failed.");
    }
  };

  return (
    <PageShell
      eyebrow="sAURUM"
      title="Stake the dollar. Earn the protocol."
      description="sAURUM doesn't rebase. Instead, the index that converts sAURUM back into AURUM ticks up every block as yield accrues."
    >
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.k} className="bg-white rounded-2xl p-6 border border-black/5">
            <p className="text-sm text-black/50">{s.k}</p>
            <p className="text-3xl font-medium text-black mt-2" style={{ letterSpacing: "-0.03em" }}>
              {s.v}
            </p>
          </div>
        ))}
      </div>
      <section className="bg-white rounded-2xl border border-black/5 p-10 mt-6">
        <h2 className="text-2xl font-medium text-black mb-4" style={{ letterSpacing: "-0.03em" }}>
          How the index works
        </h2>
        <p className="text-black/60 leading-relaxed max-w-2xl">
          When you stake N AURUM, you receive N / index sAURUM. When you unstake, you receive
          sAURUM × index AURUM. As the protocol earns, the index rises — no token balance changes
          required, no taxable rebase event.
        </p>
      </section>
      <section className="bg-white rounded-2xl border border-black/5 p-6 mt-6 space-y-4">
        <h2 className="text-2xl font-medium text-black" style={{ letterSpacing: "-0.03em" }}>
          Refine back to AURUM
        </h2>
        <p className="text-black/60 text-sm">
          Convert sAURUM back into AURUM at the current on-chain accumulation index.
        </p>
        <input
          value={refineAmount}
          onChange={(e) => setRefineAmount(e.target.value)}
          inputMode="decimal"
          className="w-full max-w-md rounded-xl border border-black/10 px-4 py-3"
          placeholder="sAURUM amount"
        />
        <button
          type="button"
          onClick={runRefine}
          disabled={actionDisabled}
          className="rounded-full bg-black text-white px-8 py-3 disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Refine"}
        </button>
        {isConnected ? (
          <p className="text-sm text-black/60">Connected as {accountShort}</p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-black/60">Connect wallet to refine your sAURUM.</p>
            <ConnectButton connectText="Open Wallet" />
          </div>
        )}
        {status ? <p className="text-sm text-black">{status}</p> : null}
      </section>
    </PageShell>
  );
}
