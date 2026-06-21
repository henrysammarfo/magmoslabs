import { createFileRoute } from "@tanstack/react-router";
import { queryOptions, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  ConnectButton,
  useCurrentAccount,
  useSignAndExecuteTransaction,
  useSuiClient,
} from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";
import { PageShell } from "../components/landing/PageShell";
import { fetchUsdcRateSnapshot } from "../lib/live-data";

export const Route = createFileRoute("/aurum")({
  head: () => ({
    meta: [
      { title: "AURUM — Unit-stable Dollar on Sui" },
      {
        name: "description",
        content:
          "AURUM is a unit-stable digital dollar on Sui. Always $1, fully backed, transferable across the Sui ecosystem.",
      },
      { property: "og:title", content: "AURUM — Unit-stable Dollar on Sui" },
      { property: "og:description", content: "Always $1. Always composable." },
    ],
    links: [{ rel: "canonical", href: "/aurum" }],
  }),
  component: AurumPage,
});

const usdcRateQuery = queryOptions({
  queryKey: ["usdc-rate-live"],
  queryFn: fetchUsdcRateSnapshot,
  staleTime: 10_000,
  refetchInterval: 30_000,
});

const VITE_ENV =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env ?? {};
const USDC_TYPE =
  VITE_ENV.VITE_USDC_COIN_TYPE ??
  "0xa1ec7fc00a6f40db9693ad1415d0c193ad3906494428cf252621037bd7117e29::usdc::USDC";
const AURUM_TYPE =
  VITE_ENV.VITE_AURUM_COIN_TYPE ??
  `${VITE_ENV.VITE_MAGMOS_PACKAGE_ID ?? "0xe12b3253116bc30fc1f039edcf6bb6ff6f2e93b6a03852e4a021c86b8304194e"}::aurum::AURUM`;
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

