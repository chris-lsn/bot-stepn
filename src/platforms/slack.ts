import { STATUS_CODES } from 'http'
import axios from 'axios'

import { Failure, Result, Success } from '../result'
import { App } from '@slack/bolt'
import { BasePlatform } from './platform'

export class Slack extends BasePlatform {
  readonly app: App

  constructor(slackToken: string, slackSecret: string) {
    super()
    this.app = new App({
      token: slackToken,
      signingSecret: slackToken,
    })
  }
  
  private async fetchImage(url: string, token: string): Promise<Result<Buffer, Error>> {
    const res = await axios.get(url, {
      responseType: 'arraybuffer',
      headers: { Authorization: `Bearer ${token}` },
    })
    return res.statusText === STATUS_CODES['200']
      ? new Success(Buffer.from(res.data))
      : new Failure(new Error('Cannot fetch image from your slack.'))
  }

  public listen(): void {
    this.app.event('message', async ({ event }) => {
      if (event.subtype !== 'file_share' || event.files == null) {
        return
      }
      const images = await Promise.all(
        event.files.map(async (f) => {
          if (f.url_private != null) {
            const result = await this.fetchImage(f.url_private, this.config.slackToken)
            return result.isSuccess() ? result.value : console.error(result.error)
          }
        })
      )
    
      const parseResults = await Promise.all(
        images
          .flatMap((x) => x ?? []) // undefinedを除去
          .map(async (image) => {
            const result = await this.analyzer.parse(image)
            return result.isSuccess() ? result.value : console.error(result.error)
          })
      )
    
      const appendResult = await this.sheet.append(parseResults.flatMap((x) => x ?? []))
      if (appendResult.isFailure()) {
        console.error(appendResult.error)
      }
    })
  }
}
