import { useState, useEffect } from 'react';
import Head from 'next/head';
import { ethers } from 'ethers';
import WalletConnect from '../components/WalletConnect';
import MintNFT from '../components/MintNFT';
import NFTCard from '../components/NFTCard';
import { getContract, connectWallet, getCurrentAccount } from '../utils/contract';

export default function Home() {
  const [account, setAccount] = useState(null);
  const [contract, setContract] = useState(null);
  const [stats, setStats] = useState({
    totalSupply: 0,
    maxSupply: 10000,
    mintPrice: '0.01',
    userBalance: 0
  });
  const [loading, setLoading] = useState(false);
  const [userNFTs, setUserNFTs] = useState([]);

  // 初始化
  useEffect(() => {
    const init = async () => {
      const currentAccount = await getCurrentAccount();
      if (currentAccount) {
        setAccount(currentAccount);
        const contractInstance = await getContract();
        setContract(contractInstance);
      }
    };
    init();
  }, []);

  // 获取合约统计信息
  const fetchStats = async () => {
    if (!contract) return;
    
    try {
      setLoading(true);
      
      const [currentTokenId, maxSupply, mintPrice] = await Promise.all([
        contract.getCurrentTokenId(),
        contract.maxSupply(),
        contract.mintPrice()
      ]);
      
      let userBalance = 0;
      if (account) {
        userBalance = await contract.balanceOf(account);
      }
      
      setStats({
        totalSupply: currentTokenId.toNumber(),
        maxSupply: maxSupply.toNumber(),
        mintPrice: ethers.utils.formatEther(mintPrice),
        userBalance: userBalance.toNumber()
      });
    } catch (error) {
      console.error('获取统计信息失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 获取用户NFT
  const fetchUserNFTs = async () => {
    if (!contract || !account) return;
    
    try {
      const balance = await contract.balanceOf(account);
      const nfts = [];
      
      for (let i = 0; i < balance.toNumber(); i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(account, i);
        const attributes = await contract.getAttributes(tokenId);
        nfts.push({
          tokenId: tokenId.toNumber(),
          rarity: attributes.rarity,
          power: attributes.power,
          level: attributes.level,
          value: attributes.value
        });
      }
      
      setUserNFTs(nfts);
    } catch (error) {
      console.error('获取用户NFT失败:', error);
    }
  };

  useEffect(() => {
    if (contract && account) {
      fetchStats();
      fetchUserNFTs();
    }
  }, [contract, account]);

  const handleWalletConnect = async () => {
    try {
      const connectedAccount = await connectWallet();
      if (connectedAccount) {
        setAccount(connectedAccount);
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();
        const contractInstance = getContract(signer);
        setContract(contractInstance);
      }
    } catch (error) {
      console.error('连接钱包失败:', error);
    }
  };

  return (
    <>
      <Head>
        <title>机密NFT - 基于区块链的NFT平台</title>
        <meta name="description" content="基于区块链技术的NFT铸造和交易平台" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* 背景装饰 */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse-slow"></div>
        </div>

        <div className="relative z-10">
          {/* 头部导航 */}
          <nav className="flex justify-between items-center p-6">
            <h1 className="text-2xl font-bold text-white">机密NFT</h1>
            <WalletConnect onConnect={handleWalletConnect} account={account} />
          </nav>

          {/* 主要内容 */}
          <main className="container mx-auto px-4 py-8">
            {/* 英雄区域 */}
            <section className="text-center py-20">
              <div className="max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
                  机密<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">NFT</span>
                </h1>
                <p className="text-xl md:text-2xl text-gray-300 mb-8">
                  基于区块链技术的NFT平台
                </p>
                <p className="text-lg text-gray-400 mb-12 max-w-2xl mx-auto">
                  铸造、收集和交易独特的数字资产。每个NFT都具有独特的稀有度、力量值和价值属性。
                </p>
              </div>
            </section>

            {/* 统计信息 */}
            {!loading && (
              <section className="mb-12">
                <div className="grid md:grid-cols-4 gap-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                    <h3 className="text-2xl font-bold text-white">{stats.totalSupply}</h3>
                    <p className="text-gray-300">已铸造</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                    <h3 className="text-2xl font-bold text-white">{stats.maxSupply}</h3>
                    <p className="text-gray-300">最大供应量</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                    <h3 className="text-2xl font-bold text-white">{stats.mintPrice} ETH</h3>
                    <p className="text-gray-300">铸造价格</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 text-center">
                    <h3 className="text-2xl font-bold text-white">{stats.userBalance}</h3>
                    <p className="text-gray-300">您的NFT</p>
                  </div>
                </div>
              </section>
            )}

            {/* 铸造区域 */}
            {account && contract && (
              <section className="mb-12">
                <MintNFT />
              </section>
            )}

            {/* NFT画廊 */}
            {account && userNFTs.length > 0 && (
              <section className="mb-12">
                <h2 className="text-3xl font-bold text-white mb-8 text-center">我的NFT</h2>
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {userNFTs.map((nft) => (
                    <NFTCard key={nft.tokenId} nft={nft} />
                  ))}
                </div>
              </section>
            )}

            {/* 连接钱包提示 */}
            {!account && (
              <section className="text-center py-20">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 max-w-md mx-auto">
                  <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">连接钱包开始</h3>
                  <p className="text-gray-300 mb-8">连接您的钱包以铸造和管理NFT</p>
                  <button
                    onClick={handleWalletConnect}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 px-6 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200"
                  >
                    连接钱包
                  </button>
                </div>
              </section>
            )}


          </main>

          {/* 页脚 */}
          <footer className="border-t border-white/10 py-8">
            <div className="container mx-auto px-4 text-center">
              <p className="text-gray-400">
                © 2024 机密NFT. 基于区块链技术构建
              </p>
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}