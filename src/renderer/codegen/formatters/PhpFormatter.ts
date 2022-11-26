import prettier from "prettier/standalone"
import BaseFormatter from "./BaseFormatter"
import phpPlugin from "@prettier/plugin-php/standalone"

class PhpFormatter extends BaseFormatter {
    
    format() {
        this.formatWithPrettierPhpParser()

        return this.content
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