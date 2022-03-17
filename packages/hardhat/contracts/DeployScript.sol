pragma solidity ^0.7.0;
import  "./ENSRegistry.sol";
import "./Root.sol";
import "./oracles/TrustedXNHNSOracle.sol";
import "./registrars/HNSRegistrar.sol";

contract DeployScript {
  constructor(
    address governance,
    string memory namespace
  ) {
    ENS ens = new ENSRegistry();
    Root root = new Root(ens);
    ens.setOwner(0x0, address(root));

    TrustedXNHNSOracle oracle = new TrustedXNHNSOracle(namespace);
    HNSRegistrar registrar = new HNSRegistrar(ens, namespace, oracle);

    root.setController(address(registrar), true);
    oracle.setCallerPermission(address(registrar), true);
    
    root.transferOwnership(governance);
    oracle.transferOwnership(governance);
  }
}
