export default abstract class AbstractComponent {
    id: string
    componentData: any

    constructor(componentData: any) {
        this.id = componentData.id
        this.componentData = componentData
    }
}