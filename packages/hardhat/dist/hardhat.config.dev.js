"use strict";

var _require = require('ethers'),
    utils = _require.utils;

var fs = require('fs');

require('@nomiclabs/hardhat-waffle');

require("@nomiclabs/hardhat-etherscan"); // Uncomment to verify on etherscan


require('hardhat-deploy');

var isAddress = utils.isAddress,
    getAddress = utils.getAddress,
    formatUnits = utils.formatUnits,
    parseUnits = utils.parseUnits;
/*
      📡 This is where you configure your deploy configuration for 🏗 scaffold-eth

      check out `packages/scripts/deploy.js` to customize your deployment

      out of the box it will auto deploy anything in the `contracts` folder and named *.sol
      plus it will use *.args for constructor args
*/
//
// Select the network you want to deploy to here:
//

var defaultNetwork = 'localhost';

function mnemonic() {
  try {
    return fs.readFileSync('./mnemonic.txt').toString().trim();
  } catch (e) {
    if (defaultNetwork !== 'localhost') {
      console.log('☢️ WARNING: No mnemonic file created for a deploy account. Try `yarn run generate` and then `yarn run account`.');
    }
  }

  return '';
}

module.exports = {
  defaultNetwork: defaultNetwork,
  // don't forget to set your provider like:
  // REACT_APP_PROVIDER=https://dai.poa.network in packages/react-app/.env
  // (then your frontend will talk to your contracts on the live network!)
  // (you will need to restart the `yarn run start` dev server after editing the .env)
  networks: {
    localhost: {
      url: 'http://localhost:8545'
      /*
        notice no mnemonic here? it will just use account 0 of the hardhat node to deploy
        (you can put in a mnemonic here to set the deployer locally)
      */

    },
    hardhat: {
      mnemonic: 'clean pioneer chronic noise deputy evoke vague cream project wife execute school',
      live: false,
      saveDeployments: true,
      tags: ["test", "local"]
    },
    rinkeby: {
      url: 'https://rinkeby.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad',
      //<---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: mnemonic()
      }
    },
    mainnet: {
      url: 'https://mainnet.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad',
      //<---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: mnemonic()
      }
    },
    ropsten: {
      url: 'https://ropsten.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad',
      //<---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: mnemonic()
      }
    },
    goerli: {
      url: 'https://goerli.infura.io/v3/460f40a260564ac4a4f4b3fffb032dad',
      //<---- YOUR INFURA ID! (or it won't work)
      accounts: {
        mnemonic: mnemonic()
      }
    },
    xdai: {
      url: 'https://dai.poa.network',
      gasPrice: 1000000000,
      accounts: {
        mnemonic: mnemonic()
      }
    }
  },
  solidity: {
    compilers: [{
      version: "0.7.0"
    }, {
      version: "0.5.16"
    } // { version: "0.4.24" },
    ],
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  etherscan: {
    apiKey: '43JVMCI3EJCZSECDWX99KRZRYWDX3H7MCH'
  }
};
var DEBUG = false;

function debug(text) {
  if (DEBUG) {
    console.log(text);
  }
}

