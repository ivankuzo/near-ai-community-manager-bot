import MessageModel from 'models/message.model'
import logger from 'utils/logger.util'

interface GetMessageHistoryByUsername {
    params: {
        chatId: number
        username: string
        timestampFrom?: number
        timestampTo?: number
        page?: number
    }
    return: string // Array<{ username: string; message: string }>
}

const messagesPerPage = 50

export const getMessageHistory = async (
    params: GetMessageHistoryByUsername['params'],
): Promise<GetMessageHistoryByUsername['return']> => {
    try {
        const {
            chatId,
            username,
            timestampFrom,
            timestampTo,
            page = 1,
        } = params
        const skip = (page - 1) * messagesPerPage

        logger.debug(`chatId: ${chatId}`)
        logger.debug(`username: ${username}`)
        logger.debug(`timestampFrom: ${timestampFrom}`)
        logger.debug(`timestampTo: ${timestampTo}`)
        logger.debug(`page: ${page}`)

        const query = {
            chatId,
            ...(username && { username }),
            ...(timestampFrom && { timestamp: { $gte: timestampFrom } }),
            ...(timestampTo && { timestamp: { $lte: timestampTo } }),
        }

        const messageDocs = await MessageModel.find(query)
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(messagesPerPage)
        const messages = messageDocs.map(m => ({
            username: m.username!,
            message: m.message,
        }))
        logger.debug(messages)
        return JSON.stringify(messages)
    } catch (e) {
        logger.error(e)
        return 'The request is not processed'
    }
}
