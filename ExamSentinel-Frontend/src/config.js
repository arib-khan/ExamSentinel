// src/config.js
class Config {
  constructor() {
    this.config = null;
    this.loaded = false;
  }

  async load() {
    if (this.loaded) return this.config;

    try {
      // Fetch config.json from public folder
      const response = await fetch('/config.json');
      if (!response.ok) {
        throw new Error('Failed to load config.json');
      }
      this.config = await response.json();
      this.loaded = true;
      return this.config;
    } catch (error) {
      console.error('Error loading config:', error);
      // Fallback to import.meta.env if config.json fails
      this.config = {
        VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || '',
        VITE_API_CLOUD_URL: import.meta.env.VITE_API_CLOUD_URL || '',
        VITE_SOCKET_URL: import.meta.env.VITE_SOCKET_URL || '',
      };
      this.loaded = true;
      return this.config;
    }
  }

  get(key) {
    if (!this.loaded) {
      console.warn('Config not loaded yet. Call load() first.');
      return import.meta.env[key] || '';
    }
    return this.config[key] || '';
  }
}

// Export singleton instance
export const config = new Config();

// Helper function to get config value
export const getConfig = (key) => config.get(key);