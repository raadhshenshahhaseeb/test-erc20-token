const {spawnSync} = require("child_process");

async function verify(address, args) {
    const sp = spawnSync('npx hardhat verify ' + address + ' ' + args + ' --network testnet ', [], {
        timeout: 30000,
        stdio: ['inherit', 'inherit', 'pipe'],
        shell: true,
    });
    if (sp.stderr.toString('utf-8').includes('Already Verified')) {
        console.log('Contract already verified');
    } else if (sp.stderr.toString() === null || sp.stderr.toString() === '') {
        console.log('Contract Verified Successfully');
    } else {
        throw new Error(sp.stderr.toString());
    }
}

module.exports = verify;
