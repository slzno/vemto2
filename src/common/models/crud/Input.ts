import CrudPanel from './CrudPanel'
import RelaDB from '@tiago_silva_pereira/reladb'


export default class Input  extends RelaDB.Model {
    id: string
    panelId: string
    panel: CrudPanel
    name: string
    type: string
    label: string
    placeholder: string
    order: number
    readOnly: boolean
    required: boolean
    hidden: boolean
    defaultValue: string
    checked: boolean
    max: number
    min: number
    step: number
    items: any[]
    creationRules: any[]
    updateRules: any[]
    showOnCreation: boolean
    showOnUpdate: boolean
    showOnDetails: boolean
    showOnIndex: boolean
}