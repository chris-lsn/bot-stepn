import { Context } from "telegraf";
import { ConfigService } from "../services/configService";
import { SheetService } from "../services/sheetService";
import { StepnAnalyzer, StepnRecord } from "../services/stepnService";

export abstract class BasePlatform {
    protected readonly config: ConfigService = ConfigService.Instance
    protected readonly sheet: SheetService = SheetService.Instance
    protected readonly analyzer: StepnAnalyzer

    constructor() {
        this.analyzer = new StepnAnalyzer(this.config.googleCredentials)
    }

    protected reply(record: StepnRecord, ctx: Context): void {
        const header = `<b>${record.title} - ${record.date}</b>\n`
        const divider = `-------------------------------\n`
        const remarks = record.remarks ? `Remarks: ${record.remarks}\n` : ''
        let message = header + divider
        switch (record.title) {
            case 'Move & Earn':
               message +=
                    `Sneaker Lv. ${record.level}\n` +
                    `Time: ${record.duration}\n` +
                    `Durability: ${record.durability}\n` +
                    `Energy: ${-1.0 * record.energy!}\n` +
                    divider +
                    `<b>Earned GST: ${record.amount}</b>`
                break;
            case 'Repair':
                // Hard to extract the repair durability, use 100/100 instead first
                message +=
                `Durability: ${record.durability} -> 100/100\n` +
                remarks +
                divider +
                `<b>Cost GST: ${record.amount}</b>`
                break;
            case 'Level Up':
                message +=
                `Level: ${record.remarks}\n` +
                divider +
                `<b>Cost GST: ${record.amount}</b>`
                break;

        }
        ctx.replyWithHTML(message)

    }

    public abstract listen(): void;
}