import Transport from "@ledgerhq/hw-transport";
import { Keypair, PublicKey } from "@solana/web3.js";
import base58 from "bs58";
import { DERIVATION_PATH } from "./wallet-seed";

const BIP32_HARDENED_BIT = (1 << 31) >>> 0;

const INS_GET_PUBKEY = 0x05;

const MAX_PAYLOAD = 255;

const P1_NON_CONFIRM = 0x01;

const P2_EXTEND = 0x01;
const P2_MORE = 0x02;

const LEDGER_CLA = 0xe0;

const harden = (n: number) => {
  return (n | BIP32_HARDENED_BIT) >>> 0;
};

export const getSolanaDerivationPath = (
  account?: Keypair,
  change?: any,
  derivationPath: string = DERIVATION_PATH.bip44Change
): Buffer => {
  let useAccount = account || 0;
  let useChange = change || 0;

  switch (derivationPath) {
    case DERIVATION_PATH.bip44Root:
      return handleBip44Root();
    case DERIVATION_PATH.bip44:
      return handleBip44(useAccount);
    case DERIVATION_PATH.bip44Change:
      return handleBip44Change(useChange, useAccount);
    default:
      throw new Error(`Invalid derivation path`);
  }
};

const handleBip44Root = () => {
  const length = 2;
  const derivationPathBuffer = Buffer.alloc(1 + length * 4);
  let offset = 0;
  offset = derivationPathBuffer.writeUInt8(length, offset);
  offset = derivationPathBuffer.writeUInt32BE(harden(44), offset); // Using BIP44
  derivationPathBuffer.writeUInt32BE(harden(501), offset); // Solana's BIP44 path
  return derivationPathBuffer;
};

const handleBip44 = (useAccount: number) => {
  const length = 3;
  const derivationPathBuffer = Buffer.alloc(1 + length * 4);
  let offset = 0;
  offset = derivationPathBuffer.writeUInt8(length, offset);
  offset = derivationPathBuffer.writeUInt32BE(harden(44), offset); // Using BIP44
  offset = derivationPathBuffer.writeUInt32BE(harden(501), offset); // Solana's BIP44 path
  derivationPathBuffer.writeUInt32BE(harden(useAccount), offset);
  return derivationPathBuffer;
};

const handleBip44Change = (useAccount: number, useChange: number) => {
  const length = 4;
  const derivationPathBuffer = Buffer.alloc(1 + length * 4);
  let offset = 0;
  offset = derivationPathBuffer.writeUInt8(length, offset);
  offset = derivationPathBuffer.writeUInt32BE(harden(44), offset); // Using BIP44
  offset = derivationPathBuffer.writeUInt32BE(harden(501), offset); // Solana's BIP44 path
  offset = derivationPathBuffer.writeUInt32BE(harden(useAccount), offset);
  derivationPathBuffer.writeUInt32BE(harden(useChange), offset);
  return derivationPathBuffer;
};

export const getPublicKey = async (transport: Transport, path?: Buffer) => {
  let fromDerivationPath;
  if (path) {
    fromDerivationPath = path;
  } else {
    fromDerivationPath = getSolanaDerivationPath();
  }

  const fromPubkeyBytes = await getPubkeyFromSolanaLedger(
    transport,
    fromDerivationPath
  );
  const fromPubkeyString = base58.encode(fromPubkeyBytes);
  return new PublicKey(fromPubkeyString);
};

const getPubkeyFromSolanaLedger = (
  transport: Transport,
  derivationPath: Buffer
) => sendSolana(transport, INS_GET_PUBKEY, P1_NON_CONFIRM, derivationPath);

/**
 * Helper for chunked send of large payloads
 */
async function sendSolana(
  transport: Transport,
  instruction: any,
  p1: any,
  payload: any
) {
  let p2 = 0;
  let payloadOffset = 0;

  if (payload.length > MAX_PAYLOAD) {
    while (payload.length - payloadOffset > MAX_PAYLOAD) {
      const buf = payload.slice(payloadOffset, payloadOffset + MAX_PAYLOAD);
      payloadOffset += MAX_PAYLOAD;

      console.log(
        "send",
        (p2 | P2_MORE).toString(16),
        buf.length.toString(16),
        buf
      );

      const reply = await transport.send(
        LEDGER_CLA,
        instruction,
        p1,
        p2 | P2_MORE,
        buf
      );

      if (reply.length !== 2) {
        throw new Error("sendSolana: Received unexpected replay payload");
      }
    }
    p2 |= P2_EXTEND;
  }

  const buf = payload.slice(payloadOffset);
  console.log("send", p2.toString(16), buf.length.toString(16), buf);
  const reply = await transport.send(LEDGER_CLA, instruction, p1, p2, buf);
  return reply.slice(0, reply.length - 2);
}
