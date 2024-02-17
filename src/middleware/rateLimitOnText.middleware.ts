import {
    botActivationKeyword,
    botMessages,
    rateLimitConfig,
} from 'constants/bot.constants'
import { Context } from 'telegraf'
import { Message } from 'telegraf/typings/core/types/typegram'
import logger from 'utils/logger.util'

const { limit, interval } = rateLimitConfig
const users: Map<number, number[]> = new Map()

export default (ctx: Context, next: () => Promise<void>) => {
    try {
        const userId = ctx.from?.id
        if (!userId) return next()

        const chatType = ctx.chat!.type
        const message = (ctx.message as Message.TextMessage).text
            .trim()
            .toLowerCase()

        if (chatType !== 'private' && !message.startsWith(botActivationKeyword))
            return next()

        const now = Date.now()
        const timestamps = users.get(userId) || []
        timestamps.push(now)
        const recentTimestamps = timestamps.filter(t => now - t < interval)

        if (recentTimestamps.length > 0) users.set(userId, recentTimestamps)
        else users.delete(userId)

        if (recentTimestamps.length <= limit) return next()
        else
            return ctx.reply(botMessages.rateLimit, {
                reply_to_message_id: ctx.message!.message_id,
            })
    } catch (e) {
        logger.error(e)
        return ctx.reply(botMessages.error)
    }
}
