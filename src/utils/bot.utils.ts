export const messageWithDetails = (
    chatType: string,
    chatId: number,
    //username: string | null | undefined,
    message: string,
) => {
    if (chatType === 'private') return message
    else {
        const chadIdLine = `Metadata chatId: ${chatId}\n`
        //const usernameLine = username ? `username: ${username}\n` : ''
        return `${chadIdLine}${message}`
    }
}
