import HeaderOneComponent from "../HeaderOneComponent"
import ParagraphComponent from "../ParagraphComponent"
import SmallComponent from "../SmallComponent"
import ForelseComponent from "../ForelseComponent"
import CustomComponent from "../CustomComponent"
import TwoColumnsComponent from "../TwoColumnsComponent"
import LinkComponent from "../LinkComponent"

export default abstract class ComponentHelper {

    static getComponentHandler(component: any): any {
        const componentHandler = ComponentHelper.getComponentHandlerMap()[component.type]

        if (!componentHandler) {
            throw new Error(`Component type ${component.type} not found`)
        }

        return new componentHandler(component)
    }

    static getComponentHandlerMap(): any {
        return {
            HeaderOne: HeaderOneComponent,
            Paragraph: ParagraphComponent,
            Small: SmallComponent,
            Forelse: ForelseComponent,
            Custom: CustomComponent,
            TwoColumns: TwoColumnsComponent,
            Link: LinkComponent,
        }
    }

}