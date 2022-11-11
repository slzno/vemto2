export default class BaseFormatter {
    content: string
    extraOptions: any

    setOptions(options) {
        this.extraOptions = options

        return this
    }

    getOptions() {
        return this.extraOptions
    }

    setContent(content) {
        this.content = content

        return this
    }

    getContent() {
        return this.content
    }
}