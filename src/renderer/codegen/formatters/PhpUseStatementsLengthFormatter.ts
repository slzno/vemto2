import BaseFormatter from "./BaseFormatter"

class PhpUseStatementsLengthFormatter extends BaseFormatter {

    format() {
        this.sortUseStatementsByLength()

        return this.content
    }

    sortUseStatementsByLength() {
        const ocurrences = this.getUseStatements()

        if(!ocurrences || !ocurrences.length) return

        ocurrences.forEach(ocurrence => {
            let lines = ocurrence.split(/\r?\n/).map(line => line.trim())

            lines = lines.sort((a, b) => a.length - b.length)

            // Remove duplicated use statements
            lines = [...new Set(lines)]

            this.content = this.content.replace(ocurrence, lines.join("\r\n"))
        })
    }

    getUseStatements() {
        const regex = /((?<!(\w)(.*))use( ))((.*)(;))/,
            lines = this.content.split('\n'),
            statements = []
        
        let newStatement = ''

        lines.forEach(line => {
            if(regex.test(line)) {
                newStatement += '\n' + line
            } else {
                if(newStatement.length) statements.push(newStatement)
                newStatement = ''
            }
        })

        return statements
    }

}

export default new PhpUseStatementsLengthFormatter