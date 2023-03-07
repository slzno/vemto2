export default class RendererBridge {

    static onDataUpdatedCallback: Function

    static onDataUpdated(callback: Function) {
        this.onDataUpdatedCallback = callback
    }

    static dataUpdated() {
        console.log('here')
        if(!this.onDataUpdatedCallback) return
        
        this.onDataUpdatedCallback()
    }

}