import { oneLine } from 'common-tags'

import redis from '@/redis.js'
import { RSIService } from '@/services/rsi/rsi.js'
import { TelegramService } from '@/services/telegram.js'

import { Schedule } from './schedule.js'

export default new Schedule('*/5 * * * *', async () => {
  const { version } = await RSIService.getLatestLauncher()
  const cached = await redis.get('launcher_version')

  if (cached !== version) {
    await redis.set('launcher_version', version)

    const message = oneLine`
      🔄 <b>RSI Launcher has been updated:</b>
      <code>${version}</code>
    `

    await TelegramService.sendMessage(message)
  }
})
