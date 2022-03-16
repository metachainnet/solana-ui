import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from "@material-ui/core";
import React, { useEffect, useState } from "react";
import {
  DERIVATION_PATH,
  generateMnemonicAndSeed,
  GenerateMnenomicAndSeedParam,
  normalizeMnemonic,
  storeMnemonicAndSeed,
} from "../lib/wallet-seed";
import DialogForm from "./DialogForm";

const CreateWalletForm = () => {
  const [mnemonicAndSeed, setMnemonicAndSeed] =
    useState<GenerateMnenomicAndSeedParam>({
      mnemonic: "",
      seed: "",
    });
  const [savedWords, setSavedWords] = useState<boolean>(false);

  useEffect(() => {
    generateMnemonicAndSeed().then(setMnemonicAndSeed);
  }, []);

  const submit = async (password: string) => {
    const { mnemonic, seed } = mnemonicAndSeed;

    await storeMnemonicAndSeed(
      mnemonic,
      seed,
      password,
      DERIVATION_PATH.bip44Change
    );
  };

  if (!savedWords) {
    return (
      <SeedWordsForm
        mnemonicAndSeed={mnemonicAndSeed}
        goForward={() => setSavedWords(true)}
      />
    );
  }

  return (
    <ChoosePasswordForm goBack={() => setSavedWords(false)} onSubmit={submit} />
  );
};

const SeedWordsForm = ({
  mnemonicAndSeed,
  goForward,
}: {
  mnemonicAndSeed: GenerateMnenomicAndSeedParam;
  goForward: any;
}) => {
  const [confirmed, setConfirmed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [seedCheck, setSeedCheck] = useState("");

  const downloadMnemonic = (mnemonic: string) => {
    const url = window.URL.createObjectURL(new Blob([mnemonic]));
    const link = document.createElement("a");
    link.href = url;
    link.style.display = "none";
    link.setAttribute("download", "wallet.json");
    document.body.appendChild(link);
    link.click();
  };

  return (
    <>
      <div>
        <h1>지갑 생성</h1>
        <h2>솔라나와 토큰을 담을 새로운 지갑을 생성합니다</h2>
        <h3>아래의 24개 단어를 기록하고 안전한 곳에 저장하세요</h3>
        {mnemonicAndSeed ? (
          <p>{mnemonicAndSeed.mnemonic}</p>
        ) : (
          <p>Loading...</p>
        )}
        <p>
          Private Keys 들은 오직 당신의 컴퓨터나 장치에 저장됩니다 브라우저가
          초기화되거나 장치가 손상을 입거나 잃어버렸을 때 지갑을 복구하기 위해서
          단어가 필요합니다
        </p>
        <p>
          기본적으로 메인 지갑의 derivation path는 <code>m/44'/501'/0'/0'</code>
          입니다. 다른 경로를 사용하려면 기존 지갑 복구하기를 사용해보세요
        </p>
        <input
          type="checkbox"
          disabled={!mnemonicAndSeed}
          onChange={(e) => setConfirmed(e.target.checked)}
          id="checkbox"
        />
        <label htmlFor="checkbox">안전한 곳에 단어들을 저장했습니다</label>
        <button
          onClick={() => {
            downloadMnemonic(mnemonicAndSeed?.mnemonic);
            setDownloaded(true);
          }}
        >
          백업용 Mnemonic File 저장 (필수)
        </button>
        <Button
          color="primary"
          disabled={!confirmed || !downloaded}
          onClick={() => setShowDialog(true)}
        >
          게속하기
        </Button>
      </div>
      <DialogForm
        open={showDialog}
        onClose={() => setShowDialog(false)}
        onSubmit={goForward}
      >
        <DialogTitle>{"Mnemonic 확인"}</DialogTitle>
        <DialogContent>
          <p>당신의 Seed 단어들을 입력하여 저장했다는 것을 확인하세요</p>
          <TextField
            label={`Seed 단어들을 입력하고 확인 버튼을 누르세요`}
            variant="outlined"
            margin="normal"
            value={seedCheck}
            onChange={(e) => setSeedCheck(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>닫기</Button>
          <Button
            type="submit"
            color="secondary"
            disabled={
              normalizeMnemonic(seedCheck) !== mnemonicAndSeed?.mnemonic
            }
          >
            계속하기
          </Button>
        </DialogActions>
      </DialogForm>
    </>
  );
};

const ChoosePasswordForm = ({
  goBack,
  onSubmit,
}: {
  goBack: () => void;
  onSubmit: (password: string) => void;
}) => {
  const [password, setPassword] = useState("");

  return (
    <div>
      <p>비밀번호 선택 (선택사항)</p>
      <p>선택사항으로 지갑을 보호하기 위해 비밀번호를 사용하세요</p>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <p>
        만약 비밀번호를 잃어버렸다면 seed 단어들을 이용하여 지갑을 복구할 수
        있습니다
      </p>
      <button onClick={() => onSubmit(password)}>지갑 생성</button>
    </div>
  );
};

export default CreateWalletForm;
