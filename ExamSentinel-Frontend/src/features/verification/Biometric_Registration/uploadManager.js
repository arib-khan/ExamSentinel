import { config, getConfig } from "@/config";

class UploadManager {
  constructor() {
    this.queue = this.loadQueue();
    this.servers = [];
    this.isProcessing = false;
    this.listeners = [];
    this.configLoaded = false;
  }

  async init() {
    if (!this.configLoaded) {
      await config.load();
      this.configLoaded = true;
    }

    this.servers = [
      getConfig('VITE_BIO_SERVER1_URL'),
      // getConfig('VITE_BIO_SERVER2_URL'),
      // getConfig('VITE_BIO_SERVER3_URL')
    ].filter(Boolean);

    console.log("✅ UploadManager servers loaded:", this.servers);
  }

  loadQueue() {
    try {
      const stored = localStorage.getItem('upload_queue');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveQueue() {
    try {
      localStorage.setItem('upload_queue', JSON.stringify(this.queue));
      this.notifyListeners();
    } catch (error) {
      console.error('Failed to save queue:', error);
    }
  }

  subscribe(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
    };
  }

  notifyListeners() {
    const status = this.getStatus();
    this.listeners.forEach(callback => callback(status));
  }

  async addToQueue(data, type, metadata = {}) {
    const uploadItem = {
      id: `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      data,
      type,
      metadata,
      timestamp: Date.now(),
      attempts: 0,
      status: 'pending',
      lastError: null,
      successfulServers: [], // Track server indices that succeeded
      failedServers: []      // Track server indices that failed
    };

    this.queue.push(uploadItem);
    this.saveQueue();

    setTimeout(async () => {
      if (!this.configLoaded) await this.init();
      this.processQueue();
    }, 0);

    return uploadItem.id;
  }

  /**
   * Upload to multiple servers in parallel
   * IMPORTANT: Only uploads to specified servers, never re-uploads to successful ones
   */
  async uploadToServers(formData, endpoint, targetServers = null) {
    const Token = sessionStorage.getItem("authToken");
    
    // targetServers = null means "all servers"
    // targetServers = [{url, index}, ...] means "only these specific servers"
    const serversToTry = targetServers || this.servers.map((url, idx) => ({ url, index: idx }));
    
    console.log(`🚀 Uploading to ${serversToTry.length} server(s) in parallel...`);
    
    // Create parallel upload promises
    const uploadPromises = serversToTry.map(async (serverInfo) => {
      const server = typeof serverInfo === 'string' ? serverInfo : serverInfo.url;
      const serverIndex = typeof serverInfo === 'object' ? serverInfo.index : this.servers.indexOf(server);
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        // CRITICAL: Clone FormData for each request (parallel uploads need separate instances)
        const clonedFormData = new FormData();
        for (let [key, value] of formData.entries()) {
          clonedFormData.append(key, value);
        }

        const response = await fetch(`${server}${endpoint}`, {
          method: 'POST',
          body: clonedFormData,
          headers: Token ? { Authorization: `Bearer ${Token}` } : {},
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          
          // Validate response based on expected format
          const isValidResponse = result.status === true || result.ok === true;
          
          if (isValidResponse) {
            return {
              success: true,
              serverIndex,
              serverName: `Server ${serverIndex + 1}`,
              serverUrl: server,
              response: result
            };
          } else {
            return {
              success: false,
              serverIndex,
              serverName: `Server ${serverIndex + 1}`,
              serverUrl: server,
              error: result.msg || 'Invalid response format',
              response: result
            };
          }
        } else {
          return {
            success: false,
            serverIndex,
            serverName: `Server ${serverIndex + 1}`,
            serverUrl: server,
            error: `HTTP ${response.status}`,
            statusCode: response.status
          };
        }
      } catch (error) {
        const errorMsg = error.name === 'AbortError' ? 'Timeout' : error.message;
        return {
          success: false,
          serverIndex,
          serverName: `Server ${serverIndex + 1}`,
          serverUrl: server,
          error: errorMsg
        };
      }
    });

    // Wait for ALL uploads to complete
    const results = await Promise.all(uploadPromises);

    // Separate successful and failed uploads
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);

    // Log detailed results
    console.log(`📊 Upload Results: ${successful.length}/${results.length} servers succeeded`);
    successful.forEach(r => console.log(`  ✅ ${r.serverName}: ${r.response?.msg || 'Success'}`));
    failed.forEach(r => console.log(`  ❌ ${r.serverName}: ${r.error}`));

    return {
      success: successful.length > 0,
      allSuccessful: failed.length === 0,
      successfulServers: successful,
      failedServers: failed,
      totalServers: results.length
    };
  }

  async processQueue() {
    if (this.isProcessing || this.queue.length === 0) return;

    this.isProcessing = true;
    const itemsToProcess = [...this.queue.filter(item => item.status === 'pending')];

    for (const item of itemsToProcess) {
      try {
        const formData = new FormData();
        let endpoint = '';

        // Prepare FormData based on type
        if (item.type === 'photo') {
          const blob = item.data.blob instanceof Blob
            ? item.data.blob
            : await this.base64ToBlob(item.data.blob);

          formData.append('cappic', blob, 'captured_photo.jpg');
          formData.append('student_id', item.data.student_id);
          endpoint = 'api/studentext/student_pic_capture';

        } else if (item.type === 'fingerprint') {
          formData.append('student_id', item.data.student_id);
          formData.append('student_biometric_capture', item.data.pidData);
          endpoint = 'api/studentext/add';
        }

        // SMART RETRY LOGIC: Only upload to servers that haven't succeeded yet
        let targetServers;
        
        if (item.successfulServers.length === 0) {
          // No servers succeeded yet - upload to ALL servers
          targetServers = null;
          console.log(`🎯 [${item.type}] Attempt ${item.attempts + 1}: Uploading to ALL ${this.servers.length} servers`);
          
        } else {
          // Some servers already succeeded - only retry the failed ones
          const serversToRetry = [];
          for (let i = 0; i < this.servers.length; i++) {
            if (!item.successfulServers.includes(i)) {
              serversToRetry.push({
                url: this.servers[i],
                index: i
              });
            }
          }
          
          targetServers = serversToRetry;
          console.log(`🔄 [${item.type}] Retry #${item.attempts}: Uploading to ${targetServers.length} failed server(s) only`);
          console.log(`   ✅ Already successful: Server(s) ${item.successfulServers.map(i => i + 1).join(', ')}`);
        }

        // Safety check: If all servers already succeeded, remove from queue
        if (targetServers && targetServers.length === 0) {
          console.log(`✅ [${item.type}] All servers already successful, removing from queue`);
          this.queue = this.queue.filter(i => i.id !== item.id);
          this.saveQueue();
          continue;
        }

        // Upload to target servers (parallel execution)
        const result = await this.uploadToServers(formData, endpoint, targetServers);

        // Update successful servers list (add newly successful ones)
        result.successfulServers.forEach(server => {
          if (!item.successfulServers.includes(server.serverIndex)) {
            item.successfulServers.push(server.serverIndex);
          }
        });

        // Calculate which servers are still failing (those not in successful list)
        const stillFailingServers = [];
        for (let i = 0; i < this.servers.length; i++) {
          if (!item.successfulServers.includes(i)) {
            stillFailingServers.push(i);
          }
        }
        item.failedServers = stillFailingServers;

        // Determine next action based on results
        if (item.successfulServers.length === this.servers.length) {
          // ✅ ALL servers succeeded - Remove from queue
          this.queue = this.queue.filter(i => i.id !== item.id);
          this.saveQueue();

          console.log(`✅ [${item.type}] Successfully uploaded to ALL ${this.servers.length} servers!`);
          console.log(`   Student ID: ${item.data.student_id}`);
          console.log(`   Successful servers: ${item.successfulServers.map(i => i + 1).join(', ')}`);

          if (item.metadata.onSuccess) {
            item.metadata.onSuccess(result);
          }

        } else if (item.successfulServers.length > 0 && item.failedServers.length > 0) {
          // ⚠️ Partial success - Keep in queue to retry failed servers
          item.lastError = `Partial: ${item.successfulServers.length}/${this.servers.length} succeeded`;
          
          console.log(`⚠️  [${item.type}] Partial success: ${item.successfulServers.length}/${this.servers.length} servers`);
          console.log(`   ✅ Successful servers: ${item.successfulServers.map(i => i + 1).join(', ')}`);
          console.log(`   ❌ Will retry servers: ${item.failedServers.map(i => i + 1).join(', ')}`);

          // Increment attempts
          item.attempts++;
          
          // Save progress
          this.saveQueue();

          // Optional callback for partial success
          if (item.metadata.onPartialSuccess) {
            item.metadata.onPartialSuccess({
              ...result,
              totalSuccessful: item.successfulServers.length,
              totalFailed: item.failedServers.length,
              totalServers: this.servers.length
            });
          }
          
          // Add exponential backoff before retrying failed servers
          const backoffMs = Math.min(1000 * Math.pow(2, item.attempts), 60000);
          console.warn(`⏳ [${item.type}] Will retry ${item.failedServers.length} failed server(s) in ${backoffMs / 1000}s`);
          await new Promise(resolve => setTimeout(resolve, backoffMs));

        } else {
          // ❌ All targeted servers failed
          throw new Error(`All ${result.totalServers} server(s) failed`);
        }

      } catch (error) {
        item.attempts++;
        item.lastError = error.message;
        item.lastAttempt = Date.now();

        const maxAttempts = 5;
        if (item.attempts >= maxAttempts) {
          item.status = 'failed';
          console.error(`❌ [${item.type}] Max attempts (${maxAttempts}) reached`);
          console.error(`   Student ID: ${item.data.student_id}`);
          console.error(`   ✅ Successful: ${item.successfulServers.length}/${this.servers.length} servers (${item.successfulServers.map(i => i + 1).join(', ')})`);
          console.error(`   ❌ Failed: ${item.failedServers.length}/${this.servers.length} servers (${item.failedServers.map(i => i + 1).join(', ')})`);

          if (item.metadata.onFail) {
            item.metadata.onFail(error);
          }
        } else {
          const backoffMs = Math.min(1000 * Math.pow(2, item.attempts), 60000);
          console.warn(`⏳ [${item.type}] Retry ${item.attempts}/${maxAttempts} in ${backoffMs / 1000}s`);
          
          await new Promise(resolve => setTimeout(resolve, backoffMs));
        }

        this.saveQueue();
      }
    }

