/* global RequestInit */
import { parse as parseYaml } from 'yaml'

import config from '@/config.js'

import type { RSIAccount, RSIGameRelease, RSILibrary, RSIOptions, RSIResponse, RSIStatusResponse, RSIUpdaterResponse } from './types.js'

export class RSIService {
  private static LAUNCHER_API_BASE_URL = 'https://robertsspaceindustries.com/api/launcher/v3'
  private static LAUNCHER_UPDATER_URL = 'https://install.robertsspaceindustries.com/rel/2/latest.yml'
  private static SERVER_STATUS_URL = 'https://status.robertsspaceindustries.com/index.json'
  private static USER_AGENT = `RSI Tracker/${config.package.version} (+https://github.com/devilr33f/rsi-tracker)`

  token?: string

  // eslint-disable-next-line no-useless-constructor
  constructor (private options: RSIOptions) {}

  static getLatestLauncher (): Promise<RSIUpdaterResponse> {
    return fetch(RSIService.LAUNCHER_UPDATER_URL, {
      headers: { 'User-Agent': RSIService.USER_AGENT },
    }).then((r) => r.text())
      .then((r) => parseYaml(r))
  }

  static getServerStatus (): Promise<RSIStatusResponse> {
    return fetch(RSIService.SERVER_STATUS_URL, {
      headers: { 'User-Agent': RSIService.USER_AGENT },
    }).then((r) => r.json())
  }

  private $request (url: string, options: RequestInit = {}): Promise<Response> {
    return fetch(`${RSIService.LAUNCHER_API_BASE_URL}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': RSIService.USER_AGENT,
        'X-RSI-Device': this.options.deviceId,
        ...(this.token ? { 'X-RSI-Token': this.token } : {}),
      },
      method: 'POST',
      ...options,
    })
  }

  getClaims (): Promise<RSIResponse<string>> {
    return this.$request('/games/claims').then(r => r.json())
  }

  getGameRelease (claims: string, gameId: string, channelId: string): Promise<RSIResponse<RSIGameRelease>> {
    return this.$request('/games/release', { body: JSON.stringify({ claims, gameId, channelId }) }).then(r => r.json())
  }

  getLibrary (claims: string): Promise<RSIResponse<RSILibrary>> {
    return this.$request('/games/library', { body: JSON.stringify({ claims }) }).then(r => r.json())
  }

  async login (): Promise<RSIResponse<RSIAccount>> {
    const { version: launcherVersion } = await RSIService.getLatestLauncher().catch(() => ({ version: null }))
    if (!launcherVersion) throw new Error('Could not get latest launcher version')

    const body = {
      username: this.options.username,
      password: this.options.password,
      remember: true,
      launcherVersion,
    }

    const response = await this.$request('/signin', { body: JSON.stringify(body) }).then(r => r.json())

    if (response.data && response.data.session_id) {
      this.token = response.data.session_id
    }

    return response
  }
}

export default new RSIService({ username: config.rsi.username, password: config.rsi.password, deviceId: config.rsi.deviceId })
