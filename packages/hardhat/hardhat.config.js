const { utils } = require('ethers')
const fs = require('fs')

require('@nomiclabs/hardhat-waffle');
require("@nomiclabs/hardhat-etherscan"); // Uncomment to verify on etherscan
require('hardhat-deploy');

const { isAddress, getAddress, formatUnits, parseUnits } = utils

/*
      📡 This is where you configure your deploy configuration for 🏗 scaffold-eth

      check out `packages/scripts/deploy.js` to customize your deployment

      out of the box it will auto deploy anything in the `contracts` folder and named *.sol
      plus it will use *.args for constructor args
*/

//
// Select the network you want to deploy to here:
//
const defaultNetwork = 'matic'

function mnemonic(generate) {
  if(generate || defaultNetwork === 'localhost') return '';

  try {
    return fs.readFileSync('./prod.txt').toString().trim()
  } catch (e) {
    console.log('deploying  from non mnomnic account', );
    if (defaultNetwork !== 'localhost') {
      console.log(
        '☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.'
      )
    }
  }
  return ''
}

module.exports = {
  defaultNetwork,
  // don't forget to set your provider like:
  // REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
  // (then your frontend will talk to your contracts on the live network!)
  // (you will need to restart the `yarn run start` dev server after editing the .env)

  /** HARDAT DEPLOY CONFIG */
  namedAccounts: {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
      // 4: '0xA296a3d5F026953e17F472B497eC29a5631FB51B', // but for rinkeby it will be a specific address
    },
  },
  external: {
    contracts: [
      {
        artifacts: "node_modules/@chainlink/0.7/dev/artifacts/",
      },
    ]
  },

  /** STANDARD HARDAT CONFIG */
  networks: {
    mainnet: {
      url: 'https://mainnet.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', //<---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: mnemonic(true),
      },
    },
    /* L2s */
    xdai: {
      url: 'https://rpc.xdaichain.com/',
      gasPrice: 1000000000,
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    matic: {
      url: 'https://polygon-rpc.com',
      accounts: {
        mnemonic: mnemonic(),
      },
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    },
    /* local */
    localhost: {
      url: 'http://localhost:8545',
    },
    hardhat: {
      live: false,
      saveDeployments: true,
      tags: ["test", "local"]
    },
    /* testnet */
    mumbai: { // matic PoS testnet
      url: 'https://rpc-mumbai.matic.today',
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    kovan: {
      url: 'https://kovan.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', //<---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', //<---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    ropsten: {
      url: 'https://ropsten.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', //<---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: mnemonic(),
      },
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad', //<---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: mnemonic(),
      },
    },
  },
  solidity: {
    evmVersion: 'istanbul',
    compilers: [
      { version: "0.7.0" },
      { version: "0.5.16" },
      // { version: "0.4.24" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  // Set API key for etherscan/polygonscan/mumbai.polygonscan
  // Endpoint will be chosed based on default network
  // TODO: Replace this hardcode with a switch on defaultNetwork
  etherscan: {
    apiKey: '43JVMCI3EJCZSECDWX99KRZRYWDX3H7MCH'
  }
}

const DEBUG = false

function debug(text) {
  if (DEBUG) {
    console.log(text)
  }
}

task('wallet', 'Create a wallet (pk) link', async (_, { ethers }) => {
  const randomWallet = ethers.Wallet.createRandom()
  const privateKey = randomWallet._signingKey().privateKey
  console.log('🔐 WALLET Generated as ' + randomWallet.address + '')
  console.log('🔗 http://localhost:3000/pk#' + privateKey)
})

task('fundedwallet', 'Create a wallet (pk) link and fund it with deployer?')
  .addOptionalParam(
    'amount',
    'Amount of ETH to send to wallet after generating'
  )
  .addOptionalParam('url', 'URL to add pk to')
  .setAction(async (taskArgs, { network, ethers }) => {
    const randomWallet = ethers.Wallet.createRandom()
    const privateKey = randomWallet._signingKey().privateKey
    console.log('🔐 WALLET Generated as ' + randomWallet.address + '')
    let url = taskArgs.url ? taskArgs.url : 'http://localhost:3000'

    let localDeployerMnemonic
    try {
      localDeployerMnemonic = fs.readFileSync('./mnemonic.txt')
      localDeployerMnemonic = localDeployerMnemonic.toString().trim()
    } catch (e) {
      /* do nothing - this file isn't always there */
    }

    let amount = taskArgs.amount ? taskArgs.amount : '0.01'
    const tx = {
      to: randomWallet.address,
      value: ethers.utils.parseEther(amount),
    }

    //SEND USING LOCAL DEPLOYER MNEMONIC IF THERE IS ONE
    // IF NOT SEND USING LOCAL HARDHAT NODE:
    if (localDeployerMnemonic) {
      let deployerWallet = new ethers.Wallet.fromMnemonic(localDeployerMnemonic)
      deployerWallet = deployerWallet.connect(ethers.provider)
      console.log(
        '💵 Sending ' +
          amount +
          ' ETH to ' +
          randomWallet.address +
          ' using deployer account'
      )
      let sendresult = await deployerWallet.sendTransaction(tx)
      console.log('\n' + url + '/pk#' + privateKey + '\n')
      return
    } else {
      console.log(
        '💵 Sending ' +
          amount +
          ' ETH to ' +
          randomWallet.address +
          ' using local node'
      )
      console.log('\n' + url + '/pk#' + privateKey + '\n')
      return send(ethers.provider.getSigner(), tx)
    }
  })

task(
  'generate',
  'Create a mnemonic for builder deploys',
  async (_, { ethers }) => {
    const bip39 = require('bip39')
    const hdkey = require('ethereumjs-wallet/hdkey')
    const mnemonic = bip39.generateMnemonic()
    if (DEBUG) console.log('mnemonic', mnemonic)
    const seed = await bip39.mnemonicToSeed(mnemonic)
    if (DEBUG) console.log('seed', seed)
    const hdwallet = hdkey.fromMasterSeed(seed)
    const wallet_hdpath = "m/44'/60'/0'/0/"
    const account_index = 0
    let fullPath = wallet_hdpath + account_index
    if (DEBUG) console.log('fullPath', fullPath)
    const wallet = hdwallet.derivePath(fullPath).getWallet()
    const privateKey = '0x' + wallet._privKey.toString('hex')
    if (DEBUG) console.log('privateKey', privateKey)
    var EthUtil = require('ethereumjs-util')
    const address =
      '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex')
    console.log(
      '🔐 Account Generated as ' +
        address +
        ' and set as mnemonic in packages/hardhat'
    )
    console.log(
      "💬 Use 'yarn run account' to get more information about the deployment account."
    )

    fs.writeFileSync('./' + address + '.txt', mnemonic.toString())
    fs.writeFileSync('./mnemonic.txt', mnemonic.toString())
  }
)

