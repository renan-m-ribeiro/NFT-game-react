import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import myEpicGame from "../../utils/MyEpicGame.json";

const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);

    useEffect(() => {
        const { ethereum } = window;
      
        if (ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const gameContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            myEpicGame.abi,
            signer
          );
          setGameContract(gameContract);
        } else {
            console.log("Objeto Ethereum não encontrado");
        }
    }, []);
    useEffect(() => {
        const getCharacters = async () => {
          try {
            console.log("Buscando contrato de personagens para mintar");
      
            const charactersTxn = await gameContract.getAllDefaultCharacters();
            console.log("charactersTxn:", charactersTxn);
      
            const characters = charactersTxn.map((characterData) =>
              transformCharacterData(characterData)
            );
    
            setCharacters(characters);
          } catch (error) {
            console.error("Algo deu errado ao buscar personagens:", error);
          }
        };

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            alert(
                `Seu NFT está pronto -- veja aqui: https://testnets.opensea.io/assets/${gameContract}/${tokenId.toNumber()}`
              );
            console.log(
              `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );
            if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log("CharacterNFT: ", characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));
            }
        };
          
        if (gameContract) {
            getCharacters();
            gameContract.on("CharacterNFTMinted", onCharacterMint);
        }
        
        return () => {
            if (gameContract) {
              gameContract.off("CharacterNFTMinted", onCharacterMint);
            }
          };
        }, [gameContract]);

    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className="character-item" key={character.name}>
                <div className="name-container">
                    <p>{character.name}</p>
                </div>
                <img src={character.imageURI} alt={character.name} />
                <button
                type="button"
                className="character-mint-button"
                onClick={mintCharacterNFTAction(index)} 
                >{`Mintar ${character.name}`}</button>
            </div>
        ));

    const mintCharacterNFTAction = (characterId) => async () => {
        try {
          if (gameContract) {
            console.log("Mintando personagem...");
            const mintTxn = await gameContract.mintCharacterNFT(characterId);
            await mintTxn.wait();
            console.log("mintTxn:", mintTxn);
          }
        } catch (error) {
          console.warn("MintCharacterAction Error:", error);
          }
    };

    return (
        <div className="select-character-container">
            <h2>Minte seu Herói. Escolha com sabedoria.</h2>
            {characters.length > 0 && (
                <div className="character-grid">{renderCharacters()}</div>
            )}
        </div>
    );
};



export default SelectCharacter;
