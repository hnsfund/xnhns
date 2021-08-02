# @version 0.2.12

interface IRoot:
  # xnhns Root interface
  def setResolver(resolver: address): nonpayable
  def register(id: uint256,  owner_: address) ->  bool: nonpayable
  def unregister( id: uint256) ->  bool: nonpayable
  def reclaim(id: uint256,  owner_: address) ->  bool: nonpayable
  def getControllerOfNFTLD(id: uint256) -> address: view
  def isController(controller: address) -> bool: view

  # ERC721 interface
  def ownerOf( _tokenId: uint256) -> address: view
  def safeTransferFrom( _from: address, _to: address , _tokenId: uint256 ) : payable
  def approve( _approved: address, _tokenId: uint256 ) : payable
  def setApprovalForAll( _operator: address,  _approved: bool): nonpayable
  def getApproved( _tokenId: uint256) -> address: view
  def isApprovedForAll( _owner: address,  _operator: address) -> bool: view
