/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
    prepareProject: (path: string) => Promise<string>,
    loadSchema: (path: string) => Promise<any>,
    onDefaultError: (callback: Callback) => void,
    loadProjectDatabase: (path: string) => Promise<any>,
    databaseDataUpdated: (data: any) => void,
    addFileToGenerationQueue: (filePath: string, content: string) => Promise<void>,
    readProjectFile: (path: string) => Promise<string>,
    readTemplateFile: (path: string) => Promise<string>,
}

declare global {
    interface Window {
        api: ElectronApi
    }
}