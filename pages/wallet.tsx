import { NextPage } from "next";
import { ConnectionProvider } from "../src/context/ConnectionContext";
import { WalletProvider } from "../src/context/WalletContext";

const WalletPage: NextPage = () => {
  return (
    <ConnectionProvider>
      <WalletProvider>hello</WalletProvider>
    </ConnectionProvider>
  );
};

export default WalletPage;
