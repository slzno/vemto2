import Column from './Column'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
})

test('It can save a new column', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTableWithSchemaState({ name: 'users' }),    
        column = TestHelper.createColumnWithSchemaState({ table })
    
    column.name = 'test_column'
    column.save()

    expect(column.id).toBe(1)
})

test('A column has changes when schema state is empty', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTableWithSchemaState({ name: 'users' }),    
        column = TestHelper.createColumn({ table })
    
    expect(column.isNew()).toBe(true)
    expect(column.isDirty()).toBe(true)
})

test('A column does not have changes when schema state is not empty', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTableWithSchemaState({ name: 'users' }),    
        column = TestHelper.createColumnWithSchemaState({ table })

    expect(column.isNew()).toBe(false)
    expect(column.isDirty()).toBe(false)
})

test('It adds column options to the schema state', () => {
    const column = TestHelper.createColumnWithSchemaState()

    const hasOptions = typeof column.schemaState.options !== undefined

    expect(hasOptions).toBe(true)
})

test('It reorders columns sequentially', () => {
    const usersTable = TestHelper.createTable({ name: 'users' }),
        usersModel = TestHelper.createModel({ name: 'User', table: usersTable }),
        postsTable = TestHelper.createTable({ name: 'posts' }),
        postsModel = TestHelper.createModel({ name: 'Post', table: postsTable })

        TestHelper.createColumn({ name: 'id', table: usersTable, autoIncrement: true, order: 0 })

        const idColumn = TestHelper.createColumn({ name: 'id', table: postsTable, autoIncrement: true, order: 0 }),
            titleColumn = TestHelper.createColumn({ name: 'title', table: postsTable, order: 1 }),
            bodyColumn = TestHelper.createColumn({ name: 'body', table: postsTable, order: 5 }),
            createdAtColumn = TestHelper.createColumn({ name: 'created_at', table: postsTable, order: 6 }),
            updatedAtColumn = TestHelper.createColumn({ name: 'updated_at', table: postsTable, order: 7 })

    const foreignColumn = postsTable.getOrCreateForeignColumn('user_id', postsModel)

    expect(idColumn.fresh().order).toBe(0)
    expect(titleColumn.fresh().order).toBe(1)
    expect(bodyColumn.fresh().order).toBe(2)
    expect(foreignColumn.fresh().order).toBe(3)
    expect(createdAtColumn.fresh().order).toBe(4)
    expect(updatedAtColumn.fresh().order).toBe(5)
})

test('It reorders columns sequentially when orders are incorrect', () => {
    const usersTable = TestHelper.createTable({ name: 'users' }),
        usersModel = TestHelper.createModel({ name: 'User', table: usersTable }),
        postsTable = TestHelper.createTable({ name: 'posts' }),
        postsModel = TestHelper.createModel({ name: 'Post', table: postsTable })

        TestHelper.createColumn({ name: 'id', table: usersTable, autoIncrement: true, order: 0 })

        const idColumn = TestHelper.createColumn({ name: 'id', table: postsTable, autoIncrement: true, order: 0 }),
            titleColumn = TestHelper.createColumn({ name: 'title', table: postsTable, order: 3 }),
            bodyColumn = TestHelper.createColumn({ name: 'body', table: postsTable, order: 5 }),
            createdAtColumn = TestHelper.createColumn({ name: 'created_at', table: postsTable, order: 6 }),
            updatedAtColumn = TestHelper.createColumn({ name: 'updated_at', table: postsTable, order: 10 })

    const foreignColumn = postsTable.getOrCreateForeignColumn('user_id', postsModel)

    expect(idColumn.fresh().order).toBe(0)
    expect(titleColumn.fresh().order).toBe(1)
    expect(bodyColumn.fresh().order).toBe(2)
    expect(foreignColumn.fresh().order).toBe(3)
    expect(createdAtColumn.fresh().order).toBe(4)
    expect(updatedAtColumn.fresh().order).toBe(5)
})

test('It can send a column to the bottom', () => {
    const postsTable = TestHelper.createTable({ name: 'posts' })

    TestHelper.createColumn({ name: 'id', table: postsTable, autoIncrement: true, order: 0 })
    TestHelper.createColumn({ name: 'title', table: postsTable, order: 1 })

    const createdAtColumn = TestHelper.createColumn({ name: 'created_at', table: postsTable, order: 2 })

    const bodyColumn = TestHelper.createColumn({ name: 'body', table: postsTable })

    expect(bodyColumn.fresh().order).toBe(2)
    expect(createdAtColumn.fresh().order).toBe(3)

    bodyColumn.sendToBottom()

    expect(bodyColumn.fresh().order).toBe(3)
    expect(createdAtColumn.fresh().order).toBe(2)

    createdAtColumn.sendToBottom()

    expect(bodyColumn.fresh().order).toBe(2)
    expect(createdAtColumn.fresh().order).toBe(3)
})

