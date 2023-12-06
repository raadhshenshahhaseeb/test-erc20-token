# Initial Coin Offering (ICO) contract

## Test Summary
- [x] Assigns initial balance
- [x] Do not have permission to burning token
- [x] Set price tiers
- [x] Should set and get the current price tier correctly
- [x] Buy token with ether
- [x] Should correctly report the total sold tokens
- [x] Should correctly report the contract's Ether balance
- [x] Should revert the transaction when the purchase exceeds the HARD CAP
- [x] Do not have permission to withdraw ether from contract
- [x] Transfer adds amount to destination account
- [x] Transfer emits event
- [x] Can not transfer above the amount
- [x] Can not transfer from empty account
- [x] Burning token
- [x] Withdraw ether from contract
- [x] Do not have enough ether to buy token
- [x] Should only allow the owner to set the soft cap
- [x] Should revert if the new soft cap is more than half of the current hard cap
- [x] Should only allow the owner to set the hard cap
- [x] Should return the presale as running

20 tests passing (498ms)

## Setup

## Coverage Report

| File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |
| -------------- | ------- | -------- | ------- | ------- | --------------- |
| **contracts/** | **100** | **61.54** | **100** | **100** |                 |
| SampleICO.sol  | 100     | 61.54    | 100     | 100     |                 |

> All files have 100% statement, function, and line coverage, but branch coverage is 61.54%.

```bash
$ npm install
```

to compile your smart contract to get an ABI and artifact of a smart contract.

```bash
$ npm run compile
```

for a unit testing smart contract using the command line.

```
$ npm run test
```
expecting `sample-test.js` result.


after testing if you want to deploy the contract using the command line.

```bash

$ npm run test-rpc
# Open another Terminal
$ npm run deploy-local

# result in npx hardhat node Terminal
web3_clientVersion
eth_chainId
eth_accounts
eth_chainId
eth_estimateGas
eth_gasPrice
eth_sendTransaction
  Contract deployment: <UnrecognizedContract>
  Contract address:    0x5fb...aa3
  Transaction:         0x4d8...945
  From:                0xf39...266
  Value:               0 ETH
  Gas used:            323170 of 323170
  Block #1:            0xee6...85d

eth_chainId
eth_getTransactionByHash
eth_blockNumber
eth_chainId (2)
eth_getTransactionReceipt

# result in npx hardhat run Terminal
Initial Coin Offering (ICO) contract deployed to: 0x5Fb...aa3

```
your can edit deploy network endpoint at `hardhat.config.js`.

```javascript
module.exports = {
  networks: {
        {
        localhost: {
          url: "http://127.0.0.1:8545"
        },
        hardhat: {
          // See its defaults
        }
  }
};

```
Example customized function  
If you want to pay token fee to the miner or validator in the network.
```javascript
    // pragma solidity 0.8.0
    // Solidity 0.8.X has an integrated SafeMath Library
    // override function transfer to distribute fee to miner or validator in the network
    /* Diagram transfer with token fees
      ##### Before #####
      A balance: 101
      B balance: 0
      C balance: 0

      A.transfer(B.address,101);
                    A
                    |	
                    | transfer Tx
                    |_____ 
                    |     |
                    v     v				
                    B     C

      ##### After #####
      A balance: 0
      B balance: 100
      C balance: 1
    */
    function transfer(address account,uint256 amount) public override returns(bool){
        require(amount % 10 != 0, "ERC20: insufficient funds");
        uint256 fee = amount % 10;
        _transfer(msg.sender,account,amount-fee);
        _transfer(msg.sender,block.coinbase,fee);
        return true;
    }
```
