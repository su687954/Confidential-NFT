import { useState } from 'react';
import { parseEther } from '../utils/contract';
import toast from 'react-hot-toast';

const MintNFT = ({ onMint, mintPrice, maxSupply, totalSupply, isConnected }) => {
  const [isMinting, setIsMinting] = useState(false);
  const [mintAmount, setMintAmount] = useState(1);
  const [isBatchMint, setIsBatchMint] = useState(false);
  const [batchAddresses, setBatchAddresses] = useState(['']);

  const handleSingleMint = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    if (totalSupply >= maxSupply) {
      toast.error('已达到最大供应量');
      return;
    }

    setIsMinting(true);
    try {
      await onMint('single', { amount: mintAmount });
      toast.success(`成功铸造 ${mintAmount} 个NFT！`);
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('铸造失败：' + error.message);
    } finally {
      setIsMinting(false);
    }
  };

  const handleBatchMint = async () => {
    if (!isConnected) {
      toast.error('请先连接钱包');
      return;
    }

    const validAddresses = batchAddresses.filter(addr => 
      addr && addr.match(/^0x[a-fA-F0-9]{40}$/)
    );

    if (validAddresses.length === 0) {
      toast.error('请输入有效的地址');
      return;
    }

    if (totalSupply + validAddresses.length > maxSupply) {
      toast.error('超出最大供应量');
      return;
    }

    setIsMinting(true);
    try {
      await onMint('batch', { addresses: validAddresses });
      toast.success(`成功批量铸造 ${validAddresses.length} 个NFT！`);
      setBatchAddresses(['']);
    } catch (error) {
      console.error('Batch mint error:', error);
      toast.error('批量铸造失败：' + error.message);
    } finally {
      setIsMinting(false);
    }
  };

  const addBatchAddress = () => {
    setBatchAddresses([...batchAddresses, '']);
  };

  const removeBatchAddress = (index) => {
    if (batchAddresses.length > 1) {
      setBatchAddresses(batchAddresses.filter((_, i) => i !== index));
    }
  };

  const updateBatchAddress = (index, value) => {
    const newAddresses = [...batchAddresses];
    newAddresses[index] = value;
    setBatchAddresses(newAddresses);
  };

  const totalCost = isBatchMint 
    ? batchAddresses.filter(addr => addr && addr.match(/^0x[a-fA-F0-9]{40}$/)).length * parseFloat(mintPrice)
    : mintAmount * parseFloat(mintPrice);

  const remainingSupply = maxSupply - totalSupply;

  return (
    <div className="card space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">铸造机密NFT</h2>
        <p className="text-gray-400">
          每个NFT都具有加密的稀有度、力量值和价值属性
        </p>
      </div>

      {/* 供应量信息 */}
      <div className="bg-white/5 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-gray-400">铸造进度</span>
          <span className="text-white font-medium">
            {totalSupply} / {maxSupply}
          </span>
        </div>
        <div className="progress">
          <div 
            className="progress-bar" 
            style={{ width: `${(totalSupply / maxSupply) * 100}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-400 mt-2">
          <span>剩余: {remainingSupply}</span>
          <span>价格: {mintPrice} ETH</span>
        </div>
      </div>

      {/* 铸造模式切换 */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        <button
          onClick={() => setIsBatchMint(false)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            !isBatchMint 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          单个铸造
        </button>
        <button
          onClick={() => setIsBatchMint(true)}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            isBatchMint 
              ? 'bg-purple-500 text-white' 
              : 'text-gray-400 hover:text-white'
          }`}
        >
          批量铸造
        </button>
      </div>

      {/* 单个铸造 */}
      {!isBatchMint && (
        <div className="space-y-4">
          <div>
            <label className="label">铸造数量</label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setMintAmount(Math.max(1, mintAmount - 1))}
                disabled={mintAmount <= 1}
                className="w-10 h-10 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                -
              </button>
              <input
                type="number"
                min="1"
                max={Math.min(10, remainingSupply)}
                value={mintAmount}
                onChange={(e) => setMintAmount(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                className="flex-1 input text-center"
              />
              <button
                onClick={() => setMintAmount(Math.min(10, remainingSupply, mintAmount + 1))}
                disabled={mintAmount >= Math.min(10, remainingSupply)}
                className="w-10 h-10 bg-white/10 rounded-lg border border-white/20 flex items-center justify-center text-white hover:bg-white/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                +
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              最多一次铸造 10 个
            </p>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="flex justify-between items-center">
              <span className="text-purple-300">总费用</span>
              <span className="text-purple-300 font-bold text-lg">
                {totalCost.toFixed(4)} ETH
              </span>
            </div>
          </div>

          <button
            onClick={handleSingleMint}
            disabled={!isConnected || isMinting || remainingSupply === 0}
            className="w-full btn-primary py-3 text-lg flex items-center justify-center space-x-2"
          >
            {isMinting ? (
              <>
                <div className="loading-spinner" />
                <span>铸造中...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>铸造 {mintAmount} 个NFT</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 批量铸造 */}
      {isBatchMint && (
        <div className="space-y-4">
          <div>
            <label className="label">接收地址列表</label>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {batchAddresses.map((address, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => updateBatchAddress(index, e.target.value)}
                    placeholder={`地址 ${index + 1}: 0x...`}
                    className="flex-1 input"
                  />
                  {batchAddresses.length > 1 && (
                    <button
                      onClick={() => removeBatchAddress(index)}
                      className="w-10 h-10 bg-red-500/20 text-red-400 rounded-lg border border-red-500/20 flex items-center justify-center hover:bg-red-500/30 transition-all duration-200"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            <button
              onClick={addBatchAddress}
              disabled={batchAddresses.length >= 20}
              className="w-full mt-2 py-2 bg-white/5 border border-white/20 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + 添加地址 ({batchAddresses.length}/20)
            </button>
          </div>

          <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-purple-300">有效地址</span>
                <span className="text-purple-300">
                  {batchAddresses.filter(addr => addr && addr.match(/^0x[a-fA-F0-9]{40}$/)).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-purple-300">总费用</span>
                <span className="text-purple-300 font-bold text-lg">
                  {totalCost.toFixed(4)} ETH
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleBatchMint}
            disabled={!isConnected || isMinting || batchAddresses.filter(addr => addr && addr.match(/^0x[a-fA-F0-9]{40}$/)).length === 0}
            className="w-full btn-primary py-3 text-lg flex items-center justify-center space-x-2"
          >
            {isMinting ? (
              <>
                <div className="loading-spinner" />
                <span>批量铸造中...</span>
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <span>批量铸造</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* 提示信息 */}
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="text-blue-400 font-medium text-sm">关于机密NFT</p>
            <ul className="text-blue-300 text-sm mt-1 space-y-1">
              <li>• 每个NFT的属性都经过全同态加密保护</li>
              <li>• 只有获得查看权限的用户才能看到真实属性</li>
              <li>• 稀有度、力量值和价值都是随机生成的</li>
              <li>• 支持属性比较和NFT升级功能</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MintNFT;