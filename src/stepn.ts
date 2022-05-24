import vision, { ImageAnnotatorClient } from '@google-cloud/vision'
import { auth } from 'google-auth-library'

import { Failure, Result, Success } from './result'

export type StepnRecord = {
  title: 'Repair' | 'Level Up' | 'Move & Earn'
  inOut: 'IN' | 'OUT'
  currency: 'GST'
  price: number
  duration: string
  startTime: string
  energy: number
  level: number
  sneakerCode: string
}

export class StepnAnalyzer {
  private readonly client: ImageAnnotatorClient
  private readonly datetimeRegex = /(?<date>\d{2}\/\d{2}\/\d{4}\s\d{2}:\d{2})/
  private readonly costRegex = /(?<num>\d+(\.\d+)?\s*)GST/
  private readonly earningRegex = /\+\s*(?<num>\d+(\.\d+)?)/
  private readonly durationRegex = /(?<duration>\d{2}:\d{2}:\d{2})/
  private readonly usedEnergyRegex = /(.*(?<usedEnergy>\d+\.\d+))/
  private readonly levelRegex = /(Lv.*(?<level>\d+))/
  private readonly sneakerCodeRegex = /(?<sneakerCode>\d{9})/

  private readonly identifier = {
    REPAIR: 'REPAIR',
    LEVEL_UP: 'LEVEL UP',
    STEPN: 'Long press to identify and download APP', // 歩いてGSTを稼いだ時の画面識別用
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
      return text
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
    if (text.match(this.identifier.REPAIR)) {
      const target = text.match(this.costRegex)
      return target?.groups?.num != null
        ? new Success({
            title: 'Repair',
            inOut: 'OUT',
            currency: 'GST',
            price: Number(target?.groups?.num) || 0,
            startTime: '',
            duration: '',
            energy: 0,
            level: Number(target?.groups?.level) || 0,
            sneakerCode: ''
          })
        : new Failure(new Error('Cannot extract values.'))
    }

    if (text.match(this.identifier.LEVEL_UP)) {
      const target = text.match(this.costRegex)
      return target?.groups?.num != null
        ? new Success({
            title: 'Level Up',
            inOut: 'OUT',
            currency: 'GST',
            price: Number(target?.groups?.num) || 0,
            startTime: '',
            duration: '',
            energy: 0,
            level: Number(target?.groups?.level) || 0,
            sneakerCode: ''
          })
        : new Failure(new Error('Cannot extract values.'))
    }

    if (text.match(this.identifier.STEPN)) {
      const earningTarget = text.match(this.earningRegex)
      const startTimeTarget = text.match(this.datetimeRegex)
      const durationTarget = text.match(this.durationRegex)
      const usedEnergyTarget = text.match(this.usedEnergyRegex)
      const levelTarget = text.match(this.levelRegex)
      const sneakerCodeTarget = text.match(this.sneakerCodeRegex)
     
      return new Success({
            title: 'Move & Earn',
            inOut: 'IN',
            currency: 'GST',
            price: Number(earningTarget?.groups?.num) || 0,
            startTime: startTimeTarget?.groups?.date || '',
            duration: durationTarget?.groups?.duration || '',
            energy: Number(usedEnergyTarget?.groups?.usedEnergy) || 0,
            level: Number(levelTarget?.groups?.level) || 0,
            sneakerCode: `#${sneakerCodeTarget?.groups?.sneakerCode}` || ''
          })

    }

    return new Failure(new Error('The expected string was not included.'))
  }
}
