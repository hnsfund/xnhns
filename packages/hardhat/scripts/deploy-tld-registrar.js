const fs = require('fs')
const chalk = require('chalk')
const { config, ethers } = require('hardhat')
const { utils } = ethers
const namehash = require('eth-ens-namehash').hash

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


/**
 * @dev Deploys a registrar to sell SLDs for a TLD owned by `deployer` (configured in hardha.config.js)
 * Uses an existing instance of ENS where TLD has already been claimed from HNS
*/
async function main() {
  console.log('📡 Deploy \n')
  const [deployer] = await ethers.getSigners();

  // deploy 
  const registryAddress = process.env.ENS_REGISTRY_ADDRESS
  //console.log('contractList', contractList)
  
  // pricing algo for registrar
  await deploy('DummyOracle', [1])
  await deploy('StablePriceOracle', [
    addresses['DummyOracle'],
    [1]
  ])

  const BaseRegistrar = await deploy('BaseRegistrar', [
    registryAddress,
    TLD_NAMEHASH
  ])

  const RegistrarController = await deploy('RegistrarController', [
    addresses['BaseRegistrar'],
    addresses['StablePriceOracle'],
    30,
    864000,
  ])
  // give controller ability to register and sell subdomains
  await BaseRegistrar.addController(addresses['RegistrarController'])
  const isController = await BaseRegistrar.controllers(addresses['RegistrarController'])
  console.log('Controller has permission : ', isController);

  // setup resolver
  const PublicResolver = await deploy('PublicResolver', [addresses['ENSRegistry']])
  // set tld owner to deployed so we can setup resolver before transferring tld to registrar
  await EnsRegistry.setSubnodeOwner(
    ROOT_NODE,
    utils.id(TLD), 
    deployer.address
  )
  await EnsRegistry.setSubnodeOwner(
    TLD_NAMEHASH,
    utils.id('resolver'),
    deployer.address
  )
  await EnsRegistry.setResolver(TLD_NAMEHASH, addresses['PublicResolver'])
  await EnsRegistry.setResolver(namehash(`resolver.${TLD}`), addresses['PublicResolver'])
  console.log(`Resolver for .${TLD} deployed and set to resolver.${TLD} at address : `, addresses['PublicResolver']);

  // setup .badas
  await EnsRegistry.setSubnodeOwner(
    ROOT_NODE,
    utils.id(TLD), 
    BaseRegistrar.address
  )

  console.log('Base Registrar is owner of .badass at address : ', await EnsRegistry.owner(TLD_NAMEHASH));
  console.log('Owner of Registrar Contoller : ', await RegistrarController.owner());
  
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
