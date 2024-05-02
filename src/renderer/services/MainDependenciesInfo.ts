import { compareVersions } from "compare-versions"
import Main from "@Renderer/services/wrappers/Main"

export default class MainDependenciesInfo {
    phpVersion: string = ""
    phpExtensions: string[] = []
    phpIsInstalled: boolean = false
    composerIsInstalled: boolean = false

    async check() {
        const phpInfo: any = await Main.API.getPhpInfo()

        this.phpIsInstalled = await Main.API.phpIsInstalled()
        this.composerIsInstalled = await Main.API.composerIsInstalled()

        this.phpVersion = phpInfo.version
        this.phpExtensions = phpInfo.extensions
    }

    isPhpVersionValid() {
        if(!this.phpIsInstalled) {
            return false
        }

        return compareVersions(this.phpVersion, "8.2") >= 0
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
