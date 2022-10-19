const sendErrorMessage = (event: any, error: any) => {
    event.sender.send("error:default", {error: error, stack: error.stack})
}

export async function handleError(event: any, callback: any) {
    try {
        return await callback(event)
    } catch (error) {
        sendErrorMessage(event, error)

        return error
    }
}