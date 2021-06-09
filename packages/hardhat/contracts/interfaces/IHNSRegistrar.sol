interface IHNSRegistrar {
  function register(bytes32 node) external returns (bool);
  function unregister(bytes32 node) external returns (bool);
  function verify(bytes32 node) external returns (bool);
  
  function getTLD(bytes32 node) external returns (
      uint256 id,
      address token,
      uint256 deposit,
      uint256 unlockTime,
      address referrer
    );
  function getSnitch(bytes32 node) external returns (address snitch, uint256 blockStart);
}
