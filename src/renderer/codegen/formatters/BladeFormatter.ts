import BaseFormatter from "./BaseFormatter"
// import { Formatter } from "blade-formatter"

class BladeFormatter extends BaseFormatter {
    
    async format() {
        // return new Formatter({
        //     indentSize: 4
        // }).formatContent(this.content)

        return this.content
    }

}

export default new BladeFormatter