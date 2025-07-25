import { useState, useEffect } from 'react';
import { connectWallet, getCurrentNetwork, switchNetwork, formatAddress } from '../utils/contract';
import toast from 'react-hot-toast';

const WalletConnect = ({ onConnect, onDisconnect }) => {
  const [account, setAccount] = useState(null);
  const [network, setNetwork] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    checkConnection();
    setupEventListeners();
    
    return () => {
      removeEventListeners();
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const currentNetwork = await getCurrentNetwork();
          setNetwork(currentNetwork);
          onConnect?.(accounts[0]);
        }
      } catch (error) {
        console.error('Error checking connection:', error);
      }
    }
  };

  const setupEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }
  };

  const removeEventListeners = () => {
    if (typeof window !== 'undefined' && window.ethereum) {
      window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      window.ethereum.removeListener('chainChanged', handleChainChanged);
    }
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      setAccount(null);
      setNetwork(null);
      onDisconnect?.();
      toast.error('钱包已断开连接');
    } else {
      setAccount(accounts[0]);
      onConnect?.(accounts[0]);
      toast.success('账户已切换');
    }
  };

  const handleChainChanged = async () => {
    const currentNetwork = await getCurrentNetwork();
    setNetwork(currentNetwork);
    toast.success(`网络已切换到 ${currentNetwork?.name || '未知网络'}`);
  };

  const handleConnect = async () => {
    if (isConnecting) return;
    
    setIsConnecting(true);
    try {
      const connectedAccount = await connectWallet();
      setAccount(connectedAccount);
      const currentNetwork = await getCurrentNetwork();
      setNetwork(currentNetwork);
      onConnect?.(connectedAccount);
      toast.success('钱包连接成功！');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('钱包连接失败：' + error.message);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    setAccount(null);
    setNetwork(null);
    onDisconnect?.();
    toast.success('钱包已断开连接');
  };

  const handleNetworkSwitch = async (networkName) => {
    try {
      await switchNetwork(networkName);
      setIsDropdownOpen(false);
    } catch (error) {
      console.error('Network switch error:', error);
      toast.error('网络切换失败：' + error.message);
    }
  };

  const getNetworkColor = (networkName) => {
    switch (networkName) {
      case 'Sepolia':
        return 'text-blue-400';
      case 'Localhost':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  const getNetworkDot = (networkName) => {
    switch (networkName) {
      case 'Sepolia':
        return 'bg-blue-400';
      case 'Localhost':
        return 'bg-green-400';
      default:
        return 'bg-gray-400';
    }
  };

  if (!account) {
    return (
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="btn-primary flex items-center space-x-2"
      >
        {isConnecting ? (
          <>
            <div className="loading-spinner" />
            <span>连接中...</span>
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>连接钱包</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center space-x-3">
        {/* 网络指示器 */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center space-x-2 px-3 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/20 transition-all duration-200"
          >
            <div className={`w-2 h-2 rounded-full ${getNetworkDot(network?.name)}`} />
            <span className={`text-sm font-medium ${getNetworkColor(network?.name)}`}>
              {network?.name || '未知网络'}
            </span>
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* 网络切换下拉菜单 */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-48 bg-slate-800 rounded-lg border border-white/20 shadow-xl z-50 animate-slide-down">
              <div className="p-2">
                <div className="text-xs text-gray-400 px-3 py-2 font-medium">切换网络</div>
                {Object.entries({
                  localhost: 'Localhost',
                  sepolia: 'Sepolia'
                }).map(([key, name]) => (
                  <button
                    key={key}
                    onClick={() => handleNetworkSwitch(key)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-white/10 transition-all duration-200 ${
                      network?.name === name ? 'bg-white/10' : ''
                    }`}
                  >
                    <div className={`w-2 h-2 rounded-full ${getNetworkDot(name)}`} />
                    <span className={`text-sm ${getNetworkColor(name)}`}>{name}</span>
                    {network?.name === name && (
                      <svg className="w-4 h-4 text-green-400 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 账户信息 */}
        <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white">{formatAddress(account)}</span>
            <span className="text-xs text-gray-400">已连接</span>
          </div>
          <button
            onClick={handleDisconnect}
            className="p-2 text-gray-400 hover:text-red-400 transition-colors duration-200"
            title="断开连接"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>

      {/* 点击外部关闭下拉菜单 */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default WalletConnect;