import { compareVersions } from "compare-versions"
import Main from "@Renderer/services/wrappers/Main"

export default class MainDependenciesInfo {
    phpVersion: string = ""
    phpExtensions: string[] = []
    phpIsInstalled: boolean = false
    composerIsInstalled: boolean = false

    async check() {
        try {
            this.phpIsInstalled = await Main.API.phpIsInstalled()
            this.composerIsInstalled = await Main.API.composerIsInstalled()
            
            const phpInfo: any = await Main.API.getPhpInfo()
            
            console.log(phpInfo)

            this.phpVersion = phpInfo.version || "1.0.0"
            this.phpExtensions = phpInfo.extensions || []
        } catch (error) {
            this.phpIsInstalled = false
            this.composerIsInstalled = false

            console.error(error)
        }
    }

    isPhpVersionValid() {
        if(!this.phpIsInstalled) {
            return false
        }

        try {
            return compareVersions(this.phpVersion, "8.2") >= 0
        } catch (error) {
            console.error(error)
            return false
        }
    }

    isComposerInstalled() {
        return this.composerIsInstalled
    }

    hasExtension(extension: string) {
        if(!this.phpIsInstalled) {
            return false
        }

        return this.phpExtensions.includes(extension)
    }

    hasMissingDependencies() {
        return !this.allDependenciesAreValid()
    }

    allDependenciesAreValid() {
        return this.isPhpVersionValid() 
            && this.isComposerInstalled() 
            && this.hasExtension("zip")
            && this.hasExtension("PDO")
            && this.hasExtension("sqlite3")
            && this.hasExtension("pdo_sqlite")
            && this.hasExtension("ctype")
            && this.hasExtension("curl")
            && this.hasExtension("dom")
            && this.hasExtension("fileinfo")
            && this.hasExtension("filter")
            && this.hasExtension("hash")
            && this.hasExtension("mbstring")
            && this.hasExtension("openssl")
            && this.hasExtension("pcre")
            && this.hasExtension("session")
            && this.hasExtension("tokenizer")
            && this.hasExtension("xml")
    }
}
