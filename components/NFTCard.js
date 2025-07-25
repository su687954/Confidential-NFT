import { useState } from 'react';
import { formatAddress } from '../utils/contract';
import toast from 'react-hot-toast';

const NFTCard = ({ nft, onTransfer, onViewDetails, canView = false }) => {
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferAddress, setTransferAddress] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);

  const handleTransfer = async () => {
    if (!transferAddress) {
      toast.error('请输入接收地址');
      return;
    }

    if (!transferAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
      toast.error('请输入有效的以太坊地址');
      return;
    }

    setIsTransferring(true);
    try {
      await onTransfer(nft.tokenId, transferAddress);
      setIsTransferModalOpen(false);
      setTransferAddress('');
      toast.success('NFT转移成功！');
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error('转移失败：' + error.message);
    } finally {
      setIsTransferring(false);
    }
  };

  const getRarityColor = (rarity) => {
    if (!canView) return 'text-gray-400';
    
    switch (rarity) {
      case 1:
        return 'text-gray-400'; // 普通
      case 2:
        return 'text-green-400'; // 稀有
      case 3:
        return 'text-blue-400'; // 史诗
      case 4:
        return 'text-purple-400'; // 传说
      case 5:
        return 'text-yellow-400'; // 神话
      default:
        return 'text-gray-400';
    }
  };

  const getRarityName = (rarity) => {
    if (!canView) return '机密';
    
    switch (rarity) {
      case 1:
        return '普通';
      case 2:
        return '稀有';
      case 3:
        return '史诗';
      case 4:
        return '传说';
      case 5:
        return '神话';
      default:
        return '未知';
    }
  };

  const getRarityGradient = (rarity) => {
    if (!canView) return 'from-gray-500 to-gray-600';
    
    switch (rarity) {
      case 1:
        return 'from-gray-500 to-gray-600';
      case 2:
        return 'from-green-500 to-green-600';
      case 3:
        return 'from-blue-500 to-blue-600';
      case 4:
        return 'from-purple-500 to-purple-600';
      case 5:
        return 'from-yellow-500 to-yellow-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  return (
    <>
      <div className="card-hover group relative overflow-hidden">
        {/* NFT图片/占位符 */}
        <div className={`aspect-square bg-gradient-to-br ${getRarityGradient(nft.rarity)} rounded-lg mb-4 flex items-center justify-center relative overflow-hidden`}>
          <div className="absolute inset-0 bg-black/20" />
          <div className="relative z-10 text-center">
            <div className="w-16 h-16 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="text-white font-bold text-lg">#{nft.tokenId}</div>
            <div className={`text-sm font-medium ${getRarityColor(nft.rarity)}`}>
              {getRarityName(nft.rarity)}
            </div>
          </div>
          
          {/* 机密标识 */}
          {!canView && (
            <div className="absolute top-2 right-2 bg-red-500/80 backdrop-blur-sm px-2 py-1 rounded-full">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          )}
        </div>

        {/* NFT信息 */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">机密NFT #{nft.tokenId}</h3>
            <span className={`badge ${canView ? 'badge-success' : 'badge-warning'}`}>
              {canView ? '可见' : '机密'}
            </span>
          </div>

          {/* 属性信息 */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="space-y-1">
              <div className="text-gray-400">稀有度</div>
              <div className={`font-medium ${getRarityColor(nft.rarity)}`}>
                {getRarityName(nft.rarity)}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">力量值</div>
              <div className="font-medium text-white">
                {canView ? nft.power || '???' : '***'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">等级</div>
              <div className="font-medium text-white">
                {canView ? `Lv.${nft.level || 1}` : 'Lv.***'}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-gray-400">价值</div>
              <div className="font-medium text-white">
                {canView ? `${nft.value || '???'} ETH` : '*** ETH'}
              </div>
            </div>
          </div>

          {/* 所有者信息 */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-gray-400 text-xs mb-1">所有者</div>
            <div className="text-white text-sm font-mono">
              {formatAddress(nft.owner)}
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex space-x-2 pt-3">
            <button
              onClick={() => onViewDetails(nft)}
              className="flex-1 btn-secondary text-sm py-2"
            >
              查看详情
            </button>
            {nft.isOwner && (
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="flex-1 btn-outline text-sm py-2"
              >
                转移
              </button>
            )}
          </div>
        </div>

        {/* 悬停效果 */}
        <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-xl" />
      </div>

      {/* 转移模态框 */}
      {isTransferModalOpen && (
        <div className="modal-overlay" onClick={() => setIsTransferModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="text-xl font-semibold text-white">转移 NFT #{nft.tokenId}</h3>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="modal-body space-y-4">
              <div>
                <label className="label">接收地址</label>
                <input
                  type="text"
                  value={transferAddress}
                  onChange={(e) => setTransferAddress(e.target.value)}
                  placeholder="0x..."
                  className="input"
                />
                <p className="text-xs text-gray-400 mt-1">
                  请输入有效的以太坊地址
                </p>
              </div>
              
              <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <div>
                    <p className="text-yellow-400 font-medium text-sm">注意</p>
                    <p className="text-yellow-300 text-sm mt-1">
                      转移后，您将失去对此NFT的所有权。此操作不可撤销。
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="btn-secondary"
                disabled={isTransferring}
              >
                取消
              </button>
              <button
                onClick={handleTransfer}
                disabled={isTransferring || !transferAddress}
                className="btn-primary flex items-center space-x-2"
              >
                {isTransferring ? (
                  <>
                    <div className="loading-spinner" />
                    <span>转移中...</span>
                  </>
                ) : (
                  <span>确认转移</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default NFTCard;