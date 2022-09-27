/**
 * Should match main/preload.ts for typescript support in renderer
 */
export default interface ElectronApi {
    loadSchema: (path: string) => void,
    onSchemaLoaded: (callback: (data: any) => void) => void,
    offSchemaLoaded: () => void
}

declare global {
    interface Window {
        api: ElectronApi
    }
}
