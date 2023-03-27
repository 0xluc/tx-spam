const { ethers } = require("ethers");
require('dotenv').config()
const fs = require('fs')
const prompt = require("prompt-sync")({ sigint: true });

let provider = new ethers.providers.JsonRpcProvider('https://goerli-rollup.arbitrum.io/rpc')
let wallet = new ethers.Wallet(process.env.PK, provider)

function changeSettings(){
    console.log("Change settings:")
    const subMenu = {
        1: changeProvider,
        2: changeWallet,
        3: changeContract,
        4: backToMainMenu
    }

    function showSubMenu(){
        console.log("[1] Change Provider")
        console.log("[2] Change Wallet")
        console.log("[3] Change Contract")
        console.log("[4] Go back")
        
        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question("\nPlease select an option: ", function(option) {
            readline.close();
            if (submenu.hasOwnProperty(option)) {
                submenu[option]();
            } else {
                console.log("Invalid option, please try again.");
                showSubMenu();
            }
        });
    }
    function changeProvider(){
        provider = prompt('Set new provider url: ')
        provider = new ethers.providers.JsonRpcProvider(provider)
        showSubMenu()
    }
    function changeContract(){
        showSubMenu()
    }
    function changeWallet(){
        showSubMenu()
    }
    function backToMainMenu(){
        showMenu()
    }
}
function spamEther(){
    showMenu()
}
function spamErc20(){
    showMenu()
}
const menu = {
    1: spamEther,
    2: spamErc20,
    3: changeSettings,
    4: function() { process.exit(); }
}
async function showMenu(){
    console.log("\nMenu Options:")
    console.log("[1] Spam ether tx")
    console.log("[2] Spam Erc20 tx") 
    console.log("[3] Change settings")
    console.log("[4] Exit")
    
    const readline = require('readline').createInterface({
        input: process.stdin,
        input: process.stdout
    })
    
    await readline.question("\nPlease select an option: ", function(option){
        readline.close()
        if(menu.hasOwnProperty(option)){
            menu[option]()
        }
        else{
            console.log("Invalid option, please try again.")
            showMenu()
        }
    })
}

showMenu().then(() =>{
    console.log("finished")
}).catch(err => {
    console.log(err)
})