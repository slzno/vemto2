export default class TableNameExceptions {
    static get() {
        return {
            Food: {
                table: 'food',
                plural: 'AllFood'
            },
            Art: {
                table: 'art',
                plural: 'AllArt'
            },
            Education: {
                table: 'education',
                plural: 'AllEducation'
            }
        }
    }
}