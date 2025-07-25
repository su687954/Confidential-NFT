// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ConfidentialNFT
 * @dev 机密NFT合约，演示隐私保护的NFT属性管理
 */
contract ConfidentialNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // NFT属性结构体
    struct NFTAttributes {
        uint32 rarity;      // 稀有度 (1-5)
        uint32 power;       // 力量值 (1-1000)
        uint32 level;       // 等级 (1-100)
        uint64 value;       // 价值 (wei)
    }
    
    // 存储每个NFT的属性
    mapping(uint256 => NFTAttributes) private _attributes;
    
    // 存储每个NFT的价格
    mapping(uint256 => uint256) private _prices;
    
    // 查看权限映射: tokenId => viewer => hasPermission
    mapping(uint256 => mapping(address => bool)) private _viewingPermissions;
    
    // 铸造价格
    uint256 public mintPrice = 0.01 ether;
    
    // 最大供应量
    uint256 public maxSupply = 10000;
    
    // 事件
    event ConfidentialMint(address indexed to, uint256 indexed tokenId);
    event ViewingPermissionGranted(uint256 indexed tokenId, address indexed viewer);
    event ViewingPermissionRevoked(uint256 indexed tokenId, address indexed viewer);
    event PriceSet(uint256 indexed tokenId, uint256 price);
    event NFTUpgraded(uint256 indexed tokenId, uint32 newLevel);

    constructor(
        string memory name,
        string memory symbol
    ) ERC721(name, symbol) {
        _tokenIdCounter.increment(); // 从1开始
    }
    
    /**
     * @dev 铸造NFT
     * @param to 接收者地址
     */
    function mint(address to) external payable nonReentrant {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(totalSupply() < maxSupply, "Max supply reached");
        require(to != address(0), "Cannot mint to zero address");

        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        // 生成随机属性
        uint32 rarity = _generateRandomRarity();
        uint32 power = _generateRandomPower(rarity);
        uint32 level = 1;
        uint64 value = _calculateValue(rarity, power);

        // 存储属性
        _attributes[tokenId] = NFTAttributes({
            rarity: rarity,
            power: power,
            level: level,
            value: value
        });

        // 铸造NFT
        _safeMint(to, tokenId);
        
        // 默认给所有者查看权限
        _viewingPermissions[tokenId][to] = true;

        emit ConfidentialMint(to, tokenId);
    }
    
    /**
     * @dev 批量铸造
     * @param recipients 接收者地址数组
     */
    function batchMint(address[] calldata recipients) external payable nonReentrant onlyOwner {
        require(recipients.length > 0, "No recipients provided");
        require(totalSupply() + recipients.length <= maxSupply, "Would exceed max supply");
        require(msg.value >= mintPrice * recipients.length, "Insufficient payment");

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "Cannot mint to zero address");
            
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();

            // 生成随机属性
            uint32 rarity = _generateRandomRarity();
            uint32 power = _generateRandomPower(rarity);
            uint32 level = 1;
            uint64 value = _calculateValue(rarity, power);

            // 存储属性
            _attributes[tokenId] = NFTAttributes({
                rarity: rarity,
                power: power,
                level: level,
                value: value
            });

            // 铸造NFT
            _safeMint(recipients[i], tokenId);
            
            // 默认给所有者查看权限
            _viewingPermissions[tokenId][recipients[i]] = true;

            emit ConfidentialMint(recipients[i], tokenId);
        }
    }
    
    /**
     * @dev 设置NFT价格
     * @param tokenId NFT ID
     * @param price 价格
     */
    function setPrice(uint256 tokenId, uint256 price) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _prices[tokenId] = price;
        emit PriceSet(tokenId, price);
    }
    
    /**
     * @dev 授予查看权限
     * @param tokenId NFT ID
     * @param viewer 查看者地址
     */
    function grantViewPermission(uint256 tokenId, address viewer) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _viewingPermissions[tokenId][viewer] = true;
        emit ViewingPermissionGranted(tokenId, viewer);
    }
    
    /**
     * @dev 撤销查看权限
     * @param tokenId NFT ID
     * @param viewer 查看者地址
     */
    function revokeViewPermission(uint256 tokenId, address viewer) external {
        require(ownerOf(tokenId) == msg.sender, "Not the owner");
        _viewingPermissions[tokenId][viewer] = false;
        emit ViewingPermissionRevoked(tokenId, viewer);
    }
    
    /**
     * @dev 获取NFT属性（需要查看权限）
     * @param tokenId NFT ID
     * @return rarity 稀有度
     * @return power 力量值
     * @return level 等级
     * @return value 价值
     */
    function getAttributes(uint256 tokenId) 
        external 
        view 
        returns (uint32 rarity, uint32 power, uint32 level, uint64 value) 
    {
        require(_exists(tokenId), "Token does not exist");
        require(
            _viewingPermissions[tokenId][msg.sender] || 
            ownerOf(tokenId) == msg.sender,
            "No permission to view"
        );
        
        NFTAttributes memory attrs = _attributes[tokenId];
        
        rarity = attrs.rarity;
        power = attrs.power;
        level = attrs.level;
        value = attrs.value;
    }
    
    /**
     * @dev 获取NFT价格（需要权限）
     * @param tokenId NFT ID
     * @return price 价格
     */
    function getPrice(uint256 tokenId) external view returns (uint256 price) {
        require(_exists(tokenId), "Token does not exist");
        require(
            _viewingPermissions[tokenId][msg.sender] || 
            ownerOf(tokenId) == msg.sender,
            "No permission to view"
        );
        
        return _prices[tokenId];
    }
    
    /**
     * @dev 比较两个NFT的稀有度
     * @param tokenId1 第一个NFT ID
     * @param tokenId2 第二个NFT ID
     * @return isFirstRarer 第一个NFT是否更稀有
     */
    function compareRarity(uint256 tokenId1, uint256 tokenId2) 
        external 
        view 
        returns (bool isFirstRarer) 
    {
        require(_exists(tokenId1) && _exists(tokenId2), "Token does not exist");
        require(
            (_viewingPermissions[tokenId1][msg.sender] || ownerOf(tokenId1) == msg.sender) &&
            (_viewingPermissions[tokenId2][msg.sender] || ownerOf(tokenId2) == msg.sender),
            "No permission to compare"
        );
        
        return _attributes[tokenId1].rarity > _attributes[tokenId2].rarity;
    }
    
    /**
     * @dev 升级NFT等级（消耗其他NFT）
     * @param targetTokenId 目标NFT ID
     * @param sacrificeTokenId 牺牲的NFT ID
     */
    function upgradeLevel(uint256 targetTokenId, uint256 sacrificeTokenId) external {
        require(ownerOf(targetTokenId) == msg.sender, "Not the owner of target");
        require(ownerOf(sacrificeTokenId) == msg.sender, "Not the owner of sacrifice");
        require(targetTokenId != sacrificeTokenId, "Cannot sacrifice self");
        
        // 将牺牲NFT的力量值加到目标NFT上
        _attributes[targetTokenId].power += _attributes[sacrificeTokenId].power;
        
        // 提升目标NFT等级
        _attributes[targetTokenId].level += 1;
        
        // 销毁牺牲的NFT
        _burn(sacrificeTokenId);
        delete _attributes[sacrificeTokenId];
        delete _prices[sacrificeTokenId];
        
        emit NFTUpgraded(targetTokenId, _attributes[targetTokenId].level);
    }
    
    /**
     * @dev 设置铸造价格（仅所有者）
     */
    function setMintPrice(uint256 _mintPrice) external onlyOwner {
        mintPrice = _mintPrice;
    }
    
    /**
     * @dev 提取合约余额（仅所有者）
     */
    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
    
    /**
     * @dev 获取当前token ID计数
     */
    function getCurrentTokenId() external view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    /**
     * @dev 检查是否有查看权限
     */
    function hasViewPermission(uint256 tokenId, address viewer) external view returns (bool) {
        return _viewingPermissions[tokenId][viewer] || ownerOf(tokenId) == viewer;
    }
    
    // 重写必要的函数
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // 转移查看权限给新所有者
        if (to != address(0)) {
            _viewingPermissions[tokenId][to] = true;
        }
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    // 内部辅助函数
    
    /**
     * @dev 生成随机稀有度
     */
    function _generateRandomRarity() private view returns (uint32) {
        uint256 random = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _tokenIdCounter.current()
        ))) % 100;
        
        if (random < 50) return 1;      // 50% 普通
        if (random < 75) return 2;      // 25% 稀有
        if (random < 90) return 3;      // 15% 史诗
        if (random < 98) return 4;      // 8% 传说
        return 5;                       // 2% 神话
    }
    
    /**
     * @dev 根据稀有度生成随机力量值
     */
    function _generateRandomPower(uint32 rarity) private view returns (uint32) {
        uint256 baseRandom = uint256(keccak256(abi.encodePacked(
            block.timestamp,
            block.prevrandao,
            msg.sender,
            _tokenIdCounter.current(),
            rarity
        )));
        
        uint32 basePower = rarity * 100;
        uint32 randomBonus = uint32(baseRandom % (rarity * 50));
        
        return basePower + randomBonus;
    }
    
    /**
     * @dev 计算NFT价值
     */
    function _calculateValue(uint32 rarity, uint32 power) private pure returns (uint64) {
        return uint64(rarity * power * 1e15); // 基于稀有度和力量值计算价值
    }
}