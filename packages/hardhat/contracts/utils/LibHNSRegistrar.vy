from ..interfaces import IHNSRegistrar
from ..interfaces import ILibHNSRegistrar
from ..interfaces import IRoot
from ..interfaces import IXNHNSOracle

implements: ILibHNSRegistrar

interface IENS:
  def owner(node: bytes32) -> address: view

# @dev Gets the contract controlling root zone for agiven ENS instance
# @param _ens - ENS registry instance for calling registrar
#
@external
def getRoot(_ens: address) -> address:
  return self._getRoot(_ens)

@internal
def _getRoot(_ens: address) -> address:
  return IENS(_ens).owner(EMPTY_BYTES32)


# @dev Gets the contract controlling root zone for agiven ENS instance
# @param _id - Token ID for NFTLD
# @param _ens - ENS registry instance for calling registrar
#
@external
def getControllerOfNFTLD(_id: uint256, _ens: address) -> address:
  return IRoot( self._getRoot(_ens) ).getControllerOfNFTLD(_id)

# @dev Gets the contract controlling root zone for agiven ENS instance
# @param _id - Token ID for NFTLD
# @param _ens - ENS registry instance for calling registrar
#
@external
def getOwnerOfNFTLD(_id: uint256, _ens: address) -> address:
  return IRoot( self._getRoot(_ens) ).ownerOf(_id)

@external
@pure
# @notice TODO check that toNamehash.vy == toNameshash.sol in all conditions
# @dev Takes a string TLD and computes the ENS node for it
# @param _tld - domain to hash
def toNamehash(_tld: String[1000]) -> bytes32:
  return keccak256(concat(EMPTY_BYTES32, keccak256(_tld)))

@external
def isValidTLDOwner(owner: address, sender: address) -> bool:
  return ZERO_ADDRESS != owner and sender == owner


# @dev Checks if calling registrar is able to un/register TLDs on root
#   and can initiate
# @param _registrar - registrar to check status of
# @param _ens - ENS registry instance
# @param _oracle - XNHNS oracle that registrar wants to call for checking tld status
# @return - true if enabled on both Root and Oracle, false if not
@external
def isRegistrarEnabled(
  _ens: address,
  _registrar: address
) -> bool:
  return (
    IRoot(self._getRoot(_ens)).isController(_registrar) and
    IXNHNSOracle( IHNSRegistrar(_registrar).oracle() ).getCallerPermission(_registrar)
  )
