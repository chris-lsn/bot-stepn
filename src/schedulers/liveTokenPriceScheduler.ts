import logger from "../logger";
import CoinService, { Coin } from "../services/coinService";
import { ConfigService } from "../services/configService";
import { SheetService } from "../services/sheetService";

const schedule = require("node-schedule")

class LiveTokenPriceScheduler {
    private readonly sheet: SheetService = SheetService.Instance
    private readonly config: ConfigService = ConfigService.Instance
    private readonly coinService: CoinService = CoinService.Instance
    private readonly gstId = "16352"
    
    start(): void {
        schedule.scheduleJob("* */60 * * * *", async () => {
           const result = await this.coinService.fetchCoin(Coin.GST)
           if (result.isSuccess()){
             
           } else if (result.isFailure()) {
              logger.error(result.error.message);
           }
            
        })
    }
}

export default LiveTokenPriceScheduler