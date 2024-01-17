import dotenv from 'dotenv'
dotenv.config({ path: '.env' })

const {
    MONGO_URI,
    BOT_NAME,
    TELEGRAM_TOKEN,
    OPENAI_KEY,
    ASSISTANT_KEY,
    BOT_ADMINS,
} = process.env

export default {
    MONGO_URI,
    BOT_NAME,
    TELEGRAM_TOKEN,
    OPENAI_KEY,
    ASSISTANT_KEY,
    BOT_ADMINS,
}
