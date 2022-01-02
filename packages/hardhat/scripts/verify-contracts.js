const fs = require('fs');
const hre = require('hardhat');

const namespace = 'matic';

// Comment ones you don't want to verify (lazy peeps customizable way)
const contractNames = [
  'ENSRegistry',
  'Root',
  'TrustedXNHNSOracle',
  'HNSRegistrar',
  'PublicResolver'
];

// Gather all addresses from artifacts directory
const addresses = {};
fs.readdirSync(`${hre.config.paths.artifacts}`, {withFileTypes: true}).map(file => {
  if (!file.isFile() || !file.name.endsWith('.address')) return;
  addresses[file.name.replace(/\.address$/, '')] = fs.readFileSync(`${hre.config.paths.artifacts}/${file.name}`)?.toString() || null;
})
console.log('Addresses:', addresses);

// Constructor arguments needed to verify
const constructorArguments = {
  'ENSRegistry': [],
  'Root': [addresses.ENSRegistry],
  'TrustedXNHNSOracle': [namespace],
  'HNSRegistrar': [addresses.ENSRegistry, namespace, addresses.TrustedXNHNSOracle],
  'PublicResolver': [addresses.ENSRegistry],
};
console.log('Constructor Arguments:', constructorArguments);


// Verify all (uncommented) contracts
async function main() {
  for (const name of contractNames) {
    console.log(`Verifying contract ${name}...`);

    const address = addresses[name];

    if (!address || !address.length) {
      console.log('No address found, skipping.');
      continue;
    }

    try {
      await hre.run('verify:verify', {
        address: address,
        constructorArguments: constructorArguments[name],
      });
    } catch (error) {
      const alreadyVerified = error.message.includes('Contract source code already verified') ||
                            error.message.includes('Already Verified')
      if (alreadyVerified) {
        console.log('Already verified, skipping.');
      } else {
        throw error;
      }
    }

    console.log('Done!')
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
