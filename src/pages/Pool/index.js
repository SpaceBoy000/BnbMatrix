import { useMemo, useState, useEffect } from 'react';
import { styled } from "@mui/system";
import "./style.css"
import { shorten } from "../../Home/components/Connect";
import { useContractContext } from '../../providers/ContractProvider';

import { copyfunc } from '../../Home';

const Wrapper = styled("div")(({ theme }) => ({
    color: 'white',
    textAlign: 'center',
    background: "linear-gradient(90deg, #fedd58 15%, #eec433 84%, #e0ae13 100%)",
    fontSize:'20px',
    height: '100%',
    fontFamily: 'mediumPolice',
    [theme.breakpoints.down("md")]: {
        // height:'100vh'
    },
}));

const Pool = () => {

  let element = document.getElementById('description');
  element.content = "Enter The Matrix..."

  const [lastDepositTime, setLastDepositTime] = useState(0);
  const [lastWinner, setLastWinner] = useState('0x0000000000000000000000000000000000000000');
  const [poolPrizeSize, setPoolPrizeSite] = useState(0);
  const [curWinner, setCurWinner] = useState('0x0000000000000000000000000000000000000000');
  const [lastPoolPrizeSize, setLastPoolPrizeSite] = useState(0);
  const [cutoffStep, setCutoffStep] = useState(0);

  const { contract, fromWei } = useContractContext();

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
          
            let seconds = lastDepositTime;
            const data = getCountdown(Number(seconds) + Number(cutoffStep))
            // console.log("lastDepositTime: ", lastDepositTime, " : ", cutoffStep, " : ", data);
            // if (!settingsData || settingsData?.account.members.toNumber() == 0) data.total = 1;
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
  }, [lastDepositTime, cutoffStep])

  useEffect(() => {
    const fetchContractInfo = async () => {
      try {
        const [lastDepositTime, lastWinner, poolPrizeSize, curWinner, lastpoolPrizeSize, cutoffStep] = await Promise.all([
          contract.methods.LATEST_DEPOSIT_TIME()
            .call()
            .catch((err) => {
              console.log(err);
              return 0;
            }),
          contract.methods.LAST_WINNER()
            .call()
            .catch((err) => {
              console.log(err);
              return 0;
            }),
          contract.methods.POOL_PRIZE_SIZE()
            .call()
            .catch((err) => {
              console.log(err);
              return 0;
            }),
          contract.methods.CUR_WINNER()
            .call()
            .catch((err) => {
              console.log(err);
              return 0;
            }),
          contract.methods.LAST_POOL_PRIZE_SIZE()
            .call()
            .catch((err) => {
              console.log(err);
              return 0;
            }),
          contract.methods.CUTOFF_STEP()
            .call()
            .catch((err) => {
              console.log(err);
              return 0;
            }),
        ]);

        setLastDepositTime(lastDepositTime);
        setLastWinner(lastWinner);
        setPoolPrizeSite(fromWei(poolPrizeSize));
        setCurWinner(curWinner);
        setLastPoolPrizeSite(fromWei(lastpoolPrizeSize));
        setCutoffStep(cutoffStep);
        console.log("poolPrizeSize: ", poolPrizeSize);
        console.log("cutoffStep: ", cutoffStep);
      } catch (err) {
        console.log(err);
      }
    }
    console.log("Pool page");
    fetchContractInfo();
  }, [contract]);

    return (
        <Wrapper>
          <div style={{fontSize: '40px', padding:'30px'}}>
            POOL PRIZE
          </div>
          <div style={{color: 'black', fontSize:'30px', fontWeight: 'bolder'}}>
            { countdown.alive && <>{ `${countdown.hours.toString().padStart(2, '0')} : ${countdown.minutes.toString().padStart(2, '0')} : ${countdown.seconds.toString().padStart(2, '0')}`}</>}
          </div>
          <div style={{fontSize: isMobile ? '40px' : '60px', color: '#11B470', padding:'30px'}}>
            <span className='nn'>{ poolPrizeSize }</span> BNB

          </div>
          <div>
            Last Deposit Address
          </div>
          <div className='nn' style={{color:'black', fontWeight:'bolder', padding:'5px', cursor:'pointer'}} onClick={() => {copyfunc(curWinner)}}>
            { isMobile ? shorten(curWinner) : curWinner }
          </div>
          <div>
            {!countdown.alive?<span style={{color: 'green'}}> Won Prize! </span>:""}
          </div>
          <div style={{margin:'20px'}}>
            If there are no investment of at least 0.1 BNB within 24 hours after you, then the entire amount of 
            Prize Pool will automatically be credited to your wallet via the smart contract.
          </div>
          <div style={{padding:'10px'}}>
            The Pool Prize corresponds to 10% of all new deposits.
          </div>
          <div style={{cursor:'pointer'}} onClick={() => {copyfunc(lastWinner)}}>
            Last Winner: <span className='nn' style={{color:'black'}}>{ isMobile ? shorten(lastWinner) : lastWinner }</span>
          </div>
          <div>
            Last Prize: <span className='nn' style={{color:'black'}}>{Number(lastPoolPrizeSize).toFixed(3)} </span>
            <span style={{color:'black'}}>BNB</span>
          </div>
        </Wrapper>
    );
}

export default Pool;
