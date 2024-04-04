const sendErrorMessage = (event: any, error: any) => {
    const isFromValidation = error.message && error.message.includes("VALIDATION_ERROR(")

    event.sender.send("error:default", {
        message: error.message || error.error || error, 
        stack: error.stack,
        isFromValidation
    })
}

export async function handleError(event: any, callback: any) {
    try {
        return await callback(event)
    } catch (error) {
        sendErrorMessage(event, error)

        return error
    }
}