import { useState, useRef, useCallback, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { generateAPI, apiConfig } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, 
  Upload, 
  Image as ImageIcon, 
  Images, 
  Wand2, 
  Download,
  X,
  Sparkles,
  Settings,
  AlertCircle,
  Check,
  Zap,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

const MODELS = [
  { id: 'gemini-3-pro-image-preview', name: 'Gemini 3 Pro Image', desc: '最佳质量' },
  { id: 'gemini-3.1-flash-image-preview', name: 'Gemini 3.1 Flash Image', desc: '快速生成' },
  { id: 'gemini-2.5-flash-image', name: 'Gemini 2.5 Flash Image', desc: '平衡选择' },
];

const SIZES = [
  { id: '1K', name: '1K', desc: '1024px', width: 1024 },
  { id: '2K', name: '2K', desc: '2048px', width: 2048 },
];

const ASPECT_RATIOS = [
  { id: '1:1', name: '1:1', desc: '正方形', value: '1:1' },
  { id: '16:9', name: '16:9', desc: '宽屏', value: '16:9' },
  { id: '9:16', name: '9:16', desc: '竖屏', value: '9:16' },
  { id: '4:3', name: '4:3', desc: '标准', value: '4:3' },
  { id: '3:4', name: '3:4', desc: '肖像', value: '3:4' },
  { id: '21:9', name: '21:9', desc: '超宽', value: '21:9' },
];

const PROVIDERS = [
  { id: 'zhenzhen', name: '贞贞的AI工坊' },
  { id: 'sillydream', name: 'SillyDream' },
];

export default function Generate() {
  useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState<'text2img' | 'img2img' | 'multiImg'>('text2img');
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState('zhenzhen');
  const [model, setModel] = useState('gemini-3-pro-image-preview');
  const [size, setSize] = useState('1K');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [referenceImages, setReferenceImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 检查API配置
  const checkApiConfig = useCallback(() => {
    const config = apiConfig.getProviderConfig(provider);
    return !!config?.apiKey;
  }, [provider]);

  useEffect(() => {
    // 组件挂载时检查配置
    checkApiConfig();
  }, [provider, checkApiConfig]);

  const handleFileUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 10 * 1024 * 1024) {
      toast.error('图片大小不能超过10MB');
      return;
    }

    try {
      toast.loading('正在上传图片...');
      const response = await generateAPI.uploadImage(file);
      toast.dismiss();
      
      const imageUrl = response.data.url;
      if (mode === 'img2img') {
        setReferenceImages([imageUrl]);
      } else if (mode === 'multiImg') {
        if (referenceImages.length >= 4) {
          toast.error('最多只能上传4张参考图');
          return;
        }
        setReferenceImages([...referenceImages, imageUrl]);
      }
      toast.success('图片上传成功');
    } catch (err) {
      toast.dismiss();
      toast.error('图片上传失败');
    }
  }, [mode, referenceImages]);

  const removeReferenceImage = (index: number) => {
    setReferenceImages(referenceImages.filter((_, i) => i !== index));
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入提示词');
      return;
    }

    if ((mode === 'img2img' || mode === 'multiImg') && referenceImages.length === 0) {
      setError('请上传参考图片');
      return;
    }

    // 检查API配置
    if (!checkApiConfig()) {
      toast.error('请先在API设置中配置密钥', {
        action: {
          label: '去配置',
          onClick: () => navigate('/settings')
        }
      });
      return;
    }

    setError('');
    setIsGenerating(true);
    setGeneratedImage(null);
    setProgress(0);

    // 模拟进度条
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev;
        return prev + Math.random() * 15;
      });
    }, 1000);

    try {
      const response = await generateAPI.generate({
        prompt,
        provider,
        model,
        size,
        aspectRatio,
        mode,
        referenceImages: mode === 'text2img' ? undefined : referenceImages,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const { imageUrl, imageBase64 } = response.data;
      setGeneratedImage(imageUrl || imageBase64);
      toast.success('图像生成成功！');
    } catch (err: any) {
      clearInterval(progressInterval);
      setError(err.response?.data?.error || '图像生成失败，请重试');
      toast.error('图像生成失败');
    } finally {
      setTimeout(() => setIsGenerating(false), 500);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `banana-ai-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('图片下载中...');
  };

  const isApiConfigured = checkApiConfig();

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* 顶部提示 */}
      {!isApiConfigured && (
        <Alert className="mb-6 bg-banana/10 border-banana/30 text-banana">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>您尚未配置API密钥，请先前往设置页面配置</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-banana/50 text-banana hover:bg-banana/20"
              onClick={() => navigate('/settings')}
            >
              立即配置
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* 左侧：控制面板 - 占4列 */}
        <div className="lg:col-span-4 space-y-6">
          {/* 模式选择 */}
          <Card className="bg-dark-card border-dark-border overflow-hidden">
            <CardContent className="p-0">
              <Tabs value={mode} onValueChange={(v) => {
                setMode(v as any);
                setReferenceImages([]);
                setGeneratedImage(null);
              }}>
                <TabsList className="w-full grid grid-cols-3 bg-dark-elevated rounded-none h-14">
                  <TabsTrigger 
                    value="text2img" 
                    className="data-[state=active]:bg-banana data-[state=active]:text-black rounded-none flex flex-col items-center gap-1"
                  >
                    <Wand2 className="w-4 h-4" />
                    <span className="text-xs">文生图</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="img2img"
                    className="data-[state=active]:bg-banana data-[state=active]:text-black rounded-none flex flex-col items-center gap-1"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-xs">图生图</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="multiImg"
                    className="data-[state=active]:bg-banana data-[state=active]:text-black rounded-none flex flex-col items-center gap-1"
                  >
                    <Images className="w-4 h-4" />
                    <span className="text-xs">多图参考</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardContent>
          </Card>

          {/* 参数设置 */}
          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Settings className="w-4 h-4 text-banana" />
                <h3 className="text-white font-semibold">生成参数</h3>
              </div>

              {/* API供应商 */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">API 供应商</Label>
                <Select value={provider} onValueChange={setProvider}>
                  <SelectTrigger className="bg-dark-elevated border-dark-border text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-elevated border-dark-border">
                    {PROVIDERS.map((p) => (
                      <SelectItem 
                        key={p.id} 
                        value={p.id}
                        className="text-white focus:bg-banana/20 focus:text-white"
                      >
                        <div className="flex items-center gap-2">
                          {p.name}
                          {apiConfig.getProviderConfig(p.id)?.apiKey && (
                            <Check className="w-3 h-3 text-banana" />
                          )}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isApiConfigured && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" />
                    未配置API密钥
                  </p>
                )}
              </div>

              {/* 模型选择 */}
              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">模型</Label>
                <Select value={model} onValueChange={setModel}>
                  <SelectTrigger className="bg-dark-elevated border-dark-border text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-elevated border-dark-border">
                    {MODELS.map((m) => (
                      <SelectItem 
                        key={m.id} 
                        value={m.id}
                        className="text-white focus:bg-banana/20 focus:text-white"
                      >
                        <div className="flex flex-col">
                          <span>{m.name}</span>
                          <span className="text-xs text-gray-500">{m.desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 分辨率 */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">分辨率</Label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger className="bg-dark-elevated border-dark-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-elevated border-dark-border">
                      {SIZES.map((s) => (
                        <SelectItem 
                          key={s.id} 
                          value={s.id}
                          className="text-white focus:bg-banana/20 focus:text-white"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{s.name}</span>
                            <span className="text-xs text-gray-500">({s.desc})</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 宽高比 */}
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">宽高比</Label>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger className="bg-dark-elevated border-dark-border text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-dark-elevated border-dark-border">
                      {ASPECT_RATIOS.map((r) => (
                        <SelectItem 
                          key={r.id} 
                          value={r.id}
                          className="text-white focus:bg-banana/20 focus:text-white"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{r.name}</span>
                            <span className="text-xs text-gray-500">{r.desc}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 参考图片 */}
          {(mode === 'img2img' || mode === 'multiImg') && (
            <Card className="bg-dark-card border-dark-border">
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-gray-300 text-sm flex items-center gap-2">
                    <Upload className="w-4 h-4 text-banana" />
                    {mode === 'img2img' ? '参考图片' : `参考图片 (${referenceImages.length}/4)`}
                  </Label>
                  {mode === 'multiImg' && referenceImages.length > 0 && (
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setReferenceImages([])}
                      className="text-gray-400 hover:text-red-400 h-auto py-1"
                    >
                      清空
                    </Button>
                  )}
                </div>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept="image/*"
                  className="hidden"
                  multiple={mode === 'multiImg'}
                />
                
                {referenceImages.length === 0 ? (
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-dark-border rounded-xl h-32 flex flex-col items-center justify-center cursor-pointer hover:border-banana/50 hover:bg-banana/5 transition-colors group"
                  >
                    <Upload className="w-8 h-8 text-gray-600 group-hover:text-banana mb-2 transition-colors" />
                    <span className="text-sm text-gray-500 group-hover:text-banana transition-colors">
                      点击上传图片
                    </span>
                    <span className="text-xs text-gray-600 mt-1">支持 JPG, PNG, WEBP</span>
                  </div>
                ) : (
                  <div className={`grid gap-2 ${mode === 'multiImg' ? 'grid-cols-2' : 'grid-cols-1'}`}>
                    {referenceImages.map((img, index) => (
                      <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-dark-border">
                        <img
                          src={img}
                          alt={`参考图 ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="icon"
                            className="w-8 h-8 rounded-full"
                            onClick={() => removeReferenceImage(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {mode === 'multiImg' && referenceImages.length < 4 && (
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="aspect-square border-2 border-dashed border-dark-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-banana/50 hover:bg-banana/5 transition-colors"
                      >
                        <Upload className="w-6 h-6 text-gray-600 mb-1" />
                        <span className="text-xs text-gray-500">添加更多</span>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* 右侧：生成区域 - 占8列 */}
        <div className="lg:col-span-8 space-y-6">
          {/* 提示词输入 */}
          <Card className="bg-dark-card border-dark-border">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-gray-300 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-banana" />
                  提示词
                </Label>
                <Badge variant="outline" className="border-banana/30 text-banana">
                  {prompt.length} 字
                </Badge>
              </div>
              
              <Textarea
                placeholder={
                  mode === 'text2img'
                    ? '描述您想要生成的图像，例如：一只穿着宇航服的猫，站在月球表面，地球在背景中，科幻风格，高清细节...'
                    : mode === 'img2img'
                    ? '描述您想要对参考图进行的修改，例如：将风格转换成赛博朋克，添加霓虹灯光效果...'
                    : '描述您想要融合的效果，例如：融合这些图片的风格，创造一个全新的场景...'
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[160px] bg-dark-elevated border-dark-border text-white placeholder:text-gray-600 resize-none focus:border-banana/50 focus:ring-banana/20"
              />
              
              {error && (
                <Alert variant="destructive" className="bg-red-500/10 border-red-500/30 text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !prompt.trim() || !isApiConfigured}
                  className="flex-1 bg-banana text-black hover:bg-banana-dark h-12 text-lg font-semibold disabled:opacity-50"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      开始生成
                    </>
                  )}
                </Button>
                
                {generatedImage && !isGenerating && (
                  <Button
                    variant="outline"
                    onClick={() => {
                      setGeneratedImage(null);
                      setPrompt('');
                      setReferenceImages([]);
                    }}
                    className="border-dark-border hover:border-banana/50 h-12 px-6"
                  >
                    <RefreshCw className="w-5 h-5" />
                  </Button>
                )}
              </div>

              {/* 进度条 */}
              {isGenerating && (
                <div className="space-y-2">
                  <Progress value={progress} className="h-2 bg-dark-elevated" />
                  <p className="text-xs text-center text-gray-500">
                    正在努力创作中，请稍候... {Math.round(progress)}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 生成结果 */}
          {generatedImage && (
            <Card className="bg-dark-card border-dark-border overflow-hidden">
              <CardContent className="p-0">
                <div className="relative group">
                  <img
                    src={generatedImage}
                    alt="生成的图像"
                    className="w-full h-auto"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center justify-between">
                      <div className="text-white">
                        <p className="text-sm font-medium">生成完成</p>
                        <p className="text-xs text-gray-300">{model} • {size} • {aspectRatio}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-white/30 text-white hover:bg-white/20"
                          onClick={() => {
                            setGeneratedImage(null);
                            setPrompt('');
                          }}
                        >
                          重新生成
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-banana text-black hover:bg-banana-dark"
                          onClick={handleDownload}
                        >
                          <Download className="w-4 h-4 mr-2" />
                          下载图片
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 空状态 */}
          {!generatedImage && !isGenerating && (
            <div className="relative h-[500px] rounded-xl border-2 border-dashed border-dark-border flex flex-col items-center justify-center overflow-hidden">
              {/* 背景装饰 */}
              <div className="absolute inset-0 bg-gradient-to-br from-banana/5 via-transparent to-transparent" />
              <div className="absolute top-10 left-10 w-20 h-20 bg-banana/10 rounded-full blur-3xl animate-pulse" />
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-banana/5 rounded-full blur-3xl animate-pulse delay-700" />
              
              <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-banana/20 to-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-float">
                  <Sparkles className="w-12 h-12 text-banana" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  准备好开始创作了吗？
                </h3>
                <p className="text-gray-500 max-w-md mx-auto mb-6">
                  输入提示词，选择参数，点击生成按钮开始您的AI创作之旅。支持文生图、图生图和多图参考模式。
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-banana" />
                    高清输出
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-banana" />
                    快速生成
                  </span>
                  <span className="flex items-center gap-1">
                    <Check className="w-4 h-4 text-banana" />
                    多种风格
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
