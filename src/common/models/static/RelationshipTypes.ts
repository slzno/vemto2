export default class RelationshipTypes {
    static getForDropdown(): Object {
        const types = this.get()

        return Object.keys(types).map(key => {
            return {
                key,
                label: types[key].label,
                description: types[key].help
            }
        })
    }

    static get(): Object {
        return {
            BelongsTo: {label: 'Belongs To', inverse: 'HasMany'},
            HasMany: {label: 'Has Many', inverse: 'BelongsTo'},
            HasOne: {label: 'Has One', inverse: 'BelongsTo'},
            BelongsToMany: {label: 'Belongs To Many', inverse: 'BelongsToMany'},
            HasManyThrough: {label: 'Has Many Through', inverse: null}
        }
    }
}