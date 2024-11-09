import rsi from '@/services/rsi/rsi.js'

import { Schedule } from './schedule.js'

export default new Schedule('*/30 * * * *', async () => {
  await rsi.login()
})
