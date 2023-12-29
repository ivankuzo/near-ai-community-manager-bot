import { Context } from 'telegraf'
import config from 'config'
import { botMessages } from 'constants/bot.constants'

const BOT_ADMINS = config.get<string>('BOT_ADMINS').split(',')

export default (ctx: Context, next: () => Promise<void>) => {
    try {
        const userId = ctx.from?.id.toString()
        if (!userId) throw new Error()
        if (BOT_ADMINS.includes(userId)) return next()
        else throw new Error()
    } catch {
        return ctx.reply(botMessages.adminOnly)
    }
}
