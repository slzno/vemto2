export default class IndexTypes {
    static getForDropdown() {
        const types = this.get()

        return Object.keys(types).map(key => {
            return {
                key: types[key].value,
                label: types[key].label
            }
        })
    }

    static get(): Object {
        return {
            Primary: { label: 'Primary Key', value: 'primary' },
            Unique: { label: 'Unique Key', value: 'unique' },
            Foreign: { label: 'Foreign Key', value: 'foreign' },
            Index: { label: 'Index', value: 'index' },
            Fulltext: { label: 'Fulltext', value: 'fullText' },
            FulltextChain: { label: 'Fulltext Chain', value: 'fulltext' },
            Spatial: { label: 'Spatial Index', value: 'spatialIndex' },
        }
    }
}