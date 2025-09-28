import React, { useState, useEffect } from 'react';
import { connectWallet, getContract, getCurrentAccount } from './utils/web3';
import SecurePollABI from './contracts/SecurePollABI.json';
import ConnectionStatus from './components/ConnectionStatus';
import PollCreator from './components/PollCreator';
import PollVoter from './components/PollVoter';
import PollResults from './components/PollResults';
import './App.css';

//const CONTRACT_ADDRESS = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B"; // Replace with your deployed contract address

//0xd9145CCE52D386f254917e481eB44e9943F39138
const CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138";


function App() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [pollCount, setPollCount] = useState(0);
  const [activeTab, setActiveTab] = useState('create');
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [polls, setPolls] = useState([]);

  useEffect(() => {
    initializeApp();
  }, []);

  useEffect(() => {
    if (contract) {
      loadPollCount();
    }
  }, [contract]);

  const initializeApp = async () => {
    try {
      const currentAccount = await getCurrentAccount();
      if (currentAccount) {
        setAccount(currentAccount);
        initializeContract();
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    }
  };

  const initializeContract = () => {
    const pollContract = getContract(CONTRACT_ADDRESS, SecurePollABI);
    setContract(pollContract);
  };

  const handleConnectWallet = async () => {
    const account = await connectWallet();
    setAccount(account);
    initializeContract();
  };

  const loadPollCount = async () => {
    try {
      const count = await contract.methods.pollCount().call();
      setPollCount(parseInt(count));
      loadPolls(parseInt(count));
    } catch (error) {
      console.error('Error loading poll count:', error);
    }
  };

  const loadPolls = async (count) => {
    const pollPromises = [];
    for (let i = 0; i < count; i++) {
      pollPromises.push(contract.methods.getPollInfo(i).call());
    }
    
    try {
      const pollData = await Promise.all(pollPromises);
      setPolls(pollData.map((data, index) => ({ ...data, id: index })));
    } catch (error) {
      console.error('Error loading polls:', error);
    }
  };

  const handlePollCreated = () => {
    loadPollCount();
    setActiveTab('vote');
  };

  const handleVote = () => {
    loadPollCount();
  };

// 🔽 ADD THIS SINGLE FUNCTION RIGHT HERE 🔽
// Check if contract is properly connected
const checkContractConnection = async () => {
  if (!contract) {
    console.log('❌ Contract not loaded');
    return false;
  }
  
  try {
    // Test by calling a simple view function
    const pollCount = await contract.methods.pollCount().call();
    console.log('✅ Contract connected! Poll count:', pollCount);
    return true;
  } catch (error) {
    console.error('❌ Contract connection failed:', error);
    return false;
  }
};

// Call this check when contract loads
useEffect(() => {
  if (contract) {
    checkContractConnection();
  }
}, [contract]);
// 🔼 END OF ADDED CODE 🔼

  return (
    <div className="App">
      <header className="app-header">
        <h1>Secure Poll DApp</h1>
        <ConnectionStatus account={account} onConnect={handleConnectWallet} />
      </header>

      <main className="app-main">
        {!account ? (
          <div className="connect-prompt">
            <h2>Welcome to Secure Poll</h2>
            <p>Please connect your MetaMask wallet to start creating and voting on polls.</p>
          </div>
        ) : !contract ? (
          <div>Loading contract...</div>
        ) : (
          <>
            <nav className="app-nav">
              <button 
                className={activeTab === 'create' ? 'active' : ''}
                onClick={() => setActiveTab('create')}
              >
                Create Poll
              </button>
              <button 
                className={activeTab === 'vote' ? 'active' : ''}
                onClick={() => setActiveTab('vote')}
              >
                Vote ({pollCount})
              </button>
              <button 
                className={activeTab === 'results' ? 'active' : ''}
                onClick={() => setActiveTab('results')}
              >
                View Results
              </button>
            </nav>

            <div className="tab-content">
              {activeTab === 'create' && (
                <PollCreator 
                  contract={contract} 
                  account={account} 
                  onPollCreated={handlePollCreated}
                />
              )}

              {activeTab === 'vote' && (
                <div className="vote-tab">
                  <h2>Available Polls</h2>
                  <div className="polls-list">
                    {polls.map((poll) => (
                      <div key={poll.id} className="poll-item">
                        <PollVoter 
                          contract={contract}
                          account={account}
                          pollId={poll.id}
                          pollInfo={poll}
                          onVote={handleVote}
                        />
                      </div>
                    ))}
                    {polls.length === 0 && <p>No polls available</p>}
                  </div>
                </div>
              )}

              {activeTab === 'results' && (
                <div className="results-tab">
                  <h2>Poll Results</h2>
                  <div className="polls-list">
                    {polls.map((poll) => (
                      <div key={poll.id} className="poll-item">
                        <PollResults 
                          contract={contract}
                          pollId={poll.id}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;