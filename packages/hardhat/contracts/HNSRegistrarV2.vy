from vyper.interfaces import ERC20
from interfaces import IXNHNSOracle
from interfaces import IHNSRegistrar
from interfaces import ILibHNSRegistrar
from interfaces import IRoot

from adapters import DepositAdapter
from adapters import TimelockAdapter
from adapters import SnitchAdapter

implements: IHNSRegistrar


event TLDMigrationRequested:
  node: indexed(bytes32)
  owner: address
  deposit: uint256
  timelock: uint256

event NewOwner:
  node: indexed(bytes32)
  owner: address

event NewOracle:
  oracle: address

oracle: public(IXNHNSOracle)
namespace: public(String[10])
owner: public(address)

ens: public(address)
xnhnsLib: ILibHNSRegistrar
timelockAdapter: TimelockAdapter
depositAdapter: DepositAdapter
snitchAdapter: SnitchAdapter


## TODO precompile
# INTERFACE_META_ID: constant(private(convert(keccak256("supportsInterface(bytes4)"), bytes4)))
# XNHNS_CLAIM_ID: constant(private(convert(
#   keccak256("register(string)") ^
#   keccak256("unregister(string)") ^
#   keccak256("snitchOn(string)") ^
#   keccak256("namespace()") ^
#   keccak256("oracle()"),
  # bytes4)))

struct DepositConfig:
  adapterEnabled: bool
  token: address
  minDeposit: uint256
  currentDeposits: uint256
  maxTotalDeposits: uint256

struct TimelockConfig:
  adapterEnabled: bool
  minTimelock: uint256 # TODO what is the base time interval here?

struct SnitchConfig:
    adapterEnabled: bool
    minDeposit: uint256
    minOracleDelay: uint256 # timestamps


@external
def __init__(
  # hardcode in contract or constructor args?
  ens_              :address,
  oracle_           :address,
  owner_            :address,
  xnhnsLib_         :address,
  depositAddr       :address,
  timelockAddr      :address,
  snitchAddr        :address,
  depositConfig     :DepositConfig,
  timelockConfig    :TimelockConfig,
  snitchConfig      :SnitchConfig
):
  """
    @notice

    @dev
    @param ens_ - ENS Registry for XNHNS on this chain
    @param oracle_ - Oracle to check for TLD ownership. Registrar must be whitelisted on oracle
    @param xnhnsLib
  """
  self.owner = owner_
  self.ens = ens_
  self.xnhnsLib = ILibHNSRegistrar(xnhnsLib_)
  self.oracle = IXNHNSOracle(oracle_)
  self.depositAdapter = DepositAdapter(depositAddr)
  self.timelockAdapter = TimelockAdapter(timelockAddr)

  self.depositAdapter.updateRegistrarConfig(depositConfig)
  self.timelockAdapter(depositAddr).updateRegistrarConfig(timelockConfig)
  self.snitchAdapter(snitchAddr).updateRegistrarConfig(snitchConfig)
  

@external
def verify(
  tld: String[1000],
  owner: address,
  deposit: uint256,
  timelock: uint256
) -> bytes32:
  assert ILibHNSRegistrar.isRegistrarEnabled(self.address, self.ens), 'Registrar disabled'

  node: bytes32 = self.xnhnsLib.toNamehash(tld)

  assert self.depositAdapter.increaseDeposit(node, owner, deposit)
  assert self.timelockAdapter.increaseTimelock(node, timelock)

  requestId: bytes32 = oracle.requestTLDUpdate(tld)

  log TLDMigrationRequested(node, msg.sender, deposit, timelock)
  return requestId


@external
def register(tld: String[1000]) -> bytes32:
  node: bytes32 = self.xnhnsLib.toNamehash(tld)
  assert self.xnhnsLib.isValidTLDOwner(tldOwner, msg.sender)

  self.xnhnsLib.getRoot(self.ens).register(node, tldOwner)
  log NewOwner(node, tldOwner)
  return node

