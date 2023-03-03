import prettier from "prettier/standalone"
import BaseFormatter from "./BaseFormatter"
import phpPlugin from "@prettier/plugin-php/standalone"

class PhpFormatter extends BaseFormatter {
    
    format() {
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

}

export default new PhpFormatter