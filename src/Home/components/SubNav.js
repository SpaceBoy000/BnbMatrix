import { useEffect, useState } from 'react';
import { useContractContext } from '../../providers/ContractProvider';

export default function SubNav() {

    const { contract, fromWei } = useContractContext();

    const [totalInvestment, setTotalInvestment] = useState(0);
    const [contractBalance, setContractBalance] = useState(0);
    const [main, setMain] = useState([]);

    let contractInfos = [
        { label: 'Total Investments', value: totalInvestment, unit: 'USDC' },
        { label: 'Total Value Locked', value: contractBalance, unit: 'USDC' },
        { label: 'Weekly ROI', value: 7, unit: "%" },
        { label: 'Organization', value: main?.users == undefined ? 0 : main?.users, unit: "Members" },
    ]

    useEffect(() => {
        const fetchContractInfo = async () => {
            if (!contract) return;
            console.log("NavBar: ", contract);
            try {
                const [main, contractBalance] = await Promise.all([
                    contract.methods.MainKey(1)
                        .call()
                        .catch((err) => {
                            console.log(err);
                            return 0;
                        }),
                    contract.methods.getContractBalance()
                        .call()
                        .catch((err) => {
                            console.log(err);
                            return 0;
                        }),
                ]);
                console.log("contractBalance: ", contractBalance);
                console.log("main.ovrTotalDeps: ", main);
                setMain(main);
                setContractBalance(fromWei(String(contractBalance)));
                setTotalInvestment(fromWei(String(main.ovrTotalDeps)));
            } catch (err) {
                console.log(err);
            }
        }
        fetchContractInfo();
    }, [contract]);

    return (
        <div className="text-white">
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
        </div>
    );
}