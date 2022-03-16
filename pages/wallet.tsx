import { NextPage } from "next";
import BalancesList from "../src/components/BalancesList";
import { ConnectionProvider } from "../src/context/ConnectionContext";
import { useWallet, WalletProvider } from "../src/context/WalletContext";

const WalletPage: NextPage = () => {
  return (
    <ConnectionProvider>
      <WalletProvider>
        <BalancesList />
      </WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletPage;
