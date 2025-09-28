import Web3 from 'web3';

let web3;

//Check if MetaMask is installed
if (window.ethereum && window.ethereum.isMetaMask) {
  // Use MetaMask if available
  web3 = new Web3(window.ethereum);
  console.log('Connected to' + web3.contractAddress);
} else {
  // Fallback to Remix VM (localhost:8545)
  web3 = new Web3('http://localhost:8545');
  console.log('Connected to Remix VM on port 8545');
}


export const connectWallet = async () => {
  try {
    if (window.ethereum) {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const accounts = await web3.eth.getAccounts();
      return accounts[0];
    } else {
      throw new Error('MetaMask not installed');
    }
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

export const getCurrentAccount = async () => {
  const accounts = await web3.eth.getAccounts();
  return accounts[0] || null;
};

export const getContract = (contractAddress, abi) => {
  return new web3.eth.Contract(abi, contractAddress);
};

export default web3;