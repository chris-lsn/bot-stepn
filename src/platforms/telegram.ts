import axios from 'axios';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import logger from '../logger';
import { BasePlatform } from './platform';

export class Telegram extends BasePlatform {
    bot: Telegraf<Context<Update>>

    constructor(telegramToken: string) {
        super()
        this.bot = new Telegraf(telegramToken)
    }

    public listen(): void {
        this.bot.start((ctx) => {
            ctx.reply("Hello, this is a activity history record bot for StepN")
        })

        this.bot.on('photo', async ctx => {
            logger.info("A new photo received")
            const fileLink = await this.bot.telegram.getFileLink(ctx.message.photo[3])
            const file = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
            const result = await this.analyzer.parse(file.data)

            if (result.isSuccess()) {
                const resultValue = result.value
                const appendResult = await this.sheet.append([resultValue])
                if (appendResult.isFailure()) {
                    logger.error(appendResult.error)
                }
                ctx.reply(`Action: ${resultValue.title}, InOut: ${resultValue.inOut}, Currency: ${resultValue.currency}, Price: ${resultValue.price}`)
            }
            
        })

        this.bot.launch()
    }

}