@external 
def increaseDeposit(node: bytes32, from_: address, amount: uint256) -> bool:
  assert self.depositAdapter.increaseDeposit(node, from_, amount)
  return True

@external 
def decreaseDeposit(node: bytes32, to_: address, amount: uint256) -> bool:
  tldOwner: address = self.xnhnsLib.getOwnerOfNFTLD(node, ens)
  assert msg.sender == tldOwner, 'Only NFTLD holder can withdraw deposit'
  assert self.depositAdapter.decreaseDeposit(node, to_, amount)
  return True
  
@external
def unregister(node: bytes32):
  assert self.timelockAdapter.timelockEndBlock(node) <= block.timestamp, 'NFTLD timelocked'

  tldOwner: address = self.xnhnsLib.getOwnerOfNFTLD(node, ens)
  assert msg.sender == tldOwner, 'Only TLD owner can unregister'

  deposit, token = self._unregister(node)
  ERC20(token).safeTransferFrom(self.address, tldOwner, deposit)
  return True

@payable
@external
def snitch(tld: String[1000]) -> bytes32:
  assert ILibHNSRegistrar.isRegistrarEnabled(self.address, self.ens), 'Registrar disabled'
  minDeposit: uint256 = self.snitchAdapter.registrarConfigs(self.address).minDeposit
  assert msg.value == minDeposit, 'Insufficient snitch deposit'
  node: bytes32 = self.xnhnsLib.toNamehash(tld)
  assert self.snitchAdapter.snitch(node, msg.sender), 'Invalid TLD to snitch on'
  
  return oracle.requestTLDUpdate(tld)


@payable
@external
def claimSnitchReward(node: bytes32):
  success: bool = self.snitchAdapter.isSnitchSuccessful(node, self.address)
  if success:
    tldDeposit: uint256
    token: address
    snitch: address
    snitchDeposit: uint256
    _: uint256
    tldDeposit, token = self._unregister(node)
    snitch, _, snitchDeposit = self.snitchAdapter.getSnitch(node)
    send(snitch, snitchDeposit) # return their deposit
    ERC20(token).safeTransferFrom(self.address, snitch, tldDeposit / 2) # give them reward
    
    self.snitchAdapter.endActiveSnitch(node, token, tldDeposit)
    self.timelockhAdapter.removeTLD(node) # end timelock for invalid TLD
  else:
    # do nothing. keep deposit
    # make sure to include this otherwise snitch can steal all tokens in registrar
    self.snitchAdapter.endActiveSnitch(node, ZERO_ADDRESS, 0)


@external
@payable
def takeProfits():
  """
    @notice for ETH withdraws it relies on all snitch deposits strictly equaling the depositAmount
  """
  assert msg.sender == self.owner

  # self.snitchAdapter.getRegistrarConfig(self.address)
  token: address
  totalDeposits: uint256
  token, totalDeposits = self.depositAdapter.getRegistrarDeposits(self.address)
  withdrawableTokens: uint256 = ERC20(token).balanceOf(self.address) - totalDeposits
  ERC20(token).safeTransferFrom(self.address, self.owner, withdrawableTokens)
  
  snitchesAmnt: uint256
  snitchDepositAmnt : uint256
  snitchesAmnt, snitchDepositAmnt = self.snitchAdapter.getRegistrarSnitches(self.address)
  withdrawableETH = self.value - (snitchesAmnt * snitchDepositAmnt)
  send(self.owner, withdrawableETH)

  
  # get currDeposits for registrar - balanceOf(self.address)
  # get activeSnitches * snitchDeposit
  return True

@external
def updateOwner(owner_: address):
  assert msg.sender == self.owner
  self.owner = owner_

@internal
def _unregister(node: bytes32) -> (bytes32, address):
  self.xnhnsLib.getRoot(self.ens).unregister(node)
  return self.depositAdapter.tldDepositDetails(node)

@external
@view
def oracle() -> address:
  return address(oracle)

@external
@view
def namespace() -> String[10]:
  return namespace
