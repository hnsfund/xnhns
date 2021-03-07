const fs = require("fs");
const chalk = require("chalk");
const bre = require("hardhat");

const publishDir = "../react-app/src/contracts";
const graphDir = "../subgraph"

function publishContract(contractName, contractPath) {
  console.log(
    "Publishing",
    chalk.cyan(contractName),
    "to",
    chalk.yellow(publishDir)
  );
  try {
    let contract;
    let address;
    console.log('pulch contract', `${bre.config.paths.artifacts}/contracts${contractPath}/${contractName}.sol/${contractName}.json`);
    try {
      contract = fs
        .readFileSync(`${bre.config.paths.artifacts}/contracts/${contractPath}/${contractName}.sol/${contractName}.json`)
        .toString();
      address = fs
        .readFileSync(`${bre.config.paths.artifacts}/${contractName}.address`)
        .toString();
    } catch (e) {

    }
    if(!address || !contract) return;

    contract = JSON.parse(contract);
    let graphConfigPath = `${graphDir}/config/config.json`
    let graphConfig
    try {
      if (fs.existsSync(graphConfigPath)) {
        console.log('write to existing graph config');
        graphConfig = fs
          .readFileSync(graphConfigPath)
          .toString();
      } else {
        graphConfig = '{}'
      }
      } catch (e) {
        console.log(e)
      }
    console.log(`Adding ${contractName} to subgraph...`);

    graphConfig = JSON.parse(graphConfig)
    graphConfig[contractName + "Address"] = address
    fs.writeFileSync(
      `${publishDir}/${contractName}.address.js`,
      `module.exports = "${address}";`
    );
    fs.writeFileSync(
      `${publishDir}/${contractName}.abi.js`,
      `module.exports = ${JSON.stringify(contract.abi, null, 2)};`
    );
    fs.writeFileSync(
      `${publishDir}/${contractName}.bytecode.js`,
      `module.exports = "${contract.bytecode}";`
    );

    const folderPath = graphConfigPath.replace("/config.json","")
    if (!fs.existsSync(folderPath)){
      fs.mkdirSync(folderPath);
    }

    fs.writeFileSync(
      graphConfigPath,
      JSON.stringify(graphConfig, null, 2)
    );
    fs.writeFileSync(
      `${graphDir}/abis/${contractName}.json`,
      JSON.stringify(contract.abi, null, 2)
    );



    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

async function main() {
  if (!fs.existsSync(publishDir)) {
    fs.mkdirSync(publishDir);
  }
  const finalContractList = [];
  const pathStart = bre.config.paths.sources;
  const findAllContracts = (currentPath, files) => {
    files.forEach((file) => {
      if (file.indexOf(".sol") >= 0) {
        const contractName = file.replace(".sol", "");
        // Add contract to list if publishing is successful
        if (publishContract(contractName, currentPath)) {
          finalContractList.push(contractName, pathStart + currentPath + contractName);
        }
      } else {
        const nextPath = currentPath + '/' + file + '/';
        findAllContracts(nextPath, fs.readdirSync(pathStart + nextPath))
      }
    })
  }
  
  findAllContracts('', fs.readdirSync(pathStart))

  fs.writeFileSync(
    `${publishDir}/contracts.js`,
    `module.exports = ${JSON.stringify(finalContractList)};`
  );
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
