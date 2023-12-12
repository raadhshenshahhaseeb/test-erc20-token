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

## Coverage Report

| File           | % Stmts | % Branch | % Funcs | % Lines | Uncovered Lines |
| -------------- | ------- | -------- | ------- | ------- | --------------- |
| **contracts/** | **100** | **61.54** | **100** | **100** |                 |
| SampleICO.sol  | 100     | 61.54    | 100     | 100     |                 |

> All files have 100% statement, function, and line coverage, but branch coverage is 61.54%.

## Setup
Install all the node dependencies.
```bash
$ npm install
```

to compile your smart contract to get an ABI and artifact of a smart contract.

```bash
$ npm run compile
```

for a unit testing smart contract using the command line.

```bash
$ npm run test
```

after testing if you want to deploy the contract using the command line.

To Run locally:
```bash
$npm run deploy:local
```

To Run on testnet:
First setup the .env file by renaming the [sample.env](.sample.env) file to `.env`.

Add all the required attributes in `.env` file.
```bash
$npm run deploy:local
```

To verify, you must add the appropriate testnet scan key in your `.env`, then run:
```bash
npx hardhat verify-contract --address YOUR_CONTRACT_ADDRESS
```

Originally deployed at:
https://mumbai.polygonscan.com/address/0x531e5822c8E724D6970642779d724c2E7D5e2B2E

## Pricing
The pricing is designed by setting up the price tiers and choosing the appropriate tier.

The pricing is designed such that for example if the price of token for tier 3 is 6. Then 1 wei will get a user (1*1000)/6=166 tokens (not rounded).

## Further Improvements
Following further improvements can make the contract even more performant.
- Adding a vesting schedule.
- Refund of tokens to original wallets if `SOFT_CAP` is not achieved.
- Improved pricing and tiers.
- Multiple sale rounds.
- Pre-sale `pause` and `end` functionality.
- Instead of transferring the amount to owner, we could store it in contract and once soft_cap is achieved, the owner would be able to withdraw the funds.
- Rounding the transferred tokens to nearest value.
