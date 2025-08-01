// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/// @title JobMarketplace
/// @notice A simple escrow based marketplace where clients can post jobs paid in ERC20 tokens
/// @dev This contract is a minimal MVP and has not been audited.  Use at your own risk.
contract JobMarketplace is Ownable {
    struct Job {
        address client;
        address worker;
        address token;
        string title;
        string description;
        uint256 price;
        uint256 deadline;
        bool accepted;
        bool completed;
        bool confirmed;
        bool autoReleased;
    }

    /// @notice Counter for job IDs
    uint256 public jobCount;

    /// @notice Mapping from job ID to job details
    mapping(uint256 => Job) public jobs;

    /// @notice Fee percentage (e.g. 2 for 2%).  Must be <=3.
    uint256 public feePercent;

    /// @notice Address that receives collected fees
    address public feeWallet;

    /// @notice Emitted when a new job is posted
    event JobPosted(uint256 indexed jobId, address indexed client, string title, uint256 price, uint256 deadline);
    /// @notice Emitted when a worker accepts a job
    event JobAccepted(uint256 indexed jobId, address indexed worker);
    /// @notice Emitted when work is submitted
    event JobCompleted(uint256 indexed jobId, address indexed worker);
    /// @notice Emitted when the client confirms completion and releases payment
    event JobConfirmed(uint256 indexed jobId);
    /// @notice Emitted when payment is auto released after the deadline
    event AutoReleased(uint256 indexed jobId);

    /// @param _feePercent The fee percentage charged on each job (max 3%).
    /// @param _feeWallet The wallet where fees are sent.
    constructor(uint256 _feePercent, address _feeWallet) {
        require(_feePercent <= 3, "Fee too high");
        require(_feeWallet != address(0), "Invalid fee wallet");
        feePercent = _feePercent;
        feeWallet = _feeWallet;
    }

    /// @notice Post a new job.  The caller must approve this contract to spend `price` tokens prior to calling.
    /// @param title Title of the job
    /// @param description Description of the work
    /// @param price Amount of tokens to lock in escrow
    /// @param deadline Unix timestamp after which the job can be auto released
    /// @param token Address of the ERC20 token used for payment
    function postJob(
        string memory title,
        string memory description,
        uint256 price,
        uint256 deadline,
        address token
    ) external returns (uint256) {
        require(deadline > block.timestamp, "Deadline must be in future");
        require(price > 0, "Price must be greater than 0");
        require(token != address(0), "Invalid token");
        // Transfer the payment to this contract
        IERC20(token).transferFrom(msg.sender, address(this), price);
        jobCount++;
        jobs[jobCount] = Job({
            client: msg.sender,
            worker: address(0),
            token: token,
            title: title,
            description: description,
            price: price,
            deadline: deadline,
            accepted: false,
            completed: false,
            confirmed: false,
            autoReleased: false
        });
        emit JobPosted(jobCount, msg.sender, title, price, deadline);
        return jobCount;
    }

    /// @notice Accept a job as a worker.  The caller becomes the worker.
    /// @param jobId The ID of the job to accept
    function acceptJob(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.client != address(0), "Job does not exist");
        require(!job.accepted, "Job already accepted");
        require(block.timestamp <= job.deadline, "Job expired");
        job.worker = msg.sender;
        job.accepted = true;
        emit JobAccepted(jobId, msg.sender);
    }

    /// @notice Mark the job as completed.  Only the worker can call this.
    /// @param jobId The ID of the job
    function submitWork(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.worker == msg.sender, "Only worker can submit");
        require(job.accepted, "Job not accepted");
        job.completed = true;
        emit JobCompleted(jobId, msg.sender);
    }

    /// @notice Confirm completion and release payment to worker (minus fee).  Only the client can call.
    /// @param jobId The ID of the job
    function confirmCompletion(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.client == msg.sender, "Only client can confirm");
        require(job.completed, "Job not completed");
        require(!job.confirmed, "Already confirmed");
        job.confirmed = true;
        uint256 fee = (job.price * feePercent) / 100;
        uint256 amountToWorker = job.price - fee;
        IERC20(job.token).transfer(job.worker, amountToWorker);
        if (fee > 0) {
            IERC20(job.token).transfer(feeWallet, fee);
        }
        emit JobConfirmed(jobId);
    }

    /// @notice Automatically release funds to the worker if the deadline has passed without confirmation.
    /// @param jobId The ID of the job
    function autoRelease(uint256 jobId) external {
        Job storage job = jobs[jobId];
        require(job.accepted, "Job not accepted");
        require(!job.confirmed, "Already confirmed");
        require(!job.autoReleased, "Already auto released");
        require(block.timestamp > job.deadline, "Deadline not reached");
        job.autoReleased = true;
        uint256 fee = (job.price * feePercent) / 100;
        uint256 amountToWorker = job.price - fee;
        IERC20(job.token).transfer(job.worker, amountToWorker);
        if (fee > 0) {
            IERC20(job.token).transfer(feeWallet, fee);
        }
        emit AutoReleased(jobId);
    }

    /// @notice Update the fee percentage.  Only the contract owner can call.
    /// @param newFeePercent The new fee percentage (max 3)
    function setFeePercent(uint256 newFeePercent) external onlyOwner {
        require(newFeePercent <= 3, "Fee too high");
        feePercent = newFeePercent;
    }

    /// @notice Update the fee wallet.  Only the contract owner can call.
    /// @param newWallet The new fee wallet address
    function setFeeWallet(address newWallet) external onlyOwner {
        require(newWallet != address(0), "Invalid wallet");
        feeWallet = newWallet;
    }
}
