/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
    onDevelopment: () => boolean,
    confirm: (message: string) => Promise<any>,
    openFolderDialog: () => Promise<string>,
    prepareProject: (path: string) => Promise<string>,
    loadSchema: (path: string) => Promise<any>,
    onDefaultError: (callback: Callback) => void,
    onModelDataUpdated: (callback: Callback) => void,
    loadProjectDatabase: (path: string) => Promise<any>,
    closeProjectDatabase: () => Promise<void>,
    databaseDataUpdated: (data: any) => void,
    addFileToGenerationQueue: (filePath: string, content: string) => Promise<void>,
    readProjectFile: (path: string) => Promise<string>,
    writeProjectFile: (path: string, content: string) => Promise<void>,
    readTemplateFile: (path: string) => Promise<string>,
    writeTemplateFile: (path: string, content: string) => Promise<void>,
    openProjectFile: (path: string) => Promise<void>,
    openProjectFolder: (path: string) => Promise<void>,
    openProjectFolderOnTerminal: (path: string) => Promise<void>,
    readConflictsFile: (path: string) => Promise<string>,
    solveConflictReplacingCode: (fileId: string, conflictId: string, content: string) => Promise<void>,
    readProjectFolder: (path: string, removeBasePath?: boolean) => Promise<string[]>,
    readInternalFolder: (path: string, removeBasePath?: boolean) => Promise<string[]>,
}

declare global {
    interface Window {
        api: ElectronApi
    }
}