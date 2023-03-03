/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
    onDevelopment: () => boolean,
    prepareProject: (path: string) => Promise<string>,
    loadSchema: (path: string) => Promise<any>,
    onDefaultError: (callback: Callback) => void,
    onModelDataUpdated: (callback: Callback) => void,
    loadProjectDatabase: (path: string) => Promise<any>,
    databaseDataUpdated: (data: any) => void,
    addFileToGenerationQueue: (filePath: string, content: string) => Promise<void>,
    readProjectFile: (path: string) => Promise<string>,
    readTemplateFile: (path: string) => Promise<string>,
    openProjectFile: (path: string) => Promise<void>,
}

declare global {
    interface Window {
        api: ElectronApi
    }
}