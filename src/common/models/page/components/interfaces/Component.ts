export default interface Component {
    getPreviewCode(): string
    getRenderCode(): string
    getSettings(): any
}