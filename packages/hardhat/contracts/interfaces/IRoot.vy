# @version 0.2.12

from vyper.interfaces import ERC721

implements: ERC721

interface IRoot:
  def setResolver(resolver: address): nonpayable
  def register(id: uint256,  owner_: address) ->  bool: nonpayable
  def unregister( id: uint256) ->  bool: nonpayable
  def reclaim(id: uint256,  owner_: address) ->  bool: nonpayable
  def getControllerForNFTLD(id: uint256) -> address: view
  def isController(controller: address) -> bool: view
