export default class EnvParser {
    static parse(content) {
        const lines = content.split(/\r?\n/) // split by line break
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