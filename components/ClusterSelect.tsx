import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { Cluster } from "@solana/web3.js";
import React from "react";
import { ClusterOptions, Metachainnet } from "../constants/Cluster.const";
import {
  useConnectionDispatch,
  useConnectionState,
} from "../context/ConnectionProvider";

export default function ClusterSelect(props: any) {
  const { cluster } = useConnectionState();
  const connectionDispatch = useConnectionDispatch()!;

  const handleRadioChange = (nextValue: Cluster | Metachainnet) => {
    switch (nextValue) {
      case "mainnet-beta":
        connectionDispatch({
          type: "CHANGE_CONNECTION",
          payload: "mainnet-beta",
        });
        break;
      case "testnet":
        connectionDispatch({
          type: "CHANGE_CONNECTION",
          payload: "testnet",
        });
        break;
      case "devnet":
        connectionDispatch({
          type: "CHANGE_CONNECTION",
          payload: "devnet",
        });
        break;
      case "metachainnet":
        connectionDispatch({
          type: "CHANGE_CONNECTION",
          payload: "metachainnet",
        });
      default:
        break;
    }
  };

  return (
    <RadioGroup
      onChange={(nextValue: Cluster | Metachainnet) => {
        console.log(nextValue);
        handleRadioChange(nextValue);
      }}
      value={cluster}
    >
      <Stack direction="row">
        {ClusterOptions.map((c) => (
          <Radio key={c.cluster} value={c.cluster}>
            {c.displayName}
          </Radio>
        ))}
      </Stack>
    </RadioGroup>
  );
}
