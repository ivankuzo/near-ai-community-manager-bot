import config from 'config'
import logger from 'utils/logger.util'
import connectDB from 'services/connectDB.service'
import { Telegraf } from 'telegraf'
import { initHandlers } from 'handlers/handlers'

const TELEGRAM_TOKEN = config.get<string>('TELEGRAM_TOKEN')
const bot = new Telegraf(TELEGRAM_TOKEN)

const startBot = async () => {
    try {
        await connectDB()
        initHandlers(bot)
        bot.launch({ dropPendingUpdates: true })
    } catch (error) {
        logger.error(error)
    }
}

startBot()
