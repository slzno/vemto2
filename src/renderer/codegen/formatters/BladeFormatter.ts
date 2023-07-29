import prettier from "prettier/standalone"
import BaseFormatter from "./BaseFormatter"

class BladeFormatter extends BaseFormatter {
    
    async format() {
        // this.content = prettier.format(this.content, {parser: 'blade'})

        return this.content
    }

}

export default new BladeFormatter