test('It can send a column to the bottom when orders are incorrect', () => {
    const postsTable = TestHelper.createTable({ name: 'posts' })

    TestHelper.createColumn({ name: 'id', table: postsTable, autoIncrement: true, order: 0 })
    TestHelper.createColumn({ name: 'title', table: postsTable, order: 5 })

    const createdAtColumn = TestHelper.createColumn({ name: 'created_at', table: postsTable, order: 10 })

    const bodyColumn = TestHelper.createColumn({ name: 'body', table: postsTable })

    expect(bodyColumn.fresh().order).toBe(2)
    expect(createdAtColumn.fresh().order).toBe(3)

    bodyColumn.sendToBottom()

    expect(bodyColumn.fresh().order).toBe(3)
    expect(createdAtColumn.fresh().order).toBe(2)

    createdAtColumn.sendToBottom()

    expect(bodyColumn.fresh().order).toBe(2)
    expect(createdAtColumn.fresh().order).toBe(3)
})

test('It can check if a column has changes', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'renamed'

    expect(column.isDirty()).toBe(true)
    expect(column.hasLocalChanges()).toBe(true)
})

test('It can check if a column does not have changes', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.isDirty()).toBe(false)
    expect(column.hasLocalChanges()).toBe(false)
})

test('It can apply column changes', () => {
    const column = TestHelper.createColumn()

    Column.savingInternally()

    column.applyChanges({ name: 'test_column_2' })

    Column.notSavingInternally()

    expect(column.name).toBe('test_column_2')
    expect(column.schemaState.name).toBe('test_column_2')
})

// assure an error is thrown if trying to apply changes when not saving internally
test('It can not apply column changes when not saving internally', () => {
    const column = TestHelper.createColumn()

    expect(() => {
        column.applyChanges({ name: 'test_column_2' })
    }).toThrow()
})

test('It can save schema state separately', () => {
    const column = TestHelper.createColumn()

    Column.savingInternally()

    column.applyChanges({ name: 'renamed' })

    expect(column.name).toBe('renamed')
    expect(column.schemaState.name).toBe('renamed')

    column.name = 'reverted'
    column.save()

    expect(column.fresh().name).toBe('reverted')
    expect(column.fresh().schemaState.name).toBe('renamed')

    column.saveSchemaState()

    expect(column.fresh().name).toBe('reverted')
    expect(column.fresh().schemaState.name).toBe('reverted')

    Column.notSavingInternally()
})

test('It does not apply changes when unnecessary', () => {
    const column = TestHelper.createColumnWithSchemaState()

    Column.savingInternally()

    const columnData = column.export()
    columnData.name = 'renamed'

    let changesWereApplied = column.fresh().applyChanges(columnData)

    expect(changesWereApplied).toBe(true)

    changesWereApplied = column.fresh().applyChanges(columnData)

    expect(changesWereApplied).toBe(false)

    Column.notSavingInternally()
})

test('A column was not considered renamed when schema state is empty', () => {
    const column = TestHelper.createColumn()

    column.name = 'renamed'
    column.save()

    const wasRenamed = column.wasRenamed()

    expect(wasRenamed).toBe(false)
})

test('It can check if a column was renamed from interface using the save method', () => {
    const column = TestHelper.createColumn()

    Column.savingInternally()

    const columnData = column.export()
    columnData.name = 'renamed'

    column.applyChanges(columnData)

    Column.notSavingInternally()

    expect(column.wasRenamed()).toBe(false)

    column.name = 'reverted'
    column.save()

    expect(column.wasRenamed()).toBe(true)
})

test('A column can not be considered as renamed without schema state', () => {
    const column = TestHelper.createColumn()

    expect(column.wasRenamed()).toBe(false)

    column.name = 'reverted'
    column.save()

    expect(column.wasRenamed()).toBe(false)
})

test('A column with the order changed cannot be considered as changed', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasLocalChanges()).toBe(false)

    column.order = 2
    column.save()

    expect(column.hasLocalChanges()).toBe(false)
})

