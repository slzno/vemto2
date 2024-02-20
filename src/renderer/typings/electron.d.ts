declare global {
    interface Window {
        api: ElectronApi,
        projectConfirm: (message?: string, title?: string, options?: any) => Promise<boolean>
    }
}

/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
    onDevelopment: () => boolean,
    isRecording: () => boolean,
    confirm: (message: string) => Promise<any>,
    openFolderDialog: () => Promise<string>,
    openURL: (url: string) => void,
    prepareDatabase: (path: string) => Promise<string>,
    loadSchema: (path: string) => Promise<any>,
    onDefaultError: (callback: Callback) => void,
    onModelDataUpdated: (callback: Callback) => void,
    loadProjectDatabase: (path: string) => Promise<any>,
    closeProjectDatabase: () => Promise<void>,
    databaseDataUpdated: (data: any) => void,
    addFileToGenerationQueue: (filePath: string, content: string) => Promise<void>,
    readFile: (path: string) => Promise<string>,
    folderExists: (path: string) => Promise<boolean>,
    readProjectFile: (path: string) => Promise<string>,
    writeProjectFile: (path: string, content: string) => Promise<void>,
    projectFileExists: (path: string) => Promise<boolean>,
    readTemplateFile: (path: string) => Promise<string>,
    writeTemplateFile: (path: string, content: string) => Promise<void>,
    openFolder: (path: string) => Promise<void>,
    openTerminal: (path: string) => Promise<void>,
    openProjectFile: (path: string) => Promise<void>,
    openProjectFolder: (path: string) => Promise<void>,
    clearProjectFolder: (path: string) => Promise<void>,
    openProjectFolderOnTerminal: (path: string) => Promise<void>,
    fileHasConflicts: (relativePath: string, newContent: string) => Promise<boolean>,
    readConflictsFile: (path: string) => Promise<string>,
    solveConflictReplacingCode: (fileId: string, conflictId: string, content: string) => Promise<void>,
    readProjectFolder: (path: string, removeBasePath?: boolean) => Promise<string[]>,
    readInternalFolder: (path: string, removeBasePath?: boolean) => Promise<string[]>,
    copyInternalFolderToProject: (path: string, destination: string) => Promise<void>,
    copyInternalFolderIfNotExists: (path: string, destination: string) => Promise<void>,
    mergePHPFile: (relativePath: string) => Promise<any>,
}