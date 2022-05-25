import vision, { ImageAnnotatorClient } from '@google-cloud/vision'
import { auth } from 'google-auth-library'
import moment from 'moment'

import { Failure, Result, Success } from '../result'

export type StepnRecord = {
  title: 'Repair' | 'Level Up' | 'Move & Earn'
  inOut: 'IN' | 'OUT'
  currency: 'GST' | 'GMT'
  amount: number
  duration?: string
  date: string
  energy?: number
  level?: number
  sneakerCode?: string,
  durability?: string,
  remarks?: string
}

export class StepnAnalyzer {
  private readonly client: ImageAnnotatorClient
  private readonly datetimeRegex = /(?<date>\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2})/
  private readonly amountRegex = /(?<amount>\d+(\.\d+)?\s*)GST/
  private readonly earningRegex = /\+\s*(?<earning>\d+(\.\d+)?)/
  private readonly durationRegex = /(?<duration>\d{2}:\d{2}:\d{2})/
  private readonly usedEnergyRegex = /(\-.*(?<usedEnergy>\d+\.\d+))/
  private readonly levelRegex = /(Lv\s(?<level>\d+))/
  private readonly sneakerCodeRegex = /(?<sneakerCode>\d{9})/
  private readonly durabilityRegex = /(?<durability>\d+\/100)/

  private readonly identifier = {
    REPAIR: 'REPAIR',
    LEVEL_UP: 'LEVEL UP',
    STEPN: 'SHARE YOUR RUN', // 歩いてGSTを稼いだ時の画面識別用
  } as const

  constructor(credentials: string) {
    const keys = JSON.parse(credentials)
    this.client = new vision.ImageAnnotatorClient({
      authClient: auth.fromJSON(keys),
    })
  }

  public async parse(image: Buffer): Promise<Result<StepnRecord, Error>> {
    const text = await this.detectText(image)
    if (text.isFailure()) {
      return new Failure(text.error)
    }
    return await this.parseText(text.value)
  }

  private async detectText(image: Buffer): Promise<Result<string, Error>> {
    const [result] = await this.client.textDetection(image)
    // Vision APIでパースできない不正なBufferファイルの場合
    if (result.error != null) {
      return new Failure(
        new Error(`Some error occurred during the text detection process. ${result.error}`)
      )
    }
    // 文字を検出できない画像の場合
    if (
      result.textAnnotations == null ||
      result.textAnnotations.length === 0 ||
      result.textAnnotations[0].description == null
    ) {
      return new Failure(new Error('Cannot detect any texts from the image.'))
    }
    // 正常に文字を検出できる場合
    return new Success(result.textAnnotations[0].description)
  }

  private parseText(text: string): Result<StepnRecord, Error> {
    const currentTime = moment().format('DD/MM/yyyy HH:MM')
    if (text.match(this.identifier.REPAIR)) {
      console.log(text)
      const amount = Number(text.match(this.amountRegex)?.groups?.amount)
      const durability = text.match(this.durabilityRegex)?.groups?.durability

      if (Number.isNaN(amount) || !durability)
        return new Failure(new Error('Cannot extract values.'))

      return new Success({
        title: 'Repair',
        inOut: 'OUT',
        currency: 'GST',
        amount: Number(amount),
        date: currentTime,
        durability
      })
    }

    if (text.match(this.identifier.LEVEL_UP)) {
      const amount: number = Number(text.match(this.amountRegex)?.groups?.amount)
      const currentLv: number = Number(text.match(this.levelRegex)?.groups?.level)
      const nextLv: number = currentLv + 1

      if (Number.isNaN(amount) || !currentLv || Number.isNaN(nextLv)) 
        return new Failure(new Error('The expected string was not included.')) 

      return new Success({
        title: 'Level Up',
        inOut: 'OUT',
        currency: 'GST',
        amount,
        date: currentTime,
        level: currentLv,
        remarks: `Lv${currentLv} -> Lv${nextLv}`
      })

    }

    if (text.match(this.identifier.STEPN)) {
      const amount = Number(text.match(this.earningRegex)?.groups?.earning)
      const date = text.match(this.datetimeRegex)?.groups?.date
      const duration = text.match(this.durationRegex)?.groups?.duration
      const durability = text.match(this.durabilityRegex)?.groups?.durability
      const energy = Number(text.match(this.usedEnergyRegex)?.groups?.usedEnergy)
      const level = Number(text.match(this.levelRegex)?.groups?.level)
      const sneakerCode = `#${text.match(this.sneakerCodeRegex)?.groups?.sneakerCode}`

      console.log(amount, date, duration, energy, level, sneakerCode)

      if (Number.isNaN(amount) || !date || !duration || Number.isNaN(energy) || Number.isNaN(level) || !sneakerCode)
        return new Failure(new Error('The expected string was not included.'))

      return new Success({
        title: 'Move & Earn',
        inOut: 'IN',
        currency: 'GST',
        amount,
        date,
        duration,
        durability,
        energy,
        level,
        sneakerCode
      })
    }

    return new Failure(new Error('This screenshot pattern is not supported.'))
  }
}
