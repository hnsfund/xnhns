# @version 0.2.12

from ..interfaces import ILibHNSRegistrar

struct TimelockRegistrarConfig:
  adapterEnabled: bool
  minTimelock: uint256

struct TimelockDetails:
  timeStart: uint256
  timeEnd: uint256

event RegistrarConfigUpdated:
  registrar: address
  minTimelock: uint256
  enabled: bool

event TimelockIncreased:
  node: bytes32
  registrar: address
  amount: uint256

registrarConfigs: public(HashMap[address, TimelockRegistrarConfig])
timelocks: public(HashMap[bytes32, TimelockDetails]) # ENS node -> timestamp for end of lock period
xnhnsLib: ILibHNSRegistrar

@external
def __init__(
  xnhnsLib_: address
):
  self.xnhnsLib = ILibHNSRegistrar(xnhnsLib_)

@external
def updateRegistrarConfig(
  minTimelock: uint256,
  adapterEnabled: bool,
) -> bool:
  """
    @notice
        Allows registrar to update any parameter
    @dev
        .minTimelock the amount of time domains should be locked in the registrar for
  """
  assert minTimelock > 0

  self.registrarConfigs[msg.sender] = TimelockRegistrarConfig({
    minTimelock: minTimelock,
    adapterEnabled: adapterEnabled
  })

  log RegistrarConfigUpdated(msg.sender, minTimelock, adapterEnabled)
  return True

@external
def increaseTimelock(
  node: bytes32,
  amount: uint256
) -> bool:
  """
    @notice
        Only accessible to configured registrars.
        Users only interact with registrar contracts.
        Assets are deposited in registrar - NOT this contract. Adapter only handles executing logic.

    @dev
      `amount` must be at least the minTimelock on adapaters's TimelockRegistrarConfig

    @param node The ENS node for TLD
    @param amount Amount of time to add to timelock
  """
  assert amount > 0
  assert msg.sender == self.xnhnsLib.getControllerOfNFTLD(node, ens)

  config : TimelockRegistrarConfig = self.registrarConfigs[msg.sender]
  assert config.adapterEnabled == True

  lock : TimelockDetails = self.deposits[node]
  
  if not lock.timeStart :
    assert amount >= config.minTimelock
    lock.timeStart = block.timestamp
    lock.timeEnd = block.timestamp + amount
  else :
    lock.timeEnd += amount

  log TimelockIncreased(node, msg.sender, amount)
  return True

# no decrease timelock because obv not a thing

@view
@external
def removeTLD(node: bytes32) -> bool:
  """
  @notice Only called when TLD has been snitched on and unregistered
    to allow next owner to register tld without errors
  """
  assert msg.sender == self.xnhnsLib.getControllerOfNFTLD(node, ens)
  empty(timelocks[node])
  return True

@view
@external
def timelockEndBlock(node: bytes32) -> bool:
  return self.timelocks[node].timeEnd

@view
@external
def isAdapterEnabled(registrar: address) -> bool:
  return self.registrarConfigs[registrar].adapterEnabled

@view
@external
def getRegistrarConfig(registrar: address) -> (
  bool,
  uint256
):
  config: RegistrarDepositConfig = self.registrarConfigs[registrar]
  return (
    config.adapterEnabled,
    config.minTimelock
  )
