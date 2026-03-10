import React, { useState, useRef } from 'react';
import { Upload, Wand2, Download, Loader2, X, ImagePlus } from 'lucide-react';

const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1' },
  { label: '16:9', value: '16:9' },
  { label: '9:16', value: '9:16' },
  { label: '4:3', value: '4:3' },
  { label: '3:4', value: '3:4' },
  { label: '21:9', value: '21:9' },
  { label: '原始比例', value: 'original' },
];

export const Img2Img: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      const data = await res.json();
      setUploadedImage(data.url);
    } catch (error) {
      alert('上传失败');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (!uploadedImage) {
      alert('请先上传参考图片');
      return;
    }
    if (!prompt) {
      alert('请输入描述');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          prompt,
          mode: 'img2img',
          referenceImages: [uploadedImage],
          aspectRatio: ratio,
          provider: 'zhenzhen',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGeneratedImage(data.imageUrl || data.imageBase64);
      } else {
        alert(data.error || '生成失败');
      }
    } catch (error) {
      alert('生成失败');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!generatedImage) return;
    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `generated-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="h-full flex gap-6 overflow-hidden">
      <div className="w-80 flex flex-col gap-4 overflow-auto pr-2">
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gradient">图生图</h2>
          <p className="text-sm text-[var(--text-muted)]">
            上传参考图片，AI基于原图创作新作品
          </p>

          <div>
            <label className="block text-sm font-medium mb-2">画面描述</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述您想要的修改，例如：转换成赛博朋克风格，添加霓虹灯光..."
              rows={5}
              className="input-elegant resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">画面比例</label>
            <div className="grid grid-cols-3 gap-2">
              {ASPECT_RATIOS.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRatio(r.value)}
                  className={`p-2 rounded-lg text-sm font-medium transition-all ${
                    ratio === r.value
                      ? 'bg-amber-500 text-black'
                      : 'bg-[var(--bg-secondary)] text-[var(--text-secondary)] hover:bg-[var(--bg-tertiary)]'
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !prompt || !uploadedImage}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <><Loader2 className="animate-spin" size={18} /> 生成中...</>
            ) : (
              <><Wand2 size={18} /> 开始创作</>
            )}
          </button>
        </div>
      </div>

      <div className="w-80 flex flex-col gap-4">
        <div className="glass rounded-2xl p-6 flex-1 flex flex-col">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <ImagePlus size={20} className="text-amber-400" />
            参考图片
          </h3>
          
          <div className="flex-1 border-2 border-dashed border-[var(--border-color)] rounded-xl flex flex-col items-center justify-center relative overflow-hidden hover:border-amber-500/50 transition-all group min-h-[300px]">
            {uploadedImage ? (
              <div className="relative w-full h-full p-4">
                <img
                  src={uploadedImage}
                  alt="Reference"
                  className="w-full h-full object-contain rounded-lg"
                />
                <button
                  onClick={() => setUploadedImage(null)}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="text-center p-8">
                {uploadLoading ? (
                  <Loader2 className="animate-spin mx-auto mb-4 text-amber-400" size={48} />
                ) : (
                  <Upload size={48} className="mx-auto mb-4 text-[var(--text-muted)] group-hover:text-amber-400 transition-colors" />
                )}
                <p className="text-[var(--text-muted)]">
                  {uploadLoading ? '上传中...' : '点击或拖拽上传图片'}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-2">支持 JPG, PNG, WEBP (最大10MB)</p>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={uploadLoading}
            />
          </div>
        </div>
      </div>

      <div className="flex-1 glass rounded-2xl p-6 flex flex-col">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Wand2 size={20} className="text-amber-400" />
          生成结果
        </h3>
        
        <div className="flex-1 border border-[var(--border-color)] rounded-xl flex items-center justify-center relative overflow-hidden bg-[var(--bg-secondary)]">
          {generatedImage ? (
            <div className="relative w-full h-full p-4 flex items-center justify-center">
              <img
                src={generatedImage}
                alt="Generated"
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <button
                onClick={handleDownload}
                className="absolute bottom-4 right-4 btn-primary flex items-center gap-2"
              >
                <Download size={18} /> 下载
              </button>
            </div>
          ) : (
            <div className="text-center text-[var(--text-muted)]">
              <div className="text-6xl mb-4 opacity-50">🎨</div>
              <p>上传参考图并点击生成按钮开始创作</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
