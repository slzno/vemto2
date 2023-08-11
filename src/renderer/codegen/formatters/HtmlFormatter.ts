import BaseFormatter from "./BaseFormatter"

class HtmlFormatter extends BaseFormatter {
    
    async format() {
        return this.content
    }

}

export default new HtmlFormatter