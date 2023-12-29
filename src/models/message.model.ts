import mongoose, { InferSchemaType } from 'mongoose'

const messageSchema = new mongoose.Schema({
    chatId: {
        type: Number,
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    username: {
        type: String,
    },
    timestamp: {
        type: Number,
        default: () => Math.floor(Date.now() / 1000),
        required: true,
    },
})

export type MessageModelType = InferSchemaType<typeof messageSchema>
const MessageModel = mongoose.model<MessageModelType>('message', messageSchema)

export default MessageModel
