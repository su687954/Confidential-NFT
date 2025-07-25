const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署机密NFT合约...");
  
  // 获取部署者账户
  const [deployer] = await ethers.getSigners();
  console.log("部署账户:", deployer.address);
  
  // 获取账户余额
  const balance = await deployer.getBalance();
  console.log("账户余额:", ethers.utils.formatEther(balance), "ETH");
  
  // 获取合约工厂
  const ConfidentialNFT = await ethers.getContractFactory("ConfidentialNFT");
  
  console.log("正在部署合约...");
  
  // 部署合约 - 提供构造函数参数
  const confidentialNFT = await ConfidentialNFT.deploy("Confidential NFT", "CNFT");
  
  // 等待部署完成
  await confidentialNFT.deployed();
  
  console.log("✅ 机密NFT合约部署成功!");
  console.log("合约地址:", confidentialNFT.address);
  console.log("部署交易哈希:", confidentialNFT.deployTransaction.hash);
  
  // 获取部署后的合约信息
  const name = await confidentialNFT.name();
  const symbol = await confidentialNFT.symbol();
  const mintPrice = await confidentialNFT.mintPrice();
  const maxSupply = await confidentialNFT.maxSupply();
  
  console.log("\n=== 合约信息 ===");
  console.log("名称:", name);
  console.log("符号:", symbol);
  console.log("铸造价格:", ethers.utils.formatEther(mintPrice), "ETH");
  console.log("最大供应量:", maxSupply.toString());
  
  // 验证合约（如果在测试网或主网）
  if (network.name !== "hardhat" && network.name !== "localhost") {
    console.log("\n等待区块确认以进行合约验证...");
    await confidentialNFT.deployTransaction.wait(6);
    
    try {
      await hre.run("verify:verify", {
        address: confidentialNFT.address,
        constructorArguments: [],
      });
      console.log("✅ 合约验证成功!");
    } catch (error) {
      console.log("❌ 合约验证失败:", error.message);
    }
  }
  
  // 保存部署信息
  const deploymentInfo = {
    network: network.name,
    contractAddress: confidentialNFT.address,
    deployerAddress: deployer.address,
    deploymentHash: confidentialNFT.deployTransaction.hash,
    blockNumber: confidentialNFT.deployTransaction.blockNumber,
    timestamp: new Date().toISOString(),
    contractInfo: {
      name,
      symbol,
      mintPrice: ethers.utils.formatEther(mintPrice),
      maxSupply: maxSupply.toString()
    }
  };
  
  // 写入部署信息到文件
  const fs = require('fs');
  const path = require('path');
  
  const deploymentsDir = path.join(__dirname, '..', 'deployments');
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }
  
  const deploymentFile = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  
  console.log(`\n📄 部署信息已保存到: ${deploymentFile}`);
  
  return confidentialNFT;
}

// 错误处理
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });