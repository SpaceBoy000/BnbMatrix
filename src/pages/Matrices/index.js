import { useMemo, useState, useEffect } from 'react';
import { styled } from "@mui/system";
import "./style.css"
import { shorten } from "../../Home/components/Connect";
import { useContractContext } from '../../providers/ContractProvider';

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
        { label: 'Total Value locked', value: 0, unit: 'USDC' },
        { label: 'Weekly ROI', value: 0, unit: "%" },
        { label: 'Organization', value: 0, unit: "MEmbers" },
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

    return (
        <Wrapper>
            <div className='contractInfo'>
                {
                    contractInfos.map((item, index) => {
                        return (
                            <div className="contractInfoItem" key={index}>
                                <span className="tt">{item.label}</span>
                                <span className='nn'>{item.value + " " + item.unit} </span>
                            </div>
                        );
                    })
                }
            </div>

            <div className='flex gap-4'>
                <div className='tradeCard'>
                    <span className='tt text-xl pb-2'>Matrix</span>
                    <span className='tt'>Deposit USDC to enter the Mmatrix</span>
                    <div className="flex gap-6">
                        <div className='tt bg-white text-black rounded-lg px-2'>+1234 USDC</div>
                        <div className='tt bg-white text-black rounded-lg px-2'>10.00%</div>
                    </div>
                </div>
                <div className='tradeCard flex flex-row'>
                    <div className='w-1/2'>
                        <div className='tt text-xl pb-2'>Referral</div>
                        <div className="gap-2 items-center">
                            <div>Referral Rewards</div>
                            <div>2.45 USDC</div>
                        </div>
                    </div>
                    <div className='w-1/2'>
                        <div className='tt text-xl pb-2'>Referral link</div>
                        <div className="gap-2 items-center">
                            <div>Claim</div>
                            <div>Invest</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='tradeCard'>
                <span className='tt text-xl pb-2'>Your Matrices</span>
                <div className="flex justify-between">
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Total Deposited</div>
                        <div>100.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Currently Staked</div>
                        <div>90.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Daily Earnings</div>
                        <div>0.96 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Total Withdrawn</div>
                        <div>11.00 USDC</div>
                    </div>
                </div>
                <div className="flex justify-between">
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Claimable Earnings</div>
                        <div>6.75 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Timer</div>
                        <div>06D 12H 02M</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div>Claim All</div>
                    </div>
                </div>
            </div>
            
            <div className='tradeCard blueCover2'>
                <span className='tt text-xl pb-2'>Matrices 1</span>
                <div className="flex justify-between">
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Amount Invested</div>
                        <div>100.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Active Balance</div>
                        <div>90.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Daily Earnings</div>
                        <div>0.96 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Total Profit</div>
                        <div>11.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Unstake</div>
                        <div>10 Cycles</div>
                    </div>
                </div>
            </div>
            <div className='tradeCard blueCover2'>
                <span className='tt text-xl pb-2'>Matrices 2</span>
                <div className="flex justify-between">
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Amount Invested</div>
                        <div>100.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Active Balance</div>
                        <div>90.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Daily Earnings</div>
                        <div>0.96 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Total Profit</div>
                        <div>11.00 USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='text-sm font-thin'>Unstake</div>
                        <div>10 Cycles</div>
                    </div>
                </div>
            </div>
        </Wrapper>
    );
}

export default Matrices;
