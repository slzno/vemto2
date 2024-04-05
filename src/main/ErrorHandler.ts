const sendErrorMessage = (event: any, error: any) => {
    event.sender.send("error:default", {
        message: error.message || error.error || error, 
        stack: error.stack
    })
}

export async function handleError(event: any, callback: any, throwError: boolean = false) {
    try {
        return await callback(event)
    } catch (error) {
        sendErrorMessage(event, error)

        if(throwError) throw error
        
        return error
    }
}