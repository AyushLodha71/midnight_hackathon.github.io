import React, { useState, useEffect } from 'react';

const PollResults = ({ contract, pollId }) => {
  const [pollInfo, setPollInfo] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPollData();
  }, [pollId]);

  const loadPollData = async () => {
    try {
      const [info, resultData] = await Promise.all([
        contract.methods.getPollInfo(pollId).call(),
        contract.methods.getPollResults(pollId).call()
      ]);
      
      setPollInfo(info);
      setResults(resultData);
    } catch (error) {
      console.error('Error loading poll data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalVotes = () => {
    if (!results) return 0;
    return results.reduce((total, votes) => total + parseInt(votes), 0);
  };

  const getPercentage = (votes) => {
    const total = getTotalVotes();
    return total > 0 ? ((votes / total) * 100).toFixed(1) : 0;
  };

  if (loading) return <div>Loading results...</div>;
  if (!pollInfo) return <div>Poll not found</div>;

  const totalVotes = getTotalVotes();

  return (
    <div className="poll-results">
      <h3>Results: {pollInfo.question}</h3>
      <div className="total-votes">Total Votes: {totalVotes}</div>
      
      <div className="results-list">
        {pollInfo.options.map((option, index) => {
          const votes = parseInt(results[index]);
          const percentage = getPercentage(votes);
          
          return (
            <div key={index} className="result-item">
              <div className="option-info">
                <span className="option-text">{option}</span>
                <span className="vote-count">{votes} votes ({percentage}%)</span>
              </div>
              <div className="vote-bar">
                <div 
                  className="vote-progress" 
                  style={{ width: `${percentage}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PollResults;