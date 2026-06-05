const BASE_URL = 'https://api.weather-ai.co/v1';

class WeatherAiApi {
  constructor() {
    this.apiKey = null;
    this.rateLimitInfo = null;
  }

  setApiKey(key) {
    this.apiKey = key;
    localStorage.setItem('weatherAiApiKey', key);
  }

  getApiKey() {
    if (!this.apiKey) {
      this.apiKey = localStorage.getItem('weatherAiApiKey');
    }
    return this.apiKey;
  }

  clearApiKey() {
    this.apiKey = null;
    localStorage.removeItem('weatherAiApiKey');
  }

  getRateLimitInfo() {
    return this.rateLimitInfo;
  }

  async request(endpoint, options = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('API key not set. Please enter your WeatherAI API key.');
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...options.headers,
      },
    });

    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');
    
    if (limit && remaining && reset) {
      this.rateLimitInfo = {
        limit: parseInt(limit),
        remaining: parseInt(remaining),
        reset: parseInt(reset),
      };
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  async getWeather(lat, lon, days = 5, units = 'metric', ai = true) {
    const url = `/weather?lat=${lat}&lon=${lon}&days=${days}&ai=${ai}&units=${units}`;
    return this.request(url);
  }

  async analyzeForestImage(imageFile, metadata = {}) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    if (metadata.farmerId) formData.append('farmerId', metadata.farmerId);
    if (metadata.county) formData.append('county', metadata.county);
    if (metadata.landAcres) formData.append('landAcres', metadata.landAcres.toString());
    if (metadata.location) formData.append('location', metadata.location);
    if (metadata.notes) formData.append('notes', metadata.notes);
    
    return this.request('/trees/analyze', {
      method: 'POST',
      body: formData,
    });
  }
}

export const weatherAiApi = new WeatherAiApi();