import { Container } from "@material-ui/core";
import { NextPage } from "next";
import BalancesList from "../src/components/BalancesList";
import { useWallet } from "../src/context/WalletContext";

const Wallet: NextPage = () => {
  const wallet = useWallet();

  if (!wallet) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <BalancesList />
    </Container>
  );
};

export default Wallet;
