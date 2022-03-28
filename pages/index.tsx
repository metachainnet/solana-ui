import type { NextPage } from "next";
import styles from "../styles/Home.module.css";
import React from "react";
import { useConnectionState } from "../context/ConnectionProvider";
import { useKeypairState } from "../context/KeypairProvider";
import ClusterSelect from "../components/ClusterSelect";
import KeypairGenerateBtn from "../components/KeypairGenerateBtn";
import KeypairDeleteBtn from "../components/KeypairDeleteBtn";
import TokenCreateComponent from "../components/TokenCreateComponent";

const Home: NextPage = () => {
  const { connection } = useConnectionState();
  const keypair = useKeypairState()?.keypair;

  return (
    <div suppressHydrationWarning={true} className={styles.container}>
      <ClusterSelect />
      {!!keypair ? <KeypairDeleteBtn /> : <KeypairGenerateBtn />}
      {keypair && <TokenCreateComponent />}
    </div>
  );
};

export default Home;
