import { format, createLogger, transports } from 'winston'
import isDevMode from './isDevMode.util'

const logFormat = format.printf(({ level, timestamp, message, stack }) => {
    if (typeof message === 'object') {
        message = JSON.stringify(message, null, 2)
    }
    return `\n${level}\n${timestamp}\n${stack || message}\n`
})

const devLogger = () => {
    return createLogger({
        level: 'silly',
        format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'HH:mm:ss' }),
            format.errors({ stack: true }),
            logFormat,
        ),
        transports: [new transports.Console()],
    })
}

const prodLogger = () => {
    const currentDate = new Date()
    const year = currentDate.getFullYear().toString().slice(-2)
    const formattedDate = `${currentDate.getDate()}.${
        currentDate.getMonth() + 1
    }.${year}`

    return createLogger({
        level: 'info',
        format: format.combine(
            format.timestamp({ format: 'HH:mm:ss' }),
            format.errors({ stack: true }),
            logFormat,
        ),
        transports: [
            new transports.File({
                filename: `logs/${formattedDate}.log`,
            }),
        ],
    })
}

const logger = isDevMode ? devLogger() : prodLogger()

export default logger
