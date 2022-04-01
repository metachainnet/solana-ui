import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import React from "react";
import { useConnectionState } from "../context/ConnectionProvider";
import { useKeypairState } from "../context/KeypairProvider";
import ClusterSelect from "../components/ClusterSelect";
import KeypairGenerateBtn from "../components/KeypairGenerateBtn";
import KeypairDeleteBtn from "../components/KeypairDeleteBtn";
import TokenCreateComponent from "../components/TokenCreateComponent";
import TokenSelect from "../components/TokenSelect";
import TokenAccountCreate from "../components/TokenAccountCreate";
import { useTokenState } from "../context/TokenProvider";
import TransferBtn from "../components/TransferBtn";

const Home: NextPage = () => {
  const { connection } = useConnectionState();
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
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
