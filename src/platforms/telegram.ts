import axios from 'axios';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { ConfigService } from '../services/configService';
import logger from '../logger';
import { BasePlatform } from './platform';

export class Telegram extends BasePlatform {
    private readonly bot: Telegraf<Context<Update>>

    constructor() {
        super()
        this.bot = new Telegraf(ConfigService.Instance.telegramToken)
    }

    public listen(): void {
        this.bot.start((ctx) => {
            ctx.reply("Hello, this is a activity history record bot for StepN")
        })

        this.bot.on('photo', async ctx => {
            logger.info("New sceenshot received")
            const fileLink = await this.bot.telegram.getFileLink(ctx.message.photo[3])
            const file = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
            const result = await this.analyzer.parse(file.data)

            if (result.isSuccess()) {
                const resultValue = result.value
                this.sheet.append([resultValue])
                ctx.reply(`Action: ${resultValue.title} \nInOut: ${resultValue.inOut} \nCurrency: ${resultValue.currency} \nPrice: ${resultValue.price}`)
            }
            
        })

        this.bot.launch()
    }

}