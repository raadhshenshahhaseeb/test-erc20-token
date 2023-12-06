// scripts/deploy.js
const ico = require('../artifacts/contracts/SampleICO.sol/ICO.json');

async function main(hre, key) {
    // Check if hre is passed, if not, require it
    if (!hre) {
        hre = require("hardhat");
    }

    const contract = await hre.ethers.getContractFactory("ICO");
    const token = await contract.deploy();
    console.log('tx hash:' + token.deployTransaction.hash);
    await token.deployed();

    console.log("\nInitial Coin Offering (ICO) contract deployed to:", token.address);

    let deployTx = await token.deployTransaction.wait(1);

    return {
        address: token.address,
        block: deployTx.blockNumber,
        abi: ico.abi,
        bytecode: ico.bytecode
    };
}

module.exports = main;

// Only call main directly if the script is not being imported
if (require.main === module) {
    main()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error);
            process.exit(1);
        });
}
