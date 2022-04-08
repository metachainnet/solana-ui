import { Flex } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import React from "react";
import ClusterSelect from "../components/ClusterSelect";
import KeypairDeleteBtn from "../components/KeypairDeleteBtn";
import KeypairGenerateBtn from "../components/KeypairGenerateBtn";
import CreateTokenAccount from "../components/token/CreateTokenAccount";
import TokenAccountInfo from "../components/token/TokenAccountInfo";
import TokenBurnBtn from "../components/token/TokenBurnBtn";
import CreateToken from "../components/token/CreateToken";
import TokenMintBtn from "../components/token/TokenMintBtn";
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
    <>
      <Head>
        <title>Metachainnet UI</title>
      </Head>

      <div suppressHydrationWarning={true} className={styles.container}>
        <ClusterSelect />
        <br />
        {!!keypair ? <KeypairDeleteBtn /> : <KeypairGenerateBtn />}
        {!!keypair && <TransferBtn />}
        <br />
        {!!keypair && (
          <div>
            <h3 style={{ fontSize: "2rem" }}>새로운 토큰을 생성해보세요 💪</h3>
            <CreateToken />
            <br />
            <h3 style={{ fontSize: "2rem" }}>토큰을 선택하세요 👀</h3>
            <TokenSelect />
            <br />
            {selectedToken && (
              <>
                <h3 style={{ fontSize: "2rem" }}>토큰 계정을 생성하세요 🕶</h3>
                <CreateTokenAccount />
                <TokenAccountInfo />
                <Flex flexDirection={"row"}>
                  <TokenMintBtn />
                  <TokenBurnBtn />
                  <TokenTransferBtn />
                </Flex>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
