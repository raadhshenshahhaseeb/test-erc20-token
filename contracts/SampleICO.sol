// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// import from node_modules @openzeppelin/contracts v4.0
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
  *@title Initial Coin Offerring(ICO) contract
*/
contract ICO is ERC20, ReentrancyGuard {
    address public owner;

    uint256 public MAX_SUPPLY = 1000000 * 10 ** decimals();
    uint256 public TOTAL_SOLD = 0;

    uint256 public SOFT_CAP = 1000 * 10 ** decimals();
    uint256 public HARD_CAP = 10000 * (10 ** uint256(decimals()));

    uint256[3] public priceTiers;
    bool public isPresale = false;

    uint256 public currentPriceTier;
    // constructor() public ERC20("_name", "_symbol") {
    //  // mint to `msg.sender`
    //  _mint(msg.sender, _amount*(10**uint256(decimals())));
    //  // mint to `_address`
    //  _mint(_address, _amount*(10**uint256(decimals())));
    // }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    constructor() ERC20("BasicCoin", "BSC") {
        owner = msg.sender;
        require(SOFT_CAP <= HARD_CAP / 2, "SOFT_CAP must be at least half less than HARD_CAP");
        _mint(owner, 1000000 * (18 ** uint256(decimals())));
    }

    receive() external payable {}

    /**
      * @param account (type address) address of recipient
      * @param amount (type uint256) amount of token
      * @dev function use to burn token
    */
    function burn(address account, uint256 amount) public onlyOwner returns (bool success) {
        require(account != address(0) && amount != uint256(0), "ERC20: function burn invalid input");
        _burn(account, amount);
        return true;
    }

    /**
      * @param _priceTier1 (type uint256) price of token for tier 1
      * @param _priceTier2 (type uint256) price of token for tier 2
      * @param _priceTier3 (type uint256) price of token for tier 3
      * @dev function to set price tiers
    */
    function setPriceTiers(uint256 _priceTier1, uint256 _priceTier2, uint256 _priceTier3) public onlyOwner {
        require(_priceTier1 > 0, "Price Tier 1 must be greater than 0");
        require(_priceTier2 > 0, "Price Tier 2 must be greater than 0");
        require(_priceTier3 > 0, "Price Tier 3 must be greater than 0");

        // Directly set the price tiers without any conversion
        // The price tiers represent the ETH/MATIC cost for 1000 tokens
        priceTiers[0] = _priceTier1;
        priceTiers[1] = _priceTier2;
        priceTiers[2] = _priceTier3;

        isPresale = true;
    }


    function setCurrentPriceTier(uint8 tierIndex) public onlyOwner {
        require(tierIndex < priceTiers.length, "Invalid tier index");

        currentPriceTier = priceTiers[tierIndex];
    }

    function getCurrentPriceTier() public view returns (uint256) {
        return currentPriceTier;
    }

    function isRunningPresale() public view returns (bool success) {
        return isPresale;
    }

    function buy() public payable nonReentrant returns (bool success) {
        require(isPresale, "ICO: Presale is not active");
        require(currentPriceTier > 0, "ICO: Current price tier is not set");

        uint256 tokensToBuy = (msg.value * 1000) / currentPriceTier;
        tokensToBuy = tokensToBuy * (10 ** decimals());

        // Check if the purchase does not exceed the HARD_CAP
        require(TOTAL_SOLD + tokensToBuy <= HARD_CAP, "ICO: Purchase exceeds HARD CAP");

        _transfer(owner, msg.sender, tokensToBuy);

        // Increment TOTAL_SOLD
        TOTAL_SOLD += tokensToBuy;

        // Transfer the Ether to the owner
        payable(owner).transfer(msg.value);

        return true;
    }

    function getTotalSold() public view returns (uint256) {
        return TOTAL_SOLD;
    }

    /**
      * @dev Returns the Ether balance of the contract.
      * @return uint256 The balance of the contract in Wei.
     */
    function getContractBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getHardCap() public view returns (uint256){
        return HARD_CAP;
    }

    function getSoftCap() public view returns (uint256){
        return SOFT_CAP;
    }

    function setSoftCap(uint256 newSoftCap) public onlyOwner {
        // Ensure the new soft cap is at least half less than the current hard cap
        require(newSoftCap * (10 ** uint256(decimals())) <= HARD_CAP / 2, "SOFT_CAP must be at least half less than HARD_CAP");
        SOFT_CAP = newSoftCap * (10 ** uint256(decimals()));
    }

    function setHardCap(uint256 newHardCap) public onlyOwner {
        // Ensure the current soft cap is at least half less than the new hard cap
        require(SOFT_CAP <= newHardCap * (10 ** uint256(decimals())) / 2, "SOFT_CAP must be at least half less than HARD_CAP");
        HARD_CAP = newHardCap * (10 ** uint256(decimals()));
    }

    /**
      * @param amount (type uint256) amount of ether
      * @dev function use to withdraw ether from contract
    */
    function withdraw(uint256 amount) public onlyOwner returns (bool success) {
        require(amount <= address(this).balance, "ICO: function withdraw invalid input");
        payable(_msgSender()).transfer(amount);
        return true;
    }
}