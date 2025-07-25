const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ConfidentialNFT", function () {
  let confidentialNFT;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  
  const mintPrice = ethers.utils.parseEther("0.01");
  
  beforeEach(async function () {
    // 获取测试账户
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // 部署合约
    const ConfidentialNFT = await ethers.getContractFactory("ConfidentialNFT");
    confidentialNFT = await ConfidentialNFT.deploy();
    await confidentialNFT.deployed();
  });
  
  describe("部署", function () {
    it("应该设置正确的名称和符号", async function () {
      expect(await confidentialNFT.name()).to.equal("ConfidentialNFT");
      expect(await confidentialNFT.symbol()).to.equal("CNFT");
    });
    
    it("应该设置正确的所有者", async function () {
      expect(await confidentialNFT.owner()).to.equal(owner.address);
    });
    
    it("应该设置正确的铸造价格", async function () {
      expect(await confidentialNFT.mintPrice()).to.equal(mintPrice);
    });
    
    it("应该设置正确的最大供应量", async function () {
      expect(await confidentialNFT.MAX_SUPPLY()).to.equal(10000);
    });
  });
  
  describe("铸造", function () {
    const tokenURI = "https://example.com/token/1";
    const encryptedRarity = "0x1234"; // 模拟加密数据
    const encryptedPower = "0x5678";
    const encryptedLevel = "0x9abc";
    const encryptedValue = "0xdef0";
    
    it("应该允许用户铸造NFT", async function () {
      await expect(
        confidentialNFT.connect(addr1).confidentialMint(
          addr1.address,
          tokenURI,
          encryptedRarity,
          encryptedPower,
          encryptedLevel,
          encryptedValue,
          { value: mintPrice }
        )
      ).to.emit(confidentialNFT, "ConfidentialMint")
        .withArgs(addr1.address, 0);
      
      expect(await confidentialNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await confidentialNFT.tokenURI(0)).to.equal(tokenURI);
    });
    
    it("应该拒绝支付不足的铸造", async function () {
      const insufficientPayment = ethers.utils.parseEther("0.005");
      
      await expect(
        confidentialNFT.connect(addr1).confidentialMint(
          addr1.address,
          tokenURI,
          encryptedRarity,
          encryptedPower,
          encryptedLevel,
          encryptedValue,
          { value: insufficientPayment }
        )
      ).to.be.revertedWith("Insufficient payment");
    });
    
    it("应该正确增加token ID计数", async function () {
      expect(await confidentialNFT.getCurrentTokenId()).to.equal(0);
      
      await confidentialNFT.connect(addr1).confidentialMint(
        addr1.address,
        tokenURI,
        encryptedRarity,
        encryptedPower,
        encryptedLevel,
        encryptedValue,
        { value: mintPrice }
      );
      
      expect(await confidentialNFT.getCurrentTokenId()).to.equal(1);
    });
  });
  
  describe("批量铸造", function () {
    it("应该允许批量铸造NFT", async function () {
      const recipients = [addr1.address, addr2.address];
      const uris = ["https://example.com/1", "https://example.com/2"];
      const encryptedData = ["0x1234", "0x5678"];
      const totalPayment = mintPrice.mul(2);
      
      await confidentialNFT.connect(addr1).batchConfidentialMint(
        recipients,
        uris,
        encryptedData, // rarity
        encryptedData, // power
        encryptedData, // level
        encryptedData, // value
        { value: totalPayment }
      );
      
      expect(await confidentialNFT.ownerOf(0)).to.equal(addr1.address);
      expect(await confidentialNFT.ownerOf(1)).to.equal(addr2.address);
      expect(await confidentialNFT.getCurrentTokenId()).to.equal(2);
    });
    
    it("应该拒绝数组长度不匹配", async function () {
      const recipients = [addr1.address];
      const uris = ["https://example.com/1", "https://example.com/2"];
      const encryptedData = ["0x1234"];
      
      await expect(
        confidentialNFT.connect(addr1).batchConfidentialMint(
          recipients,
          uris,
          encryptedData,
          encryptedData,
          encryptedData,
          encryptedData,
          { value: mintPrice }
        )
      ).to.be.revertedWith("Arrays length mismatch");
    });
    
    it("应该拒绝铸造过多NFT", async function () {
      const recipients = new Array(11).fill(addr1.address);
      const uris = new Array(11).fill("https://example.com/1");
      const encryptedData = new Array(11).fill("0x1234");
      const totalPayment = mintPrice.mul(11);
      
      await expect(
        confidentialNFT.connect(addr1).batchConfidentialMint(
          recipients,
          uris,
          encryptedData,
          encryptedData,
          encryptedData,
          encryptedData,
          { value: totalPayment }
        )
      ).to.be.revertedWith("Too many tokens to mint");
    });
  });
  
  describe("权限管理", function () {
    beforeEach(async function () {
      // 铸造一个NFT用于测试
      await confidentialNFT.connect(addr1).confidentialMint(
        addr1.address,
        "https://example.com/1",
        "0x1234",
        "0x5678",
        "0x9abc",
        "0xdef0",
        { value: mintPrice }
      );
    });
    
    it("应该允许所有者授予查看权限", async function () {
      await expect(
        confidentialNFT.connect(addr1).grantViewPermission(0, addr2.address)
      ).to.emit(confidentialNFT, "ViewPermissionGranted")
        .withArgs(0, addr2.address);
      
      expect(await confidentialNFT.hasViewPermission(0, addr2.address)).to.be.true;
    });
    
    it("应该允许所有者撤销查看权限", async function () {
      // 先授予权限
      await confidentialNFT.connect(addr1).grantViewPermission(0, addr2.address);
      
      // 然后撤销权限
      await expect(
        confidentialNFT.connect(addr1).revokeViewPermission(0, addr2.address)
      ).to.emit(confidentialNFT, "ViewPermissionRevoked")
        .withArgs(0, addr2.address);
      
      expect(await confidentialNFT.hasViewPermission(0, addr2.address)).to.be.false;
    });
    
    it("应该拒绝非所有者授予权限", async function () {
      await expect(
        confidentialNFT.connect(addr2).grantViewPermission(0, addr2.address)
      ).to.be.revertedWith("Not the owner");
    });
  });
  
  describe("管理功能", function () {
    it("应该允许所有者设置铸造价格", async function () {
      const newPrice = ethers.utils.parseEther("0.02");
      
      await confidentialNFT.connect(owner).setMintPrice(newPrice);
      expect(await confidentialNFT.mintPrice()).to.equal(newPrice);
    });
    
    it("应该拒绝非所有者设置铸造价格", async function () {
      const newPrice = ethers.utils.parseEther("0.02");
      
      await expect(
        confidentialNFT.connect(addr1).setMintPrice(newPrice)
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
    
    it("应该允许所有者提取资金", async function () {
      // 先铸造一些NFT以产生资金
      await confidentialNFT.connect(addr1).confidentialMint(
        addr1.address,
        "https://example.com/1",
        "0x1234",
        "0x5678",
        "0x9abc",
        "0xdef0",
        { value: mintPrice }
      );
      
      const initialBalance = await owner.getBalance();
      const contractBalance = await ethers.provider.getBalance(confidentialNFT.address);
      
      const tx = await confidentialNFT.connect(owner).withdraw();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed.mul(receipt.effectiveGasPrice);
      
      const finalBalance = await owner.getBalance();
      
      expect(finalBalance).to.equal(
        initialBalance.add(contractBalance).sub(gasUsed)
      );
    });
  });
  
  describe("转账", function () {
    beforeEach(async function () {
      // 铸造一个NFT用于测试
      await confidentialNFT.connect(addr1).confidentialMint(
        addr1.address,
        "https://example.com/1",
        "0x1234",
        "0x5678",
        "0x9abc",
        "0xdef0",
        { value: mintPrice }
      );
    });
    
    it("应该在转账时触发机密转账事件", async function () {
      await expect(
        confidentialNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 0)
      ).to.emit(confidentialNFT, "ConfidentialTransfer")
        .withArgs(addr1.address, addr2.address, 0);
      
      expect(await confidentialNFT.ownerOf(0)).to.equal(addr2.address);
    });
    
    it("应该给新所有者查看权限", async function () {
      await confidentialNFT.connect(addr1).transferFrom(addr1.address, addr2.address, 0);
      
      expect(await confidentialNFT.hasViewPermission(0, addr2.address)).to.be.true;
    });
  });
});