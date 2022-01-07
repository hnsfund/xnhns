pragma solidity ^0.7.0;

interface IXNHNSOracle {
  event NewOracle(address oracle);
  // NewOwner event identical to IENS.sol
  event NewOwner(string indexed tld, address owner);

  function requestTLDUpdate(string calldata tld) external returns (bytes32);
  function receiveTLDUpdate(bytes32, address) external returns (bool);
  function getTLDOwner(bytes32 node) external view returns (address);
  function getCallerPermission(address addr) external view returns (bool);
  function setCallerPermission(address addr, bool permission) external returns (bool);
  function setOracle(address oracle, uint fee, bytes32 jobId) external returns (bool);
}