task('wallet', 'Create a wallet (pk) link', function _callee(_, _ref) {
  var ethers, randomWallet, privateKey;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          ethers = _ref.ethers;
          randomWallet = ethers.Wallet.createRandom();
          privateKey = randomWallet._signingKey().privateKey;
          console.log('🔐 WALLET Generated as ' + randomWallet.address + '');
          console.log('🔗 http://localhost:3000/pk#' + privateKey);

        case 5:
        case "end":
          return _context.stop();
      }
    }
  });
});
task('fundedwallet', 'Create a wallet (pk) link and fund it with deployer?').addOptionalParam('amount', 'Amount of ETH to send to wallet after generating').addOptionalParam('url', 'URL to add pk to').setAction(function _callee2(taskArgs, _ref2) {
  var network, ethers, randomWallet, privateKey, url, localDeployerMnemonic, amount, tx, deployerWallet, sendresult;
  return regeneratorRuntime.async(function _callee2$(_context2) {
    while (1) {
      switch (_context2.prev = _context2.next) {
        case 0:
          network = _ref2.network, ethers = _ref2.ethers;
          randomWallet = ethers.Wallet.createRandom();
          privateKey = randomWallet._signingKey().privateKey;
          console.log('🔐 WALLET Generated as ' + randomWallet.address + '');
          url = taskArgs.url ? taskArgs.url : 'http://localhost:3000';

          try {
            localDeployerMnemonic = fs.readFileSync('./mnemonic.txt');
            localDeployerMnemonic = localDeployerMnemonic.toString().trim();
          } catch (e) {
            /* do nothing - this file isn't always there */
          }

          amount = taskArgs.amount ? taskArgs.amount : '0.01';
          tx = {
            to: randomWallet.address,
            value: ethers.utils.parseEther(amount)
          }; //SEND USING LOCAL DEPLOYER MNEMONIC IF THERE IS ONE
          // IF NOT SEND USING LOCAL HARDHAT NODE:

          if (!localDeployerMnemonic) {
            _context2.next = 19;
            break;
          }

          deployerWallet = new ethers.Wallet.fromMnemonic(localDeployerMnemonic);
          deployerWallet = deployerWallet.connect(ethers.provider);
          console.log('💵 Sending ' + amount + ' ETH to ' + randomWallet.address + ' using deployer account');
          _context2.next = 14;
          return regeneratorRuntime.awrap(deployerWallet.sendTransaction(tx));

        case 14:
          sendresult = _context2.sent;
          console.log('\n' + url + '/pk#' + privateKey + '\n');
          return _context2.abrupt("return");

        case 19:
          console.log('💵 Sending ' + amount + ' ETH to ' + randomWallet.address + ' using local node');
          console.log('\n' + url + '/pk#' + privateKey + '\n');
          return _context2.abrupt("return", send(ethers.provider.getSigner(), tx));

        case 22:
        case "end":
          return _context2.stop();
      }
    }
  });
});
task('generate', 'Create a mnemonic for builder deploys', function _callee3(_, _ref3) {
  var ethers, bip39, hdkey, mnemonic, seed, hdwallet, wallet_hdpath, account_index, fullPath, wallet, privateKey, EthUtil, address;
  return regeneratorRuntime.async(function _callee3$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          ethers = _ref3.ethers;
          bip39 = require('bip39');
          hdkey = require('ethereumjs-wallet/hdkey');
          mnemonic = bip39.generateMnemonic();
          if (DEBUG) console.log('mnemonic', mnemonic);
          _context3.next = 7;
          return regeneratorRuntime.awrap(bip39.mnemonicToSeed(mnemonic));

        case 7:
          seed = _context3.sent;
          if (DEBUG) console.log('seed', seed);
          hdwallet = hdkey.fromMasterSeed(seed);
          wallet_hdpath = "m/44'/60'/0'/0/";
          account_index = 0;
          fullPath = wallet_hdpath + account_index;
          if (DEBUG) console.log('fullPath', fullPath);
          wallet = hdwallet.derivePath(fullPath).getWallet();
          privateKey = '0x' + wallet._privKey.toString('hex');
          if (DEBUG) console.log('privateKey', privateKey);
          EthUtil = require('ethereumjs-util');
          address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex');
          console.log('🔐 Account Generated as ' + address + ' and set as mnemonic in packages/hardhat');
          console.log("💬 Use 'yarn run account' to get more information about the deployment account.");
          fs.writeFileSync('./' + address + '.txt', mnemonic.toString());
          fs.writeFileSync('./mnemonic.txt', mnemonic.toString());

        case 23:
        case "end":
          return _context3.stop();
      }
    }
  });
});
task('account', 'Get balance informations for the deployment account.', function _callee4(_, _ref4) {
  var ethers, hdkey, bip39, mnemonic, seed, hdwallet, wallet_hdpath, account_index, fullPath, wallet, privateKey, EthUtil, address, qrcode, n, provider, balance;
  return regeneratorRuntime.async(function _callee4$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          ethers = _ref4.ethers;
          hdkey = require('ethereumjs-wallet/hdkey');
          bip39 = require('bip39');
          mnemonic = fs.readFileSync('./mnemonic.txt').toString().trim();
          if (DEBUG) console.log('mnemonic', mnemonic);
          _context4.next = 7;
          return regeneratorRuntime.awrap(bip39.mnemonicToSeed(mnemonic));

        case 7:
          seed = _context4.sent;
          if (DEBUG) console.log('seed', seed);
          hdwallet = hdkey.fromMasterSeed(seed);
          wallet_hdpath = "m/44'/60'/0'/0/";
          account_index = 0;
          fullPath = wallet_hdpath + account_index;
          if (DEBUG) console.log('fullPath', fullPath);
          wallet = hdwallet.derivePath(fullPath).getWallet();
          privateKey = '0x' + wallet._privKey.toString('hex');
          if (DEBUG) console.log('privateKey', privateKey);
          EthUtil = require('ethereumjs-util');
          address = '0x' + EthUtil.privateToAddress(wallet._privKey).toString('hex');
          qrcode = require('qrcode-terminal');
          qrcode.generate(address);
          console.log('‍📬 Deployer Account is ' + address);
          _context4.t0 = regeneratorRuntime.keys(config.networks);

        case 23:
          if ((_context4.t1 = _context4.t0()).done) {
            _context4.next = 45;
            break;
          }

          n = _context4.t1.value;
          _context4.prev = 25;
          provider = new ethers.providers.JsonRpcProvider(config.networks[n].url);
          _context4.next = 29;
          return regeneratorRuntime.awrap(provider.getBalance(address));

        case 29:
          balance = _context4.sent;
          console.log(' -- ' + n + ' --  -- -- 📡 ');
          console.log('   balance: ' + ethers.utils.formatEther(balance));
          _context4.t2 = console;
          _context4.next = 35;
          return regeneratorRuntime.awrap(provider.getTransactionCount(address));

        case 35:
          _context4.t3 = _context4.sent;
          _context4.t4 = '   nonce: ' + _context4.t3;

          _context4.t2.log.call(_context4.t2, _context4.t4);

          _context4.next = 43;
          break;

        case 40:
          _context4.prev = 40;
          _context4.t5 = _context4["catch"](25);

          if (DEBUG) {
            console.log(_context4.t5);
          }

        case 43:
          _context4.next = 23;
          break;

        case 45:
        case "end":
          return _context4.stop();
      }
    }
  }, null, null, [[25, 40]]);
});

