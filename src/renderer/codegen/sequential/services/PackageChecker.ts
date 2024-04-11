import Project from "@Common/models/Project"
import ProjectInfo from "@Renderer/services/project/ProjectInfo"
import Renderable, { RenderableDependency } from "./foundation/Renderable"

export interface DependenciesMissing {
    composer: RenderableDependency[]
    packages: RenderableDependency[]
}

export default class PackageChecker {
    project: Project
    projectInfo: null | ProjectInfo = null

    composerMissingDependencies: RenderableDependency[] = []
    packagesMissingDependencies: RenderableDependency[] = []

    constructor(project: Project) {
        this.project = project
    }

    hasMissingDependencies(): boolean {
        return this.composerMissingDependencies.length > 0
            || this.packagesMissingDependencies.length > 0
    }

    async checkForMissingDependencies(): Promise<void> {
        await this.setProjectInfo()
        await this.checkComposerDependencies()
        await this.checkPackagesDependencies()
    }

    async setProjectInfo(): Promise<void> {
        const projectInfo = new ProjectInfo(this.project.getPath())

        await projectInfo.read()

        this.projectInfo = projectInfo
    }

    async checkComposerDependencies(): Promise<void> {
        const normalDependencies = Object.keys(this.projectInfo.composerData.require || {}),
            devDependencies = Object.keys(this.projectInfo.composerData["require-dev"] || {})
        
        const allProjectComposerDependencies = normalDependencies.concat(devDependencies)

        this.composerMissingDependencies = Renderable.getComposerDependencies()
            .filter(dependency => !allProjectComposerDependencies.includes(dependency.name))
    }

    async checkPackagesDependencies(): Promise<void> {
        const normalDependencies = Object.keys(this.projectInfo.packageData.dependencies || {}),
            devDependencies = Object.keys(this.projectInfo.packageData.devDependencies || {})

        const allProjectPackagesDependencies = normalDependencies.concat(devDependencies)

        this.packagesMissingDependencies = Renderable.getPackagesDependencies()
            .filter(dependency => !allProjectPackagesDependencies.includes(dependency.name))
    }

    getComposerMissingDependencies(): RenderableDependency[] {
        return this.composerMissingDependencies
    }

    getPackagesMissingDependencies(): RenderableDependency[] {
        return this.packagesMissingDependencies
    }

    getDependenciesMissing(): DependenciesMissing {
        return {
            composer: this.getComposerMissingDependencies(),
            packages: this.getPackagesMissingDependencies()
        } as DependenciesMissing
    }

    reset(): void {
        this.projectInfo = null
        this.composerMissingDependencies = []
        this.packagesMissingDependencies = []
    }
}