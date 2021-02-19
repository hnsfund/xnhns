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

/**
 * @dev Deploys an entirely new instance of ENS to be used by only a single tld (e.g. .badass/)
*/
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
  const [deployer] = await ethers.getSigners();
  console.log('deploying from - ', deployer.address);
  // deploy 
  const EnsRegistry = await deploy('ENSRegistry')
  const registryAddress = addresses['ENSRegistry']
  const setOwner = _setOwner(EnsRegistry)
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

  // wait for registrar tx to be confirmed before interacting with contract
  console.log('waiting for BaseRegistrar to be confirmed before continuing...');
  await BaseRegistrar.deployTransaction.wait()

  console.log('Adding controller to registrar...');
  const addController = await BaseRegistrar.addController(addresses['RegistrarController'])
  await addController.wait()
  const isController = await BaseRegistrar.controllers(addresses['RegistrarController'])
  console.log('Controller has permission : ', isController);

  // setup resolver
  const PublicResolver = await deploy('PublicResolver', [addresses['ENSRegistry']])
  // setup reverse registrar


  // wait for registry to be deployed before interacting
  await EnsRegistry.deployTransaction.wait()
  // set tld owner to deployed so we can setup resolver before transferring tld to registrar
  console.log(`Giving ownership of .${TLD} to deployer...`);
  const setTld = await setOwner(
    ROOT_NODE,
    TLD,
    deployer.address
  );
  await setTld.wait()

  console.log(`Creating resolver.${TLD} domain...`);
  const setResolver = await setOwner(
    TLD_NAMEHASH,
    'resolver',
    deployer.address
  )
  console.log(`Setting resolver for .${TLD} and resolver.${TLD} to address : `, addresses['PublicResolver']);
  await EnsRegistry.setResolver(TLD_NAMEHASH, addresses['PublicResolver'])
  await setResolver.wait()
  await EnsRegistry.setResolver(namehash(`resolver.${TLD}`), addresses['PublicResolver'])
  
  // setup .badass
  console.log(`Giving ownerhsip of .${TLD} to BaseRegistrar...`, );
  const giveTldToRegistrar = await setOwner(
    ROOT_NODE,
    TLD, 
    BaseRegistrar.address
  )
  await giveTldToRegistrar.wait()
  console.log('Base Registrar is owner of .badass at address : ', await EnsRegistry.owner(TLD_NAMEHASH));
  console.log('Owner of Registrar Contoller : ', await RegistrarController.owner());

  // wallet for local dev
  const localWallet = new ethers.Wallet.fromMnemonic('test test test test test test test test test test test junk')
  console.log('private key', localWallet._signingKey().privateKey);
}

const _setOwner = ens => async (node, label, owner) =>
  await ens.setSubnodeOwner(node, utils.id(label), owner);
  // await Promise.all([
  //   ens.setSubnodeOwner(node, namehash(label), owner),
  //   ens.setSubnodeOwner(node, utils.id(label), owner)
  // ])

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