function addr(ethers, addr) {
  var accounts;
  return regeneratorRuntime.async(function addr$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          if (!isAddress(addr)) {
            _context5.next = 2;
            break;
          }

          return _context5.abrupt("return", getAddress(addr));

        case 2:
          _context5.next = 4;
          return regeneratorRuntime.awrap(ethers.provider.listAccounts());

        case 4:
          accounts = _context5.sent;

          if (!(accounts[addr] !== undefined)) {
            _context5.next = 7;
            break;
          }

          return _context5.abrupt("return", accounts[addr]);

        case 7:
          throw "Could not normalize address: ".concat(addr);

        case 8:
        case "end":
          return _context5.stop();
      }
    }
  });
}

task('accounts', 'Prints the list of accounts', function _callee5(_, _ref5) {
  var ethers, accounts;
  return regeneratorRuntime.async(function _callee5$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          ethers = _ref5.ethers;
          _context6.next = 3;
          return regeneratorRuntime.awrap(ethers.provider.listAccounts());

        case 3:
          accounts = _context6.sent;
          accounts.forEach(function (account) {
            return console.log(account);
          });

        case 5:
        case "end":
          return _context6.stop();
      }
    }
  });
});
task('blockNumber', 'Prints the block number', function _callee6(_, _ref6) {
  var ethers, blockNumber;
  return regeneratorRuntime.async(function _callee6$(_context7) {
    while (1) {
      switch (_context7.prev = _context7.next) {
        case 0:
          ethers = _ref6.ethers;
          _context7.next = 3;
          return regeneratorRuntime.awrap(ethers.provider.getBlockNumber());

        case 3:
          blockNumber = _context7.sent;
          console.log(blockNumber);

        case 5:
        case "end":
          return _context7.stop();
      }
    }
  });
});
task('balance', "Prints an account's balance").addPositionalParam('account', "The account's address").setAction(function _callee7(taskArgs, _ref7) {
  var ethers, balance;
  return regeneratorRuntime.async(function _callee7$(_context8) {
    while (1) {
      switch (_context8.prev = _context8.next) {
        case 0:
          ethers = _ref7.ethers;
          _context8.t0 = regeneratorRuntime;
          _context8.t1 = ethers.provider;
          _context8.next = 5;
          return regeneratorRuntime.awrap(addr(ethers, taskArgs.account));

        case 5:
          _context8.t2 = _context8.sent;
          _context8.t3 = _context8.t1.getBalance.call(_context8.t1, _context8.t2);
          _context8.next = 9;
          return _context8.t0.awrap.call(_context8.t0, _context8.t3);

        case 9:
          balance = _context8.sent;
          console.log(formatUnits(balance, 'ether'), 'ETH');

        case 11:
        case "end":
          return _context8.stop();
      }
    }
  });
});

