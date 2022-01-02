const fs = require('fs');

const namespace = 'matic'

module.exports = async ({getNamedAccounts, deployments}) => {
  const {deploy, execute} = deployments;
  const {deployer} = await getNamedAccounts();

  const ENSRegistry = await deploy('ENSRegistry', {
    from: deployer,
    args: [],
    log: true,
  });

  const Root = await deploy('Root', {
    from: deployer,
    args: [ENSRegistry.address],
    log: true,
  });

  // Set ENSRegistry's owner to Root
  if (ENSRegistry.newlyDeployed) {
    await execute(
      'ENSRegistry',
      {
        from: deployer,
        log: true
      },
      'setOwner',
      // args:
      '0x0000000000000000000000000000000000000000000000000000000000000000', Root.address
    );
  }

  const TrustedXNHNSOracle = await deploy('TrustedXNHNSOracle', {
    from: deployer,
    args: [namespace],
    log: true,
  });

  const HNSRegistrar = await deploy('HNSRegistrar', {
    from: deployer,
    args: [ENSRegistry.address, namespace, TrustedXNHNSOracle.address],
    log: true,
  });

  // Set Root's controller to HNSRegistrar
  if (Root.newlyDeployed) {
    await execute(
      'Root',
      {
        from: deployer,
        log: true
      },
      'setController',
      // args:
      HNSRegistrar.address, true
    );
  }

  // Allow HNSRegistrar to call XNHNSOracle
  if (TrustedXNHNSOracle.newlyDeployed || Root.newlyDeployed) {
    await execute(
      'TrustedXNHNSOracle',
      {
        from: deployer,
        log: true
      },
      'setCallerPermission',
      // args:
      HNSRegistrar.address, true
    );
  }

  const PublicResolver = await deploy('PublicResolver', {
    from: deployer,
    args: [ENSRegistry.address],
    log: true,
  });

  fs.writeFileSync('artifacts/ENSRegistry.address', ENSRegistry.address);
  fs.writeFileSync('artifacts/Root.address', Root.address);
  fs.writeFileSync('artifacts/TrustedXNHNSOracle.address', TrustedXNHNSOracle.address);
  fs.writeFileSync('artifacts/HNSRegistrar.address', HNSRegistrar.address);
  fs.writeFileSync('artifacts/PublicResolver.address', PublicResolver.address);
};

module.exports.tags = ['all'];
