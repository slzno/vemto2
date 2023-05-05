export default class RelationshipTypes {
    static getForDropdown() {
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
            HasManyThrough: {label: 'Has Many Through', inverse: null},
            MorphMany: {label: 'Morph Many', inverse: null},
            MorphOne: {label: 'Morph One', inverse: null},
            MorphTo: {label: 'Morph To', inverse: null},
            MorphToMany: {label: 'Morph To Many', inverse: null},
        }
    }
}