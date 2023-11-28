import prettier from "prettier/standalone"
import BaseFormatter from "./BaseFormatter"
import phpPlugin from "@prettier/plugin-php/standalone"

class PhpFormatter extends BaseFormatter {
    
    format() {
        this.sortUseStatementsByLength()
        
        this.formatWithPrettierPhpParser()

        return this.content
    }

    addLineBreaksToParsedContent() {
        this.content = this.content.replace(/(class\s)/g, "\r\nclass ")

        // add line breaks to methods (public, private or protected)
        this.content = this.content.replace(/((public\s|private\s|protected\s)function)/g, "\r\n$1")

        // add line breaks to docblocks
        this.content = this.content.replace(/(\/\*\*\s)/g, "\r\n$1")

        return this
    }

    formatWithPrettierPhpParser() {
        const baseOptions = {
            parser: 'php',
            plugins: [phpPlugin],
            singleQuote: true,
        }
        
        this.content = prettier.format(this.content, {...baseOptions, ...this.getOptions()})
    }

    sortUseStatementsByLength() {
        let ocurrences = this.getUseStatements()

        if(!ocurrences || !ocurrences.length) return

        ocurrences.forEach(ocurrence => {
            let lines = ocurrence.split(/\r?\n/).map(line => line.trim())

            lines = lines.sort((a, b) => a.length - b.length)

            // Remove duplicated use statements
            lines = [...new Set(lines)]

            this.content = this.content.replace(ocurrence, lines.join("\r\n"))
        })
    }

    removeDuplicateUseStatements() {
        let ocurrences = this.getUseStatements()

        if(!ocurrences || !ocurrences.length) return

        ocurrences.forEach(ocurrence => {
            let lines = ocurrence.split(/\r?\n/).map(line => line.trim())

            // Remove duplicated use statements
            lines = [...new Set(lines)]

            this.content = this.content.replace(ocurrence, lines.join("\r\n"))
        })
    }

    getUseStatements() {
        let regex = /((?<!(\w)(.*))use( ))((.*)(;))/,
            lines = this.content.split('\n'),
            statements = [],
            newStatement = ''

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

export default new PhpFormatter