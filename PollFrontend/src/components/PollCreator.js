import React, { useState } from 'react';

const PollCreator = ({ contract, account, onPollCreated }) => {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [duration, setDuration] = useState(3600); // 1 hour in seconds
  const [isCreating, setIsCreating] = useState(false);

  const addOption = () => {
    setOptions([...options, '']);
  };

  const removeOption = (index) => {
    if (options.length > 2) {
      const newOptions = options.filter((_, i) => i !== index);
      setOptions(newOptions);
    }
  };

  const updateOption = (index, value) => {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  };

  const createPoll = async () => {
    if (!question.trim()) {
      alert('Please enter a question');
      return;
    }

    const validOptions = options.filter(opt => opt.trim() !== '');
    if (validOptions.length < 2) {
      alert('Please enter at least 2 options');
      return;
    }

    setIsCreating(true);
    try {
      const result = await contract.methods.createPoll(question, validOptions, duration).send({ from: account });
      
      // Reset form
      setQuestion('');
      setOptions(['', '']);
      setDuration(3600);
      
      alert('Poll created successfully!');
      if (onPollCreated) {
        onPollCreated();
      }
    } catch (error) {
      console.error('Error creating poll:', error);
      alert('Error creating poll: ' + error.message);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="poll-creator">
      <h2>Create New Poll</h2>
      <div className="form-group">
        <label>Question:</label>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Enter your poll question"
        />
      </div>

      <div className="form-group">
        <label>Options:</label>
        {options.map((option, index) => (
          <div key={index} className="option-input">
            <input
              type="text"
              value={option}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={`Option ${index + 1}`}
            />
            {options.length > 2 && (
              <button type="button" onClick={() => removeOption(index)} className="remove-option">
                Remove
              </button>
            )}
          </div>
        ))}
        <button type="button" onClick={addOption} className="add-option">
          Add Option
        </button>
      </div>

      <div className="form-group">
        <label>Duration (seconds):</label>
        <input
          type="number"
          value={duration}
          onChange={(e) => setDuration(parseInt(e.target.value) || 3600)}
          min="60"
        />
        <small>Current duration: {Math.floor(duration / 3600)}h {Math.floor((duration % 3600) / 60)}m</small>
      </div>

      <button 
        onClick={createPoll} 
        disabled={isCreating}
        className="create-poll-button"
      >
        {isCreating ? 'Creating...' : 'Create Poll'}
      </button>
    </div>
  );
};

export default PollCreator;