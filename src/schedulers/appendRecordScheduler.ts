import logger from "../logger";
import { SheetService } from "../services/sheetService";

const schedule = require("node-schedule")

class AppendRecordScheduler {
    private readonly sheet: SheetService = SheetService.Instance

    start(): void {
        schedule.scheduleJob("*/5 * * * * *", async () => {
            if (this.sheet.getRecords().length > 0) {
                const result = await this.sheet.flush()
                if (result.isFailure()) 
                    logger.error(`Fail to append row to sheet - details: ${result.error}`)
            }
        })
    }
}

export default AppendRecordScheduler