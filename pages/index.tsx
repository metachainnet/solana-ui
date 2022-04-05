import type { NextPage } from "next";
import React from "react";
import ClusterSelect from "../components/ClusterSelect";
import KeypairDeleteBtn from "../components/KeypairDeleteBtn";
import KeypairGenerateBtn from "../components/KeypairGenerateBtn";
import TokenBalance from "../components/token/TokenAccountInfo";
import TokenAccountCreate from "../components/token/TokenAccountCreate";
import TokenCreateComponent from "../components/token/TokenCreateComponent";
import TokenSelect from "../components/token/TokenSelect";
import TokenTransferBtn from "../components/token/TokenTransferBtn";
import TransferBtn from "../components/TransferBtn";
import { useKeypairState } from "../context/KeypairProvider";
import { useTokenState } from "../context/TokenProvider";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const { keypair } = useKeypairState();
  const { selectedToken } = useTokenState();

  return (
    <div suppressHydrationWarning={true} className={styles.container}>
      <ClusterSelect />
      <br />
      {!!keypair ? <KeypairDeleteBtn /> : <KeypairGenerateBtn />}
      {!!keypair && <TransferBtn />}
      <br />
      {keypair && (
        <div>
          <h3 style={{ fontSize: "2rem" }}>새로운 토큰을 생성해보세요 💪</h3>
          <TokenCreateComponent />
          <br />
          <h3 style={{ fontSize: "2rem" }}>토큰을 선택하세요 👀</h3>
          <TokenSelect />
          <br />
          {selectedToken && (
            <>
              <h3 style={{ fontSize: "2rem" }}>토큰 계정을 생성하세요 🕶</h3>
              <TokenAccountCreate />
              <TokenBalance />
              <TokenTransferBtn />
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
