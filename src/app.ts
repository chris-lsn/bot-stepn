import { ConfigService, Platform } from './services/configService'
import { Slack } from './platforms/slack';
import { BasePlatform } from './platforms/platform';
import { Telegram } from './platforms/telegram';
import logger from './logger';
import AppendRecordScheduler from './schedulers/appendRecordScheduler';
import LiveTokenPriceScheduler from './schedulers/liveTokenPriceScheduler';

const app = require('express')()
const config: ConfigService = ConfigService.Instance;
const ars = new AppendRecordScheduler()
const ltps = new LiveTokenPriceScheduler()

let bot: BasePlatform

app.get('*', (req: any, res: any) => {
  res.send("Enjoy the StepN bot :)")
})

app.listen(config.port, () => {
  // Bot
  switch (config.platform) {
    case Platform.SLACK:
      bot = new Slack()
      break
    case Platform.TELEGRAM:
      bot = new Telegram()
      break
    default:
      logger.error(`Inputted Plaform: ${config.platform} isn't supported`)
      process.exit(1)
  }
  bot.listen()

  // Scheduler
  ars.start()
  ltps.start()
  logger.info('⚡️ STEPN BOT is running!')
})






