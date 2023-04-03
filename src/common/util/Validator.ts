import { default as BaseValidator } from 'validatorjs'
import en from 'validatorjs/src/lang/en'

BaseValidator.setMessages('en', en)

export default class Validator {
    validator: BaseValidator

    constructor(data: any, rules: any, customMessages?: any) {
        this.validator = new BaseValidator(data, rules, customMessages)
    }
    
    public async passes() {
        return await this.validator.passes()
    }
    
    public async fails() {
        return await this.validator.fails()
    }
    
    public getErrors() {
        return this.validator.errors.errors
    }
}