import { useRouter } from "next/router";
import { SyntheticEvent, useState } from "react";
import { loadMnemonicAndSeed } from "../lib/wallet-seed";

const LoginForm = () => {
  const [password, setPassword] = useState<string>("");

  const handleChangePassword = (e: SyntheticEvent) => {
    setPassword(e.target.value);
  };

  const router = useRouter();
  const submit = async (e) => {
    e.preventDefault();
    await loadMnemonicAndSeed(password);
    router.push("/wallet");
  };

  return (
    <div>
      <h1>비밀번호로 로그인</h1>
      <input type="password" value={password} onChange={handleChangePassword} />
      <button onClick={submit}>로그인</button>
    </div>
  );
};

export default LoginForm;
