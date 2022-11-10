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

        return this
    }

    addContentToSchemaCreateOnUpMethod(table: string, content: string) {
        const tableContent = this.getSchemaCreateContentOnUpMethod(table),
            newTableContent = tableContent + content

        this.content = this.content.replace(tableContent, newTableContent)

        return this
    }

    replaceSchemaTableOnUpMethod(table: string, content: string) {
        const tableContent = this.getSchemaTableContentOnUpMethod(table)

        this.content = this.content.replace(tableContent, content)

        return this
    }

    replaceSchemaCreateOnUpMethod(table: string, content: string) {
        const tableContent = this.getSchemaCreateOnUpMethod(table)

        this.content = this.content.replace(tableContent, content)

        return this
    }

    getSchemaTableOnUpMethod(table: string): string {
        const regex = new RegExp(`(?<=up\\(\\)(.*))Schema::table\\(('|")${table}('|")(.*?)}\\);(?=(.*)})`, 's')
        
        return this.getRegexMatch(regex)
    }

    getSchemaTableContentOnUpMethod(table: string): string {
        const regex = new RegExp(`(?<=up\\(\\)(.*)Schema::table\\(('|")${table}('|")(.*){)(.*?)(?=}\\);(.*)})`, 's')
        
        return this.getRegexMatch(regex)
    }

    getSchemaCreateOnUpMethod(table: string): string {
        const regex = new RegExp(`(?<=up\\(\\)(.*))Schema::create\\(('|")${table}('|")(.*?)}\\);(?=(.*)})`, 's')
        
        return this.getRegexMatch(regex)
    }

    getSchemaCreateContentOnUpMethod(table: string): string {
        const regex = new RegExp(`(?<=up\\(\\)(.*)Schema::create\\(('|")${table}('|")(.*){)(.*?)(?=}\\);(.*)})`, 's')
        
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