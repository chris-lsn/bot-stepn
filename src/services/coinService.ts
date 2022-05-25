import axios from "axios";
import { ConfigService } from "./configService";
import { Failure, Result, Success } from "../result";

export default class CoinService {
    private static _instance: CoinService
    private readonly config: ConfigService = ConfigService.Instance

    public async fetchCoinPrice(id: string): Promise<Result<string, Error>> {
        try {
            const response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest', {
                headers: {
                    'X-CMC_PRO_API_KEY': this.config.coinMarketCapApiKey
                },
                params: {
                    id
                }
            })

            if (response) {
                const price = response.data.data['16352'].quote['USD'].price
                return new Success(price)
            }
        } catch (err: any) {
            return new Failure(new Error("Exception in fetchCoinPrice: " + err.response.data) )
        }
        return new Failure(new Error())
    }

    public static get Instance()
    {
        return this._instance || (this._instance = new this());
    }
}