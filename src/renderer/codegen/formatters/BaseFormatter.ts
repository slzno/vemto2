export default class BaseFormatter {
    content: string

    setContent(content) {
        this.content = content

        return this
    }

    getContent() {
        return this.content
    }
}