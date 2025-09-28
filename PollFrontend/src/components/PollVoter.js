import React, { useState, useEffect } from 'react';

const PollVoter = ({ contract, account, pollId, pollInfo, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [isVoting, setIsVoting] = useState(false);
  const [results, setResults] = useState(null);

  useEffect(() => {
    checkIfVoted();
    loadResults();
  }, [pollId, account]);

  const checkIfVoted = async () => {
    try {
      // Note: This requires adding a hasVoted function to your contract
      // You'll need to modify the contract to include this view function
      const voted = await contract.methods.hasVoted(pollId, account).call();
      setHasVoted(voted);
    } catch (error) {
      console.error('Error checking vote status:', error);
    }
  };

  const loadResults = async () => {
    try {
      const pollResults = await contract.methods.getPollResults(pollId).call();
      setResults(pollResults);
    } catch (error) {
      console.error('Error loading results:', error);
    }
  };

  const handleVote = async () => {
    if (selectedOption === null) {
      alert('Please select an option');
      return;
    }

    setIsVoting(true);
    try {
      await contract.methods.vote(pollId, selectedOption).send({ from: account });
      setHasVoted(true);
      await loadResults();
      if (onVote) {
        onVote();
      }
      alert('Vote cast successfully!');
    } catch (error) {
      console.error('Error voting:', error);
      alert('Error voting: ' + error.message);
    } finally {
      setIsVoting(false);
    }
  };

  const isPollActive = () => {
    if (!pollInfo) return false;
    const now = Math.floor(Date.now() / 1000);
    return pollInfo.isActive && now < parseInt(pollInfo.endTime);
  };

  if (!pollInfo) return <div>Loading poll information...</div>;

  return (
    <div className="poll-voter">
      <h3>{pollInfo.question}</h3>
      <div className="poll-meta">
        <span>Creator: {pollInfo.creator.substring(0, 10)}...</span>
        <span>Ends: {new Date(parseInt(pollInfo.endTime) * 1000).toLocaleString()}</span>
        <span>Status: {isPollActive() ? 'Active' : 'Ended'}</span>
      </div>

      {!isPollActive() && <div className="poll-ended">This poll has ended</div>}

      {hasVoted ? (
        <div className="already-voted">
          <p>You have already voted in this poll.</p>
          {results && (
            <div className="results">
              <h4>Current Results:</h4>
              {pollInfo.options.map((option, index) => (
                <div key={index} className="result-item">
                  <span>{option}:</span>
                  <span>{results[index]} votes</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : isPollActive() ? (
        <div className="voting-interface">
          <h4>Select your vote:</h4>
          {pollInfo.options.map((option, index) => (
            <div key={index} className="option">
              <label>
                <input
                  type="radio"
                  name="pollOption"
                  value={index}
                  checked={selectedOption === index}
                  onChange={() => setSelectedOption(index)}
                />
                {option}
              </label>
            </div>
          ))}
          <button 
            onClick={handleVote} 
            disabled={isVoting || selectedOption === null}
            className="vote-button"
          >
            {isVoting ? 'Voting...' : 'Cast Vote'}
          </button>
        </div>
      ) : (
        <div className="poll-ended-message">
          This poll has ended. Voting is no longer allowed.
        </div>
      )}
    </div>
  );
};

export default PollVoter;