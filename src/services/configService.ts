/* eslint-disable no-unused-vars */
import * as util from 'util'

export enum Platform {
  TELEGRAM,
  SLACK
}

export class ConfigService {
  readonly port: number | string
  readonly platform: Platform
  readonly slackSecret: string
  readonly slackToken: string
  readonly telegramToken: string
  readonly sheetId: string
  readonly googleCredentials: string
  readonly googleServiceAccount: string
  readonly googlePrivateKey: string
  readonly coinMarketCapApiKey: string

  private static _instance: ConfigService

  constructor() {
    this.port = process.env.PORT || 3000
    this.platform = Platform[process.env.PLATFORM as keyof typeof Platform]!
    this.slackSecret = process.env.SLACK_SIGNING_SECRET!
    this.slackToken = process.env.SLACK_BOT_TOKEN!
    this.telegramToken = process.env.TG_BOT_TOKEN!
    this.sheetId = process.env.GOOGLE_SHEET_ID!
    this.googleCredentials = process.env.GOOGLE_CREDENTIALS!
    this.coinMarketCapApiKey = process.env.COINMARKETCAP_API_TOKEN!

    const keys = JSON.parse(this.googleCredentials)
    this.googleServiceAccount = keys.client_email
    this.googlePrivateKey = keys.private_key
  }

  private checkEnvironmentVariables = () => {
    const errorTemplate: string = 'Environment variable `{0}` is not set.'

    if (!process.env.PLATFORM) {
      console.error(new Error(util.format(errorTemplate, 'PLATFORM')))
      process.exit(1)
    }

    if (Platform.SLACK == null) {
      if (!process.env.SLACK_SIGNING_SECRET) {
        console.error(new Error(util.format(errorTemplate, 'SLACK_SIGNING_SECRET')))
        process.exit(1)
      }
      if (!process.env.SLACK_BOT_TOKEN) {
        console.error(new Error(util.format(errorTemplate, 'SLACK_BOT_TOKEN')))
        process.exit(1)
      }
    } else if (this.platform === Platform.TELEGRAM) {
      if (!process.env.TG_BOT_TOKEN) {
        console.error(new Error(util.format(errorTemplate, 'TG_BOT_TOKEN')))
        process.exit(1)
      }
    }
  
    if (!process.env.GOOGLE_SHEET_ID) {
      console.error(new Error(util.format(errorTemplate, 'GOOGLE_SHEET_ID')))
      process.exit(1)
    }
    if (!process.env.GOOGLE_CREDENTIALS) {
      console.error(new Error(util.format(errorTemplate, 'GOOGLE_CREDENTIALS')))
      process.exit(1)
    }
  }

  public static get Instance()
  {
      return this._instance || (this._instance = new this());
  }
}
