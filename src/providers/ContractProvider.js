import { createContext, useContext, useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { config } from "../config";
import {
  getWalletSolBalance,
  getVaultSolBalance,
  getSettings,
  getUserState,
  getUserInvestDataList,
  getBlackList
} from "../contracts/instructions"

export const ContractContext = createContext({
  settingsData: null,
  userMatrixList: [],
  blacklist: [],
  userData: null,
  walletSolBalance: 0,
  contractSolBalance: 0,
  refreshData: () => {},
});

export const ContractProvider = ({ children }) => {
  const [walletSolBalance, setWalletSolBalance] = useState("0");
  const [contractSolBalance, setContractSolBalance] = useState("0");
  const [dataUpdate, setDataUpdate] = useState(false);
  const [userData, setUserData] = useState(null);
  const [settingsData, setSettingsData] = useState(null);
  const [userMatrixList, setUserMatrixList] = useState([]);
  const [blacklist, setBlacklist] = useState([]);
  const wallet = useWallet();

  useEffect(() => {
    console.log("refresh");
    if (wallet && wallet.publicKey) {
      getUserInvestDataList(wallet.publicKey).then(data => {
        setUserMatrixList(data.sort((a, b) => (a?.account.investTime?.toNumber() - b?.account.investTime?.toNumber())));
      });
    } else {
      setUserMatrixList([]);
    }
    getWalletSolBalance(wallet).then(bal => {
      console.log('refresh wallet sol balance =', bal);
      setWalletSolBalance(bal);
    });
    getUserState(wallet.publicKey).then(data => {
      if (data !== null) {
        console.log('refresh userstate =', data);
        setUserData(data);
      }
    });
    getSettings().then(data => {
      if (data !== null) {
        console.log('refresh settings =', data);
        setSettingsData(data);
      }
    });
    getVaultSolBalance(wallet).then(bal => {
      console.log('refresh vault sol balance =', bal);
      setContractSolBalance(bal);
    });
    getBlackList().then((v) => {
      console.log('refresh blacklist =', v);
      setBlacklist(v);
    })
  }, [wallet, dataUpdate]);

  return (
    <ContractContext.Provider
      value={{ 
        settingsData,
        userMatrixList,
        userData,
        walletSolBalance,
        contractSolBalance,
        blacklist,
        refreshData: () => setDataUpdate(!dataUpdate)
      }}
    >
      {children}
    </ContractContext.Provider>
  );
};

export const useContractContext = () => useContext(ContractContext);

