import "./style.css"
import { styled } from "@mui/system";
import Divider from "@mui/material/Divider";
import { useState, useEffect } from 'react';
// import { setPoolPrize, addBlacklist, removeFromBlacklist, getUserTotalInfo, startMiner, toUiSolAmount } from '../../contracts/instructions';
// import { useWallet } from "@solana/wallet-adapter-react";

import { useContractContext } from "../../providers/ContractProvider";

import { copyfunc } from '../../Home';
import { shorten } from "../../Home/components/Connect";
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
const Item = styled('div')(({ theme }) => ({
    fontSize: '25px',
    display: 'flex',
    // justifyContent: 'space-between',
    // width: '80%',
    margin: '15px 0px',
    [theme.breakpoints.down("sm")]: {
        width: '100%',
    },
  }));

  const Item1 = styled('div')(({ theme }) => ({
    fontSize: '25px',
    display: 'flex',
    // justifyContent: 'space-between',
    // width: '80%',
    margin: '15px 0px',
    [theme.breakpoints.down("sm")]: {
        width: '100%',
        flexDirection:'column',
    },
  }));
  
  const Item2 = styled('div')(({ theme }) => ({
    fontSize: '25px',
    display: 'flex',
    justifyContent: 'space-between',
    width: '50%',
    margin: '10px 0px',

    [theme.breakpoints.down("sm")]: {
        width: "100%",
    },
  }));

  const MyButton = styled('button')(({ theme }) => ({
    color: 'white',
    background: '#3ac0b3',
    minWidth: '100px',
    "&:hover": {
        color: 'black',
    }
  }));

  const MyInput = styled('input')(({ theme }) => ({
    width: '30%',
    margin: '0px 10px',
  }));

const Admin = () => {

    let element = document.getElementById('description');
    element.content = "Enter The Matrix...";
    const [fee, setFee] = useState(0);
    const [poolPrizeTime, setPoolPrizeTime] = useState(0);
    const [userAddress, setUserAddress] = useState('');
    const [userInfo, setUserInfo] = useState(null);

    // const wallet = useWallet();

    const {
      settingsData,
      userMatrixList,
      userData,
      walletSolBalance,
      contractSolBalance,
      blacklist,
      refreshData,
    } = useContractContext();

    useEffect(() => {
      setFee(settingsData?.account.poolPrizeRatio.toNumber() / 100 ?? 0);
      setPoolPrizeTime(settingsData?.account.poolPrizeLimit / 60)
    }, [settingsData])

    const setPPFee = (value) => {
      const x = parseFloat(value);
      if (x > 100) setFee(100);
      else if (x < 0) setFee(0);
      else setFee(value);
    }

    const onHandlePoolPrizeArg = async () => {
      try {
        // await setPoolPrize(wallet, poolPrizeTime, fee);
        refreshData();
      } catch (err) {
        console.error(err);
      }
    }

    const onHandleGetUserInfo = async () => {
      // let info = await getUserTotalInfo(userAddress);
      // setUserInfo(info);
    }
    
    const onHandleBanUser = async () => {
      try {
        // await addBlacklist(wallet, userAddress);
        refreshData();
      } catch (err) {
        console.error(err);
      }
    }

    const onHandleUnblockUser = async () => {
      try {
        // await removeFromBlacklist(wallet, userAddress);
        refreshData();
      } catch (err) {
        console.error(err);
      }
    }

    const onHandleStartMiner = async () => {
      try {
        // await startMiner(wallet);
        refreshData();
      } catch (err) {
        console.error(err);
      }
    }
    let isMobile = window.matchMedia("only screen and (max-width: 900px)").matches;

    console.log("isMobile =", isMobile);
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
        <div style={{fontSize:"30px", color:"white"}}>
            {
              (settingsData?.account.minerStarted ?? 0)?"":<MyButton style={{margin:'10px 0px'}} onClick={ onHandleStartMiner }>Start Miner</MyButton>
            }
            
            <Item>
                <Item2>
                    <div>Set Fee (%)</div>
                    <MyInput type="number" value={fee} onChange={(e) => {setPPFee(e.target.value)}}/>
                </Item2>
                <MyButton style={{margin:'10px 0px'}} onClick={ onHandlePoolPrizeArg }>Set</MyButton>
            </Item>
            <Item>
                <Item2>
                    <div>Set Time (min)</div>
                    <MyInput type="number" value={poolPrizeTime} onChange={(e) => {setPoolPrizeTime(Math.abs(e.target.value))}}/>
                </Item2>
                <MyButton style={{margin:'10px 0px'}} onClick={ onHandlePoolPrizeArg }>Set</MyButton>
            </Item>
            <Item1>
                <Item2>
                    <div>User Address</div>
                    <MyInput value={userAddress} onChange={(e) => {setUserAddress(e.target.value)}}/>
                </Item2>
                <div style={{margin:'10px 0px'}}>
                    <MyButton onClick={ onHandleGetUserInfo }>Get Info</MyButton>
                    <MyButton style={{background: 'red'}} onClick={ onHandleBanUser }>Block</MyButton>
                    <MyButton style={{background: 'green'}} onClick={ onHandleUnblockUser }>Unblock</MyButton>
                </div>
            </Item1>
            
            <Divider/>
            
            <Item2>
                <div>Amount Invested</div>
                <div>{Number(userInfo?.totalInvest ?? 0).toFixed(3)} Sol</div> 
            </Item2>
            <Item2>
                <div>Active Balance</div>
                <div>{Number(userInfo?.activeBalance ?? 0).toFixed(3)} Sol</div> 
            </Item2>
            <Item2>
                <div>Number of Referrals</div>
                <div>{userInfo?.referralCount ?? 0} Members</div> 
            </Item2>
            <Item2>
                <div>Referral Reward</div>
                <div>{userInfo?.referralReward} SOL</div> 
            </Item2>
            <Item2>
                <div>Banned or Not</div>
                <div>{userInfo?.bannedStatus ? 'TRUE' : 'FALSE'}</div> 
            </Item2>
            <Item2>
                <div>Number of Compound</div>
                <div>{userInfo?.compoundTimes ?? 0} Times</div> 
            </Item2>
            <Item2>
                <div>Referrer</div>
                <div style={{paddingLeft: '40px'}}  onClick={() => {copyfunc(userInfo?.referrer ?? '')}}>{isMobile? shorten(userInfo?.referrer ?? 'No Addr') : (userInfo?.referrer ?? 'No Addr')}</div> 
            </Item2>
            <Divider/>
            <span>Blacklist Addresses</span>
            <div>
            {
              blacklist && blacklist.map((acc, i) => (
                <p key={i} onClick={() => {copyfunc(acc?.toBase58() ?? '')}}>{isMobile? shorten(acc?.toBase58() ?? '') : (acc?.toBase58() ?? '')}</p>
              ))
            }
          </div>
        </div>
        </>
    );
}

export default Admin;
