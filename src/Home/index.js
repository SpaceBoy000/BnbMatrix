import { styled } from "@mui/system";

import LinearProgress from "@mui/material/LinearProgress";
import { useLocation } from "react-router-dom";
import Divider from "@mui/material/Divider";
import { Toast } from "../utils";
import { useEffect, useState } from "react";
import Matrix from "../components/Matrix";

// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { useWallet } from "@solana/wallet-adapter-react";
// import { deposit, compound, toUiSolAmount, unstake } from "../contracts/instructions";
import { useContractContext } from "../providers/ContractProvider";
import { useAuthContext } from "../providers/AuthProvider";
// import * as Constants from '../contracts/constants';
// import { showToast } from "../contracts/utils";
import MiningTimer from "./components/MiningTimer.js";

const Wrapper = styled("div")(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  [theme.breakpoints.down("sm")]: {
    maxWidth: "100%",
  },
}));

export const copyfunc = async (text) => {
  try {
    const toCopy = text;
    await navigator.clipboard.writeText(toCopy);
    Toast.fire({
      icon: 'success',
      title: "Copied to clipboard!"
    });
  }
  catch (err) {
    console.error('Failed to copy: ', err);
  }
}

export default function Home() {
  const { web3, contract, wrongNetwork, getBnbBalance, fromWei, toWei } = useContractContext();
  const { address, chainId } = useAuthContext();

  const [contractBNB, setContractBNB] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [refLink, setRefLink] = useState('Copy Referral Link');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  let isMobile = window.matchMedia("only screen and (max-width: 900px)").matches;
  
  function useQuery() {
    return new URLSearchParams(useLocation().search);
  }
  const query = useQuery();
  const getRef = () => {
    const ref = query.get("ref");
    return ref;
  };

  const [countdown, setCountdown] = useState({
        alive: true,
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    })

    const getCountdown = (deadline) => {
        const now = Date.now() / 1000;
        const total = deadline - now;
        const seconds = Math.floor((total) % 60);
        const minutes = Math.floor((total / 60) % 60);
        const hours = Math.floor((total / (60 * 60)) % 24);
        const days = Math.floor(total / (60 * 60 * 24));

        return {
            total,
            days,
            hours,
            minutes,
            seconds
        };
    }

    const fetchContractBNBBalance = async () => {
      if (!web3 || wrongNetwork) {
        setContractBNB(0);
        return;
      }
      await contract.methods.getBalance().call().then((amount) => {
        setContractBNB(fromWei(amount));
      });
    };
  
    const fetchWalletBalance = async () => {
      if (!web3 || wrongNetwork || !address) {
        setWalletBalance(0);
        // setCompoundTimes(0);
        // setInitialDeposit(0);
        // setTotalDeposit(0);
        // setTotalClaimed(0);
        // setTotalReferralRewards(0);
        // setEstimatedMinerRate(0);
        return;
      }
      
      try {
        const [walletBalance, /*mainKey, userInfo, usersKey, currentRewards*/] = await Promise.all([
          getBnbBalance(address),
          // contract.methods.MainKey(1)
          //   .call()
          //   .catch((err) => {
          //     console.error("userInfo error", err);
          //     return 0;
          //   }),
          // contract.methods.userInfo()
          //   .call({from: address})
          //   .catch((err) => {
          //   console.error('user info error: ', err);
          //   return;
          // }),
          // contract.methods.UsersKey(address)
          //   .call()
          //   .catch((err) => {
          //   console.error('user info error: ', err);
          //   return;
          // }),
          // contract.methods.calcdiv(address)
          //   .call()
          //   .catch((err) => {
          //   console.error('user info error: ', err);
          //   return;
          // })
        ]);
        setWalletBalance(fromWei(walletBalance));
        console.log("Wallet Balance: ", fromWei(walletBalance));
        // setUserCount(mainKey.users);
        // setTotalDeposit(fromWei(mainKey.ovrTotalDeps));
        // console.log('usersKey=> ', usersKey);
        // setUserInfo(userInfo);
        // setInitialDeposit(fromWei(usersKey.totalInits.toString()));
        // setRefBonus(fromWei(usersKey.refBonus.toString()));
        // setTotalClaimed(fromWei(usersKey.totalAccrued.toString()));
        // setTotalReferralRewards(fromWei(usersKey.totalWithRefBonus.toString()));
        // setCurrentRewards(fromWei(currentRewards.toString()));
      } catch (err) {
        console.error(err);
        setWalletBalance(0);
        
        // setInitialDeposit(0);
        // setTotalDeposit(0);
        // setTotalClaimed(0);
        // setTotalReferralRewards(0);
        // setEstimatedMinerRate(0);
      }
    };

    useEffect(() => {
      fetchContractBNBBalance();
      console.log("Home fetchContractBNBBalance");

    }, [web3, chainId]);
  
    useEffect(() => {
      fetchWalletBalance();
      console.log("Home fetchWalletBalance");
    }, [address, web3, chainId]);

    useEffect(() => {
        const interval = setInterval(() => {
            try {
                const data = getCountdown(1667145600) // 04:00 PM 30th Oct UTC
                setCountdown({
                    alive: data.total > 0,
                    days: data.days,
                    hours: data.hours,
                    minutes: data.minutes,
                    seconds: data.seconds
                })
            } catch (err) {
                console.log(err);
            }
        }, 1000);

        // setTimeout(() => {
        //   if (wallet.publicKey) refreshData();
        // }, 30000);

        return () => clearInterval(interval);
    }, [])


  // useEffect(() => {
  //   const refData = async () => {
  //     if (wallet.publicKey) {
  //       const refLink = `${window.origin}/miner?ref=${wallet.publicKey.toBase58()}`;
  //       setRefLink(refLink);
  //     } else {
  //       setRefLink('Copy Referral Link');
  //     }
  //   };

  //   refData();
  // }, [wallet.publicKey]);

  const onInvestClick = async () => {
    setLoading(true);
    try {
      let ref = getRef();
      // await deposit(wallet, amount, ref, () => isStarted());
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    refreshData();
  }

  const refreshData = () => {
    return true;
  }

  const onCompound = async (matrixId) => {
    if (!isStarted()) return;
    setLoading(true);

    try {
      // await compound(wallet, userMatrixList[matrixId]?.publicKey);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    refreshData();
  }

  const onClaim = async (matrixId) => {
    if (!isStarted()) return;
    setLoading(true);
    try {
      // await unstake(wallet, userMatrixList[matrixId]?.publicKey);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
    refreshData();
  }

  const isStarted = () => {
    return true;
  }

  let element = document.getElementById('description');
  element.content = 'Enter The Matrix...';

  return (
    <>
    {/* <ToastContainer
      position="top-right"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
    /> */}
    <Wrapper>
      <MiningTimer/>
      <div className='contractInfo'>
        <div className="contractInfoItem">
          <span className="tt">Total Value Locked</span>
          <span className='nn'>{Number(contractBNB).toFixed(3)} BNB</span>
        </div>
        <div className="contractInfoItem">
          <span className="tt">Daily ROI</span>
          <span className='nn'>1.15%</span>
        </div>
        <div className="contractInfoItem">
          <span className="tt">Organization</span>
          <span className='nn'>{0} Members</span>
        </div> 
      </div>
      <div style={{flex:'1'}}/>

      {/*<div>
        {loading && <LinearProgress color="secondary"/>}
  </div>*/}

      <div className="investCard">
        {/* {
          userMatrixList.map((matrix, i) => (
              <>
                <Matrix data = {matrix} index = {i} onCompound={onCompound} onClaim={onClaim}/>
                { i == 0 ? 
                  <Divider style={{height: isMobile ? '2px' : '180px', width: isMobile ? '100' : '2px', background:'#559DC9', margin:'10px', alignSelf:'center'}}/>
                  : <></>
                }
              </>
            )
          )
        } */}
        {/* {userMatrixList.length < 2 ? 
          <div style={{minWidth: isMobile ? '100px' : "40%"}}>
            <div className="invest_title tt">New Matrix</div>
            <div style={{fontSize: '20px'}}>Invest to enter the Matrix</div>
            <div style={{margin: '20px 0px 40px 0px', display: 'flex'}}>
              <input
                placeholder="1 Sol"
                // type='number'
                value={ amount }
                onChange={(e) =>{setAmount(e.target.value)}}
                className='nn'
                style={{width: '120px', marginRight:'20px', padding:'5px 10px', border:'none'}}
              />
              <button className="myButton_invest" onClick={onInvestClick}>Invest</button>
            </div>
          </div> : <></>} */}
      </div>
      <div style={{flex:'1'}}/>
      <div className="refInfo">
        <div className="ref_first">
          <h3 className="tt">Referral</h3>
          <button className="refBtn1" style={{border:'none', fontFamily: 'lightPolice', fontSize:'20px', background:'black', color:'white', width:'70%', marginTop:'30px', padding:'5px'}} onClick={ () => { copyfunc(refLink) } }>Click to Copy</button>
        </div>
        <Divider style={{display: isMobile ? 'none' : 'block', height:'100px', width:'2px', background:'#559DC9', margin:'10px', alignSelf:'center'}}/>
        <div className="ref_second tt">
          <div className="ref_item">
            <span>Referral Bonus</span>
            <span className="nn">10%</span>
          </div>
          <div className="ref_item">
            <span>Members Referred</span>
            <span className="nn">{0} Members</span>
          </div>
          <div className="ref_item">
            <span>Referral Rewards</span>
            {/* <span className="nn">{toUiSolAmount(userData?.account.referralReward?.toNumber() ?? 0 )} Sol</span> */}
          </div>
          <button className="refBtn2" style={{border:'none', fontFamily: 'lightPolice',background:'black', color:'white', width:'100%', padding:'5px'}} onClick={ () => {copyfunc(refLink)} }>Click to Copy</button>
        </div>
      </div>
    </Wrapper>
    </>  
  );
}
