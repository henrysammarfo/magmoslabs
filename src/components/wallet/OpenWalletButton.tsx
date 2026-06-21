import { ConnectModal, useCurrentAccount } from "@mysten/dapp-kit";
import { Link } from "@tanstack/react-router";

interface OpenWalletButtonProps {
  className?: string;
  onClick?: () => void;
}

export function OpenWalletButton({ className, onClick }: OpenWalletButtonProps) {
  const account = useCurrentAccount();
  if (account?.address) {
    const short = `${account.address.slice(0, 8)}...${account.address.slice(-4)}`;
    return (
      <Link to="/profile" onClick={onClick} className={className}>
        {short}
      </Link>
    );
  }

  return (
    <ConnectModal
      trigger={
        <button type="button" onClick={onClick} className={className}>
          Open Wallet
        </button>
      }
    />
  );
}
