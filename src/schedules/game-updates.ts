import { oneLine, stripIndents } from 'common-tags'

import redis from '@/redis.js'
import rsi from '@/services/rsi/rsi.js'
import { TelegramService } from '@/services/telegram.js'

import { Schedule } from './schedule.js'

const SIMILAR_LABEL_WARNING_MINI = '<i>(possibly republished)</i>'
const SIMILAR_LABEL_WARNING_FULL = '⚠️ <b>This version possibly was republished with a similar label.</b>'

export default new Schedule('*/5 * * * *', async () => {
  const { data: claims } = await rsi.getClaims()
  const { data: { games } } = await rsi.getLibrary(claims)

  const results = []

  for (const game of games) {
    for (const channel of game.channels) {
      const { data: gameRelease } = await rsi.getGameRelease(claims, game.id, channel.id)
      const cached = await redis.get(`game_release:${game.id}:${channel.id}`).then((r) => r ? JSON.parse(r) : null)

      if (!cached || cached.version !== gameRelease.version) {
        await redis.set(`game_release:${game.id}:${channel.id}`, JSON.stringify({ version: gameRelease.version, versionLabel: gameRelease.versionLabel }))

        results.push({
          game,
          channel,
          oldVersion: cached ?? {
            version: 'unknown',
            versionLabel: 'unknown',
          },
          newVersion: {
            version: gameRelease.version ?? 'unknown',
            versionLabel: gameRelease.versionLabel ?? 'unknown',
          },
        })
      }
    }
  }

  if (results.length > 0) {
    const message = results.length > 1
      ? stripIndents`
        🎮 <b>Game Updates</b>
        ${results.map((result) => oneLine`
          - <b>${result.game.name}</b>
          <i>(${result.channel.id})</i>:
          <code>${result.oldVersion.versionLabel}</code> → <code>${result.newVersion.versionLabel}</code> ${result.newVersion.versionLabel === result.oldVersion.versionLabel ? SIMILAR_LABEL_WARNING_MINI : ''}
        `).join('\n')}
      `
      : oneLine`
        🎮 <b>${results[0].game.name}</b>
        <i>(${results[0].channel.id})</i>
        has been updated:
        <code>${results[0].oldVersion.versionLabel}</code> → <code>${results[0].newVersion.versionLabel}</code> ${results[0].newVersion.versionLabel === results[0].oldVersion.versionLabel ? SIMILAR_LABEL_WARNING_FULL : ''}
      `

    await TelegramService.sendMessage(message)
  }
})
