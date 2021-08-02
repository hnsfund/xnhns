from ..interfaces import ILibHNSRegistrar
from ..interfaces import IHNSRegistrar
from ..interfaces import IXNHNSOracle

struct Snitch:
  addr: address
  timeStart: uint256

struct SnitchRegistrarConfig:
  adapterEnabled: bool
  deposit: uint256
  minOracleDelay: uint256 # timestamps
  activeSnitches: uint256

event SnitchedOn:
  node: bytes32
  snitch: address
  registrar: address
  token: address
  reward: uint256 # in token

event SnitchesGotStitches:
  node: bytes32
  snitch: address
  registrar: address
  penalty: uint256 # native protocol token

registrarConfigs: public(HashMap[address, SnitchRegistrarConfig])
snitches: public(HashMap[bytes32, Snitch]) # ENS node -> Snitch
ens: public(address)
xnhnsLib: ILibHNSRegistrar

@external
def __init__(ens_: address, xnhnsLib_: address):
  """
    @notice
        Called when contract is deployed.
        Sets ENS instance it validates registrars against
  """
  self.ens = ens_
  self.xnhnsLib = ILibHNSRegistrar(xnhnsLib_)


@external
def updateRegistrarConfig(
  deposit: uint256,
  minOracleDelay: uint256,
  adapterEnabled: bool
):
  """
    @notice
        Allows registrar owner to update any parameter
    @dev
    @param deposit - amount of native token that snitch must stake before a 
      This mitigates spam attacks against XNHNS and MEV frontrunning snitchs.
    @param minOracleDelay - milliseconds that registrar must wait after
      a snitch request for an oracle result is considered valid.
      This prevents frontrunning oracle responses and crosschain MEV 
    @param adapterEnabled - 
  """
  self.registrarConfigs[msg.sender] = SnitchRegistrarConfig({
    deposit: deposit,
    minOracleDelay: minOracleDelay,
    adapterEnabled: adapterEnabled,
    activeSnitches: self.registrarConfigs[msg.sender].activeSnitches
  })

@external
def snitch(node: bytes32, snitch: address) -> bool:
  assert self._isSnitchable(node, msg.sender)
  assert (
    msg.sender == self.xnhnsLib.getControllerOfNFTLD(node, self.ens),
    'Only NFTLD controller can register snitches'
  )

  snitches[node] = Snitch({
    addr: snitch,
    timeStare: block.timestamp
  })
  self.registrarConfigs[msg.sender].activeSnitches += 1

  return True

@internal
def isSnitchSuccessful(node: bytes32, registrar: address) -> bool:
  """
    @notice
        Verifies if a snitch called out an invalid TLD.
        Does not implement reward/punishment, leaves up to registrars to administer
    @dev throws if snitch not claimable yet.
    @return - True if snitch deserves reward, False if snitch is deserves punishment
  """
  assert ZERO_ADDRESS != self.snitches[node].addr, 'No snitch to claim'

  claimStartTime: uint256 = self.snitches[node].timeStart + registrarConfigs[msg.sender].minOracleDelay
  assert block.timestamp < claimStartTime, 'Cannot claim snitch reward yet'

  tldOwner: address = self._getTLDOwner(node, registrar)
  if ZERO_ADDRESS == tldOwner:
    return True
  else:
    return False


@external
def endActiveSnitch(node: bytes32, token: address, amount: uint256):
  assert (
    msg.sender == self.xnhnsLib.getControllerOfNFTLD(node, self.ens),
    'Only NFTLD controller can claim snitch rewards'
  )
  snitch: address
  timeStart: uint256
  deposit: uint256
  snitch, timeStart, deposit = getSnitch(node)
  claimStartTime: uint256 = timeStart + registrarConfigs[msg.sender].minOracleDelay
  assert block.timestamp > claimStartTime, 'Cannot end snitch until claim period ends'
  
  tldOwner: address = self._getTLDOwner(node, registrar)
  if ZERO_ADDRESS == tldOwner: # snitch succesful
    log SnitchedOn(node, snitch, msg.sender, token, amount)
  else: # not successful
    log SnitchesGotStitches(node, snitch, msg.sender, deposit)

  empty(self.snitches[node])
  self.registrarConfigs[msg.sender].activeSnitches -= 1


@external
def isSnitchable(node: bytes32, registrar: address) -> bool:
  return self._isSnitchable(node, registrar)

# @dev Checks if a TLD is registered in XNHNS and able to be snitched on
# @param node - ENS node of TLD to check
# @param registrar - Registrar hosting TLD
# @return - true if snitchable, false if not
@external
def getSnitch(
  node: bytes32,
  registrar: address
) -> (address, uint256, uint256):
  return (
    self.snitches[node].addr,
    self.snitches[node].timeStart,
    self.registrarConfigs[registrar].deposit
  )

@external
def getRegistrarSnitches(
  registrar: address
) -> (uint256, uint256):
  return (
    self.registrarConfigs[registrar].activeSnitches,
    self.registrarConfigs[registrar].deposit
  )


# @dev Checks if a TLD is registered in XNHNS and able to be snitched on
# @param node - ENS node of TLD to check
# @param registrar - Registrar hosting TLD
# @return - true if snitchable, false if not
@internal
def _isSnitchable(
  node: bytes32,
  registrar: address
) -> bool:
  """
    @notice
      Check NFT instead of oracle for owner because there is
      no value in snitchng something that isn't registered
  """
  assert self.registrarConfigs[registrar].adapterEnabled

  assert ZERO_ADDRESS != self.xnhnsLib.getOwnerOfNFTLD(node, ens), 'Cannot snitch on unregistered TLD'
  assert ZERO_ADDRESS == self.snitches[node].addr, 'TLD already snitched on'

  return True

@internal
def _getTLDOwner(node: bytes32, registrar: address) -> address:
  return IXNHNSOracle( IHNSRegistrar(registrar).oracle() ).getTLDOwner(node)
