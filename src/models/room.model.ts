import mongoose, { InferSchemaType } from 'mongoose'

const roomSchema = new mongoose.Schema({
    threadId: {
        type: String,
        required: true,
    },
    chatId: {
        type: Number,
        required: true,
    },
})

export type RoomModelType = InferSchemaType<typeof roomSchema>
const RoomModel = mongoose.model<RoomModelType>('room', roomSchema)

export default RoomModel
