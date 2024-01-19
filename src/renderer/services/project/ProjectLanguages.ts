import Main from "../wrappers/Main"

export default class ProjectLanguages {

    static async getDefaultLanguage(): Promise<string> {
        const appConfig = await Main.API.readProjectFile("config/app.php")

        // get the locale from the app config ('locale' => 'en' or "locale" => 'en' or 'locale' => "en" or "locale" => "en")
        let locale = appConfig.match(/'locale'\s*=>\s*'(.*?)'/)?.[1] || appConfig.match(/"locale"\s*=>\s*"(.*?)"/)?.[1]

        return locale || "en"
    }

    static async getLanguages(): Promise<string[]> {
        const langFolderPaths = await Main.API.readProjectFolder("/lang")

        return ProjectLanguages.extractLanguageCodesFromLangPaths(langFolderPaths) || ["en"]
    }

    static extractLanguageCodesFromLangPaths(paths): string[] {
        const languageCodes = new Set()

        paths.forEach(path => {
            // Extract the language code using a regular expression
            const match = path.match(/\/lang\/([^\/]+)(?:\/|\.json$)/)

            if (match) {
                languageCodes.add(match[1] as string)
            }
        })

        if (languageCodes.size === 0) {
            return null
        }

        return Array.from(languageCodes) as string[]
    }

}