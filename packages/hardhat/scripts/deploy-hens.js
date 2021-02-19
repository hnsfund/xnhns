const fs = require('fs')
const chalk = require('chalk')
const { config, ethers } = require('hardhat')
const { utils } = ethers
const namehash = require('eth-ens-namehash').hash

// const SCRIPT_NAME = 'handshake-on-ethereum'

// contract addresses after deployment
const addresses = {}

// ENS hashes for root and .badass
const ROOT_NODE =
  '0x0000000000000000000000000000000000000000000000000000000000000000'
const TLD = 'badass'
const TLD_NAMEHASH = namehash(TLD)

async function deploy(name, _args) {
  const args = _args || []

  console.log(`📄 ${name}`)
  const contractArtifacts = await ethers.getContractFactory(name)
  const contract = await contractArtifacts.deploy(...args)
  console.log(chalk.cyan(name), 'deployed to:', chalk.magenta(contract.address))
  fs.writeFileSync(`artifacts/${name}.address`, contract.address)
  console.log('\n')
  contract.name = name
  addresses[name] = contract.address
  return contract
}


async function main() {
  console.log('📡 Deploy \n')

  // deploy 
  const EnsRegistry = await deploy('ENSRegistry')
  const registryAddress = addresses['ENSRegistry']
  //console.log('contractList', contractList)

  //setup rootzone
  const RootZone = await deploy('RootZone', [registryAddress])
  // setup resolver
  const PublicResolver = await deploy('PublicResolver', [registryAddress])
  await RootZone.setResolver(addresses['PublicResolver'])
  
  // setup ChainLink oracle to verify DNSSEC

  // setup DNSSEC registrar so HNS domains can be claimed
  const HNSRegistrar = await deploy('HNSRegistrar', ['', registryAddress])
  await RootZone.setController(addresses['HNSRegistrar'], true)

  // setup reverse registrar

  // wallet for local dev
  const localWallet = new ethers.Wallet.fromMnemonic('test test test test test test test test test test test junk')
  console.log('private key', localWallet._signingKey().privateKey);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
