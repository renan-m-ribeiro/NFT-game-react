import React, { useEffect, useState } from "react"
import twitterLogo from "./assets/twitter-logo.svg"
import SelectCharacter from "./Components/SelectCharacter";
import Arena from "./Components/Arena";
import myEpicGame from "./utils/MyEpicGame.json";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import "./App.css"
import { ethers } from "ethers";

// Constants
const TWITTER_HANDLE = "web3dev_"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const App = () => {

  const [currentAccount, setCurrentAccount] = useState(null)
  const [characterNFT, setCharacterNFT] = useState(null)

  const checkIfWalletIsConnected = async () => {
    try{
      const { ethereum } = window;
      if (!ethereum) {
        console.log("Eu acho que você não tem a metamask!");
        return;
      } else {
        console.log("Nós temos o objeto ethereum", ethereum);
      }
      const accounts = await ethereum.request({ method: "eth_accounts" });
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Carteira conectada::", account);
        setCurrentAccount(account);
      } else {
        console.log("Não encontramos uma carteira conectada");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderContent = () => {
    if(!currentAccount) {
      return (
        <div className="connect-wallet-container">
            <img
              src="https://media.giphy.com/media/PJvvewo5mTtXW/giphy.gif"
              alt="Samurai Gif"
            />
            <button
              className="cta-button connect-wallet-button"
              onClick={connectWalletAction}
            >
              Conecte sua carteira para começar
            </button>
          </div>
      );
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    } else if (currentAccount && characterNFT) {
      return <Arena characterNFT={characterNFT} setCharacterNFT={setCharacterNFT} />;
    };
  };
  
  const checkNetwork = async () => {
    try {
      if (window.ethereum.networkVersion !== "5") {
        alert("Please connect to Goerli!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;
      if (!ethereum) {
        alert("Instale o Metamask!");
        return;
      }
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Conectado", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
    checkNetwork();
  };
  
  useEffect(() =>{
    checkIfWalletIsConnected();
  },[]);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Verificando pelo personagem NFT no endereço:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        myEpicGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      if(txn.name) {
        console.log("Usuario possui um personagem NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("Nenhum personagem NFT encontrado");
      }
    };

    if(currentAccount) {
      console.log("Conta Atual: ", currentAccount);
      fetchNFTMetadata();
    }
  },[currentAccount]);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">⚔️ Batalhas no Metaverso ⚔️</p>
          <p className="sub-text">Junte-se a mim para vencer os inimigos do Metaverso!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`construído por @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
