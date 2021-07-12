# @version 0.2.12

interface ILibHNSRegistrar:

  def isRegistrarEnabled(
    _registrar: address,
    _ens: address,
    _oracle: address
  ) -> bool: view

  def isSnitchable(
    _node: bytes32,
    _ens: address,
    _registrar: address
  ) -> bool: view

  def getRoot(_ens: address) -> address: view

  def getControllerForNFTLD(_id: uint256, _ens: address) -> address: view

  def toNamehash(_tld: String[1000]) -> bytes32: pure

  def isValidTLDOwner(_owner: address) -> bool: view
