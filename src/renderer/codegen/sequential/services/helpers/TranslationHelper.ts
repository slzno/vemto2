import Project, { TranslationsFormat } from "@Common/models/Project";

export default class TranslationHelper {

    private project: Project

    constructor(project: Project) {
        this.project = project
    }

    getCorrectLaravelTranslation(key: string) {
        if(!this.project.codeGenerationSettings.translationsOnViews) {
            return this.project.getDefaultTranslation(key)
        }

        if(this.project.codeGenerationSettings.translationsFormat === TranslationsFormat.LANG) {
            return `@lang('${key}')`
        }

        return `{{ __('${key}') }}`
    }
}