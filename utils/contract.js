import { ethers } from 'ethers';
import ConfidentialNFTABI from '../artifacts/contracts/ConfidentialNFT.sol/ConfidentialNFT.json';

// 合约地址 - 部署后需要更新
const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

// 网络配置
const NETWORKS = {
  sepolia: {
    chainId: '0xAA36A7', // 11155111
    chainName: 'Sepolia Testnet',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: [`https://sepolia.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`],
    blockExplorerUrls: ['https://sepolia.etherscan.io'],
  },
  localhost: {
    chainId: '0x7A69', // 31337
    chainName: 'Hardhat Local',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18,
    },
    rpcUrls: ['http://localhost:8545'],
    blockExplorerUrls: [],
  },
};

// 获取提供者
export const getProvider = () => {
  if (typeof window !== 'undefined' && window.ethereum) {
    return new ethers.providers.Web3Provider(window.ethereum);
  }
  return null;
};

// 获取签名者
export const getSigner = () => {
  const provider = getProvider();
  return provider ? provider.getSigner() : null;
};

// 获取合约实例
export const getContract = (signerOrProvider) => {
  if (!CONTRACT_ADDRESS) {
    throw new Error('Contract address not configured');
  }
  return new ethers.Contract(CONTRACT_ADDRESS, ConfidentialNFTABI.abi, signerOrProvider);
};

// 连接钱包
export const connectWallet = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });
    
    if (accounts.length === 0) {
      throw new Error('No accounts found');
    }

    return accounts[0];
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw error;
  }
};

// 获取当前账户
export const getCurrentAccount = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });
    
    return accounts.length > 0 ? accounts[0] : null;
  } catch (error) {
    console.error('Error getting current account:', error);
    return null;
  }
};

// 切换网络
export const switchNetwork = async (networkName) => {
  if (typeof window === 'undefined' || !window.ethereum) {
    throw new Error('MetaMask not installed');
  }

  const network = NETWORKS[networkName];
  if (!network) {
    throw new Error(`Network ${networkName} not supported`);
  }

  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${network.chainId.toString(16)}` }],
    });
  } catch (switchError) {
    // 如果网络不存在，尝试添加
    if (switchError.code === 4902) {
      try {
        await window.ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${network.chainId.toString(16)}`,
              chainName: network.name,
              rpcUrls: [network.rpcUrl],
              nativeCurrency: {
                name: 'ETH',
                symbol: 'ETH',
                decimals: 18,
              },
            },
          ],
        });
      } catch (addError) {
        console.error('Error adding network:', addError);
        throw addError;
      }
    } else {
      console.error('Error switching network:', switchError);
      throw switchError;
    }
  }
};

// 获取当前网络
export const getCurrentNetwork = async () => {
  if (typeof window === 'undefined' || !window.ethereum) {
    return null;
  }

  try {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    const numericChainId = parseInt(chainId, 16);
    
    for (const [name, network] of Object.entries(NETWORKS)) {
      if (network.chainId === numericChainId) {
        return { name, ...network };
      }
    }
    
    return { name: 'Unknown', chainId: numericChainId };
  } catch (error) {
    console.error('Error getting current network:', error);
    return null;
  }
};

// 格式化地址
export const formatAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// 格式化以太币数量
export const formatEther = (value) => {
  if (!value) return '0';
  return ethers.utils.formatEther(value);
};

// 解析以太币数量
export const parseEther = (value) => {
  return ethers.utils.parseEther(value.toString());
};

// 等待交易确认
export const waitForTransaction = async (txHash, confirmations = 1) => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  return await provider.waitForTransaction(txHash, confirmations);
};

// 获取交易收据
export const getTransactionReceipt = async (txHash) => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  return await provider.getTransactionReceipt(txHash);
};

// 获取余额
export const getBalance = async (address) => {
  const provider = getProvider();
  if (!provider) {
    throw new Error('Provider not available');
  }

  return await provider.getBalance(address);
};

// 估算Gas费用
export const estimateGas = async (contract, method, params = [], value = 0) => {
  try {
    const gasEstimate = await contract.estimateGas[method](...params, {
      value: value > 0 ? parseEther(value) : 0,
    });
    return gasEstimate;
  } catch (error) {
    console.error('Error estimating gas:', error);
    throw error;
  }
};



// 错误处理
export const handleContractError = (error) => {
  console.error('Contract error:', error);
  
  if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
    return 'Gas estimation failed. The transaction may fail.';
  }
  
  if (error.code === 'INSUFFICIENT_FUNDS') {
    return 'Insufficient funds for transaction.';
  }
  
  if (error.code === 'USER_REJECTED') {
    return 'Transaction rejected by user.';
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unknown error occurred.';
};

// 导出网络配置
export { NETWORKS, CONTRACT_ADDRESS };