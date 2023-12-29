import mongoose, { InferSchemaType } from 'mongoose'

const chatSchema = new mongoose.Schema({
    chatId: {
        type: Number,
        required: true,
        unique: true,
    },
})

export type ChatModelType = InferSchemaType<typeof chatSchema>
const ChatModel = mongoose.model<ChatModelType>('chat', chatSchema)

export default ChatModel
