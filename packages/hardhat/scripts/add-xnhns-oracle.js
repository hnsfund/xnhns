

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
  
function main() {
  console.log('📡 Deploy \n')
  const addresses = await ethers.getSigners();
  const deployer = addresses[0].address
  console.log('deploying from - ', deployer);

  // oracle params
  const oracleType = 'XNHNSOracle'
  const oracleParams = [
    'kovan', // namespace
    '0x3b639E3D3f6D449C79044d7e85bf28beCD18931d', // ens registry
    '0x', // oracle addr
    '0x', // link token addr
    '0x', // jobId
  ]
  const XNHNSOracle = await deploy(oracleType, oracleParams)


  const registrars = [

  ]

  registrars.map()
  // Give registrars permission to call oracle
}
