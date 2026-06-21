import { ConnectButton } from "@mysten/dapp-kit";

interface OpenWalletButtonProps {
  className?: string;
  onClick?: () => void;
}

export function OpenWalletButton({ className, onClick }: OpenWalletButtonProps) {
  return (
    <ConnectButton
      connectText="Open Wallet"
      onClick={onClick}
      className={className}
    />
  );
}
