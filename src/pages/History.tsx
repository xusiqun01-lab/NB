import { useState, useEffect } from 'react';
import { generateAPI } from '@/services/api';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Clock, Image as ImageIcon, Wand2, Images, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface GeneratedImage {
  id: string;
  prompt: string;
  mode: 'text2img' | 'img2img' | 'multiImg';
  provider: string;
  model: string;
  size: string;
  aspectRatio: string;
  imageUrl: string | null;
  imageBase64: string | null;
  createdAt: string;
}

export default function History() {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const response = await generateAPI.getHistory();
      setImages(response.data);
    } catch (error) {
      toast.error('加载历史记录失败');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, id: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `banana-ai-${id}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('图片下载中...');
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'text2img':
        return <Wand2 className="w-3 h-3" />;
      case 'img2img':
        return <ImageIcon className="w-3 h-3" />;
      case 'multiImg':
        return <Images className="w-3 h-3" />;
      default:
        return <Wand2 className="w-3 h-3" />;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case 'text2img':
        return '文生图';
      case 'img2img':
        return '图生图';
      case 'multiImg':
        return '多图参考';
      default:
        return mode;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-banana" />
          <p className="text-gray-500">加载历史记录中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">生成历史</h1>
          <p className="text-gray-400">查看和管理您之前生成的所有图像</p>
        </div>
        <Button 
          variant="outline" 
          onClick={loadHistory}
          className="border-dark-border hover:border-banana/50 hover:text-banana"
        >
          <Clock className="w-4 h-4 mr-2" />
          刷新
        </Button>
      </div>

      {images.length === 0 ? (
        <div className="h-[500px] rounded-xl border-2 border-dashed border-dark-border flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-banana/10 rounded-2xl flex items-center justify-center mb-4">
            <ImageIcon className="w-10 h-10 text-banana/50" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">
            暂无生成记录
          </h3>
          <p className="text-gray-500 mb-6">
            去生成页面创建您的第一张AI图像吧
          </p>
          <Button 
            className="bg-banana text-black hover:bg-banana-dark"
            onClick={() => window.location.href = '/'}
          >
            开始创作
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {images.map((image) => (
            <Card 
              key={image.id} 
              className="bg-dark-card border-dark-border overflow-hidden group hover:border-banana/30 transition-all duration-300 hover:-translate-y-1 hover:shadow-glow-sm"
            >
              <div className="aspect-square bg-dark-elevated relative overflow-hidden">
                {image.imageUrl || image.imageBase64 ? (
                  <img
                    src={image.imageUrl || image.imageBase64 || ''}
                    alt={image.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-gray-700" />
                  </div>
                )}
                
                {/* 遮罩层 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* 操作按钮 */}
                <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <Button
                    className="w-full bg-banana text-black hover:bg-banana-dark"
                    size="sm"
                    onClick={() => handleDownload(image.imageUrl || image.imageBase64 || '', image.id)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    下载图片
                  </Button>
                </div>

                {/* 模式标签 */}
                <div className="absolute top-3 left-3">
                  <Badge className="bg-black/60 backdrop-blur-md text-white border-0 flex items-center gap-1">
                    {getModeIcon(image.mode)}
                    {getModeLabel(image.mode)}
                  </Badge>
                </div>
              </div>
              
              <CardContent className="p-4">
                <p className="text-sm text-gray-300 line-clamp-2 mb-3 min-h-[40px]">
                  {image.prompt}
                </p>
                
                <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                  <span className="font-mono">{image.model}</span>
                  <span>{formatDate(image.createdAt)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-dark-border text-gray-400 text-xs">
                    {image.size}
                  </Badge>
                  <Badge variant="outline" className="border-dark-border text-gray-400 text-xs">
                    {image.aspectRatio}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
