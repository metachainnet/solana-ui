import { Radio, RadioGroup, Stack } from "@chakra-ui/react";
import { Cluster } from "@solana/web3.js";
import React from "react";
import { ClusterOptions } from "../constants/Cluster.const";
import {
  useConnectionDispatch,
  useConnectionState,
} from "../context/ConnectionProvider";

export default function ClusterSelect(props: any) {
  const { cluster } = useConnectionState();
  const connectionDispatch = useConnectionDispatch()!;

  const handleRadioChange = (nextValue: Cluster) => {
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
      default:
        break;
    }
  };

  return (
    <RadioGroup
      onChange={(nextValue: Cluster) => {
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
