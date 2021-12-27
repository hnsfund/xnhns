const fs = require('fs')
const chalk = require('chalk')
const { config, ethers, run } = require('hardhat')
const { utils } = ethers
const { namehash } = require('@ensdomains/ensjs')

// contract addresses after deployment
const addresses = {}

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
  const namespace = 'polygon'
  const governanceAddress = '0x11b3585b00febd9d513fdc27c3721c855051e000' // DAO multisig that contorls XNHNS system
  
  await deploy("DeployScript", [governanceAddress, namespace])
  
  /* END POST DEPLOYMENT CONFIGURATION */

  // const EnsRegistryAddress = "0x34f3fa739a0592e3a7ded83802c9faa53c28a1a5"
  // const EnsRegistryParams = []
  // const RootAddress = "0xd87944cbfa0f77da6acaf10348f90ec4dcdbcbbb"
  // const RootParams = [EnsRegistryAddress]
  // const XNHNSOracleAddress = "0xbd3289d2751bf61db41f38935da42643c4655984"
  // const XNHNSOracleParams = [namespace]
  // const HNSRegistrarAddress = "0x21322caa2853c5a2fb57b5fb2f95068dfa7ac6d6"
  // const HNSRegistrarParams = [EnsRegistryAddress, namespace, XNHNSOracleAddress]

  // const contractDetails = [
  //   [EnsRegistryAddress,     EnsRegistryParams],
  //   [RootAddress,            RootParams],
  //   [XNHNSOracleAddress,     XNHNSOracleParams],
  //   [HNSRegistrarAddress,    HNSRegistrarParams],
  // ]

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
