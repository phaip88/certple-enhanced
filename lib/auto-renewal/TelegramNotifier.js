/**
 * TelegramNotifier - Sends notifications via Telegram Bot API
 * Handles certificate expiry warnings and renewal status notifications
 */

const STORAGE_KEY = 'certple-telegram-config';

export class TelegramNotifier {
  /**
   * Get Telegram configuration
   * @returns {Object} Configuration object
   */
  getTelegramConfig() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      
      if (!data) {
        return this.getDefaultConfig();
      }

      const config = JSON.parse(data);
      
      return {
        ...this.getDefaultConfig(),
        ...config
      };
    } catch (error) {
      console.error('Failed to read Telegram config:', error);
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   * @returns {Object} Default config
   */
  getDefaultConfig() {
    return {
      enabled: false,
      botToken: '',
      chatId: '',
      notifyOnExpiring: true,  // 临期提醒
      notifyOnRenewalSuccess: true,  // 续期成功通知
      notifyOnRenewalFailure: true   // 续期失败通知
    };
  }

  /**
   * Save Telegram configuration
   * @param {Object} config - Configuration object
   * @returns {boolean} Success status
   */
  saveTelegramConfig(config) {
    try {
      // Validate config
      if (config.enabled && (!config.botToken || !config.chatId)) {
        throw new Error('Bot Token and Chat ID are required when enabled');
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Failed to save Telegram config:', error);
      return false;
    }
  }

  /**
   * Check if Telegram notifications are enabled
   * @returns {boolean}
   */
  isEnabled() {
    const config = this.getTelegramConfig();
    return config.enabled && config.botToken && config.chatId;
  }

  /**
   * Send a message via Telegram Bot API
   * @param {string} message - Message text
   * @returns {Promise<boolean>} Success status
   */
  async sendMessage(message) {
    if (!this.isEnabled()) {
      console.log('Telegram notifications disabled, skipping message:', message);
      return false;
    }

    const config = this.getTelegramConfig();
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: config.chatId,
          text: message,
          parse_mode: 'HTML'
        })
      });

      const result = await response.json();

      if (!result.ok) {
        throw new Error(result.description || 'Failed to send Telegram message');
      }

      console.log('Telegram notification sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      return false;
    }
  }

  /**
   * Send certificate expiring notification
   * @param {string} domain - Domain name
   * @param {number} daysUntilExpiry - Days until expiry
   */
  async notifyExpiring(domain, daysUntilExpiry) {
    const config = this.getTelegramConfig();
    if (!config.notifyOnExpiring) {
      return;
    }

    const message = `⚠️ <b>证书即将到期提醒</b>\n\n` +
      `域名: <code>${domain}</code>\n` +
      `剩余天数: <b>${daysUntilExpiry}</b> 天\n` +
      `时间: ${new Date().toLocaleString('zh-CN')}`;

    await this.sendMessage(message);
  }

  /**
   * Send renewal success notification
   * @param {string} domain - Domain name
   * @param {number} newExpiryDays - Days until new expiry (usually 90)
   */
  async notifyRenewalSuccess(domain, newExpiryDays = 90) {
    const config = this.getTelegramConfig();
    if (!config.notifyOnRenewalSuccess) {
      return;
    }

    const message = `✅ <b>证书续期成功</b>\n\n` +
      `域名: <code>${domain}</code>\n` +
      `新证书有效期: <b>${newExpiryDays}</b> 天\n` +
      `时间: ${new Date().toLocaleString('zh-CN')}`;

    await this.sendMessage(message);
  }

  /**
   * Send renewal failure notification
   * @param {string} domain - Domain name
   * @param {string} error - Error message
   */
  async notifyRenewalFailure(domain, error) {
    const config = this.getTelegramConfig();
    if (!config.notifyOnRenewalFailure) {
      return;
    }

    const message = `❌ <b>证书续期失败</b>\n\n` +
      `域名: <code>${domain}</code>\n` +
      `错误: ${error}\n` +
      `时间: ${new Date().toLocaleString('zh-CN')}`;

    await this.sendMessage(message);
  }

  /**
   * Test Telegram configuration by sending a test message
   * @returns {Promise<boolean>} Success status
   */
  async testConnection() {
    const message = `🔔 <b>Certple 测试通知</b>\n\n` +
      `Telegram 通知配置成功！\n` +
      `时间: ${new Date().toLocaleString('zh-CN')}`;

    return await this.sendMessage(message);
  }
}
