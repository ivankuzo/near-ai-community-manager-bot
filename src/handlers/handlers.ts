import { Telegraf } from 'telegraf'
import { initUserHandlers } from './user.handler'
import { initAdminHandlers } from './admin.handler'

export const initHandlers = (bot: Telegraf) => {
    initAdminHandlers(bot)
    initUserHandlers(bot)
}
