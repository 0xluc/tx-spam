const { ethers } = require("ethers");
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs')
require('dotenv').config()

// add provider
const provider = new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc')
// add wallet
const wallet = new ethers.Wallet(process.env.PK, provider)

//erc20 usdc goerli arb contract
const contractAddress = "0x8fb1e3fc51f3b789ded7557e680551d93ea9d892"
const abi = JSON.parse(fs.readFileSync(contractAddress+'.json'))
const contract = new ethers.Contract(contractAddress, abi, provider) 

// where to send those transactions 
const toAddress = prompt('Send to: ')

// tranfer data
const amount = ethers.utils.parseUnits('0.1', 6)
// const transferAbi = contract.interface.getFunction('transfer').abi
const transferData = contract.interface.encodeFunctionData('transfer', [toAddress, amount])
//array of txs
async function sendTransactions(){
    const balance = await checkBalance(wallet.address)
    const numberOfTxs = Math.floor(balance/0.1)
    const txs = Array(numberOfTxs).fill().map( _ => ({
        to: contractAddress,
        value: 0, 
        data: transferData // Encode the transfer function data    
    }))
    const nonce = await provider.getTransactionCount(wallet.address);


    const signedTxs = await Promise.all(
        txs.map((tx,index) => wallet.signTransaction({
            ...tx,
            nonce: nonce + index,
            gasLimit: 6000000,
            gasPrice: ethers.utils.parseUnits('10', 'gwei')
        }))
    )
    const txHashes = await Promise.all(
        signedTxs.map(signedTx => provider.sendTransaction(signedTx))
    )
    console.log(txHashes)
}
sendTransactions()

async function sendTransaction(signer){
    const connectSigner = contract.connect(signer)
    const tx =  connectSigner.transfer(to, amount)
    console.log('Mining transaction...')
}
async function checkBalance(address){
    const balance = await contract.balanceOf(address)
    const balanceFormated = ethers.utils.formatUnits(balance,6)
    return balanceFormated
}
async function main(){
    let balance1 = await checkBalance(sig1.address)
    let balance2 = await checkBalance(sig2.address)
    while (balance1>=0.1) {
        await sendTransaction(process.env.PK)
        sendTransaction(process.env.PK2)
        balance1 -= 0.1
        balance2 -= 0.1
        console.log(balance1)
    }
}
