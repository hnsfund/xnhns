# @version 0.2.12

# verify() can differ depending on registrar functionality
interface IHNSRegistrar:
  def register(node: bytes32) -> bool: nonpayable
  def unregister(node: bytes32) -> bool: nonpayable
  def verify(node: bytes32) -> bool: nonpayable

  
  # def getTLD(node: bytes32) -> : view
  def getSnitch(node: bytes32) -> (address, uint256): view

  def oracle() -> address: view
  def namespace() -> String[10]: view
