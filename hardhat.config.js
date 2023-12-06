const {task} = require("hardhat/config");
// require("hardhat-gas-reporter");
require("@nomiclabs/hardhat-waffle");
require("solidity-coverage");
require("./scripts/deploy.js");
require('dotenv').config();
require('@nomiclabs/hardhat-etherscan');


const RpcToken = process.env.RPC_TOKEN;
if (!RpcToken) {
    throw new Error('Please set your RPC_TOKEN in a .env file');
}

const walletSecret = process.env.WALLET_SECRET;
if (!walletSecret) {
    throw new Error('Please set your WALLET_SECRET in a .env file');
}

const accounts = walletSecret.length === 64 ? [walletSecret] : {mnemonic: walletSecret};

const testnetKey = process.env.TESTNET_KEY;

task("accounts", "Prints the list of accounts", async () => {
    const accounts = await ethers.getSigners();

    for (const account of accounts) {
        console.log("address :", account.address);
    }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
    networks: {
        localhost: {
            url: "http://localhost:8545",
            chainId: 123
        },
        hardhat: {
            chainId: 1337
        },
        testnet: {
            url: RpcToken,
            accounts,
            chainId: 80001
        }
    },
    solidity: {
        compilers: [
            {
                version: "0.8.0",
                settings: {
                    optimizer: {
                        enabled: true,
                        runs: 200,
                    }
                }
            }
        ]
    },
    mocha: {
        timeout: 20000,
        slow: '0'
    },
    etherscan: {
        apiKey:{
            testnet:testnetKey
        },
        customChains: [
            {
                network: 'testnet',
                chainId: 80001,
                urls: {
                    apiURL: 'https://api-testnet.polygonscan.com/api',
                    browserURL: 'https://mumbai.polygonscan.com/'
                }
            }
        ]
    }
};

const fs = require('fs');

task("deploySampleICO", "Deploys the SampleICO contract")
    .setAction(async (taskArgs, hre) => {
        const deployScript = require("./scripts/deploy.js");
        // get network name and chain id
        var chainID = hre.network.config.chainId
        var networkName = hre.network.name

        const contractDetails = await deployScript(hre, networkName, testnetKey);

        console.log("Network chain id=",chainID);
        console.log("Network Name =", networkName);

        var url

        if (networkName === 'testnet' && testnetKey){
            url = hre.config.etherscan.customChains[0]['urls']['browserURL'].toString()
        } else {
            url = 'url-not-supported/'
        }

        const output = {
            chainId: hre.network.config.chainId,
            contracts: {
                ico: {
                    abi: contractDetails.abi, // Populate this if you need the ABI
                    bytecode: contractDetails.bytecode, // Populate this if you need the bytecode
                    address: contractDetails.address,
                    block: contractDetails.block,
                    url: url + 'address/' + contractDetails.address// Set this if you have a specific URL to include
                }
            }
        };

        fs.writeFileSync('deployment-output.json', JSON.stringify(output, null, 2));
        console.log('Deployment details saved to deployment-output.json');
    });

// Import the verify function
const verify = require("./scripts/verify");

task("verify-contract", "Verifies a contract on Polygonscan")
    .addParam("address", "The contract's address")
    .addOptionalVariadicPositionalParam("constructorArgs", "The constructor arguments", [])
    .setAction(async (taskArgs, hre) => {
        await verify(taskArgs.address, taskArgs.constructorArgs);
    });
