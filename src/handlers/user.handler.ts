import config from 'config'
import { Telegraf } from 'telegraf'
import {
    botActivationKeyword,
    botMessages,
    greetings,
    intro,
} from 'constants/bot.constants'
import { randomArrayItem } from 'utils/random.util'
import {
    messagesCreate,
    messagesList,
    runCreate,
    statusCheckLoop,
    threadCreate,
} from 'services/openai.service'
import logger from 'utils/logger.util'
import { MessageContentText } from 'openai/resources/beta/threads/messages/messages'
import RoomModel from 'models/room.model'
import ChatModel from 'models/chat.model'
import MessageModel from 'models/message.model'
import { messageWithDetails } from 'utils/bot.utils'
import rateLimitOnTextMiddleware from 'middleware/rateLimitOnText.middleware'

const BOT_NAME = config.get<string>('BOT_NAME')

const startHandler = (bot: Telegraf) => {
    bot.command('start', async ctx => {
        const chatType = ctx.chat.type
        if (chatType !== 'private') return
        else return ctx.reply(intro)
    })
}

const newChatMembersHandler = (bot: Telegraf) => {
    bot.on('new_chat_members', async ctx => {
        try {
            const isBotAdded = ctx.message.new_chat_members.some(
                member => member.is_bot && member.username === BOT_NAME,
            )

            if (isBotAdded) {
                const chatId = ctx.chat.id
                const chats = await ChatModel.find()
                const allowedGroups = chats.map(chat => chat.chatId)
                if (!allowedGroups.includes(chatId)) {
                    ctx.leaveChat()
                    return
                }
            }

            ctx.message.new_chat_members.forEach(member => {
                if (!member.is_bot) {
                    ctx.reply(
                        `@${member.username}, ${randomArrayItem(greetings)}`,
                    )
                }
            })
        } catch (e) {
            logger.error(e)
        }
    })
}

const textHandler = (bot: Telegraf) => {
    bot.on('text', rateLimitOnTextMiddleware, async ctx => {
        try {
            const chatId = ctx.chat.id
            const chatType = ctx.chat.type
            const username = ctx.from.username
            let message = ctx.message.text.trim()

            if (message.startsWith('/')) return

            if (chatType !== 'private') {
                if (!message.toLowerCase().startsWith(botActivationKeyword)) {
                    await new MessageModel({ chatId, message, username }).save()
                    return
                } else
                    message = message
                        .substring(botActivationKeyword.length)
                        .trim()
            }

            let room = await RoomModel.findOne({ chatId })

            if (!room) {
                const newThread = await threadCreate()
                room = await RoomModel.create({
                    chatId,
                    threadId: newThread.id,
                })
            }

            await messagesCreate(
                room.threadId,
                messageWithDetails(chatType, chatId, message),
            )
            const run = await runCreate(room.threadId)
            const runStatus = await statusCheckLoop(room.threadId, run.id)
            if (runStatus !== 'completed') throw new Error(runStatus)

            const messages = await messagesList(room.threadId, 1)
            const messageContent = messages.data[0]
                .content[0] as MessageContentText
            const response = messageContent.text.value
            return ctx.reply(response, {
                reply_to_message_id: ctx.message.message_id,
            })
        } catch (e) {
            logger.error(e)
            return ctx.reply(botMessages.error, {
                reply_to_message_id: ctx.message.message_id,
            })
        }
    })
}

export const initUserHandlers = (bot: Telegraf) => {
    startHandler(bot)
    newChatMembersHandler(bot)
    textHandler(bot)
}
