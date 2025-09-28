// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract SecurePoll {
    struct Poll {
        uint256 id;
        string question;
        string[] options;
        mapping(uint256 => uint256) votes; // optionIndex -> vote count
        mapping(address => bool) hasVoted;
        address creator;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
    }
    
    uint256 public pollId;
    uint256 public pollCount;
    mapping(uint256 => Poll) public polls;
    
    event PollCreated(uint256 pollId, string question, address creator);
    event VoteCast(uint256 pollId, address voter, uint256 option);
    event PollEnded(uint256 pollId);
    
    modifier onlyPollCreator(uint256 _pollId) {
        require(polls[_pollId].creator == msg.sender, "Only poll creator can perform this action");
        _;
    }
    
    modifier pollExists(uint256 _pollId) {
        require(_pollId < pollCount && _pollId >= 0, "Poll does not exist");
        _;
    }
    
    function createPoll(
        string memory _question, 
        string[] memory _options, 
        uint256 _duration
    ) external returns (uint256) {
        require(bytes(_question).length > 0, "Question cannot be empty");
        require(_options.length >= 2, "At least 2 options required");
        require(_duration > 0, "Duration must be positive");
        
        pollId = pollCount++;
        Poll storage newPoll = polls[pollId];
        
        newPoll.id = pollId;
        newPoll.question = _question;
        newPoll.creator = msg.sender;
        newPoll.startTime = block.timestamp;
        newPoll.endTime = block.timestamp + _duration;
        newPoll.isActive = true;
        
        for (uint256 i = 0; i < _options.length; i++) {
            newPoll.options.push(_options[i]);
        }
        
        emit PollCreated(pollId, _question, msg.sender);    
        return pollId;
    }

    function viewID() public view returns(uint){
        return(pollId);
    }
    
    function vote(uint256 _pollId, uint256 _optionIndex) external pollExists(_pollId) {
        Poll storage poll = polls[_pollId];
        
        require(poll.isActive, "Poll is not active");
        require(block.timestamp >= poll.startTime, "Poll has not started yet");
        require(block.timestamp <= poll.endTime, "Poll has ended");
        require(!poll.hasVoted[msg.sender], "Already voted");
        require(_optionIndex < poll.options.length, "Invalid option");
        
        poll.votes[_optionIndex]++;
        poll.hasVoted[msg.sender] = true;
        
        emit VoteCast(_pollId, msg.sender, _optionIndex);
    }
    
    function getPollResults(uint256 _pollId) external view pollExists(_pollId) returns (uint256[] memory) {
        Poll storage poll = polls[_pollId];
        uint256[] memory results = new uint256[](poll.options.length);
        
        for (uint256 i = 0; i < poll.options.length; i++) {
            results[i] = poll.votes[i];
        }
        
        return results;
    }
    
    function endPoll(uint256 _pollId) external onlyPollCreator(_pollId) pollExists(_pollId) {
        Poll storage poll = polls[_pollId];
        require(poll.isActive, "Poll already ended");
        
        poll.isActive = false;
        emit PollEnded(_pollId);
    }
    
    function getPollInfo(uint256 _pollId) external view pollExists(_pollId) returns (
        string memory question,
        string[] memory options,
        address creator,
        uint256 startTime,
        uint256 endTime,
        bool isActive
    ) {
        Poll storage poll = polls[_pollId];
        return (
            poll.question,
            poll.options,
            poll.creator,
            poll.startTime,
            poll.endTime,
            poll.isActive
        );
    }

    function hasVoted(uint256 _pollId, address _voter) external view pollExists(_pollId) returns (bool) {
        return polls[_pollId].hasVoted[_voter];
    }    

}