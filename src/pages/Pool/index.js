import { useMemo, useState, useEffect } from 'react';
import { styled } from "@mui/system";
import "./style.css"
import { shorten } from "../../Home/components/Connect";

import { useContractContext } from "../../providers/ContractProvider";

import { getLastWinner, getLastDepositUser } from "../../contracts/instructions";

import { copyfunc } from '../../Home';

const Wrapper = styled("div")(({ theme }) => ({
    color: 'white',
    textAlign: 'center',
    background: "linear-gradient(90deg, #9945FF 15%, #14F195 84%, #14F195 100%)",
    fontSize:'20px',
    height: '100%',
    [theme.breakpoints.down("md")]: {
        // height:'100vh'
    },
}));

const Pool = () => {

  let element = document.getElementById('description');
  element.content = "Enter The Matrix..."

  const {
    settingsData,
    userMatrixList,
    userData,
    walletSolBalance,
    contractSolBalance,
    refreshData,
  } = useContractContext();

  let isMobile = window.matchMedia("only screen and (max-width: 900px)").matches;

  // const timeString = useMemo(() => {
  //   let seconds = settingsData?.account?.lastDepositTime.toNumber();
  //   let curSeconds = parseInt(Date.now() / 1000);
  //   seconds = curSeconds - seconds;
  //   let s = seconds % 60;
  //   let m = parseInt(seconds / 60) % 60;
  //   let h = parseInt(seconds / 3600) % 24;
  //   return h + " : " + m + " : " + s;
  //   // new Date(seconds)
  // }, [settingsData]);


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
    if (total <= 0) return { 
      total: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    };

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

  useEffect(() => {
    const interval = setInterval(() => {
        try {
            let seconds = settingsData?.account?.lastDepositTime.toNumber();
            let limit = settingsData?.account.poolPrizeLimit.toNumber();
            const data = getCountdown(seconds + limit)
            console.log("settingsData?.account.members.toNumber() =", settingsData?.account.members.toNumber());
            if (!settingsData || settingsData?.account.members.toNumber() == 0) data.total = 1;
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

    return () => clearInterval(interval);
  }, [settingsData])

    return (
        <Wrapper>
          <div style={{fontSize: '40px', padding:'30px'}}>
            POOL PRIZE
          </div>
          <div style={{color: 'black', fontSize:'30px', fontWeight: 'bolder'}}>
            { countdown.alive && <>{ `${countdown.hours.toString().padStart(2, '0')} : ${countdown.minutes.toString().padStart(2, '0')} : ${countdown.seconds.toString().padStart(2, '0')}`}</>}
          </div>
          <div style={{fontSize: isMobile ? '40px' : '60px', color: isMobile ? 'white': '#14F195', padding:'30px'}}>
          { settingsData ? Number(contractSolBalance * settingsData.account.poolPrizeRatio / 10000).toFixed(4) : 0 } Sol

          </div>
          <div>
            Last Deposit Address
          </div>
          <div style={{color:'black', fontWeight:'bolder', padding:'5px', cursor:'pointer'}} onClick={() => {copyfunc(getLastDepositUser(settingsData))}}>
            { isMobile ? shorten(getLastDepositUser(settingsData)) : getLastDepositUser(settingsData) }
          </div>
          <div>
            {!countdown.alive?<span style={{color: 'green'}}> Won Prize! </span>:""}
          </div>
          <div style={{margin:'20px'}}>
            If there are no investment of at least 1 Solana within 24 hours after you, then the entire amount of 
            Prize Pool will automatically be credited to your wallet via the smart contract.
          </div>
          <div style={{padding:'10px'}}>
            The Pool Prize corresponds to {Number(settingsData?.account?.poolPrizeRatio / 100 ?? 0).toFixed(0)}% of the Total Value Locked.
          </div>
          <div onClick={() => {copyfunc(getLastWinner(settingsData).winner)}}>
            Last Winner: { isMobile ? shorten(getLastWinner(settingsData).winner) : getLastWinner(settingsData).winner }
          </div>
          <div>
            Last Prize: {getLastWinner(settingsData).prize}
          </div>
        </Wrapper>
    );
}

export default Pool;
