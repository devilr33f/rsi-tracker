import { Redis } from 'ioredis'

import config from './config.js'

export default new Redis(config.redis.url)
