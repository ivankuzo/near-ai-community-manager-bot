import { botMessages } from 'constants/bot.constants'
import { Context } from 'telegraf'
import logger from 'utils/logger.util'

export default (limit: number, interval: number) => {
    const users: Map<number, number[]> = new Map()

    return (ctx: Context, next: () => Promise<void>) => {
        try {
            const userId = ctx.from?.id
            if (!userId) return next()

            const now = Date.now()
            const timestamps = users.get(userId) || []
            timestamps.push(now)
            const recentTimestamps = timestamps.filter(t => now - t < interval)

            if (recentTimestamps.length > 0) users.set(userId, recentTimestamps)
            else users.delete(userId)

            if (recentTimestamps.length <= limit) return next()
            else return ctx.reply(botMessages.rateLimit)
        } catch (e) {
            logger.error(e)
            return ctx.reply(botMessages.error)
        }
    }
}