    this.isProcessing = false;
  }

  async base64ToBlob(base64String) {
    const response = await fetch(base64String);
    return await response.blob();
  }

  getStatus() {
    return {
      pending: this.queue.filter(i => i.status === 'pending').length,
      failed: this.queue.filter(i => i.status === 'failed').length,
      total: this.queue.length,
      items: this.queue.map(item => ({
        id: item.id,
        type: item.type,
        status: item.status,
        attempts: item.attempts,
        timestamp: item.timestamp,
        successfulServers: item.successfulServers?.length || 0,
        failedServers: item.failedServers?.length || 0,
        totalServers: this.servers.length,
        successfulServerIndices: item.successfulServers || [],
        failedServerIndices: item.failedServers || []
      }))
    };
  }

  retryFailed() {
    this.queue.forEach(item => {
      if (item.status === 'failed') {
        item.status = 'pending';
        item.attempts = 0;
        item.lastError = null;
        // Keep successful/failed server tracking for smart retry
      }
    });
    this.saveQueue();
    this.processQueue();
  }

  clearCompleted() {
    this.queue = this.queue.filter(item =>
      item.status === 'pending' || item.status === 'failed'
    );
    this.saveQueue();
  }

  getDetailedStats() {
    const stats = {
      total: this.queue.length,
      pending: 0,
      failed: 0,
      partialSuccess: 0,
      byType: {
        photo: { total: 0, pending: 0, failed: 0, partialSuccess: 0 },
        fingerprint: { total: 0, pending: 0, failed: 0, partialSuccess: 0 }
      }
    };

    this.queue.forEach(item => {
      stats.byType[item.type].total++;
      
      if (item.status === 'pending') {
        stats.pending++;
        stats.byType[item.type].pending++;
        
        if (item.successfulServers?.length > 0 && item.failedServers?.length > 0) {
          stats.partialSuccess++;
          stats.byType[item.type].partialSuccess++;
        }
      } else if (item.status === 'failed') {
        stats.failed++;
        stats.byType[item.type].failed++;
      }
    });

    return stats;
  }
}

// Singleton instance
const uploadManager = new UploadManager();

// Initialize and auto-process queue every 30 seconds
uploadManager.init().then(() => {
  console.log("UploadManager initialized with config");
  setInterval(() => uploadManager.processQueue(), 30000);
});

// Process queue when connection is restored
window.addEventListener('online', () => {
  console.log('📶 Connection restored, processing queue...');
  uploadManager.processQueue();
});

export default uploadManager;