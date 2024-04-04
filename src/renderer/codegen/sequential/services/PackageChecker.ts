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

    composerDependenciesMissing: RenderableDependency[] = []
    packagesDependenciesMissing: RenderableDependency[] = []

    constructor(project: Project) {
        this.project = project
    }

    async hasMissingDependencies(): Promise<boolean> {
        await this.setProjectInfo()
        await this.checkComposerDependencies()
        await this.checkPackagesDependencies()

        return this.composerDependenciesMissing.length > 0
            || this.packagesDependenciesMissing.length > 0
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

        this.composerDependenciesMissing = Renderable.getComposerDependencies()
            .filter(dependency => !allProjectComposerDependencies.includes(dependency.name))
    }

    async checkPackagesDependencies(): Promise<void> {
        const normalDependencies = Object.keys(this.projectInfo.packageData.dependencies || {}),
            devDependencies = Object.keys(this.projectInfo.packageData.devDependencies || {})

        const allProjectPackagesDependencies = normalDependencies.concat(devDependencies)

        this.packagesDependenciesMissing = Renderable.getPackagesDependencies()
            .filter(dependency => !allProjectPackagesDependencies.includes(dependency.name))
    }

    getComposerDependenciesMissing(): RenderableDependency[] {
        return this.composerDependenciesMissing
    }

    getPackagesDependenciesMissing(): RenderableDependency[] {
        return this.packagesDependenciesMissing
    }

    getDependenciesMissing(): DependenciesMissing {
        return {
            composer: this.getComposerDependenciesMissing(),
            packages: this.getPackagesDependenciesMissing()
        } as DependenciesMissing
    }

    reset(): void {
        this.projectInfo = null
        this.composerDependenciesMissing = []
        this.packagesDependenciesMissing = []
    }
}