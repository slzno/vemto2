/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
    loadSchema: (path: string) => Promise<any>,
    onDefaultError: (callback: Callback) => void,
    loadProjectDatabase: (path: string) => Promise<any>,
    databaseDataUpdated: (data: any) => void,
    addFileToGenerationQueue: (filePath: string, content: string) => Promise<void>,
}

declare global {
    interface Window {
        api: ElectronApi
    }
}