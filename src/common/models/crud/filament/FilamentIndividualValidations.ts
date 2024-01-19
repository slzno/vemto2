/**
 *  This file contains the Laravel validations that do not have a individual method in Filament.
 *  For this reason, they must be added to the rules->([]) method
 */ 
export class FilamentIndividualValidations {
    static match(ruleName: string): boolean {
        return FilamentIndividualValidations.get()
            .some(filamentRuleName => filamentRuleName === ruleName)
    }

    static get() {
        return [
            'activeUrl',
            'alpha',
            'alphaDash',
            'alphaNum',
            'ascii',
            'confirmed',
            'doesntStartWith',
            'doesntEndWith',
            'endsWith',
            'enum',
            'exists',
            'filled',
            'hexColor',
            'in',
            'ip',
            'ipv4',
            'ipv6',
            'json',
            'macAddress',
            'multipleOf',
            'minLength',
            'maxLength',
            'notIn',
            'notRegex',
            'nullable',
            'prohibited',
            'prohibitedIf',
            'prohibitedUnless',
            'prohibits',
            'required',
            'requiredIf',
            'requiredUnless',
            'requiredWith',
            'requiredWithAll',
            'requiredWithout',
            'requiredWithoutAll',
            'regex',
            'startsWith',
            'string',
            'uuid',
            'rule',
            'rules',
            'after',
            'afterOrEqual',
            'before',
            'beforeOrEqual',
            'different',
            'gt',
            'gte',
            'lt',
            'lte',
            'same',
            'unique',
            'distinct'
        ]
    }
}
