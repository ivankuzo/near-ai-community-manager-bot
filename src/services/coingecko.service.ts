import axios from 'axios'
import logger from 'utils/logger.util'

const api = axios.create({
    baseURL: 'https://api.coingecko.com/api/v3',
})

interface GetTokenPrice {
    params: {
        token: string
        currency?: string
    }
    return: string
}

export const getTokenPrice = async (
    params: GetTokenPrice['params'],
): Promise<GetTokenPrice['return']> => {
    try {
        const token = params.token
        const currency = params.currency || 'usd'
        logger.debug(params)
        const response = await api.get(
            `/simple/price?ids=${token}&vs_currencies=${currency}`,
        )
        logger.debug(response.data)
        // const price = response.data[token][currency]
        // return price
        return JSON.stringify(response.data)
    } catch (e) {
        logger.error(e)
        return 'The request is not processed'
    }
}
