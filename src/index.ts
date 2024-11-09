import { oneLine } from 'common-tags'
import { schedule } from 'node-cron'
import { createLogger, format, transports } from 'winston'

import config from '@/config.js'

import schedules from './schedules/index.js'
import rsi from './services/rsi/rsi.js'

const logger = createLogger({
  level: 'info',
  defaultMeta: { type: 'index' },
  format: format.combine(
    format.colorize({ all: true }),
    format.timestamp(),
    format.printf(({ level, message, timestamp, type }) => {
      return `${timestamp} [${level}] ${type}: ${message}`
    }),
  ),
  transports: [
    new transports.Console(),
  ],
})

const init = async () => {
  logger.info(oneLine`
    starting
    ${config.package.name}
    (${config.package.version})
    in ${config.package.mode} mode...
  `)

  try {
    const { success, data: loginResponse } = await rsi.login()
    if (!success) throw new Error('Login failed')

    logger.info(`Logged in as ${loginResponse.nickname} (#${loginResponse.account_id})`)
  } catch (error) {
    logger.error(error)
    process.exit(1)
  }

  logger.info(`Starting ${schedules.length} schedules...`)
  for (const _schedule of schedules) {
    schedule(_schedule.expression, _schedule.run)
  }
}

init()
