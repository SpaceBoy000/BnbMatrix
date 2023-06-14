import { styled } from "@mui/system";
import { Typography } from "@mui/material";
import Slider from '@mui/material/Slider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { MuiThemeProvider } from 'material-ui';
import LinearProgress from "@mui/material/LinearProgress";
import { useLocation } from "react-router-dom";
import Divider from "@mui/material/Divider";
import { Toast } from "../utils";
import { useEffect, useState } from "react";
import Matrix from "../components/Matrix";
import Web3 from "web3";
// import { ToastContainer } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// import { useWallet } from "@solana/wallet-adapter-react";
// import { deposit, compound, toUiSolAmount, unstake } from "../contracts/instructions";
import { useContractContext } from "../providers/ContractProvider";
import { useAuthContext } from "../providers/AuthProvider";
// import * as Constants from '../contracts/constants';
// import { showToast } from "../contracts/utils";
import MiningTimer from "./components/MiningTimer.js";
import { extractEventHandlers } from "@mui/base";
import { NoBackpackSharp } from "@mui/icons-material";
import telegramIcon from "../assets/telegram.png";

const muiTheme = getMuiTheme({
    Slider: {
        trackColor: "yellow",
        selectionColor: "green"
    }
});

const Wrapper = styled("div")(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '2rem',
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
    const [memberCount, setMemberCount] = useState(0);
    const [walletBalance, setWalletBalance] = useState(0);
    const [userMatrixList, setUserMatrixList] = useState([]);
    const [actionStep, setActionStep] = useState(0);
    const [refCount, setRefCount] = useState(0);
    const [refBonus, setRefBonus] = useState(0);
    const [refLink, setRefLink] = useState('Copy Referral Link');
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);

    const [sliderValue, setSliderValue] = useState('50');
    const calculate = (v) => {
        setSliderValue(v);
    }

    let contractInfos = [
        { label: 'Total Investments', value: 0, unit: 'USDC' },
        { label: 'Total Value Locked', value: 0, unit: 'USDC' },
        { label: 'Weekly ROI', value: 0, unit: "%" },
        { label: 'Organization', value: 0, unit: "Members" },
    ]

    let profitData = [
        {totalProfit: 15, weeklyProfit: 5, roi: 12},
        {totalProfit: 10, weeklyProfit: 4, roi: 10},
        {totalProfit: 6, weeklyProfit: 3, roi: 7.5},
        {totalProfit: 3, weeklyProfit: 2, roi: 5},
        {totalProfit: 1, weeklyProfit: 1, roi: 3},
    ]
    
    let weeklyDepositsInfo = [
        {amount: 15, address: '0xbE32d169b07411595391B8A1E56636ac31164486'},
        {amount: 10, address: '0xbE32d169b07411595391B8A1E56636ac31164486'},
        {amount: 6, address: '0xbE32d169b07411595391B8A1E56636ac31164486'},
        {amount: 3, address: '0xbE32d169b07411595391B8A1E56636ac31164486'},
        {amount: 1, address: '0xbE32d169b07411595391B8A1E56636ac31164486'},
    ]

    let isMobile = window.matchMedia("only screen and (max-width: 900px)").matches;

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
            setUserMatrixList([]);
            setMemberCount(0);
            setActionStep(0);
            setRefBonus(0);
            setRefCount(0);
            // setCompoundTimes(0);
            // setInitialDeposit(0);
            // setTotalDeposit(0);
            // setTotalClaimed(0);
            // setTotalReferralRewards(0);
            // setEstimatedMinerRate(0);
            return;
        }

        try {
            const [walletBalance, userMatrixList, memberCount, actionStep, userInfo/*mainKey, usersKey, currentRewards*/] = await Promise.all([
                getBnbBalance(address),
                // contract.methods.MainKey(1)
                //   .call()
                //   .catch((err) => {
                //     console.error("userInfo error", err);
                //     return 0;
                //   }),
                contract.methods.userInfo(address)
                    .call()
                    .catch((err) => {
                        console.error('user info error: ', err);
                        return;
                    }),
                contract.methods.MEMBER_COUNT()
                    .call()
                    .catch((err) => {
                        console.error('user info error: ', err);
                        return;
                    }),
                contract.methods.ACTION_STEP()
                    .call()
                    .catch((err) => {
                        console.error('user info error: ', err);
                        return;
                    }),
                contract.methods.users(address)
                    .call()
                    .catch((err) => {
                        console.error('user info error: ', err);
                        return;
                    }),
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
            setUserMatrixList(userMatrixList);
            setMemberCount(memberCount);
            setActionStep(actionStep);
            setRefBonus(fromWei(userInfo.refBonus));
            setRefCount(userInfo.referralsCount);

            // setUserCount(mainKey.users);
            // setTotalDeposit(fromWei(mainKey.ovrTotalDeps));
            // console.log('usersKey=> ', usersKey);

            // setInitialDeposit(fromWei(usersKey.totalInits.toString()));
            // setRefBonus(fromWei(usersKey.refBonus.toString()));
            // setTotalClaimed(fromWei(usersKey.totalAccrued.toString()));
            // setTotalReferralRewards(fromWei(usersKey.totalWithRefBonus.toString()));
            // setCurrentRewards(fromWei(currentRewards.toString()));
        } catch (err) {
            console.error(err);
            setWalletBalance(0);
            setMemberCount(0);
            setUserMatrixList([]);
            setActionStep(0);
            setRefBonus(0);
            setRefCount(0);
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

    }, [web3, chainId, address]);

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


    useEffect(() => {
        const refData = async () => {
            if (address) {
                const refLink = `${window.origin}/miner?ref=${address}`;
                setRefLink(refLink);
                console.log(address, " : ", refLink);
            } else {
                setRefLink('Copy Referral Link');
            }
        };

        refData();
    }, [address]);

    const onInvest = async () => {
        setLoading(true);
        try {
            let ref = getRef();
            await contract.methods.Invest(ref).send({ from: address, value: toWei(amount) });
            refreshData();
            // fetchWalletBalance();
            // fetchContractBNBBalance();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const refreshData = () => {
        fetchWalletBalance();
        fetchContractBNBBalance();
        return true;
    }

    const onCompound = async (matrixId) => {
        if (!isStarted()) return;
        setLoading(true);

        try {
            console.log("matrix info: ", userMatrixList[matrixId].cmps);
            if (userMatrixList[matrixId].cmps == 65) {
                Toast.fire({
                    icon: 'error',
                    title: 'You could not compound, anymore!'
                });
                setLoading(false);
                return;
            }
            await contract.methods.Compound(matrixId).send({ from: address });
            refreshData();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
    }

    const onClaim = async (matrixId) => {
        if (!isStarted()) return;
        setLoading(true);
        try {
            await contract.methods.Claim(matrixId).send({ from: address });
            refreshData();
        } catch (err) {
            console.error(err);
        }
        setLoading(false);
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
                {/* <MiningTimer/> */}
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
                <div style={{ flex: '1' }} />

                <div className='flex flex-col md:flex-row gap-4'>
                    <div className='tradeCard'>
                        <span className='tt text-xl pb-2'>Trading Revenue</span>
                        <span className='nn text-sm'>Trading Bots</span>
                        <div className="flex gap-6">
                            <div className='tt'>+1234 USDC</div>
                            <div className='tt !text-[#11af6d]'>10.00%</div>
                        </div>
                        <span className='nn text-sm'>Trading Bots</span>
                        <div className="flex gap-6">
                            <div className='tt'>-1234 USDC</div>
                            <div className='tt !text-[#ff3131]'>10.00%</div>
                        </div>
                    </div>
                    <div className='tradeCard'>
                        <div className='tt text-xl pb-2'>Track Our Trades</div>
                        <div className="flex gap-2 items-center">
                            <div>Our trading strategies allow USDC Matrix to generate external revenure. Join the Telegram Channel</div>
                            <a href="https://t.me/" target="_blank" alt="telegram link" className="w-[150px] hover:-translate-y-0.5"><img src={telegramIcon} width="64px" height="64px" alt="telegramIcon"/></a>
                        </div>
                    </div>
                </div>
                
                <div className='flex flex-col md:flex-row gap-4 my-2'>
                    <div className='tradeCard gap-2'>
                        <span className='tt text-xl pb-2'>Calculator</span>
                        <div className="flex gap-4">
                            <div className="gap-6 w-full">
                                <div className='nn text-sm pb-2'>Staked Amount</div>
                                <div className='tt bg-white text-black rounded-lg px-2 py-1'>0.00 USDC</div>
                            </div>
                            
                            <div className="gap-6 w-full">
                                <div className='nn text-sm pb-2'>Weekly %</div>
                                <div className='tt bg-white text-black rounded-lg px-2 py-1'>7.00 %</div>
                            </div>
                        </div>
                        <div className="text-center items-center self-center w-2/3">
                            <div className='nn text-sm pt-3'>Period 4 weeks</div>
                            <div className="text-center">
                                <MuiThemeProvider muiTheme={muiTheme}>
                                <Slider
                                    defaultValue={50}
                                    aria-label="Default"
                                    valueLabelDisplay="auto"
                                    className="m-w-[200px] !text-[#4e6cf2]"
                                    onChange={(_, v) => calculate(v)} />
                                </MuiThemeProvider>
                            </div>
                        </div>
                        <div className="flex flex-row gap-4 py-2 justify-center">
                            <div className="gap-6">
                                <div className='nn text-sm'>Total Profit</div>
                                <div className='tt'>12,345 USDC</div>
                            </div>
                            
                            <div className="gap-6">
                                <div className='nn text-sm'>Weekly Profit</div>
                                <div className='tt'>7 %</div>
                            </div>
                        </div>
                    </div>
                    <div className='tradeCard blueCover2 text-center'>
                        <div className='tt text-xl pb-3 text-left'>Profits Distributed</div>
                        <div className="flex items-center justify-left pb-2">
                            <div className="nn text-sm min-w-[35%]">Total Profits</div>
                            <div className="nn text-sm min-w-[35%]">Weekly Profits</div>
                            <div className="nn text-sm min-w-[30%]">ROI</div>
                        </div>
                        {profitData.map((item, index) => {
                            return (
                                <div className="flex items-center justify-left pb-1" key={index}>
                                    <div className="min-w-[37%]">{item.totalProfit} USDC</div>
                                    <div className="min-w-[35%]">{item.weeklyProfit} USDC</div>
                                    <div className="min-w-[30%]">{item.roi} %</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className='tradeCard blueCover2'>
                    <div className='tt text-xl pb-2'>Weekly Deposits</div>
                    <div className="flex gap-2 items-center justify-left">
                        <div className="nn text-sm min-w-[20%]">Amount</div>
                        <div className="nn text-sm min-w-[40%]">Address</div>
                    </div>
                    {weeklyDepositsInfo.map((item, index) => {
                        return (
                            <div className="flex gap-2 items-center justify-left py-1" key={index}>
                                <div className="min-w-[20%]">{item.amount} USDC</div>
                                <div className="min-w-[40%] break-words">{item.address}</div>
                            </div>
                        );
                    })}
                </div>

                {/*<div>
                        {loading && <LinearProgress color="secondary"/>}
                </div>*/}

                <div className="investCard !hidden">
                    {
                        userMatrixList.map((matrix, i) => (
                            <>
                                <Matrix data={matrix} index={i} actionStep={actionStep} onCompound={onCompound} onClaim={onClaim} />
                                {i == 0 ?
                                    <Divider style={{ height: isMobile ? '2px' : '180px', width: isMobile ? '93%' : '2px', background: '#ECB71A', margin: '10px', alignSelf: 'center' }} />
                                    : <></>
                                }
                            </>
                        )
                        )
                    }
                    {userMatrixList.length < 2 ?
                        <div style={{ minWidth: isMobile ? '100px' : "40%" }}>
                            <div className="invest_title tt">New Matrix</div>
                            <Typography variant='body2'>Invest to enter the Matrix</Typography>
                            <div style={{ margin: '20px 0px 40px 0px', display: 'flex' }}>
                                <input
                                    placeholder="1 BNB"
                                    // type='number'
                                    value={amount}
                                    onChange={(e) => { setAmount(e.target.value) }}
                                    className='nn'
                                    style={{ width: '120px', marginRight: '20px', padding: '5px 10px', border: 'none' }}
                                />
                                <button className="myButton_invest" style={{ background: '#40454E' }} onClick={onInvest}>Invest</button>
                            </div>
                        </div> : <></>}
                </div>
                <div style={{ flex: '1' }} />
                <div className="refInfo !hidden">
                    <div className="ref_first">
                        <h3 className="tt" style={{ color: 'white' }}>Referral</h3>
                        <button className="refBtn1" style={{ border: 'none', fontFamily: 'lightPolice', fontSize: '20px', background: 'black', color: 'white', width: '70%', marginTop: '30px', padding: '5px' }} onClick={() => { copyfunc(refLink) }}>Click to Copy</button>
                    </div>
                    <Divider style={{ display: isMobile ? 'none' : 'block', height: '100px', width: '2px', background: '#ECB71A', margin: '10px', alignSelf: 'center' }} />
                    <div className="ref_second tt">
                        <div className="ref_item">
                            <span>Referral Bonus</span>
                            <span className="nn">10%</span>
                        </div>
                        <div className="ref_item">
                            <span>Members Referred</span>
                            <span className="nn">{refCount} Members</span>
                        </div>
                        <div className="ref_item">
                            <span>Referral Rewards</span>
                            <span className="nn">{refBonus} BNB</span>
                        </div>
                        <button className="refBtn2" style={{ border: 'none', fontFamily: 'lightPolice', background: 'black', color: 'white', width: '100%', padding: '5px' }} onClick={() => { copyfunc(refLink) }}>Click to Copy</button>
                    </div>
                </div>
            </Wrapper>
        </>
    );
}
