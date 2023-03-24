const { ethers } = require("ethers");
const prompt = require("prompt-sync")({ sigint: true });
const fs = require('fs')
require('dotenv').config()
const abi = JSON.parse(fs.readFileSync('abi.json'))
const contractAddress = "0x8fb1e3fc51f3b789ded7557e680551d93ea9d892"
const network = process.env.NETWORK
const provider = new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc')
const contract = new ethers.Contract(contractAddress, abi, provider) 
const signer = new ethers.Wallet(process.env.PK, provider)

const amount = ethers.utils.parseUnits("0.1",6)
const connectSigner = contract.connect(signer)
const to = prompt('Send to: ')


async function sendTransaction(){
    const tx = await connectSigner.transfer(to, amount)
    console.log('Mining transaction...')
    console.log(`https://${network}.io/tx/${tx.hash}`)
    const receipt = await tx.wait()
    console.log(`Mined in block ${receipt.blockNumber}`)
}
async function checkBalance(address){
    console.log("Checking balance...")
    const balance = await contract.balanceOf(address)
    const balanceFormated = ethers.utils.formatUnits(balance,6)
    return balanceFormated
}
async function main(){
    let balance = await checkBalance(signer.address)
    console.log(balance)
    while (balance>=0.1) {
        await sendTransaction()
        balance = await checkBalance(signer.address)
        console.log(balance)
    }
}
main()