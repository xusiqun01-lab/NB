import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { apiConfig } from '@/services/api';
import { 
  Key, 
  ExternalLink, 
  Save, 
  Trash2, 
  Check, 
  AlertCircle,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

const PROVIDERS = [
  { 
    id: 'zhenzhen', 
    name: '贞贞的AI工坊', 
    url: 'https://ai.t8star.cn',
    desc: '稳定的AI图像生成服务',
    defaultBaseURL: 'https://ai.t8star.cn/v1'
  },
  { 
    id: 'sillydream', 
    name: 'SillyDream', 
    url: 'https://wish.sillydream.top',
    desc: '高性价比的AI图像生成API',
    defaultBaseURL: 'https://wish.sillydream.top/v1'
  },
];

export default function ApiSettings() {
  const [configs, setConfigs] = useState<Record<string, { apiKey: string; baseURL: string }>>({});
  const [activeTab, setActiveTab] = useState('zhenzhen');
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = () => {
    const saved = apiConfig.getAllConfigs();
    // 确保每个provider都有baseURL
    const normalized: Record<string, { apiKey: string; baseURL: string }> = {};
    PROVIDERS.forEach(p => {
      if (saved[p.id]) {
        normalized[p.id] = {
          ...saved[p.id],
          baseURL: saved[p.id].baseURL || p.defaultBaseURL
        };
      }
    });
    setConfigs(normalized);
  };

  const handleSave = (provider: string, apiKey: string, baseURL: string) => {
    if (!apiKey.trim()) {
      toast.error('请输入API密钥');
      return;
    }
    
    apiConfig.setProviderConfig(provider, { apiKey, baseURL });
    toast.success(`${PROVIDERS.find(p => p.id === provider)?.name} API配置已保存`);
    loadConfigs();
  };

  const handleClear = (provider: string) => {
    apiConfig.clearConfig(provider);
    toast.success('配置已清除');
    loadConfigs();
  };

  const isConfigured = (provider: string) => {
    return !!configs[provider]?.apiKey;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">API 设置</h1>
        <p className="text-gray-400">配置您的API密钥以开始使用图像生成功能</p>
      </div>

      {/* 推荐供应商 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {PROVIDERS.map((provider) => (
          <Card key={provider.id} className="bg-dark-card border-dark-border hover:border-banana/30 transition-colors group">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-banana transition-colors">
                      {provider.name}
                    </h3>
                    {isConfigured(provider.id) && (
                      <Badge className="bg-banana/20 text-banana border-0">
                        <Check className="w-3 h-3 mr-1" />
                        已配置
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mb-3">{provider.desc}</p>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-dark-border hover:border-banana hover:text-banana"
                      onClick={() => window.open(provider.url, '_blank')}
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      前往注册
                    </Button>
                    {!isConfigured(provider.id) && (
                      <Badge variant="outline" className="border-red-500/50 text-red-400">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        未配置
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-banana/20 to-orange-500/20 flex items-center justify-center">
                  <Key className="w-6 h-6 text-banana" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 配置详情 */}
      <Card className="bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-banana" />
            我的API配置
          </CardTitle>
          <CardDescription className="text-gray-400">
            您的API密钥仅存储在本地浏览器中，不会上传到服务器
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-dark-elevated border border-dark-border mb-6">
              {PROVIDERS.map((p) => (
                <TabsTrigger 
                  key={p.id} 
                  value={p.id}
                  className="data-[state=active]:bg-banana data-[state=active]:text-black"
                >
                  {p.name}
                  {isConfigured(p.id) && (
                    <span className="ml-2 w-2 h-2 rounded-full bg-green-500"></span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            {PROVIDERS.map((provider) => (
              <TabsContent key={provider.id} value={provider.id}>
                <ProviderConfigForm 
                  provider={provider}
                  config={configs[provider.id]}
                  onSave={(key, url) => handleSave(provider.id, key, url)}
                  onClear={() => handleClear(provider.id)}
                  showKey={showKey}
                  setShowKey={setShowKey}
                />
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>

      {/* 使用说明 */}
      <Card className="mt-6 bg-dark-card border-dark-border">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-banana" />
            使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-gray-400">
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-banana/20 text-banana flex items-center justify-center text-sm font-bold shrink-0">1</div>
            <p>点击上方"前往注册"按钮，在供应商网站注册账号并获取API密钥</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-banana/20 text-banana flex items-center justify-center text-sm font-bold shrink-0">2</div>
            <p>在对应供应商的标签页中填入API密钥，点击保存</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-banana/20 text-banana flex items-center justify-center text-sm font-bold shrink-0">3</div>
            <p>配置完成后即可在生成页面使用该供应商的服务</p>
          </div>
          <div className="flex gap-3">
            <div className="w-6 h-6 rounded-full bg-banana/20 text-banana flex items-center justify-center text-sm font-bold shrink-0">4</div>
            <p>如不使用自定义API密钥，系统将使用默认配置（可能有限制）</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// 单个供应商配置表单组件
function ProviderConfigForm({ 
  provider, 
  config, 
  onSave, 
  onClear,
  showKey,
  setShowKey
}: { 
  provider: typeof PROVIDERS[0];
  config?: { apiKey: string; baseURL: string };
  onSave: (apiKey: string, baseURL: string) => void;
  onClear: () => void;
  showKey: boolean;
  setShowKey: (show: boolean) => void;
}) {
  const [apiKey, setApiKey] = useState(config?.apiKey || '');
  const [baseURL, setBaseURL] = useState(config?.baseURL || provider.defaultBaseURL);

  useEffect(() => {
    if (config) {
      setApiKey(config.apiKey);
      setBaseURL(config.baseURL);
    } else {
      setApiKey('');
      setBaseURL(provider.defaultBaseURL);
    }
  }, [config, provider.defaultBaseURL]);

  const hasChanges = apiKey !== (config?.apiKey || '') || baseURL !== (config?.baseURL || provider.defaultBaseURL);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label className="text-white flex items-center justify-between">
          API 密钥
          <span className="text-xs text-gray-500">必填</span>
        </Label>
        <div className="relative">
          <Input
            type={showKey ? "text" : "password"}
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder={`请输入${provider.name}的API密钥`}
            className="bg-dark-elevated border-dark-border text-white pr-20 font-mono"
          />
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? '隐藏' : '显示'}
          </Button>
        </div>
        <p className="text-xs text-gray-500">
          格式通常为：sk-xxxxxxxxxxxxxxxxxxxxxxxx
        </p>
      </div>

      <div className="space-y-2">
        <Label className="text-white flex items-center justify-between">
          API 地址
          <span className="text-xs text-gray-500">选填</span>
        </Label>
        <Input
          value={baseURL}
          onChange={(e) => setBaseURL(e.target.value)}
          placeholder={provider.defaultBaseURL}
          className="bg-dark-elevated border-dark-border text-white font-mono"
        />
        <p className="text-xs text-gray-500">
          默认地址：{provider.defaultBaseURL}
        </p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-dark-border">
        <div className="flex items-center gap-2">
          <Switch 
            checked={!!config?.apiKey}
            disabled
            className="data-[state=checked]:bg-banana"
          />
          <span className="text-sm text-gray-400">
            {config?.apiKey ? '已启用自定义API' : '使用默认配置'}
          </span>
        </div>
        
        <div className="flex gap-2">
          {config?.apiKey && (
            <Button 
              variant="outline" 
              onClick={onClear}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              清除配置
            </Button>
          )}
          <Button 
            onClick={() => onSave(apiKey, baseURL)}
            disabled={!hasChanges && !!config?.apiKey}
            className="bg-banana text-black hover:bg-banana-dark"
          >
            <Save className="w-4 h-4 mr-2" />
            保存配置
          </Button>
        </div>
      </div>
    </div>
  );
}
