import React, { useState } from 'react';
import { Wand2, Download, Loader2 } from 'lucide-react';

const ASPECT_RATIOS = [
  { label: '1:1', value: '1:1', width: 1024, height: 1024 },
  { label: '16:9', value: '16:9', width: 1024, height: 576 },
  { label: '9:16', value: '9:16', width: 576, height: 1024 },
  { label: '4:3', value: '4:3', width: 1024, height: 768 },
  { label: '3:4', value: '3:4', width: 768, height: 1024 },
  { label: '21:9', value: '21:9', width: 1024, height: 438 },
  { label: '原始', value: 'original', width: 1024, height: 1024 },
];

export const Text2Img: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [ratio, setRatio] = useState('1:1');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    // ... 调用API生成图片
    setLoading(false);
  };

  return (
    <div className="max-w-7xl mx-auto h-full flex gap-6">
      {/* 左侧：参数设置 */}
      <div className="w-96 space-y-6 overflow-auto">
        <div className="glass rounded-2xl p-6 space-y-6">
          <h2 className="text-2xl font-bold text-gradient">文生图</h2>
          
          <div>
            <label className="block text-sm font-medium mb-2">画面描述</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="描述您想要的画面..."
              rows={6}
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
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
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
            disabled={loading || !prompt}
            className="w-full btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="animate-spin" /> 生成中...</>
            ) : (
              <><Wand2 size={18} /> 开始创作</>
            )}
          </button>
        </div>
      </div>

      {/* 右侧：预览区域 */}
      <div className="flex-1 glass rounded-2xl p-8 flex items-center justify-center relative overflow-hidden">
        {result ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <img
              src={result}
              alt="Generated"
              className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
            />
            <button
              className="absolute bottom-4 right-4 btn-primary flex items-center gap-2"
              onClick={() => {/* 下载图片 */}}
            >
              <Download size={18} /> 下载
            </button>
          </div>
        ) : (
          <div className="text-center text-[var(--text-muted)]">
            <div className="text-6xl mb-4 opacity-50">🎨</div>
            <p>输入描述并点击生成按钮开始创作</p>
          </div>
        )}
      </div>
    </div>
  );
};
