import { default as DefaultPluralizer } from 'pluralize'
import * as changeCase from "change-case"

export default class WordManipulator {
    static pluralize(word: string): string {
        return DefaultPluralizer.plural(word)
    }

    static singularize(word: string): string {
        return DefaultPluralizer.singular(word)
    }

    static isPlural(word: string): boolean {
        return DefaultPluralizer.isPlural(word)
    }

    static isSingular(word: string): boolean {
        return DefaultPluralizer.isSingular(word)
    }

    static pascalCase(word: string): string {
        return changeCase.pascalCase(word)
    }

    static camelCase(word: string): string {
        return changeCase.camelCase(word)
    }
    
    static snakeCase(word: string): string {
        return changeCase.snakeCase(word)
    }

    static runMultiple(manipulators: Array<string>, word: string): string {
        let result = word

        manipulators.forEach((manipulator) => {
            result = WordManipulator[manipulator](result)
        })

        return result
    }
}