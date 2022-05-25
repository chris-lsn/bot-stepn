import { google } from 'googleapis'
import { STATUS_CODES } from 'http'

import { StepnRecord } from './stepnService'
import { Failure, Result, Success } from '../result'
import { ConfigService } from './configService'
const sheets = google.sheets('v4')

class Dao {
  private readonly startTime
  private readonly title
  private readonly inOut
  private readonly currency
  private readonly price
  private readonly energy
  private readonly level
  private readonly sneakerCode
  private readonly duration
  private readonly remarks
  private readonly emptyStr = '---'

  constructor(record: StepnRecord) {
    this.startTime = record.date 
    this.title = record.title 
    this.inOut = record.inOut
    this.currency = record.currency
    this.price = record.amount || this.emptyStr
    this.energy = record.energy || this.emptyStr
    this.level = record.level || this.emptyStr
    this.sneakerCode = record.sneakerCode || this.emptyStr
    this.duration = record.duration || this.emptyStr
    this.remarks = record.remarks || this.emptyStr
  }
  
  public toArray() {
    return [this.startTime, this.sneakerCode, this.level, this.energy, this.duration, this.title, this.inOut, this.currency, this.price, this.remarks]
  }
}

export class SheetService {
  private records: StepnRecord[]
  private readonly sheetId: string
  private readonly jwt
  private static _instance: SheetService
  private static config: ConfigService = ConfigService.Instance

  constructor(sheetId: string, email: string, key: string) {
    this.records = []
    this.sheetId = sheetId
    this.jwt = new google.auth.JWT({
      email,
      key,
      scopes: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/drive.file',
        'https://www.googleapis.com/auth/spreadsheets',
      ],
    })
  }

  public append(records: StepnRecord[]): void {
    this.records.push(...records)
  }

  public getRecords(): StepnRecord[] {
    return this.records
  }

  public async flush(): Promise<Result<string, Error>> {
    const tmpRecords = this.records
    this.records = []
    const daos = tmpRecords.map((record) => new Dao(record).toArray())
    try {
      const response = await sheets.spreadsheets.values.append({
        auth: this.jwt,
        spreadsheetId: this.sheetId,
        range: 'A1',
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: daos,
        },
      })
      return response.statusText === STATUS_CODES['200']
        ? new Success(response.statusText)
        : new Failure(new Error(response.statusText))
    } catch (err) {
      return new Failure(new Error(err as string))
    }
  }

  public static get Instance()
  {
    const { sheetId, googleServiceAccount, googlePrivateKey } = this.config
    return this._instance || (this._instance = new this(sheetId, googleServiceAccount, googlePrivateKey));
  }
}
