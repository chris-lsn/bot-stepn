import axios from "axios";
import { ConfigService } from "./configService";
import { Failure, Result, Success } from "../result";

export enum Coin {
    GST = 16352,
    GMT = 18069,
    SOL = 5426
}

export default class CoinService {
    private static _instance: CoinService
    private readonly config: ConfigService = ConfigService.Instance

    public async fetchCoin(coin: Coin): Promise<Result<any, Error>> {
        try {
            const response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest', {
                headers: {
                    'X-CMC_PRO_API_KEY': this.config.coinMarketCapApiKey
                },
                params: {
                    id: coin
                }
            })

            if (response) {
                return new Success(response.data.data[coin])
            }
        } catch (err: any) {
            return new Failure(new Error("Exception in fetchCoinPrice: " + err.response) )
        }
        return new Failure(new Error())
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }
}