task(
  'account',
  'Get balance informations for the deployment account.',
  async (_, { ethers }) => {
    const hdkey = require('ethereumjs-wallet/hdkey')
    const bip39 = require('bip39')
    let mnemonic = fs.readFileSync('./mnemonic.txt').toString().trim()
    if (DEBUG) console.log('mnemonic', mnemonic)
    const seed = await bip39.mnemonicToSeed(mnemonic)
    if (DEBUG) console.log('seed', seed)
    const hdwallet = hdkey.fromMasterSeed(seed)
    const wallet_hdpath = "m/44'/60'/0'/0/"
    const account_index = 0
    let fullPath = wallet_hdpath + account_index
    if (DEBUG) console.log('fullPath', fullPath)
    const wallet = hdwallet.derivePath(fullPath).getWallet()
    const privateKey = '0x' + wallet._privKey.toString('hex')
    if (DEBUG) console.log('privateKey', privateKey)
    var EthUtil = require('ethereumjs-util')
    const address =
      '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex')

    var qrcode = require('qrcode-terminal')
    qrcode.generate(address)
    console.log('‍📬 Deployer Account is ' + address)
    for (let n in config.networks) {
      //console.log(config.networks[n],n)
      try {
        let provider = new ethers.providers.JsonRpcProvider(
          config.networks[n].url
        )
        let balance = await provider.getBalance(address)
        console.log(' -- ' + n + ' --  -- -- 📡 ')
        console.log('   balance: ' + ethers.utils.formatEther(balance))
        console.log(
          '   nonce: ' + (await provider.getTransactionCount(address))
        )
      } catch (e) {
        if (DEBUG) {
          console.log(e)
        }
      }
    }
  }
)

async function addr(ethers, addr) {
  if (isAddress(addr)) {
    return getAddress(addr)
  }
  const accounts = await ethers.provider.listAccounts()
  if (accounts[addr] !== undefined) {
    return accounts[addr]
  }
  throw `Could not normalize address: ${addr}`
}

task('accounts', 'Prints the list of accounts', async (_, { ethers }) => {
  const accounts = await ethers.provider.listAccounts()
  accounts.forEach((account) => console.log(account))
})

task('blockNumber', 'Prints the block number', async (_, { ethers }) => {
  const blockNumber = await ethers.provider.getBlockNumber()
  console.log(blockNumber)
})

task('balance', "Prints an account's balance")
  .addPositionalParam('account', "The account's address")
  .setAction(async (taskArgs, { ethers }) => {
    const balance = await ethers.provider.getBalance(
      await addr(ethers, taskArgs.account)
    )
    console.log(formatUnits(balance, 'ether'), 'ETH')
  })

function send(signer, txparams) {
  return signer.sendTransaction(txparams, (error, transactionHash) => {
    if (error) {
      debug(`Error: ${error}`)
    }
    debug(`transactionHash: ${transactionHash}`)
    // checkForReceipt(2, params, transactionHash, resolve)
  })
}

task('send', 'Send ETH')
  .addParam('from', 'From address or account index')
  .addOptionalParam('to', 'To address or account index')
  .addOptionalParam('amount', 'Amount to send in ether')
  .addOptionalParam('data', 'Data included in transaction')
  .addOptionalParam('gasPrice', 'Price you are willing to pay in gwei')
  .addOptionalParam('gasLimit', 'Limit of how much gas to spend')

  .setAction(async (taskArgs, { network, ethers }) => {
    const from = await addr(ethers, taskArgs.from)
    debug(`Normalized from address: ${from}`)
    const fromSigner = await ethers.provider.getSigner(from)

    let to
    if (taskArgs.to) {
      to = await addr(ethers, taskArgs.to)
      debug(`Normalized to address: ${to}`)
    }

    const txRequest = {
      from: await fromSigner.getAddress(),
      to,
      value: parseUnits(
        taskArgs.amount ? taskArgs.amount : '0',
        'ether'
      ).toHexString(),
      nonce: await fromSigner.getTransactionCount(),
      gasPrice: parseUnits(
        taskArgs.gasPrice ? taskArgs.gasPrice : '1.001',
        'gwei'
      ).toHexString(),
      gasLimit: taskArgs.gasLimit ? taskArgs.gasLimit : 24000,
      chainId: network.config.chainId,
    }

    if (taskArgs.data !== undefined) {
      txRequest.data = taskArgs.data
      debug(`Adding data to payload: ${txRequest.data}`)
    }
    debug(txRequest.gasPrice / 1000000000 + ' gwei')
    debug(JSON.stringify(txRequest, null, 2))

    return send(fromSigner, txRequest)
  })
