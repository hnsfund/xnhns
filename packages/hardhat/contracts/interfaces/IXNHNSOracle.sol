pragma solidity ^0.7.0;

interface IXNHNSOracle {
  event NewOracle(address oracle);
  event NewOwner(bytes32 indexed node, address owner);

  function requestTLDUpdate(string calldata tld) external returns (bytes32);
  function getTLDOwner(bytes32 node) external returns (address);
  function getCallerPermission(address addr) external returns (bool);
  function setCallerPermission(address addr, bool _permission) external returns (bool);
  function setOracle(address _oracle, uint _fee, bytes32 _jobId) external returns (bool);
}
