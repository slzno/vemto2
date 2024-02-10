export default class CircularRelationError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'CircularRelationError'
    }
}