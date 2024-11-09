export interface RSIOptions {
  username: string
  password: string
  deviceId: string
}

export interface RSIUpdaterFile {
  url: string
  sha512: string
  size: number
}

export interface RSIUpdaterResponse {
  version: string
  files: RSIUpdaterFile[]
  path: string
  sha512: string
  releaseDate: string
}

export interface RSIResponse<T> {
  success: number
  code: string
  msg: string
  data: T
}

export interface RSIEnvironement {
  exp: string
  version_str: string
  copy_erase_status: boolean
}

export interface RSIAccount {
  account_id: string
  session_name: string
  session_id: string
  citizen_id: string
  tracking_metrics_id: string
  nickname: string
  displayname: string
  roles: string[]
  badges: Record<string, string>
  agreements: any[]
  envs: Record<string, RSIEnvironement>
  avatar: string
}

export interface RSIS3Url {
  url: string
  signatures: string
}

export interface RSIGameRelease {
  gameId: string
  channelId: string
  version: number
  versionLabel: string
  platformURL: string
  servicesEndpoint: string
  universeHost: string
  universePort: number
  executable: string
  installDir: string
  launchOptions: string
  network: any
  platformId: string
  manifest: RSIS3Url
  p4kBase: RSIS3Url
  p4kBaseVerificationFile: RSIS3Url
  objects: RSIS3Url
}

export interface RSIGameChannel {
  id: string
  name: string
  version: number
  versionLabel: string
  servicesEndpoint: string
  installDir: string
  network: any
  platformId: string
  nid: string
  weight: any
}

export interface RSIGame {
  id: string
  name: string
  channels: RSIGameChannel[]
}

export interface RSILibrary {
  games: RSIGame[]
}

export interface RSIStatusIssue {
  is: 'issue'
  title: string
  createdAt: string
  lastMod: string
  permalink: string
  severity: string
  resolved: boolean
  informational: boolean
  resolvedAt: string
  affected: string[]
  filename: string
}

export interface RSIStatusCategory {
  name: string
  hideTitle: boolean
  closedByDefault: boolean
}

export interface RSIStatusSystem {
  name: string
  category: string
  status: string // @note: known - "operational"
  unresolvedIssues: RSIStatusIssue[]
}

export interface RSIStatusResponse {
  is: 'index'
  cStateVersion: string
  apiVersion: string
  title: string
  languageCodeHTML: string
  languageCode: string
  baseURL: string
  description: string
  summaryStatus: string
  categories: RSIStatusCategory[]
  systems: RSIStatusSystem[]
  buildDate: string
  buildTime: string
  buildTimezone: string
  colorBrand: string
  colorOk: string
  colorDisrupted: string
  colorDown: string
  colorNotice: string
  alwaysKeepBrandColor: string
  logo: string
  googleAnalytics: string
}