function send(signer, txparams) {
  return signer.sendTransaction(txparams, function (error, transactionHash) {
    if (error) {
      debug("Error: ".concat(error));
    }

    debug("transactionHash: ".concat(transactionHash)); // checkForReceipt(2, params, transactionHash, resolve)
  });
}

task('send', 'Send ETH').addParam('from', 'From address or account index').addOptionalParam('to', 'To address or account index').addOptionalParam('amount', 'Amount to send in ether').addOptionalParam('data', 'Data included in transaction').addOptionalParam('gasPrice', 'Price you are willing to pay in gwei').addOptionalParam('gasLimit', 'Limit of how much gas to spend').setAction(function _callee8(taskArgs, _ref8) {
  var network, ethers, from, fromSigner, to, txRequest;
  return regeneratorRuntime.async(function _callee8$(_context9) {
    while (1) {
      switch (_context9.prev = _context9.next) {
        case 0:
          network = _ref8.network, ethers = _ref8.ethers;
          _context9.next = 3;
          return regeneratorRuntime.awrap(addr(ethers, taskArgs.from));

        case 3:
          from = _context9.sent;
          debug("Normalized from address: ".concat(from));
          _context9.next = 7;
          return regeneratorRuntime.awrap(ethers.provider.getSigner(from));

        case 7:
          fromSigner = _context9.sent;

          if (!taskArgs.to) {
            _context9.next = 13;
            break;
          }

          _context9.next = 11;
          return regeneratorRuntime.awrap(addr(ethers, taskArgs.to));

        case 11:
          to = _context9.sent;
          debug("Normalized to address: ".concat(to));

        case 13:
          _context9.next = 15;
          return regeneratorRuntime.awrap(fromSigner.getAddress());

        case 15:
          _context9.t0 = _context9.sent;
          _context9.t1 = to;
          _context9.t2 = parseUnits(taskArgs.amount ? taskArgs.amount : '0', 'ether').toHexString();
          _context9.next = 20;
          return regeneratorRuntime.awrap(fromSigner.getTransactionCount());

        case 20:
          _context9.t3 = _context9.sent;
          _context9.t4 = parseUnits(taskArgs.gasPrice ? taskArgs.gasPrice : '1.001', 'gwei').toHexString();
          _context9.t5 = taskArgs.gasLimit ? taskArgs.gasLimit : 24000;
          _context9.t6 = network.config.chainId;
          txRequest = {
            from: _context9.t0,
            to: _context9.t1,
            value: _context9.t2,
            nonce: _context9.t3,
            gasPrice: _context9.t4,
            gasLimit: _context9.t5,
            chainId: _context9.t6
          };

          if (taskArgs.data !== undefined) {
            txRequest.data = taskArgs.data;
            debug("Adding data to payload: ".concat(txRequest.data));
          }

          debug(txRequest.gasPrice / 1000000000 + ' gwei');
          debug(JSON.stringify(txRequest, null, 2));
          return _context9.abrupt("return", send(fromSigner, txRequest));

        case 29:
        case "end":
          return _context9.stop();
      }
    }
  });
});