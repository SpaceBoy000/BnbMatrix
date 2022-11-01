import { toast } from "react-toastify";
import BN from 'bn.js';
import BigNumber from 'bignumber.js';
import { DAY_IN_SEC } from "./constants";

export const showToast = (
  txt: string,
  duration: number = 5000,
  ty: number = 0
) => {
  let type = toast.TYPE.SUCCESS;
  if (ty === 1) type = toast.TYPE.ERROR;
  if (ty === 2) type = toast.TYPE.INFO;
  if (ty === 3) type = toast.TYPE.WARNING;

  let autoClose: any = duration;
  if (duration < 0) {
    autoClose = false;
  }
  return toast.error(txt, {
    position: "bottom-left",
    autoClose,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: false,
    draggable: true,
    progress: undefined,
    type,
    theme: "colored",
  });
};

export const bn2uiNum = (x: BN) => {
  const lamports = 1000_000_000;
  return new BigNumber(x.toString()).div(lamports).toFixed(2);
}

export const remainDays = (days: BN) => {
  const currentTime = Date.now() / 1000;
  return 60 - days.toNumber();
}

export const miniAddress = (addr: string) => {
  return addr.slice(0, 5) + "..." + addr.slice(addr.length - 5, addr.length);
}