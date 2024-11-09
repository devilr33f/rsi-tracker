export class Schedule {
  callback: () => Promise<void>
  cron: string
  // eslint-disable-next-line no-useless-constructor
  constructor (cron: string, callback: () => Promise<void>) {
    this.cron = cron
    this.callback = callback
  }

  get expression (): string {
    return this.cron
  }

  get run (): () => Promise<void> {
    return this.callback
  }
}
