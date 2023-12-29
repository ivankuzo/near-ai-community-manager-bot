import config from 'config'
import logger from 'utils/logger.util'
import connectDB from 'services/connectDB.service'
import { Telegraf } from 'telegraf'
import { initHandlers } from 'handlers/handlers'
import rateLimitMiddleware from 'middleware/rateLimit.middleware'
import { rateLimitConfig } from 'constants/bot.constants'

const TELEGRAM_TOKEN = config.get<string>('TELEGRAM_TOKEN')
const bot = new Telegraf(TELEGRAM_TOKEN)

const startBot = async () => {
    try {
        await connectDB()
        bot.use(
            rateLimitMiddleware(
                rateLimitConfig.limit,
                rateLimitConfig.interval,
            ),
        )
        initHandlers(bot)
        bot.launch({ dropPendingUpdates: true })
    } catch (error) {
        logger.error(error)
    }
}

startBot()
