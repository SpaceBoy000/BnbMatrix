import { useMemo, useState, useEffect } from 'react';
import { styled } from "@mui/system";
import "./style.css"
import { shorten } from "../../Home/components/Connect";
import { useContractContext } from '../../providers/ContractProvider';
import { useAuthContext } from "../../providers/AuthProvider";
import { FaCopy } from 'react-icons/fa';
import { useLocation } from "react-router-dom";
import Web3 from "web3";
import { copyfunc } from '../../Home';
import { config } from '../../config';
import { Curtains } from '@mui/icons-material';
import { Toast } from "../../utils";
const Wrapper = styled("div")(({ theme }) => ({
    color: 'white',
    textAlign: 'center',
    // background: "linear-gradient(90deg, #fedd58 15%, #eec433 84%, #e0ae13 100%)",
    fontSize: '20px',
    // height: '100%',
    fontFamily: 'mediumPolice',
    [theme.breakpoints.down("md")]: {
        // height:'100vh'
    },
}));

const Matrices = () => {

    let element = document.getElementById('description');
    element.content = "Enter The Matrix..."

    const [amount, setAmount] = useState(0);
    const [totalInvestment, setTotalInvestment] = useState(0);
    const [userTotalDeposited, setUserTotalDeposited] = useState(0);
    const [main, setMain] = useState([]);
    const [userKey, setUsersKey] = useState([]);
    const [claimables, setClaimables] = useState(0);
    const [claimable, setClaimable] = useState(false);
    const [userInfo, setUserInfo] = useState([]);
    const [refLink, setRefLink] = useState('Copy Referral Link');
    const [refBonus, setRefBonus] = useState(0);
    const [dailyProfit, setDailyProfit] = useState(0);
    const [totalActives, setTotalActives] = useState(0);
    const [totalWiths, setTotalWiths] = useState(0);
    const [loading, setLoading] = useState(false);
    const [lastDepositTime, setLastDepositTime] = useState(0);
    const [lastWinner, setLastWinner] = useState('0x0000000000000000000000000000000000000000');

    const { contract, tokenContract, toWei, fromWei } = useContractContext();
    const { address, chainId } = useAuthContext();

    let isMobile = window.matchMedia("only screen and (max-width: 900px)").matches;
    
    const [contractBalance, setContractBalance] = useState(0);
    const [userBalance, setUserBalance] = useState(0);
    const [allowancement, setAllowancement] = useState(0);

    let contractInfos = [
        { label: 'Total Investments', value: totalInvestment, unit: 'USDC' },
        { label: 'Total Value Locked', value: contractBalance, unit: 'USDC' },
        { label: 'Weekly ROI', value: 7, unit: "%" },
        { label: 'Organization', value: main?.users, unit: "Members" },
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

    const [baseDate, setBaseDate] = useState(1687089600);
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

        const curTime = parseInt(Date.now() / 1000);
        if (curTime > baseDate) {
            const l = Math.floor((curTime - baseDate) / (86400 * 7));
            setBaseDate(baseDate + (l+1)*86400*7);
        }
        const interval = setInterval(() => {
            try {

                let seconds = lastDepositTime;
                const data = getCountdown(baseDate)
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
    }, [baseDate])

    const fetchWalletBalance = async () => {
        try {
            const [contractBalance, userBalance, allowance] = await Promise.all([
                tokenContract.methods.balanceOf(config.contractAddress)
                    .call()
                    .catch((err) => {
                        console.log(err);
                        return 0;
                    }),
                tokenContract.methods.balanceOf(address)
                    .call()
                    .catch((err) => {
                        console.log(err);
                        return 0;
                    }),
                tokenContract.methods.allowance(address, config.contractAddress)
                    .call()
                    .catch((err) => {
                        console.log(err);
                        return 0;
                    }),
            ]);

            setContractBalance(fromWei(contractBalance));
            setUserBalance(fromWei(userBalance));
            setAllowancement(fromWei(allowance));
        } catch (err) {
            console.log(err);
        }
    }

    const fetchUserInfo = async () => {
        try {
            const [userKey, userInfo] = await Promise.all([
                contract.methods.UsersKey(address)
                    .call({from: address})
                    .catch((err) => {
                        console.log(err);
                        return 0;
                    }),
                contract.methods.userInfo()
                    .call({from: address})
                    .catch((err) => {
                        console.log(err);
                        return 0;
                    })
            ]);
            setUsersKey(userKey);
            setUserInfo(userInfo);
            setUserTotalDeposited(fromWei(userKey.totalInits));
            setRefBonus(fromWei(userKey.refBonus));
            setClaimables(fromWei(userKey.claimableAmount));
            setClaimable(Date.now() / 1000 > userKey.nextClaim ? true : false);
            setTotalWiths(fromWei(userKey.totalWiths));
            let totalActives = 0;
            userInfo.forEach(item => {
                totalActives += parseFloat(fromWei(item.curAmt));
            });

            console.log("totalActives: ", totalActives);
            setTotalActives(totalActives);
            setDailyProfit(totalActives / 100);
            console.log("UserKey: ", userKey);
            console.log("UserInfo: ", userInfo);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        fetchWalletBalance();
        fetchUserInfo();
    }, [tokenContract, address]);

    useEffect(() => {
        const refData = async () => {
            if (address) {
                const refLink = `${window.origin}/matrices?ref=${address}`;
                setRefLink(refLink);
                console.log(address, " : ", refLink);
            } else {
                setRefLink('Copy Referral Link');
            }
        };

        refData();
    }, [address]);

    // useEffect(() => {
    //     const fetchContractInfo = async () => {
    //         try {
    //             const [main, userInfo] = await Promise.all([
    //                 contract.methods.MainKey(1)
    //                     .call({from: address})
    //                     .catch((err) => {
    //                         console.log(err);
    //                         return 0;
    //                     }),
    //             ]);
    //             setMain(main);
    //             setTotalInvestment(fromWei(main.ovrTotalDeps));
    //         } catch (err) {
    //             console.log(err);
    //         }
    //     }
    //     fetchContractInfo();
    // }, [contract]);

    const handleClickCopy = () => {
        navigator.clipboard.writeText("https://usdc-matrix.netlify.app/?ref=");
        // toast.success('Referral link has been copied!');
        console.log("handleClickCopy>>>>>>>>>>>");
    }

    function useQuery() {
        return new URLSearchParams(useLocation().search);
    }
    const query = useQuery();
    const getRef = () => {
        const ref = Web3.utils.isAddress(query.get("ref"))
            ? query.get("ref")
            : '0x0000000000000000000000000000000000000000'
        return ref;
    };

    const onDeposit = async () => {
        if (amount < 10) {
            Toast.fire({
                icon: 'error',
                title: "Minimum deposit amount is 10USDC."
            });
            return;
        }
        setLoading(true);
        try {
            let ref = getRef();
            console.log("onDeposit: ", ref, address, amount, allowancement);
            if (allowancement >= amount) {
                await contract.methods.Deposit(toWei(amount), ref).send({ from: address});
            } else {
                await tokenContract.methods.approve(config.contractAddress, toWei(amount)).send({from: address});
                Toast.fire({
                    icon: 'success',
                    title: `${amount}USDC was approved successfully!`
                });
            }
            // refreshData();
            fetchWalletBalance();
            // fetchContractBNBBalance();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }
    
    const onReserveClaim = async () => {
        setLoading(true);
        try {
            await contract.methods.reserveClaim().send({from: address});
            fetchWalletBalance();
            fetchUserInfo();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }
    
    const onClaimRewards = async () => {
        setLoading(true);
        try {
            await contract.methods.claimRewards().send({from: address});
            fetchWalletBalance();
            fetchUserInfo();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const onClaimRefBonus = async () => {
        if (refBonus <= 0) {
            Toast.fire({
                icon: 'error',
                title: "There is no referral rewards."
            });
            return;
        }

        setLoading(true);
        try {
            await contract.methods.withdrawRefBonus().send({from: address});
            fetchWalletBalance();
            fetchUserInfo();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }
    
    const stakeRefBonus = async () => {
        if (refBonus <= 0) {
            Toast.fire({
                icon: 'error',
                title: "There is no referral rewards."
            });
            return;
        }
        setLoading(true);
        try {
            await contract.methods.stakeRefBonus().send({from: address});
            fetchWalletBalance();
            fetchUserInfo();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    return (
        <Wrapper>
            {/* <div className='contractInfo'>
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
            </div> */}

            <div className='flex flex-col md:flex-row gap-4'>
                <div className='tradeCard'>
                    <span className='tt text-xl'>Matrix</span>
                    <span className='nn text-sm font-thin py-4'>Deposit USDC to enter the Matrix</span>
                    <div className="flex gap-6">
                        <div className='tt bg-white text-black rounded-lg px-2 py-1 w-full text-center'>
                            <input
                                placeholder="10 USDC"
                                // type='number'
                                value={amount}
                                onChange={(e) => { setAmount(e.target.value) }}
                                className='nn w-full outline-none'
                            />
                        </div>
                        <div className='tt bg-[#3574b9] text-white rounded-lg px-2 py-1 w-full text-center cursor-pointer hover:-translate-y-0.5'
                            onClick={onDeposit}
                        >
                            Deposit
                        </div>
                    </div>
                </div>
                <div className='tradeCard flex flex-row'>
                    <div className='w-1/2'>
                        <div className='tt text-xl pb-4'>Referral</div>
                        <div className="gap-2 items-center">
                            <div className='nn text-sm font-thin pb-1'>Referral Rewards</div>
                            <div>{refBonus} USDC</div>
                        </div>
                    </div>
                    <div className='w-1/2'>
                        <div className='nn text-sm font-thin flex pb-2 items-center cursor-pointer hover:-translate-y-0.5' onClick={() => {copyfunc(refLink)}}>Referral link<FaCopy size="1.7em" className="pl-2" /></div>
                        <div className="gap-2 items-center">
                            <div className='tt bg-[#11b470] text-white rounded-lg px-2 py-0.5 my-3 w-full text-center min-w-[150px] cursor-pointer hover:-translate-y-0.5' onClick={onClaimRefBonus}>Claim</div>
                            <div className='tt bg-[#3574b9] text-white rounded-lg px-2 py-0.5 my-3 w-full text-center min-w-[150px] cursor-pointer hover:-translate-y-0.5' onClick={stakeRefBonus}>Invest</div>
                        </div>
                    </div>
                </div>
            </div>
            <div className='tradeCard overflow-x-scroll md:overflow-x-hidden'>
                <span className='tt text-xl pb-2'>Your Matrices</span>
                <div className="flex justify-between text-center">
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Total Deposited</div>
                        <div>{userTotalDeposited} USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Currently Staked</div>
                        <div>{totalActives} USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Daily Earnings</div>
                        <div>{dailyProfit} USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[150px]'>Total Withdrawn</div>
                        <div>{totalWiths} USDC</div>
                    </div>
                </div>
                <div className="flex justify-between mt-3 items-center text-center">
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[200px]'>Claimable Earnings</div>
                        <div className='text-center'>{claimables} USDC</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        <div className='nn text-sm font-thin min-w-[250px]'>Timer</div>
                        <div className='text-center'>{`${countdown.days}D ${countdown.hours}H ${countdown.minutes < 10 ? '0' + countdown.minutes : countdown.minutes}M ${countdown.seconds < 10 ? '0' + countdown.seconds : countdown.seconds}S`}</div>
                    </div>
                    <div className='tt rounded-lg px-2'>
                        {
                            claimables > 0 ?
                            <div className={`${claimable ? "bg-[#11b470]" : "bg-[#ff3131]"} tt text-white rounded-lg px-2 py-0.5 my-3 w-full text-center min-w-[200px] cursor-pointer hover:-translate-y-0.5`} onClick = {onClaimRewards}>Claim Rewards</div>
                            :
                            <div className={`${claimables > 0 ? "bg-[#11b470]" : "bg-[#ff3131]"} tt text-white rounded-lg px-2 py-0.5 my-3 w-full text-center min-w-[200px] cursor-pointer hover:-translate-y-0.5`} onClick = {onReserveClaim}>Reserve Claim</div>
                        }
                        
                    </div>
                </div>
            </div>
            {
                userInfo.map((item, index) => {
                    const amountInvested = fromWei(item.amt);
                    const activeBalance = fromWei(item.curAmt);
                    const cycles = parseInt(item.cycles) + Math.floor((Date.now() / 1000 - item.depoTime) / (86400 * 7));
                    // const totalProfit = fromWei(item.totalProfit);
                    return (
                        <div className='tradeCard blueCover2 overflow-x-scroll' key={index}>
                            <span className='tt text-xl pb-2'>Matrix {index + 1}</span>
                            <div className="flex justify-between text-center">
                                <div className='tt rounded-lg px-2'>
                                    <div className='nn text-sm font-thin min-w-[150px]'>Amount Invested</div>
                                    <div>{amountInvested} USDC</div>
                                </div>
                                <div className='tt rounded-lg px-2'>
                                    <div className='nn text-sm font-thin min-w-[150px]'>Active Balance</div>
                                    <div>{activeBalance} USDC</div>
                                </div>
                                <div className='tt rounded-lg px-2'>
                                    <div className='nn text-sm font-thin min-w-[150px]'>Daily Earnings</div>
                                    <div>{activeBalance / 100} USDC</div>
                                </div>
                                <div className='tt rounded-lg px-2'>
                                    <div className='nn text-sm font-thin min-w-[150px]'>Total Profit</div>
                                    <div className='text-red-600'>{0} USDC</div>
                                </div>
                                <div className='tt rounded-lg px-2'>
                                    <div className='nn text-sm font-thin min-w-[150px]'>Unstake</div>
                                    <div className={`${cycles > 7 ? "bg-[#11b470]" : "bg-[#ff3131]"}  tt rounded-lg px-2 py-0.5 w-full text-center cursor-pointer hover:-translate-y-0.5`}>{ cycles } Cycles</div>
                                </div>
                            </div>
                        </div>
                    );
                })
            }
        </Wrapper>
    );
}

export default Matrices;
