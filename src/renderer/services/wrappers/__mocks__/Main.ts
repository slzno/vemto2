export default new class Main {
    public API: any = null

    constructor() {
        this.API = {
            readTemplateFile: () => {
                return 'template content'
            },

            addFileToGenerationQueue: (name: string, content: string) => {
                console.log(name, content)
            },
        }
    }
}