export default class MigrationEditor {

    content: string

    constructor(content: string) {
        this.setMigrationContent(content)
    }

    setMigrationContent(content: string) {
        this.content = content
    }

    getMigrationContent(): string {
        return this.content
    }

    getSchemaBlockOnUpMethod(table: string): string {
        const regex = new RegExp(`(?<=up\\(\\)(.*))Schema::table\\(('|")${table}('|")(.*?)}\\);(?=(.*)})`, 's')
        
        return this.getRegexMatch(regex)
    }

    getSchemaContentOnUpMethod(table: string): string {
        const regex = new RegExp(`(?<=up\\(\\)(.*)Schema::table\\(('|")${table}('|")(.*){)(.*?)(?=}\\);(.*)})`, 's')
        
        return this.getRegexMatch(regex)
    }

    getRegexMatch(regex: RegExp): string {
        const matches = this.content.match(regex)

        console.log(regex, matches)

        if (matches === null) {
            return ''
        }

        return matches[0].trim()
    }

}