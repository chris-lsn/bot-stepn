import axios from 'axios';
import { Context, Telegraf } from 'telegraf';
import { Update } from 'typegram';
import { ConfigService } from '../services/configService';
import logger from '../logger';
import { BasePlatform } from './platform';
import CoinService, { Coin } from '../services/coinService';
import moment from 'moment';

export class Telegram extends BasePlatform {
    private readonly bot: Telegraf<Context<Update>>
    private readonly coinService: CoinService = CoinService.Instance

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

            try {
                const fileLink = await this.bot.telegram.getFileLink(ctx.message.photo[3])
                const file = await axios.get(fileLink.href, { responseType: 'arraybuffer' });
                const result = await this.analyzer.parse(file.data)

                if (result.isSuccess()) {
                    const resultValue = result.value
                    this.sheet.append([resultValue])
                    this.reply(resultValue, ctx)
                } else if (result.isFailure()) {
                    throw result.error
                }
            } catch (err: any) {
                logger.error(err.message)
                ctx.reply(err.message)
            }
        })

        this.bot.command(['gst','gmt','sol'], async ctx => {
            const symbol: string = ctx.message.text.replace('/', '').toUpperCase()
            const coin: Coin = Coin[symbol as keyof typeof Coin]

            const result = await this.coinService.fetchCoin(coin)
            const divider = `-------------------------------------\n`
            if (result.isSuccess()) {
                const { name, symbol, quote, last_updated } = result.value
                ctx.replyWithHTML(`<b>${symbol} - ${name}</b> \n` + 
                divider + 
                `Current Price: $${Number(quote.USD.price).toFixed(3)} USD\n` + 
                `Last update: ${moment(last_updated).format("YYYY-MM-DD HH:MM")}`)
            } else {
                logger.error(result.error.message)
                ctx.reply(result.error.message)
            }
        })

        this.bot.launch()
    }

}