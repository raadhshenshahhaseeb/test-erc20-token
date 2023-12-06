const { expect, assert  } = require("chai");

describe("Initial Coin Offering (ICO) contract", function() {

  let token;
  let accounts;
  const amount = ethers.utils.parseEther("1")

  before(async () => {
    const ICOContract = await ethers.getContractFactory("ICO"); // Replace "ICO" with the actual contract name
    accounts = await ethers.getSigners();
    token = await ICOContract.deploy();
    await token.deployed();
  });

  it("Assigns initial balance", async function() {
    const totalSupply = await token.totalSupply();
    expect(await token.balanceOf(accounts[0].address)).to.equal(totalSupply);
  });

  it("Do not have permission to burning token", async function(){
    const wallet = token.connect(accounts[2]);
    await expect(wallet.burn(accounts[2].address,amount)).to.be.reverted
  });

  it("Set price tiers", async function() {
    // Price tiers represent the cost in MATIC/ETH for 1000 tokens
    const priceTier1 = ethers.utils.parseUnits("0.2", "ether"); // 0.2 ETH/MATIC for 1000 tokens
    const priceTier2 = ethers.utils.parseUnits("0.4", "ether"); // 0.4 ETH/MATIC for 1000 tokens
    const priceTier3 = ethers.utils.parseUnits("0.6", "ether"); // 0.6 ETH/MATIC for 1000 tokens

    await token.connect(accounts[0]).setPriceTiers(priceTier1, priceTier2, priceTier3);

    // Check if the price tiers are set correctly
    expect(await token.priceTiers(0)).to.equal(priceTier1);
    expect(await token.priceTiers(1)).to.equal(priceTier2);
    expect(await token.priceTiers(2)).to.equal(priceTier3);

    expect(await token.isPresale()).to.equal(true);
  });


  it("should set and get the current price tier correctly", async function() {
    // Set the current price tier to 2 (index 2, which is Tier 3)
    await token.connect(accounts[0]).setCurrentPriceTier(2);

    const currentPriceTier = await token.getCurrentPriceTier();

    const formattedPriceTier = ethers.utils.formatUnits(currentPriceTier, "ether");

    expect(formattedPriceTier).to.equal("0.6");
  });

  it("Buy token with ether", async function() {
    // Set current price tier to the number of tokens for 1 ETH
    const currentPriceTier = await token.getCurrentPriceTier();
    const tokenDecimals = await token.decimals();

    const etherToSend = ethers.utils.parseUnits("1.2", "ether");

    // Calculate the expected token amount
    // Formula: expectedTokenAmount = (etherToSend / currentPriceTier) * 1000 * 10**tokenDecimals
    const expectedTokenAmount = etherToSend.mul(1000).div(currentPriceTier).mul(ethers.BigNumber.from(10).pow(tokenDecimals));

    // Check the balance of accounts[2] before the purchase
    const initialBalance = await token.balanceOf(accounts[2].address);

    // Perform the purchase
    await token.connect(accounts[2]).buy({ value: etherToSend });

    // Check the balance of accounts[2] after the purchase
    const finalBalance = await token.balanceOf(accounts[2].address);

    // Expect the balance to have increased by the expected token amount
    expect(finalBalance.sub(initialBalance)).to.equal(expectedTokenAmount);
  });

  it("should correctly report the total sold tokens", async function () {
    expect(await token.getTotalSold()).to.not.equal(0);
  });

  it("should correctly report the contract's Ether balance", async function () {
    const existingBalance = await token.getContractBalance();

    const transaction = { to: token.address, value: ethers.utils.parseEther("1.0") };
    await accounts[0].sendTransaction(transaction);

    const expectedBalance = ethers.BigNumber.from(existingBalance).add(ethers.utils.parseEther("1.0"));

    expect(await token.getContractBalance()).to.equal(expectedBalance);
  });

  it("Should revert the transaction when the purchase exceeds the HARD CAP", async function () {
    const currentPriceTier = await token.currentPriceTier();
    const HARD_CAP = await token.getHardCap();
    const tokenDecimals = await token.decimals();

    // Calculate the Ether amount that slightly exceeds the HARD_CAP
    // Formula: exceedingEther = (HARD_CAP + extraTokens) * currentPriceTier / (1000 * 10**tokenDecimals)
    const extraTokens = ethers.BigNumber.from(10).pow(tokenDecimals); // Just 1 extra token in smallest unit
    const exceedingEther = HARD_CAP.add(extraTokens).mul(currentPriceTier).div(1000).div(ethers.BigNumber.from(10).pow(tokenDecimals));

    const buyerConnectedToken = token.connect(accounts[2]);

    // Attempt to buy more tokens than the HARD_CAP
    await expect(buyerConnectedToken.buy({ value: exceedingEther }))
        .to.be.revertedWith("ICO: Purchase exceeds HARD CAP");
  });

  it("Do not have permission to withdraw ether from contract", async function(){
    const wallet = token.connect(accounts[2]);
    await expect(wallet.withdraw(amount)).to.be.reverted;
  });

  it("Transfer adds amount to destination account", async function() {
    await token.transfer(accounts[1].address,amount);
    expect(await token.balanceOf(accounts[1].address)).to.equal(amount);
  });

  it("Transfer emits event", async () => {
    await expect(token.transfer(accounts[1].address, amount))
      .to.emit(token, "Transfer")
      .withArgs(accounts[0].address, accounts[1].address, amount);
  });

  it("Can not transfer above the amount", async () => {
    const wallet = token.connect(accounts[3]);
    await expect(wallet.transfer(accounts[1].address, 1)).to.be.reverted;
  });

  it("Can not transfer from empty account", async () => {
    const wallet = token.connect(accounts[3]);
    await expect(wallet.transfer(accounts[0].address, 1)).to.be.reverted;
  });

  it("Burning token", async function() {
    const before_burn = await token.balanceOf(accounts[0].address);
    await token.burn(accounts[0].address,amount);
    const after_burn = await token.balanceOf(accounts[0].address);
    expect(after_burn).to.equal((before_burn.sub(amount)));
  });

  it("Withdraw ether from contract", async function() {
    const beforeWithdraw = await accounts[0].getBalance();

    const contractBalance = await token.getContractBalance();

    await token.withdraw(contractBalance);

    const afterWithdraw = await accounts[0].getBalance();

    expect(beforeWithdraw.lt(afterWithdraw)).to.equal(true);
  });


  it("Do not have enough ether to buy token", async function(){
    const wallet = token.connect(accounts[3]);
    const big_amount = ethers.utils.parseEther("999999")
    const option = {value: big_amount};
    let error;
    try {
      await wallet.buy(option)
    }
    catch (err) {
      error = "sender doesn't have enough funds"
    }
    expect(error).to.equal("sender doesn't have enough funds"); // maybe can refactor
  });

  it("Should only allow the owner to set the soft cap", async function () {
    // 'newSoftCap' is in ether, convert it to the smallest unit
    const newSoftCapInSmallestUnit = 500;

    // Expect a revert when a non-owner tries to set the soft cap
    await expect(token.connect(accounts[2]).setSoftCap(newSoftCapInSmallestUnit))
        .to.be.revertedWith("Only the owner can call this function");

    // Set the soft cap by the owner
    await token.connect(accounts[0]).setSoftCap(newSoftCapInSmallestUnit);

    // Retrieve the updated soft cap, which is expected to be in the smallest unit
    const updatedSoftCapInSmallestUnit = await token.getSoftCap();

    // Convert 'updatedSoftCapInSmallestUnit' back to ether for comparison
    const updatedSoftCapInEther = ethers.utils.formatUnits(updatedSoftCapInSmallestUnit, "ether");

    // 'newSoftCap' is expected to be equal to 'updatedSoftCapInEther'
    expect(updatedSoftCapInEther).to.equal("500.0");
  });

  it("Should revert if the new soft cap is more than half of the current hard cap", async function () {
    const currentHardCap = await token.getHardCap();
    const newSoftCap = currentHardCap.div(2).add(1); // Set this value to more than half of the current hard cap

    // Expect a revert when the new soft cap exceeds half of the hard cap
    await expect(token.connect(accounts[0]).setSoftCap(newSoftCap))
        .to.be.revertedWith("SOFT_CAP must be at least half less than HARD_CAP");
  });

  it("Should only allow the owner to set the hard cap", async function () {
    // Expect a revert when a non-owner tries to set the hard cap
    await expect(token.connect(accounts[2]).setHardCap(20000.0))
        .to.be.revertedWith("Only the owner can call this function");

    // Set the hard cap by the owner
    await token.connect(accounts[0]).setHardCap(20000.0);

    // Retrieve the updated hard cap
    const updatedHardCap = await token.getHardCap();

    const updatedHardCapInEther = ethers.utils.formatUnits(updatedHardCap, "ether");
    // Expect the hard cap to be updated to the new value
    expect(updatedHardCapInEther).to.equal('20000.0');
  });

  it("Should return the presale as running", async function (){
    const isrunning = await token.isRunningPresale()
    expect(isrunning).to.true
  });
});