test('It can get the old column name after rename', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'renamed'
    column.save()

    expect(column.getOldName()).toBe('name')
})

test('A column was not considered changed when schema state is empty', () => {
    const column = TestHelper.createColumn()

    column.length = 64
    column.save()

    const hasLocalChanges = column.hasLocalChanges()

    expect(hasLocalChanges).toBe(false)
})

test('It can check if a column was changed after renamed', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasLocalChanges()).toBe(false)

    column.name = 'renamed'
    column.save()

    expect(column.hasLocalChanges()).toBe(true)
})

test('It can check if a column was changed after changing the length attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasLocalChanges()).toBe(false)

    column.length = 64
    column.save()

    expect(column.hasLocalChanges()).toBe(true)
})

test('It can check if a column was changed after changing the nullable attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasLocalChanges()).toBe(false)

    column.nullable = true
    column.save()

    expect(column.hasLocalChanges()).toBe(true)
})

test('It can check if a column was changed after changing the unsigned attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasLocalChanges()).toBe(false)

    column.unsigned = true
    column.save()

    expect(column.hasLocalChanges()).toBe(true)
})

test('It can check if a column was changed after changing the autoIncrement attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasLocalChanges()).toBe(false)

    column.autoIncrement = true
    column.save()

    expect(column.hasLocalChanges()).toBe(true)
})

test('It can check if a column was changed after changing the type attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasLocalChanges()).toBe(false)

    column.type = 'text'
    column.save()

    expect(column.hasLocalChanges()).toBe(true)
})

test('It can check if a column was changed after changing the index attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasLocalChanges()).toBe(false)

    column.index = true
    column.save()

    expect(column.hasLocalChanges()).toBe(true)
})

test('It can check if a column was changed after changing the unique attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasLocalChanges()).toBe(false)

    column.unique = true
    column.save()

    expect(column.hasLocalChanges()).toBe(true)
})

test('It can check if a column has an implicit index', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.hasImplicitIndex()).toBe(false)

    column.index = true
    column.save()

    expect(column.hasImplicitIndex()).toBe(true)
})

test('It can check if a column is implicitly unique', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.isImplicitlyUnique()).toBe(false)

    column.unique = true
    column.save()

    expect(column.isImplicitlyUnique()).toBe(true)
})

test('It can check if a column is a PK', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'id'
    column.autoIncrement = true
    column.save()

    expect(column.isPrimaryKey()).toBe(true)
})

test('It can check if a column is a PK by index', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'id'
    column.save()

    TestHelper.createPrimaryIndex({
        table: column.table,
        columns: [column.name],
    })

    expect(column.isPrimaryKey()).toBe(true)
})

test('It can check if a column is an FK', () => {
    const usersTable = TestHelper.createTable(),
        postsTable = TestHelper.createTable({
            name: 'posts'
        })

    const column = TestHelper.createColumn({
        name: 'user_id',
        table: postsTable,
    })

    const index = TestHelper.createForeignIndex({
        name: 'posts_user_id_foreign',
        references: 'id',
        on: 'users',
        columns: ['user_id'],
        table: postsTable,
    })

    index.relation("indexColumns").attachUnique(column)

    expect(column.isForeign()).toBe(true)
})

test('It can check if a column is unique', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'password'
    column.unique = true
    column.save()

    expect(column.isUnique()).toBe(true)
})

test('It can check if a column is a special PK', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'special_primary_key'
    column.isUuid = true
    column.save()

    expect(column.isSpecialPrimaryKey()).toBe(true)
})

test('It fires TableColumnCreated when saving from interface', () => {
    const project = TestHelper.getProject()

    TestHelper.createTable()

    const column = new Column()
    column.name = 'test_column'
    column.tableId = project.tables[0].id
    column.saveFromInterface()

    expect(project.fresh().hasSchemaChanges()).toBe(true)
})

test('It fires TableColumnUpdated when saving from interface', () => {
    const column = TestHelper.createColumnWithSchemaState(),
        project = TestHelper.getProject()

    column.name = 'special_primary_key'
    column.saveFromInterface()

    expect(project.fresh().hasSchemaChanges()).toBe(true)
})

test('It can mark a column as removed', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.isRemoved()).toBe(false)

    column.remove()

    expect(column.isRemoved()).toBe(true)
})

test('It deletes a new column when removing it', () => {
    const column = TestHelper.createColumn()

    expect(column.isRemoved()).toBe(false)

    column.remove()

    expect(column.id).toBe(undefined)
})