interface IHNSRegistrar {
  function register(bytes32 node) external returns (bool);
  function unregister(bytes32 node) external returns (bool);
  function verify(bytes32 node) external returns (bool);
  function migrate(bytes32 node, address to) external returns (bool);
  
  function getTLD(bytes32 node) external returns (
      uint256 id,
      address token,
      uint256 deposit,
      uint256 unlockTime,
      address referrer
    );
  function getSnitch(bytes32 node) external returns (address snitch, uint256 blockStart);

  function initPreMigrationReceiverHook(bytes32 node, address currentRegistrar) external returns (bool);
  function initPostMigrationReceiverHook(bytes32 node, address currentRegistrar) external returns (bool);
}
