import Project, { TranslationsFormat } from "@Common/models/Project";

export default class TemplateHelpers {

    private project: Project

    constructor(project: Project) {
        this.project = project
    }

    lang(key: string) {
        if(!this.project.codeGenerationSettings.translationsOnViews) {
            return this.project.getDefaultTranslation(key)
        }

        if(this.project.codeGenerationSettings.translationsFormat === TranslationsFormat.LANG) {
            return `@lang('${key}')`
        }

        return `{{ __('${key}') }}`
    }
    
}