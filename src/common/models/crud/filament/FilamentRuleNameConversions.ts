export class FilamentRuleNameConversions {
    static convert(ruleName: string): string {
        const converted = FilamentRuleNameConversions.get()[ruleName]

        return converted ?? ruleName
    }

    static get() {
        return {
            min: "minLength",
            max: "maxLength",
        }
    }
}
