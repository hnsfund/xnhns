const fs = require('fs')
const chalk = require('chalk')
const { config, ethers, run } = require('hardhat')
const { utils } = ethers
const { namehash } = require('@ensdomains/ensjs')

// contract addresses after deployment
const addresses = {}

const HNS_FUND_TREASURY = '0xd25A803E24FFd3C0033547BE04D8C43FFBa7486b';
const HNS_PANVALA_CONTRACT = '';

const namespace = 'kovan',
  governanceAddress = '0xd99ff346476C36cD159fA1bE6f5F79E74b7C37e0', // DAO multisig that contorls XNHNS system
  oracleAddr = '0xd99ff346476C36cD159fA1bE6f5F79E74b7C37e0',
  linkAddr = '0xa36085F69e2889c224210F603D836748e7dC0088',
  verifyTldJobId = utils.id('41e9e8e2678f4d5f98e4bebe02cc1ccc')

const getContract = (contractName, namespace) => {
  console.log(`checking for existing contract deployments for ${contractName} on ${namespace}...`);
  return new Promise((resolve, reject) => {
    try {

      fs.readFile(
        `${config.paths.deployments}/${namespace}.json`, // deployments path is inserted by hardhat-deploy even tho not using that task
        (err, data) => {
          if(!err && data) {
            const contract = JSON.parse(data)[contractName];
            return contract && contract.address ? resolve(contract.address) : resolve(null);
          } else {
            return resolve(null);
          }
        })
    } catch(e) {
      return resolve(null);
    }
  });
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
    contractArtifacts.attach(contractAddress) : 
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
  const addresses = await ethers.getSigners();
  const deployer = addresses[0].address
  console.log('deploying from - ', deployer);
  // deploy 
  const EnsRegistry = await deploy('ENSRegistry')
  const registryAddress = EnsRegistry.address
  console.log('XNHNS registry form namespace --- ', `${registryAddress}._${namespace}.`);
  
  const rootParams = [ registryAddress ]
  const Root = await deploy('Root', rootParams)

  // uncomment for Chainlink oracle. Update config at beginning of file
  const oracleParams = [ namespace ]
  // console.log('oracle', namespace, oracleAddr, linkAddr, verifyTldJobId);
  const XNHNSOracle = await deploy('XNHNSOracle', [
    ...oracleParams,
    EnsRegistry.address,
    oracleAddr,
    linkAddr,
    verifyTldJobId
  ])

  // const XNHNSOracle = await deploy('TrustedXNHNSOracle', oracleParams)
  // const XNHNSOracle = await deploy('DummyXNHNSOracle')


  const registrarParams = [
    registryAddress,
    namespace,
    XNHNSOracle.address
  ]
  const HNSRegistrar = await deploy('HNSRegistrar', registrarParams)

  /* START POST DEPLOYMENT CONFIGURATION */
  
  if(EnsRegistry.deployTransaction) {
    await EnsRegistry.deployTransaction.wait()
    console.log('giving Root contract control of rootzone');
    try {
      const rootTransferTx = await EnsRegistry.setOwner(namehash(''), Root.address)
      console.log('Successfully transferred ownership of rootzone to Root contract');
    } catch(e) {
      console.log('error giving Root contract control of root zone: ', e);
    }
  }

  // // Allow registrar to update ENS Registry to issue TLDs
  if(Root.deployTransaction) {
    await Root.deployTransaction.wait()
  }
  console.log('Adding registrar to Root...');
  await Root.setController(HNSRegistrar.address, true)
  
  // All Root tasks complete
  // Transfer ownership of contract to Governance after all deployment config setup
  const rootOwner = await Root.owner()
  console.log('Root.owner()', rootOwner);
  if(rootOwner === deployer) {
    await Root.transferOwnership(governanceAddress);
    console.log('Successfully gave ownership of Root to governance');
  }  


  // allow registrar to call oracle to update tld status
  if(XNHNSOracle.deployTransaction) {
    await XNHNSOracle.deployTransaction.wait()
  }
  console.log('Adding registrar to Oracle...');
  await XNHNSOracle.setCallerPermission(HNSRegistrar.address, true);


  if(XNHNSOracle.owner) {
    const oracleOwner = await XNHNSOracle.owner()
    console.log('Oracle.owner()', oracleOwner);
    if(oracleOwner === deployer) {
      await XNHNSOracle.transferOwnership(governanceAddress);
      console.log('Successfully gave ownership of Oracle to governance');
    }  
  }
  /* END POST DEPLOYMENT CONFIGURATION */

  // verify contracts on explorers
  console.log('verifying contracts on etherscan...');

  const contractDetails = [
    [EnsRegistry.address,     []],
    [Root.address,            rootParams],
    [XNHNSOracle.address,     oracleParams],
    [HNSRegistrar.address,    registrarParams],
  ]
  const verifications = contractDetails.map(([addr, params]) => 
    run("verify:verify", {
      address: addr,
      constructorArguments: params
    }
  ))

  try {
    const verficationResponse = await Promise.all(verifications);
    console.log('verify contracts response', verficationResponse);
  } catch(e) {
    console.log('Error verifying contracts on etherscan', e)
  }


  // anything else to do?

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
