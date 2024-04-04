export default class EnvParser {
    content: string
    parsedContent: any

    constructor(content: string = "") {
        this.content = content
        this.parsedContent = this.parse()
    }

    add(key: string, value: string) {
        this.parsedContent.push({ key, value })
    }

    addAfter(key: string, value: string, after: string) {
        const index = this.parsedContent.findIndex((env: any) => env.key === after)

        if (index !== -1) {
            this.parsedContent.splice(index + 1, 0, { key, value })
        }
    }
    
    addBefore(key: string, value: string, before: string) {
        const index = this.parsedContent.findIndex((env: any) => env.key === before)

        if (index !== -1) {
            this.parsedContent.splice(index, 0, { key, value })
        }
    }

    addLineSeparator() {
        this.add("ENV_LINE_SEPARATOR", "ENV_LINE_SEPARATOR")
    }

    addLineSeparatorAfter(after: string) {
        this.addAfter("ENV_LINE_SEPARATOR", "ENV_LINE_SEPARATOR", after)
    }

    addLineSeparatorBefore(before: string) {
        this.addBefore("ENV_LINE_SEPARATOR", "ENV_LINE_SEPARATOR", before)
    }

    remove(key: string) {
        const index = this.parsedContent.findIndex((env: any) => env.key === key)

        if (index !== -1) {
            this.parsedContent.splice(index, 1)
        }
    }

    get() {
        return this.parsedContent
    }

    getKeyedValues() {
        const result = {}

        this.parsedContent.forEach((env: any) => {
            result[env.key] = env.value
        })

        return result
    }

    getKey(key: string) {
        const item = this.parsedContent.find((env: any) => env.key === key)

        if (item) {
            if(item.value === 'false' || item.value === 'FALSE') {
                item.value = false
            } else if(item.value === 'true' || item.value === 'TRUE') {
                item.value = true
            } else if(item.value === 'null' || item.value === 'NULL') {
                item.value = null
            }

            return item.value
        }

        return null
    }

    parse() {
        const lines = this.content.split(/\r?\n/) // split by line break
        const result = []

        lines.forEach(line => {
            // Check for empty line (line break)
            if (line.trim() === '') {
                result.push({ key: "ENV_LINE_SEPARATOR", value: "ENV_LINE_SEPARATOR" })
            } else {
                let [key, value] = line.split('=')

                // remove any line breaks from the value
                value = value.replace(/\r?\n|\r/g, "")

                result.push({ key: key.trim(), value: value.trim() })
            }
        })

        return result
    }
}