function AurumPage() {
  const { data } = useQuery(usdcRateQuery);
  const account = useCurrentAccount();
  const client = useSuiClient();
  const { mutateAsync: signAndExecuteTransaction, isPending } = useSignAndExecuteTransaction();
  const [forgeAmount, setForgeAmount] = useState("10");
  const [smeltAmount, setSmeltAmount] = useState("1");
  const [withdrawAmount, setWithdrawAmount] = useState("1");
  const [withdrawMode, setWithdrawMode] = useState<"aurum" | "saurum" | "saurum-usdc">("aurum");
  const [status, setStatus] = useState<string>("");
  const rate = data?.usdcUsd ?? 1;
  const source = data?.source ?? "coinbase";
  const previewAmount = (100 * rate).toFixed(2);
  const isConnected = Boolean(account?.address);
  const actionDisabled = !isConnected || isPending;
  const accountShort = useMemo(
    () => (account?.address ? `${account.address.slice(0, 8)}...${account.address.slice(-6)}` : ""),
    [account?.address],
  );

  const getCoinWithBalance = async (coinType: string, needed: bigint) => {
    if (!account?.address) throw new Error("Connect wallet first.");
    const { data: coins } = await client.getCoins({ owner: account.address, coinType });
    const coin = coins.find((c) => BigInt(c.balance) >= needed);
    if (!coin) {
      if (coinType.includes("usdc")) throw new Error("Insufficient USDC balance.");
      if (coinType.includes("saurum")) throw new Error("Insufficient sAURUM balance.");
      throw new Error("Insufficient AURUM balance.");
    }
    return coin;
  };

  const runForge = async () => {
    try {
      setStatus("Preparing forge transaction...");
      const amount = parseAmountToMicro(forgeAmount);
      const coin = await getCoinWithBalance(USDC_TYPE, amount);
      const tx = new Transaction();
      const payment = tx.splitCoins(tx.object(coin.coinObjectId), [tx.pure.u64(amount)]);
      const forged = tx.moveCall({
        target: `${MAGMOS_PACKAGE_ID}::aurum::forge`,
        typeArguments: [USDC_TYPE],
        arguments: [tx.object(TREASURY_ID), payment],
      });
      tx.transferObjects([forged], account!.address);
      const result = await signAndExecuteTransaction({ transaction: tx });
      setStatus(`Forge submitted: ${result.digest}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Forge failed.");
    }
  };

  const runSmelt = async () => {
    try {
      setStatus("Preparing smelt transaction...");
      const amount = parseAmountToMicro(smeltAmount);
      const coin = await getCoinWithBalance(AURUM_TYPE, amount);
      const tx = new Transaction();
      const aurum = tx.splitCoins(tx.object(coin.coinObjectId), [tx.pure.u64(amount)]);
      const saurum = tx.moveCall({
        target: `${MAGMOS_PACKAGE_ID}::saurum::smelt`,
        typeArguments: [USDC_TYPE],
        arguments: [tx.object(VAULT_ID), tx.object(TREASURY_ID), aurum],
      });
      tx.transferObjects([saurum], account!.address);
      const result = await signAndExecuteTransaction({ transaction: tx });
      setStatus(`Smelt submitted: ${result.digest}`);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Smelt failed.");
    }
  };

  const runWithdraw = async () => {
    try {
      const amount = parseAmountToMicro(withdrawAmount);
      const tx = new Transaction();
      if (withdrawMode === "aurum") {
        setStatus("Preparing AURUM withdrawal...");
        const coin = await getCoinWithBalance(AURUM_TYPE, amount);
        const aurum = tx.splitCoins(tx.object(coin.coinObjectId), [tx.pure.u64(amount)]);
        const usdc = tx.moveCall({
          target: `${MAGMOS_PACKAGE_ID}::aurum::melt`,
          typeArguments: [USDC_TYPE],
          arguments: [tx.object(TREASURY_ID), aurum],
        });
        tx.transferObjects([usdc], account!.address);
      } else if (withdrawMode === "saurum") {
        setStatus("Preparing sAURUM withdrawal...");
        const coin = await getCoinWithBalance(SAURUM_TYPE, amount);
        const saurum = tx.splitCoins(tx.object(coin.coinObjectId), [tx.pure.u64(amount)]);
        const aurum = tx.moveCall({
          target: `${MAGMOS_PACKAGE_ID}::saurum::refine`,
          typeArguments: [USDC_TYPE],
          arguments: [tx.object(VAULT_ID), tx.object(TREASURY_ID), saurum],
        });
        tx.transferObjects([aurum], account!.address);
      } else {
        setStatus("Preparing sAURUM to USDC withdrawal...");
        const coin = await getCoinWithBalance(SAURUM_TYPE, amount);
        const saurum = tx.splitCoins(tx.object(coin.coinObjectId), [tx.pure.u64(amount)]);
        const aurum = tx.moveCall({
          target: `${MAGMOS_PACKAGE_ID}::saurum::refine`,
          typeArguments: [USDC_TYPE],
          arguments: [tx.object(VAULT_ID), tx.object(TREASURY_ID), saurum],
        });
        const usdc = tx.moveCall({
          target: `${MAGMOS_PACKAGE_ID}::aurum::melt`,
          typeArguments: [USDC_TYPE],
          arguments: [tx.object(TREASURY_ID), aurum],
        });
        tx.transferObjects([usdc], account!.address);
      }

      const result = await signAndExecuteTransaction({ transaction: tx });
      setStatus(
        withdrawMode === "aurum"
          ? `Withdraw (AURUM -> USDC) submitted: ${result.digest}`
          : withdrawMode === "saurum"
            ? `Withdraw (sAURUM -> AURUM) submitted: ${result.digest}`
            : `Withdraw (sAURUM -> USDC) submitted: ${result.digest}`,
      );
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Withdraw failed.");
    }
  };

  const facts = [
    { k: "Live USDC/USD", v: `${rate.toFixed(4)} (${source})` },
    { k: "Forge preview", v: `100 USDC -> ${previewAmount} AURUM` },
    { k: "Backing", v: "USDC + short-duration treasuries" },
    { k: "Reserve ratio", v: "Live on-chain proof in /reserves" },
    { k: "Chain", v: "Sui testnet" },
    { k: "Mint / redeem", v: "Permissionless, market-rate aware" },
    { k: "Composability", v: "Native Move object" },
  ];
  return (
    <PageShell
      eyebrow="AURUM"
      title="A stable unit of account that goes anywhere on Sui."
      description="AURUM never moves. It's the dollar you spend, lend, and route — the base layer that sAURUM grows on top of."
    >
      <section className="bg-white rounded-2xl border border-black/5 divide-y divide-black/5">
        {facts.map((f) => (
          <div key={f.k} className="px-8 py-5 flex items-center justify-between gap-4">
            <span className="text-black/60">{f.k}</span>
            <span className="text-black font-medium text-right">{f.v}</span>
          </div>
        ))}
      </section>
      <section className="grid md:grid-cols-2 gap-4 mt-6">
        <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Forge AURUM</h2>
          <p className="text-black/60 text-sm">Mint AURUM 1:1 from your testnet USDC.</p>
          <input
            value={forgeAmount}
            onChange={(e) => setForgeAmount(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-xl border border-black/10 px-4 py-3"
            placeholder="USDC amount"
          />
          <button
            type="button"
            onClick={runForge}
            disabled={actionDisabled}
            className="w-full rounded-full bg-black text-white py-3 disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Forge"}
          </button>
        </div>
        <div className="bg-white rounded-2xl border border-black/5 p-6 space-y-4">
          <h2 className="text-xl font-semibold">Smelt to sAURUM</h2>
          <p className="text-black/60 text-sm">Stake AURUM and receive yield-bearing sAURUM.</p>
          <input
            value={smeltAmount}
            onChange={(e) => setSmeltAmount(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-xl border border-black/10 px-4 py-3"
            placeholder="AURUM amount"
          />
          <button
            type="button"
            onClick={runSmelt}
            disabled={actionDisabled}
            className="w-full rounded-full bg-black text-white py-3 disabled:opacity-50"
          >
            {isPending ? "Submitting..." : "Smelt"}
          </button>
        </div>
      </section>
      <section id="withdraw" className="mt-6 bg-white rounded-2xl border border-black/5 p-6 space-y-4">
        <h2 className="text-xl font-semibold">Withdraw</h2>
        <p className="text-black/60 text-sm">
          Withdraw only to your connected wallet account using supported redemption paths.
        </p>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setWithdrawMode("aurum")}
            className={`rounded-full px-4 py-2 border ${
              withdrawMode === "aurum"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black/15"
            }`}
          >
            AURUM to USDC
          </button>
          <button
            type="button"
            onClick={() => setWithdrawMode("saurum")}
            className={`rounded-full px-4 py-2 border ${
              withdrawMode === "saurum"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black/15"
            }`}
          >
            sAURUM to AURUM
          </button>
          <button
            type="button"
            onClick={() => setWithdrawMode("saurum-usdc")}
            className={`rounded-full px-4 py-2 border ${
              withdrawMode === "saurum-usdc"
                ? "bg-black text-white border-black"
                : "bg-white text-black border-black/15"
            }`}
          >
            sAURUM to USDC
          </button>
        </div>
        <input
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          inputMode="decimal"
          className="w-full max-w-md rounded-xl border border-black/10 px-4 py-3"
          placeholder={withdrawMode === "aurum" ? "AURUM amount" : "sAURUM amount"}
        />
        <button
          type="button"
          onClick={runWithdraw}
          disabled={actionDisabled}
          className="rounded-full bg-black text-white px-8 py-3 disabled:opacity-50"
        >
          {isPending ? "Submitting..." : "Withdraw"}
        </button>
      </section>
      <section className="mt-4 bg-white rounded-2xl border border-black/5 p-6">
        {isConnected ? (
          <p className="text-sm text-black/60">Connected as {accountShort}</p>
        ) : (
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-black/60">
              Connect your wallet to enable Forge/Smelt actions.
            </p>
            <ConnectButton connectText="Open Wallet" />
          </div>
        )}
        {status ? <p className="mt-3 text-sm text-black">{status}</p> : null}
      </section>
    </PageShell>
  );
}
