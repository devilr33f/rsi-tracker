import { oneLine, stripIndents } from 'common-tags'

import rsi, { RSIService } from '@/services/rsi/rsi.js'
import { TelegramService } from '@/services/telegram.js'

import { Schedule } from './schedule.js'
import { RSISystemStatusMapping } from './server-status.js'

export default new Schedule('*/5 * * * *', async () => {
  const { data: claims } = await rsi.getClaims()

  const [
    { data: { games } },
    { summaryStatus },
    { version: launcherVersion },
  ] = await Promise.all([
    rsi.getLibrary(claims),
    RSIService.getServerStatus(),
    RSIService.getLatestLauncher(),
  ])

  const gameVersions = games.map((game) => {
    return game.channels.map((channel) => {
      return {
        game,
        channel,
        version: channel.versionLabel,
      }
    })
  }).flat()

  const message = stripIndents`
    ℹ️ <b>Current information</b>

    🚪 <b>Launcher version:</b> <code>${launcherVersion}</code>
    📊 <b>RSI overall status:</b> <code>${RSISystemStatusMapping[summaryStatus]}</code>

    🎮 <b>Game versions:</b>
    ${gameVersions.map(({ game, channel, version }) => oneLine`
      - <b>${game.name}</b>
      <i>(${channel.id})</i>:
      <code>${version}</code>
    `).join('\n')}
  `

  await TelegramService.updatePinnedMessage(message)
})
