export default class CodeComparer {
    static codeIsDifferent(code1: string, code2: string) {
        return !this.codeIsEqual(code1, code2)
    }

    static codeIsEqual(code1: string, code2: string) {
        return this.removeSpacesAndTabs(code1) === this.removeSpacesAndTabs(code2)
    }

    static removeSpacesAndTabs(code: string) {
        return code.replace(/\s/g, "")
    }
}