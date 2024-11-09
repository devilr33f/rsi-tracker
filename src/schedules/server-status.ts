import { oneLine, stripIndents } from 'common-tags'

import redis from '@/redis.js'
import { RSIService } from '@/services/rsi/rsi.js'
import { TelegramService } from '@/services/telegram.js'

import { Schedule } from './schedule.js'

export const RSISystemStatusMapping: Record<string, string> = {
  operational: 'Operational',
  maintenance: 'Maintenance',
  partial: 'Partial outage',
  major: 'Major outage',
  degraded: 'Degraded',
  unknown: 'Unknown',
}

export default new Schedule('*/5 * * * *', async () => {
  const { systems } = await RSIService.getServerStatus()

  const statusChanges = []
  for (const system of systems) {
    const cached = await redis.get(`server_status:${system.name}`)

    if (!cached || cached !== system.status) {
      await redis.set(`server_status:${system.name}`, system.status)

      statusChanges.push({
        system,
        oldStatus: cached || 'unknown',
        newStatus: system.status,
      })
    }
  }

  if (statusChanges.length > 0) {
    const emoji = statusChanges.filter((system) => system.newStatus !== 'operational').length > 1 ? '🔥' : '✅'
    const message = statusChanges.length > 1
      ? stripIndents`
        ${emoji} <b>Systems status changed</b>
        ${statusChanges.map((system) => oneLine`
          - <b>${system.system.name}</b>: <code>${RSISystemStatusMapping[system.oldStatus]}</code> → <code>${RSISystemStatusMapping[system.newStatus]}</code>
        `).join('\n')}
      `
      : oneLine`
        ${emoji} <b>${statusChanges[0].system.name}</b>
        status has been updated:
        <code>${RSISystemStatusMapping[statusChanges[0].oldStatus]}</code> → <code>${RSISystemStatusMapping[statusChanges[0].newStatus]}</code>
      `

    await TelegramService.sendMessage(message)
  }
})
