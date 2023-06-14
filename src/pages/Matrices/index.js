import { useMemo, useState, useEffect } from 'react';
import { styled } from "@mui/system";
import "./style.css"
import { shorten } from "../../Home/components/Connect";
import { useContractContext } from '../../providers/ContractProvider';
import { FaCopy } from 'react-icons/fa';

import { copyfunc } from '../../Home';

const Wrapper = styled("div")(({ theme }) => ({
    color: 'white',
    textAlign: 'center',
    // background: "linear-gradient(90deg, #fedd58 15%, #eec433 84%, #e0ae13 100%)",
    fontSize: '20px',
    height: '100%',
    fontFamily: 'mediumPolice',
    [theme.breakpoints.down("md")]: {
        // height:'100vh'
    },
}));

const Matrices = () => {

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

    let contractInfos = [
        { label: 'Total Investments', value: 0, unit: 'USDC' },
        { label: 'Total Value Locked', value: 0, unit: 'USDC' },
        { label: 'Weekly ROI', value: 0, unit: "%" },
        { label: 'Organization', value: 0, unit: "Members" },
    ]

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

    const handleClickCopy = () => {
        navigator.clipboard.writeText("https://usdc-matrix.netlify.app/?ref=");
        // toast.success('Referral link has been copied!');
        console.log("handleClickCopy>>>>>>>>>>>");
    }

    return (
        <Wrapper>
            <div className='contractInfo'>
                {
                    contractInfos.map((item, index) => {
                        return (
                            <div className="contractInfoItem" key={index}>
                                <span className="rr">{item.label}</span>
                                <span className='tt font-bold pt-2'>{item.value + " " + item.unit} </span>
                            </div>
                        );
                    })
                }
            </div>

            <div className='flex flex-col md:flex-row gap-4'>
                <div className='tradeCard'>
                    <span className='tt text-xl'>Matrix</span>
                    <span className='nn text-sm font-thin py-4'>Deposit USDC to enter the Matrix</span>
                    <div className="flex gap-6">
                        <div className='tt bg-white text-black rounded-lg px-2 py-1 w-full text-center'>0.00 USDC</div>
                        <div className='tt bg-[#3574b9] text-white rounded-lg px-2 py-1 w-full text-center cursor-pointer hover:-translate-y-0.5'>Deposit</div>
                    </div>
                </div>
                <div className='tradeCard flex flex-row'>
                    <div className='w-1/2'>
                        <div className='tt text-xl pb-4'>Referral</div>
                        <div className="gap-2 items-center">
                            <div className='nn text-sm font-thin pb-1'>Referral Rewards</div>
                            <div>2.45 USDC</div>
                        </div>
                    </div>
                    <div className='w-1/2'>
                        <div className='nn text-sm font-thin flex pb-2 items-center cursor-pointer hover:-translate-y-0.5' onClick={() => {copyfunc("https://usdc-matrix.netlify.app/?ref=")}}>Referral link<FaCopy size="1.7em" className="pl-2" /></div>
                        <div className="gap-2 items-center">
                            <div className='tt bg-[#11b470] text-white rounded-lg px-2 py-0.5 my-3 w-full text-center min-w-[150px] cursor-pointer hover:-translate-y-0.5'>Claim</div>
                            <div className='tt bg-[#3574b9] text-white rounded-lg px-2 py-0.5 my-3 w-full text-center min-w-[150px] cursor-pointer hover:-translate-y-0.5'>Invest</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='tradeCard overflow-x-scroll md:overflow-x-hidden'>
                <span className='tt text-xl pb-2'>Your Matrices</span>
                <div className="flex justify-between text-center">
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Total Deposited</div>
                        <div>100.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Currently Staked</div>
                        <div>90.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Daily Earnings</div>
                        <div>0.96 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Total Withdrawn</div>
                        <div>11.00 USDC</div>
                    </div>
                </div>
                <div className="flex justify-between mt-3 items-center text-center">
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Claimable Earnings</div>
                        <div className='text-center'>6.75 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Timer</div>
                        <div className='text-center'>06D 12H 02M</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='tt bg-[#ff3131] text-white rounded-lg px-2 py-0.5 my-3 w-full text-center min-w-[150px] cursor-pointer hover:-translate-y-0.5'>Claim All</div>
                    </div>
                </div>
            </div>
            
            <div className='tradeCard blueCover2 overflow-x-scroll'>
                <span className='tt text-xl pb-2'>Matrix 1</span>
                <div className="flex justify-between text-center">
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Amount Invested</div>
                        <div>100.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Active Balance</div>
                        <div>90.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Daily Earnings</div>
                        <div>0.96 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Total Profit</div>
                        <div>11.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Unstake</div>
                        <div className='tt bg-[#11b470] text-white rounded-lg px-2 py-0.5 w-full text-center cursor-pointer hover:-translate-y-0.5'>10 Cycles</div>
                    </div>
                </div>
            </div>
        </Wrapper>
    );
}

export default Matrices;
