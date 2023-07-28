export default interface Component {
    id: string
    type: string
    subType: string
    settings: any
    category: string
    location: string
    
    getName(): string
    getPreviewCode(): string
    getRenderCode(): string
    getSettings(): any
}