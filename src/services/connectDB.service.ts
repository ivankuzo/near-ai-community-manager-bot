import mongoose from 'mongoose'
import config from 'config'
import logger from 'utils/logger.util'

const MONGO_URI = config.get<string>('MONGO_URI')

export default async () => {
    try {
        await mongoose.connect(MONGO_URI)
        logger.info('DB is connected')
    } catch (e) {
        logger.error(e)
        process.exit(1)
    }
}
