const { ethers } = require("ethers");
require('dotenv').config()
const fs = require('fs')
const prompt = require("prompt-sync")({ sigint: true });

let provider = new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc')
let wallet = new ethers.Wallet(process.env.PK, provider)
let contractAddress = "0x8fb1e3fc51f3b789ded7557e680551d93ea9d892"
let amount = '0.1'
let numberOfZeros = 6



async function spamErc20 (){
    try {
        let abi = JSON.parse(fs.readFileSync(contractAddress+'.json'))
        let contract = new ethers.Contract(contractAddress, abi, provider)
        let convertedAmount = ethers.utils.parseUnits(amount, numberOfZeros)
        let toAddress = prompt('Address to send the tokens: ')

        const transferData = contract.interface.encodeFunctionData('transfer', [toAddress, convertedAmount])
        const maxNumberOfTxs = Math.floor(await checkBalance(wallet.address)/Number(amount))
        let numberOfTxs = Number(prompt(`Number of transactions to send(Maximum is ${maxNumberOfTxs}): `) )
        while (numberOfTxs> maxNumberOfTxs){
            console.log('You cannot send more tokens than you have in your wallet')
            numberOfTxs = prompt(`Number of transactions to send(Maximum is ${maxNumberOfTxs}): `) 
        }
        const txs = Array(numberOfTxs).fill().map(_ => ({
            to:contractAddress,
            value: 0,
            data: transferData
        }))
        const nonce = await provider.getTransactionCount(wallet.address)
        const signedTxs = await Promise.all(
            txs.map((tx, index) => wallet.signTransaction({
                ...tx,
                nonce: nonce+index,
                gasLimit: 6000000,
                gasPrice: ethers.utils.parseUnits('10', 'gwei')
            }))
        )
            const txHashes = await Promise.all(
                signedTxs.map(signedTx => provider.sendTransaction(signedTx))
            )
            console.log(txHashes)
            showMenu()
    } catch (error) {
        console.log(error)
        showMenu()
    }
}
async function checkBalance(address){
    const abi = JSON.parse(fs.readFileSync(contractAddress+'.json'))
    const contract = new ethers.Contract(contractAddress, abi, provider)
    const balance = await contract.balanceOf(address)
    const balanceFormated = ethers.utils.formatUnits(balance,numberOfZeros)
    return balanceFormated
}

function changeSettings(){
    console.log("Change settings:")
    const subMenu = {
        '1': changeProvider,
        '2': changeWallet,
        '3': changeContract,
        '4': changeAmount,
        '5': backToMainMenu
    }
    showSubMenu()

    function showSubMenu(){
        console.log("[1] Change Provider")
        console.log("[2] Change Wallet")
        console.log("[3] Change Contract")
        console.log('[4] Change Amount per tx')
        console.log("[5] Go back")
        let option = prompt('Select an option: ')
        
        if (subMenu.hasOwnProperty(option)) {
            subMenu[option]();
        } else {
            console.log("Invalid option, please try again.");
            showSubMenu();
        }
        

    }
    function changeProvider(){
        newProvider = prompt('New provider url: ')
        provider = new ethers.providers.JsonRpcProvider(newProvider)
        showSubMenu()
    }
    function changeContract(){
        showSubMenu()
    }
    function changeWallet(){
        showSubMenu()
    }
    function changeAmount(){
        amount = prompt('New amount: ')
        showSubMenu()
    }
    function backToMainMenu(){
        showMenu()
    }
}
async function spamEther(){
    try {
        const balance = await provider.getBalance(wallet.address)
        console.log(Number(balance))
        const maxNumberOfTxs = Math.floor((balance/(10**18))/Number(amount))
        let numberOfTxs = Number(prompt(`Number of transactions to send(Maximum is ${maxNumberOfTxs}): `) )
        let toAddress = prompt('Address to send the tokens: ')
        while (numberOfTxs> maxNumberOfTxs){
            console.log('You cannot send more tokens than you have in your wallet')
            numberOfTxs = prompt(`Number of transactions to send(Maximum is ${maxNumberOfTxs}): `) 
        }
        const nonce = await provider.getTransactionCount(wallet.address)
        const txs = Array(numberOfTxs).fill().map(index => ({
            to: toAddress,
            value: ethers.utils.parseEther(amount),
        }))
        const txsHashes = await Promise.all(
            txs.map((tx,index) => (
                wallet.sendTransaction({
                    ...tx,
                    nonce:nonce+index
                }).then((txObj) => {
                    console.log('txHash: ', txObj.hash)
                }
                )
            )) 
        )
        showMenu()
    } catch (error) {
        console.log(error)
        showMenu()
    }
}

const menu = {
    '1': spamEther,
    '2': spamErc20,
    '3': changeSettings,
    '4': function() { process.exit(); }
}
async function showMenu(){
    console.log('Settings:')
    console.log('Rpc provider: ' + provider.connection.url)
    console.log('Wallet: '+ wallet.address)
    console.log('Contract wallet: '+ contractAddress)
    console.log('Amount per tx: '+ amount)
    console.log('Number of zeros of the erc20 token: '+ numberOfZeros)
    console.log("Menu Options:")
    console.log("[1] Spam ether tx")
    console.log("[2] Spam Erc20 tx") 
    console.log("[3] Change settings")
    console.log("[4] Exit")
    
    let option = prompt('Select an option: ')
    if(menu.hasOwnProperty(option)){
        menu[option]();
    }
    else{
        console.log("Invalid option, please try again.");
        showMenu();
    }
}

showMenu().catch(err => {
    console.log(err)
})