import "./style.css"

const NFT = () => {
    let element = document.getElementById('description');
    element.content = 'Enter The Matrix...';
    console.log("NFT.description: ", element.content);

    return (
        <>
            <noscript>hahaha: This is NFT</noscript>
            <div style={{textAlign:"center", fontSize:"60px", color:"white", marginTop:'25%'}}>
                COMING SOON ...
            </div>
        </>
    );
}

export default NFT;
