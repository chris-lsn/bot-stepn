import { Config, Platform } from './config'
import { Slack } from './platforms/slack';
import { BasePlatform } from './platforms/platform';
import { Telegram } from './platforms/telegram';
import logger from './logger';
const app = require('express')()
const config: Config = Config.getInstance();

let bot: BasePlatform
switch (config.platform) {
  case Platform.SLACK:
    bot = new Slack(config.slackToken, config.slackSecret)
  case Platform.TELEGRAM:
    bot = new Telegram(config.telegramToken)
}

if (bot !== null) {
  logger.info('⚡️ STEPN BOT is running!')
  bot.listen()
  app.listen(config.port)
} else {
  logger.error(`Inputted Plaform: ${config.platform} isn't supported`)
}


