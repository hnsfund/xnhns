import interfaces.IHNSRegistrar as IHNSRegistrar

import interfaces.ILibHNSRegistrar as ILibHNSRegistrar
import interfaces.IRoot as IRoot

implements: ILibHNSRegistrar

interface IENS:
  def owner(node: bytes32) -> address: view

struct TLD:
  id: uint256 # NFTLD id on Root.sol
  registrar: address
  referrer: address # address to send rewards for entity that signed up the TLD

struct Snitch:
  addr: address
  blockStart: uint256 # when snitch() was called

# HELPER FUNCTIONS
#
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
def getControllerForNFTLD(_id: uint256, _ens: address) -> address:
  return IRoot(self._getRoot(_ens)).getControllerForNFTLD(_id)

@external
@pure
# @notice TODO check that toNamehash.vy == toNameshash.sol in all conditions
# @dev Takes a string TLD and computes the ENS node for it
# @param _tld - domain to hash
def toNamehash(_tld: String[1000]) -> bytes32:
  return keccak256(concat(EMPTY_BYTES32, keccak256(_tld)))

@external
def isValidTLDOwner(_owner: address) -> bool:
  return ZERO_ADDRESS != _owner and msg.sender == _owner


# @dev Checks if calling registrar is able to un/register TLDs on root
#   and can initiate
# @param _registrar - registrar to check status of
# @param _ens - ENS registry instance
# @param _oracle - XNHNS oracle that registrar wants to call for checking tld status
# @return - true if enabled on both Root and Oracle, false if not
#
@external
def isRegistrarEnabled(
  _registrar: address,
  _ens: address,
  _oracle: address
) -> bool:
  return (
    IRoot(self._getRoot(_ens)).isController(_registrar) and
    IXNHNSOracle(_oracle).getCallerPermission(_registrar)
  )

@external
def isSnitchable(
  _node: bytes32,
  _ens: address,
  _registrar: address
) -> bool:
  owner: address = IRoot(self._getRoot(_ens)).ownerOf(convert(_node, uint256))
  snitch: address 
  snitch = IHNSRegistrar(_registrar).getSnitch(_node)

  # if NFTLD exists and there isn't currently a snitch on the tld
  if owner != ZERO_ADDRESS and snitch == ZERO_ADDRESS:
    return True
  else:
    return False
