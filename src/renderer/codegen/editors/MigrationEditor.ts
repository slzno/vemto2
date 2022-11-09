export default class MigrationEditor {

    content: string

    constructor(content: string) {
        this.setMigrationContent(content)
    }

    setMigrationContent(content: string) {
        this.content = content

        return this
    }

    getMigrationContent(): string {
        return this.content
    }

    resetMigrationContent() {
        this.content = ''
    
        return this
    }

    addContentToSchemaTableOnUpMethod(table: string, content: string) {
        const tableContent = this.getSchemaTableContentOnUpMethod(table),
            newTableContent = tableContent + content
        
        this.content = this.content.replace(tableContent, newTableContent)

        return newTableContent
    }


    getSchemaTableOnUpMethod(table: string): string {
        const regex = new RegExp(`(?<=up\\(\\)(.*))Schema::table\\(('|")${table}('|")(.*?)}\\);(?=(.*)})`, 's')
        
        return this.getRegexMatch(regex)
    }

    getSchemaTableContentOnUpMethod(table: string): string {
        const regex = new RegExp(`(?<=up\\(\\)(.*)Schema::table\\(('|")${table}('|")(.*){)(.*?)(?=}\\);(.*)})`, 's')
        
        return this.getRegexMatch(regex)
    }

    getRegexMatch(regex: RegExp): string {
        const matches = this.content.match(regex)

        if (matches === null) {
            return ''
        }

        return matches[0].trim()
    }

}