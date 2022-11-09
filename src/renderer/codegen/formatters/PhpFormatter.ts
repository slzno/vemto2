import prettier from "prettier/standalone"
import BaseFormatter from "./BaseFormatter"
import phpPlugin from "@prettier/plugin-php/standalone"

class PhpFormatter extends BaseFormatter {

    format() {
        this.formatWithPrettierPhpParser()

        return this.content
    }

    formatWithPrettierPhpParser() {
        this.content = prettier.format(this.content, {
            parser: 'php',
            plugins: [phpPlugin], 
        })
    }

}

export default new PhpFormatter