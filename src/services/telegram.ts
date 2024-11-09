import { Telegram } from 'puregram'

import config from '@/config.js'

export class TelegramService {
  private static telegram = Telegram.fromToken(config.telegram.token)

  static async sendMessage (message: string): Promise<void> {
    await this.telegram.api.sendMessage({
      chat_id: config.telegram.chatId,
      text: message,
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
      suppress: true,
    })
  }

  static async updatePinnedMessage (message: string): Promise<void> {
    await this.telegram.api.editMessageText({
      chat_id: config.telegram.chatId,
      message_id: config.telegram.overviewMessageId,
      text: message,
      parse_mode: 'HTML',
      link_preview_options: {
        is_disabled: true,
      },
      suppress: true,
    })
  }
}
