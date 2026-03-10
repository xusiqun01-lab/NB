import React, { useState, useEffect } from 'react';
import { Plus, Trash2, ExternalLink, Key, Check } from 'lucide-react';

interface ApiProvider {
  id: string;
  name: string;
  description: string;
  registerUrl: string;
  icon: string;
}

interface ApiKey {
  id: string;
  provider: string;
  name: string;
  key: string;
  createdAt: string;
}

export const ApiSettings: React.FC = () => {
  const [providers, setProviders] = useState<ApiProvider[]>([]);
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [newKey, setNewKey] = useState('');
  const [keyName, setKeyName] = useState('');

  useEffect(() => {
    fetchProviders();
    fetchApiKeys();
  }, []);

  const fetchProviders = async () => {
    const res = await fetch('/api/providers', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setProviders(Object.entries(data).map(([id, info]: [string, any]) => ({ id, ...info })));
  };

  const fetchApiKeys = async () => {
    const res = await fetch('/api/user/api-keys', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    const data = await res.json();
    setApiKeys(data);
  };

  const handleAddKey = async () => {
    if (!selectedProvider || !newKey) return;
    
    await fetch('/api/user/api-keys', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        provider: selectedProvider,
        key: newKey,
        name: keyName
      })
    });
    
    setShowAddModal(false);
    setNewKey('');
    setKeyName('');
    setSelectedProvider('');
    fetchApiKeys();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除此API Key？')) return;
    await fetch(`/api/user/api-keys/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    });
    fetchApiKeys();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold mb-2 text-gradient">API设置</h2>
        <p className="text-[var(--text-muted)]">配置您的API Key以开始使用图像生成功能</p>
      </div>

      {/* 推荐供应商 */}
      <section>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Sparkles className="text-amber-400" size={20} />
          推荐供应商
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {providers.map((provider) => (
            <div key={provider.id} className="glass rounded-2xl p-6 card-hover">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{provider.icon}</span>
                  <div>
                    <h4 className="font-bold text-lg">{provider.name}</h4>
                    <p className="text-sm text-[var(--text-muted)]">{provider.description}</p>
                  </div>
                </div>
              </div>
              <a
                href={provider.registerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary w-full flex items-center justify-center gap-2 text-sm"
              >
                <ExternalLink size={16} />
                前往注册获取Key
              </a>
            </div>
          ))}
        </div>
      </section>

      {/* 我的API配置 */}
      <section>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <Key className="text-amber-400" size={20} />
            我的API配置
          </h3>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus size={18} />
            添加配置
          </button>
        </div>

        <div className="space-y-4">
          {apiKeys.length === 0 ? (
            <div className="glass rounded-2xl p-12 text-center text-[var(--text-muted)]">
              <Key size={48} className="mx-auto mb-4 opacity-50" />
              <p>暂无API配置，请点击右上角添加</p>
            </div>
          ) : (
            apiKeys.map((key) => {
              const provider = providers.find(p => p.id === key.provider);
              return (
                <div key={key.id} className="glass rounded-2xl p-6 flex items-center justify-between card-hover">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center text-2xl">
                      {provider?.icon || '🔑'}
                    </div>
                    <div>
                      <h4 className="font-semibold">{key.name}</h4>
                      <p className="text-sm text-[var(--text-muted)]">{provider?.name}</p>
                      <p className="text-xs text-[var(--text-muted)] font-mono mt-1">{key.key}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(key.id)}
                    className="p-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* 添加模态框 */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-8 max-w-md w-full space-y-6">
            <h3 className="text-2xl font-bold text-gradient">添加API Key</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">选择供应商</label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="input-elegant"
                >
                  <option value="">请选择</option>
                  {providers.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">配置名称（可选）</label>
                <input
                  type="text"
                  value={keyName}
                  onChange={(e) => setKeyName(e.target.value)}
                  placeholder="例如：我的贞贞Key"
                  className="input-elegant"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">API Key</label>
                <input
                  type="password"
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="sk-xxxxxxxxxx"
                  className="input-elegant"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleAddKey}
                disabled={!selectedProvider || !newKey}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                确认添加
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
