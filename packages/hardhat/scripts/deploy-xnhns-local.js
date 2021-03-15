const fs = require('fs')
const chalk = require('chalk')
const { config, ethers } = require('hardhat')
const { utils } = ethers
// contract addresses after deployment
const addresses = {}

const HNS_FUND_TREASURY = '0xd25A803E24FFd3C0033547BE04D8C43FFBa7486b';
const HNS_PANVALA_CONTRACT = '';

const namespace = 'kovan',
  oracleAddr = '0x31Da52dFe5168e2b029703152a877149ea3fB064',
  linkAddr = '0xa36085F69e2889c224210F603D836748e7dC0088',
  verifyTldJobId = utils.id('41e9e8e2678f4d5f98e4bebe02cc1ccc'),
  verifyTxJobId = utils.id('asfawfafawaqwfa'); // coerce bytes32

const getContract = (contractName, namespace) => {
  console.log(`checkig for existing contract deployments for ${contractName} on ${namespace}...`);
  return new Promise((resolve, reject) => {
    fs.readFile(
      `${config.paths.deployments}/${namespace}.json`, // deployments path is inserted by hardhat-deploy even tho not using that task
      (err, data) => {
        if(!err && data) {
          const contract = JSON.parse(data)[contractName];
          return contract ? resolve(contract.address) : resolve(null);
        } else {
          return reject(err);
        }
      })
  }) 
}
/**
 * @dev Deploys an entirely new instance of ENS to be used by only a single tld (e.g. .badass/)
*/
async function deploy(name, _args) {
  const args = _args || []

  console.log(`📄 ${name}`)
  const contractArtifacts = await ethers.getContractFactory(name)
  const contractAddress = await getContract(name, namespace)
  console.log('predeployed contract address:', contractAddress);
  const contract = contractAddress ?
    {
      ...contractArtifacts.attach(contractAddress),
      deployTransaction: { wait: () => Promise.resolve() } // stub wait
    } : 
    await contractArtifacts.deploy(...args);
  
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
  const registryAddress = EnsRegistry.address
  console.log('XNHNS registry form namespace --- ', `${registryAddress}._${namespace}.`);

  
  const Root = await deploy('Root', [registryAddress])
  const XNHNSOracle = await deploy('DummyXNHNSOracle')
  const HNSRegistrar = await deploy('HNSRegistrar', [
    registryAddress,
    namespace,
    XNHNSOracle.address
  ]);

  
  console.log('oracle', oracleAddr, linkAddr, verifyTldJobId);
  
  // Allow registrar to update ENS Registry to issue TLDs
  await Root.deployTransaction.wait()
  await Root.setController(HNSRegistrar.address, true)
  
  // allow registrar to call oracle to update tld status
  await XNHNSOracle.deployTrasnaction.wait()
  XNHNSOracle.setCallerPermission(HNSRegistrar.address, true);

  // const HnsFund = deploy('PanvalaMember', [HNS_FUND_TREASURY])
  // const TLDBroker = await deploy('TLDSalesBroker', [
  //   registryAddress,
  //   HnsFund.address,
  //   oracleAddr,
  //   linkAddr,
  //   verifyTxJobId,
  // ])

  // anything else to do?
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
