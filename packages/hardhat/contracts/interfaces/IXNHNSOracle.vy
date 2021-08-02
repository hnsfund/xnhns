# @version 0.2.12

interface IXNHNSOracle:
  # apparently events arent allowed in vyper interfaces 
  # keeping here to remember when implementing

  # event NewOracle:
  #   oracle: indexed(address)
  #   jobId: indexed(bytes32)

  # event NewOwner:
  #   node: indexed(bytes32)
  #   owner: indexed(address)

  def getTLDOwner(node: bytes32)                                    -> address: view
  def getCallerPermission(addr: address)                           -> bool: view
  def setCallerPermission(addr: address, _permission: bool)        -> bool: nonpayable
  def setOracle(
    _oracle: address,
    _fee: uint256,
    _jobId: bytes32
  )                                                                 -> bool: nonpayable
  def requestTLDUpdate(tld: String[1000])                           -> bytes32: nonpayable

