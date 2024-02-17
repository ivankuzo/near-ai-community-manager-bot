import { getTokenPrice } from 'services/coingecko.service'
import { getMessageHistory } from 'services/messages.service'

type ToolFunction = (params: any) => Promise<any>

export const toolFunctions: { [key: string]: ToolFunction } = {
    getTokenPrice,
    getMessageHistory,
}
