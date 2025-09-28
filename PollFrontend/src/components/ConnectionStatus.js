import React from 'react';
import { getCurrentAccount } from '../utils/web3';

const ConnectionStatus = ({ account, onConnect }) => {
  const handleConnect = async () => {
    try {
      await onConnect();
    } catch (error) {
      alert('Error connecting to MetaMask: ' + error.message);
    }
  };

  const truncateAddress = (addr) => {
    return addr ? `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}` : '';
  };

  return (
    <div className="connection-status">
      {account ? (
        <div className="connected">
          <span className="status-indicator connected"></span>
          Connected: {truncateAddress(account)}
        </div>
      ) : (
        <button onClick={handleConnect} className="connect-button">
          Connect MetaMask
        </button>
      )}
    </div>
  );
};

export default ConnectionStatus;