export default interface Component {
    getName(): string
    getPreviewCode(): string
    getRenderCode(): string
    getSettings(): any
}