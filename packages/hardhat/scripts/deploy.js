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
const TLD_NAMEHASH = namehash('badass')

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
  // auto deploy to read contract directory and deploy them all (add ".args" files for arguments)
  // deploy 
  const EnsRegistry = await deploy('ENSRegistry')
  const registryAddress = addresses['ENSRegistry']
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
    600,
    86400,
  ])

  // give controller ability to register and sell subdomains
  await BaseRegistrar.addController(addresses['RegistrarController'])
  const isController = await BaseRegistrar.controllers(addresses['RegistrarController'])
  console.log('Controller has permission : ', isController);

  // setup .badas
  await EnsRegistry.setSubnodeOwner(
    ROOT_NODE,
    TLD_NAMEHASH,
    BaseRegistrar.address
  )
  console.log('Base Registrar is owner of .badass at address : ', addresses['BaseRegistrar']);
  console.log('Owner of Registrar Contoller : ', await RegistrarController.owner());
  
  // setup reverse registrar
  // setup resolver
}

  main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
