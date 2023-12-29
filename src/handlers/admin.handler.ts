import { botMessages } from 'constants/bot.constants'
import adminOnlyMiddleware from 'middleware/adminOnly.middleware'
import ChatModel from 'models/chat.model'
import { Telegraf } from 'telegraf'
import logger from 'utils/logger.util'

const chatsListHandler = (bot: Telegraf) => {
    bot.command('chatsList', adminOnlyMiddleware, async ctx => {
        try {
            const chats = await ChatModel.find()
            const chatList = chats.map(chat => chat.chatId).join('\n')
            return ctx.reply(chatList || 'No chats found.')
        } catch (e) {
            logger.error(e)
            return ctx.reply(botMessages.error)
        }
    })
}

const addChatHandler = (bot: Telegraf) => {
    bot.command('addChat', adminOnlyMiddleware, async ctx => {
        try {
            const chatId = ctx.message.text.split(' ')[1]
            if (!chatId) return ctx.reply('Please provide a chat ID')
            await new ChatModel({ chatId }).save()
            return ctx.reply(botMessages.success)
        } catch (e) {
            logger.error(e)
            return ctx.reply(botMessages.error)
        }
    })
}

const removeChatHandler = (bot: Telegraf) => {
    bot.command('removeChat', adminOnlyMiddleware, async ctx => {
        try {
            const chatId = ctx.message.text.split(' ')[1]
            if (!chatId) return ctx.reply('Please provide a chat ID.')
            await ChatModel.deleteOne({ chatId })
            return ctx.reply(botMessages.success)
        } catch (e) {
            logger.error(e)
            return ctx.reply(botMessages.error)
        }
    })
}

export const initAdminHandlers = (bot: Telegraf) => {
    chatsListHandler(bot)
    addChatHandler(bot)
    removeChatHandler(bot)
}
