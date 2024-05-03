import { default as DefaultPluralizer } from 'pluralize'
import * as changeCase from "change-case"

export default class WordManipulator {
    static pluralize(word: string): string {
        word = word || ""
        return DefaultPluralizer.plural(word)
    }

    static singularize(word: string): string {
        word = word || ""
        return DefaultPluralizer.singular(word)
    }

    static isPlural(word: string): boolean {
        word = word || ""
        return DefaultPluralizer.isPlural(word)
    }

    static isSingular(word: string): boolean {
        word = word || ""
        return DefaultPluralizer.isSingular(word)
    }

    static pascalCase(word: string): string {
        word = word || ""
        return changeCase.pascalCase(word)
    }

    static camelCase(word: string): string {
        word = word || ""
        return changeCase.camelCase(word)
    }
    
    static snakeCase(word: string): string {
        word = word || ""
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