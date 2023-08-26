export default class TemplateErrors {
    static errors = []

    add(error) {
        TemplateErrors.errors.push(error)
    }

    get() {
        return TemplateErrors.errors
    }
}