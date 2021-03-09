interface IXNHNSOracle {
  event NewOracle(address oracle);
  event TLDOwnerSet(bytes32 indexed node, address indexed owner);

  function updateTLD(string calldata tld) external returns (bytes32);
  function getTLDOwner(bytes32 node) external returns (address);
  function getCallerPermission(address addr) external returns (bool);
  function setOracle(address _oracle, uint _fee, bytes32 _jobId) external returns (bool);
}
