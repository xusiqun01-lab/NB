import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

// 创建 axios 实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证令牌和API配置
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// API配置管理
export const apiConfig = {
  getProviderConfig: (provider: string) => {
    const configs = JSON.parse(localStorage.getItem('apiConfigs') || '{}');
    return configs[provider] || null;
  },
  
  setProviderConfig: (provider: string, config: { apiKey: string; baseURL?: string }) => {
    const configs = JSON.parse(localStorage.getItem('apiConfigs') || '{}');
    configs[provider] = {
      ...config,
      baseURL: config.baseURL || (provider === 'zhenzhen' 
        ? 'https://ai.t8star.cn/v1' 
        : 'https://wish.sillydream.top/v1')
    };
    localStorage.setItem('apiConfigs', JSON.stringify(configs));
  },
  
  getAllConfigs: () => {
    return JSON.parse(localStorage.getItem('apiConfigs') || '{}');
  },
  
  clearConfig: (provider: string) => {
    const configs = JSON.parse(localStorage.getItem('apiConfigs') || '{}');
    delete configs[provider];
    localStorage.setItem('apiConfigs', JSON.stringify(configs));
  }
};

// 认证相关API
export const authAPI = {
  login: (email: string, password: string) => 
    apiClient.post('/auth/login', { email, password }),
  
  register: (email: string, password: string) => 
    apiClient.post('/auth/register', { email, password }),
  
  getMe: () => 
    apiClient.get('/auth/me'),
};

// 生成相关API
export const generateAPI = {
  generate: async (params: {
    prompt: string;
    provider: string;
    model: string;
    size: string;
    aspectRatio: string;
    mode: string;
    referenceImages?: string[];
  }) => {
    // 获取用户配置的API密钥
    const config = apiConfig.getProviderConfig(params.provider);
    
    // 如果用户配置了API密钥，使用用户配置的
    if (config?.apiKey) {
      // 直接调用供应商API
      const response = await axios.post(
        `${config.baseURL}/chat/completions`,
        {
          model: params.model,
          messages: [{ 
            role: 'user', 
            content: params.mode === 'text2img' 
              ? params.prompt 
              : [{ type: 'text', text: params.prompt }, ...(
                  params.referenceImages?.map(url => ({
                    type: 'image_url',
                    image_url: { url }
                  })) || []
                )]
          }]
        },
        {
          headers: {
            'Authorization': `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );
      
      // 解析返回结果
      const content = response.data.choices[0]?.message?.content || '';
      let imageUrl = null;
      let imageBase64 = null;
      
      const markdownMatch = content.match(/!\[image\]\((.*?)\)/);
      if (markdownMatch) {
        const url = markdownMatch[1];
        if (url.startsWith('data:')) {
          imageBase64 = url;
        } else {
          imageUrl = url;
        }
      }
      
      return {
        data: {
          success: true,
          imageUrl,
          imageBase64,
          id: Date.now().toString()
        }
      };
    } else {
      // 使用后端代理
      return apiClient.post('/generate', params);
    }
  },
  
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiClient.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  getHistory: () => 
    apiClient.get('/history'),
};

// 管理员API
export const adminAPI = {
  getUsers: () => 
    apiClient.get('/admin/users'),
  
  updateUserRole: (userId: string, role: string) => 
    apiClient.put(`/admin/users/${userId}/role`, { role }),
  
  deleteUser: (userId: string) => 
    apiClient.delete(`/admin/users/${userId}`),
  
  getAllImages: () => 
    apiClient.get('/admin/images'),
  
  getStats: () => 
    apiClient.get('/admin/stats'),
};

export default apiClient;
