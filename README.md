# bot-stepn

The Slack/Telegram BOT program to keep track of [STEPN](https://stepn.com/).

It analyzes the following images and records the GST earned or used in the game in a Google Spreadsheet.
- Results screen after walking
- Screenshot of shoe level up
- Screenshot of Shoe repair
- Latest token price fetching

## Preparation

### Prepare accounts for the following services
- [Slack](https://slack.com/) or [Telegram](https://web.telegram.org/)
- [Google Cloud Platform (GCP)](https://cloud.google.com/)
- [Heroku](https://signup.heroku.com/)
- [CoinMarketCap](https://coinmarketcap.com/api/)

### Preparation for Heroku
1. Create an application and get URL of this application

### Preparation for Slack
1. Create a channel for BOT
2. Prepare a bot token and a signing secret and keep them on hand ([ref](https://slack.dev/bolt-js/ja-jp/tutorial/getting-started))
3. Enable events([ref](https://api.slack.com/apis/connections/events-api))
4. Set the URL prepared by preparation for Heroku
5. Add `message.channels` to subscribe event
6. Add the application prepared in steps 2~5 to the channel created in step 1

### Preparation for Telegram
1. Create a bot via Bot Father([ref](https://core.telegram.org/bots#3-how-do-i-create-a-bot))
2. Copy the access token and keep it on hand

### Preparation for GCP
1. Activate Cloud vision API
2. Prepare a service account to access Cloud vision API and download the service account key
3. Activate Google Sheets API and Google Drive API
4. Create a new Google Spreadsheet and note the sheet ID
5. Share the Google Spreadsheet with the service account you created

### Preparation for CoinMarketCoin
1. Create a account with Basic Plan
2. Copy the API token on dashboard and keep it on hand

### Preparation for Heroku again
1. Set environment variables on the app's dashboard. Set the following environment variables, referring to `.env.sample`
   1. `PLATFORM`: Communication Platform - either 'SLACK' or 'TELEGRAM'
   1. `SLACK_SIGNING_SECRET`: Signing Secret prepared in preparation for Slack
   2. `SLACK_BOT_TOKEN`: Bot token prepared by Slack
   3. `TG_BOT_TOKEN`: Bot token prepared by Telegram
   4. `COINMARKETCAP_API_TOKEN`: API token prepared by CoinMarketCap
   5. `GOOGLE_SHEET_ID`: ID of Google Spreadsheet prepared by GCP
   6. `GOOGLE_CREDENTIALS`: Copy and paste the contents of the service account key downloaded in preparation for GCP.
2. Deploy this app to heroku
3. Add the application URL on [Kaffeine](https://kaffeine.herokuapp.com/) to prevent the app being idle


## Usage

### Record GST earned by walking
Post the results screen to the Slack/Telegram after the walk.

<img width="480" alt="move-and-earn" src="https://user-images.githubusercontent.com/12569534/162848492-212d7c0e-a75d-4ff4-a517-3ad7c307d34f.JPG">

### Record GST spent repairing shoes
Take the following screenshot and post it to the Slack/Telegram

<img width="480" alt="repair" src="https://user-images.githubusercontent.com/12569534/162848476-22807d45-0883-4316-b768-611382bc3a62.PNG">

### Record GST consumed by leveling up shoes
Take the following screenshot and post it to the Slack/Telegram

<img width="480" alt="level-up" src="https://user-images.githubusercontent.com/12569534/162848495-ed98c108-1a2d-4ac0-8e37-ab2a7303d6e7.PNG">

### Fetch Token Latest Price
Type the command as follows to get the token latest price - `/gst`, `/gmt`, `/sol`

<img width="480" alt="fetch-token-price-tg" src="https://user-images.githubusercontent.com/9113255/170407221-af81e9f2-754f-4cfc-9a9c-6c9c1a125404.png">

## Spreadsheet Preview
The preview of the spreadsheet

<img width="900" alt="spreadsheet-preiew" src="https://user-images.githubusercontent.com/9113255/170407454-c2ce3074-568b-449c-a37b-2a5d5d6fdf13.png">
