# 机密NFT项目 (Confidential NFT)

基于FHEVM（全同态加密虚拟机）的机密NFT项目，利用Zama的全同态加密技术保护NFT属性隐私。

## 🌟 项目特色

- **隐私保护**: 使用全同态加密技术保护NFT属性
- **机密属性**: 稀有度、力量值、等级和价值等属性完全加密
- **权限控制**: 只有获得授权的用户才能查看NFT真实属性
- **安全交易**: 支持加密状态下的属性比较和交易
- **现代界面**: 基于Next.js和Tailwind CSS的现代化Web界面

## 🛠 技术栈

### 智能合约
- **Solidity**: 智能合约开发语言
- **FHEVM**: Zama的全同态加密虚拟机
- **Hardhat**: 开发和部署框架
- **OpenZeppelin**: 安全的合约库

### 前端
- **Next.js**: React框架
- **Tailwind CSS**: 样式框架
- **ethers.js**: 以太坊交互库
- **fhevmjs**: FHEVM客户端库

## 📦 安装和设置

### 1. 克隆项目
```bash
git clone <repository-url>
cd 机密NFT
```

### 2. 安装依赖
```bash
npm install
```

### 3. 环境配置
复制环境变量模板并配置：
```bash
cp .env.example .env
```

编辑 `.env` 文件，填入以下信息：
```env
# 私钥（用于部署）
PRIVATE_KEY=your_private_key_here

# API密钥
INFURA_API_KEY=your_infura_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas报告
COINMARKETCAP_API_KEY=your_coinmarketcap_api_key
REPORT_GAS=true

# FHEVM配置
FHEVM_GATEWAY_URL=https://gateway.zama.ai
FHEVM_NETWORK_URL=https://devnet.zama.ai

# 前端配置
NEXT_PUBLIC_CONTRACT_ADDRESS=
NEXT_PUBLIC_NETWORK_ID=8009
```

## 🚀 部署和运行

### 1. 编译合约
```bash
npm run compile
```

### 2. 运行测试
```bash
npm run test
```

### 3. 部署合约

#### 本地网络
```bash
# 启动本地节点
npm run node

# 部署到本地网络
npm run deploy:localhost
```

#### FHEVM测试网
```bash
npm run deploy:fhevm
```

#### Sepolia测试网
```bash
npm run deploy:sepolia
```

### 4. 启动前端
```bash
npm run dev
```

访问 http://localhost:3000 查看应用。

## 📋 合约功能

### 核心功能
- **机密铸造**: 铸造具有加密属性的NFT
- **批量铸造**: 支持批量铸造到多个地址
- **权限管理**: 授予/撤销属性查看权限
- **属性查询**: 查询加密的NFT属性
- **属性比较**: 比较两个NFT的加密稀有度
- **NFT升级**: 提升NFT等级
- **价格设置**: 设置机密销售价格

### 管理功能
- **铸造价格**: 设置NFT铸造价格
- **资金提取**: 提取合约中的资金
- **所有者权限**: 合约所有者专用功能

## 🎮 使用指南

### 1. 连接钱包
- 点击"连接钱包"按钮
- 选择MetaMask或其他兼容钱包
- 确保连接到正确的网络

### 2. 铸造NFT
- 选择铸造数量或使用批量铸造
- 支付相应的铸造费用
- 等待交易确认

### 3. 查看NFT
- 在"我的NFT"部分查看拥有的NFT
- 默认情况下只能看到加密状态的属性
- 需要获得查看权限才能看到真实属性

### 4. 管理权限
- NFT所有者可以授予他人查看权限
- 也可以撤销已授予的权限
- 权限控制确保隐私安全

### 5. 转移NFT
- 点击NFT卡片上的"转移"按钮
- 输入接收者地址
- 确认转移交易

## 🔒 隐私特性

### 全同态加密
- 所有NFT属性都使用FHE加密
- 支持加密状态下的计算
- 无需解密即可进行比较操作

### 属性保护
- **稀有度**: 1-5级稀有度完全加密
- **力量值**: 随机生成的力量值加密存储
- **等级**: NFT等级信息加密保护
- **价值**: 估值信息加密存储

### 权限控制
- 基于地址的查看权限
- 所有者可控制谁能查看属性
- 支持权限的授予和撤销

## 🧪 测试

项目包含完整的测试套件：

```bash
# 运行所有测试
npm run test

# 运行特定测试
npx hardhat test test/ConfidentialNFT.test.js

# 生成覆盖率报告
npm run coverage
```

## 📁 项目结构

```
机密NFT/
├── contracts/              # 智能合约
│   └── ConfidentialNFT.sol
├── scripts/                # 部署脚本
│   └── deploy.js
├── test/                   # 测试文件
│   └── ConfidentialNFT.test.js
├── pages/                  # Next.js页面
│   ├── index.js
│   └── _app.js
├── components/             # React组件
│   ├── WalletConnect.js
│   ├── NFTCard.js
│   └── MintNFT.js
├── styles/                 # 样式文件
│   └── globals.css
├── utils/                  # 工具函数
│   └── contract.js
├── hardhat.config.js       # Hardhat配置
├── next.config.js          # Next.js配置
├── tailwind.config.js      # Tailwind配置
└── package.json
```

## 🌐 网络支持

- **FHEVM Testnet**: 主要测试网络
- **Localhost**: 本地开发网络
- **Sepolia**: 以太坊测试网络

## 🔧 开发工具

- **Hardhat**: 智能合约开发框架
- **Ethers.js**: 以太坊交互库
- **Chai**: 测试断言库
- **Solhint**: Solidity代码检查
- **Prettier**: 代码格式化

## 📚 相关资源

- [Zama FHEVM文档](https://docs.zama.ai/fhevm)
- [全同态加密介绍](https://docs.zama.ai/fhe-introduction)
- [Hardhat文档](https://hardhat.org/docs)
- [Next.js文档](https://nextjs.org/docs)
- [Tailwind CSS文档](https://tailwindcss.com/docs)

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件。

## ⚠️ 免责声明

本项目仅用于教育和演示目的。在生产环境中使用前，请进行充分的安全审计。

---

**注意**: 这是一个基于FHEVM的实验性项目，展示了全同态加密在NFT隐私保护方面的应用。请确保在使用前了解相关技术和风险。