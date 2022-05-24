import { Config, Platform } from './config'
import { Slack } from './platforms/slack';
import { BasePlatform } from './platforms/platform';
import { Telegram } from './platforms/telegram';
const app = require('express')()
const config: Config = Config.getInstance();

let bot: BasePlatform
switch (config.platform) {
  case Platform.SLACK:
    bot = new Slack(config.slackToken, config.slackSecret)
    break;
  case Platform.TELEGRAM:
    bot = new Telegram(config.telegramToken)
    break;
}
bot.listen()
console.log('⚡️ STEPN BOT is running!')
app.listen(config.port)

