import { NextPage } from "next";
import CreateWalletForm from "../src/components/CreateWalletForm";
import LoginForm from "../src/components/LoginForm";
import { useHasLockedMnemonicAndSeed } from "../src/lib/wallet-seed";

const LoginPage: NextPage = () => {
  const [hasLockedMnemonicAndSeed, loading] = useHasLockedMnemonicAndSeed();

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{hasLockedMnemonicAndSeed ? <LoginForm /> : <CreateWalletForm />}</>;
};

export default LoginPage;
