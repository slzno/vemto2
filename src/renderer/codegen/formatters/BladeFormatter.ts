import { v4 as uuid } from "uuid"
import prettier from "prettier/standalone"
import htmlPlugin from "prettier/parser-html"
import BaseFormatter from "./BaseFormatter"

/**
 * This formatter was made as a workaround to keep using Prettier html formatter
 * to format Blade files. The Prettier html parser works pretty well with blade,
 * but has some small glitches. For example, if you use {{ ?: some ternary op. }} 
 * inside a select option, it will break the parser. So here, we'll remove 
 * the problematic sections, then parse with html, and then replace the problematic 
 * sections again
 */
class BladeFormatter extends BaseFormatter {
    
    problematicSections: Array<any> = []

    async format() {
        return this.content

        // this.removeProblematicSections()

        // this.formatWithPrettierHtmlParser()

        // this.addProblematicSectionsAgain()

        // return this.content
    }

    removeProblematicSections() {
        this.removeBladeExtendsDirectives()
        this.removeBladeSectionDirectives()
        this.removeBladePhpDirectives()
        this.removeBladeForeachDirectives()
        this.removeSelectOptions()
        this.removeSingleInlineBladeInterpolations()
    }

    removeBladeExtendsDirectives() {
        let regex = /(@extends)(.+)([\r\n]*)/g

        this.addProblematicSectionsByRegex(regex)
    }

    removeBladeSectionDirectives() {
        let openRegex = /(@section)(.+)(\))/g,
            closeRegex = /(@endsection)/g

        this.addProblematicSectionsByRegex(openRegex)
        this.addProblematicSectionsByRegex(closeRegex)
    }

    removeBladePhpDirectives() {
        let regex = /(@php)(.+)(@endphp)/g

        this.addProblematicSectionsByRegex(regex)
    }

    removeBladeForeachDirectives() {
        let openRegex = /(@foreach)(.+)(\))/g,
            closeRegex = /(@endforeach)/g

        this.addProblematicSectionsByRegex(openRegex)
        this.addProblematicSectionsByRegex(closeRegex)
    }

    removeSelectOptions() {
        let regex = /(<option)(.+)(<\/option>)/g

        this.addProblematicSectionsByRegex(regex)
    }

    removeSingleInlineBladeInterpolations() {
        let regex = /( )({{)(.+)(}})( )/g

        this.addProblematicSectionsByRegex(regex)
    }

    addProblematicSectionsByRegex(regex) {
        let ocurrences = [...this.content.matchAll(regex)],
            codeSections = []
        
        ocurrences.forEach(ocurrence => {
            codeSections.push(ocurrence[0])
        })

        // Removing duplicates
        codeSections = Array.from(new Set(codeSections))

        codeSections.forEach(section => this.addProblematicSection(section))
    }

    addProblematicSection(section) {
        let sectionKey = uuid().replaceAll('-', '')

        this.problematicSections[sectionKey] = section

        this.content = this.content.replaceAll(section, `section=${sectionKey}`)
    }

    formatWithPrettierHtmlParser() {
        this.content = prettier.format(this.content, {
            parser: 'html', plugins: [htmlPlugin], tabWidth: 4
        })
    }

    addProblematicSectionsAgain() {
        Object.keys(this.problematicSections).forEach(sectionKey => {
            let sectionContent = this.problematicSections[sectionKey]

            this.content = this.content.replaceAll(`section=${sectionKey}`, sectionContent)
            this.content = this.content.replaceAll(`section="${sectionKey}"`, sectionContent)
        })
    }

}

export default new BladeFormatter