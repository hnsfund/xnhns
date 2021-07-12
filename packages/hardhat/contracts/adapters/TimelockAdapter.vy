# @version 0.2.12

import ILibHNSRegistrar as LibHNSRegistrar

struct RegistrarTimelockConfig:
  adapterEnabled: bool
  minTimelock: uint256 # TODO what is the base time interval here?

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

registrarConfigs: public(HashMap[address, RegistrarTimelockConfig])
timelocks: public(HashMap[bytes32, TimelockDetails]) # ENS node -> timestamp for end of lock period

@external
def updateRegistrarConfig(
  minTimelock: uint256,
  adapterEnabled: bool,
):
  """
    @notice
        Allows registrar to update any parameter
    @dev
        .minTimelock the amount of time domains should be locked in the registrar for
  """
  assert minTimelock > 0

  self.registrarConfigs[msg.sender] = RegistrarTimelockConfig({
    minTimelock: minTimelock,
    adapterEnabled: enabled
  })

  log RegistrarConfigUpdated(msg.sender, minTimelock, adapterEnabled)

@external
def increaseTimelock(
  node: bytes32,
  amount: uint256
):
  """
    @notice
        Only accessible to configured registrars.
        Users only interact with registrar contracts.
        Assets are deposited in registrar - NOT this contract. Adapter only handles executing logic.

    @dev
      `amount` must be at least the minTimelock on adapaters's RegistrarTimelockConfig

    @param node The ENS node for TLD
    @param amount Amount of time to add to timelock
  """
  assert amount > 0
  assert msg.sender == LibHNSRegistrar.getControllerForNFLTD(convert(node, uint256), ens)

  config : RegistrarTimelockConfig = self.registrarConfigs[msg.sender]
  assert config.adapterEnabled == True

  lock : TimelockDetails = self.deposits[node]
  
  if not lock.timeStart :
    assert amount >= config.minTimelock
    lock.timeStart = block.timestamp
    lock.timeEnd = block.timestamp + amount
  else :
    lock.timeEnd += amount

  log TimelockIncreased(node, msg.sender, amount)

# no decrease timelock because obv not a thing

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
