import Table from './Table'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'
import Column from './Column'
import SchemaSection from './SchemaSection'
import { IndexType } from './Index'
import Project from './Project'

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

test('It can save a new table', () => {
    const table = new Table()
    
    table.name = 'test_table'
    table.save()

    expect(table.id).toBe(1)
})

test('A table has changes when schema state is empty', () => {
    const table = new Table()
    
    table.name = 'test_table'
    table.save()

    expect(table.hasSchemaChanges({})).toBe(true)
})

test('It can validate a table', () => {
    const table = new Table()

    expect(table.isValid()).toBe(false)

    table.name = 'test_table'

    expect(table.isValid()).toBe(true)
})

test('It can save from interface', () => {
    const table = new Table()
    table.name = 'test_table'

    table.saveFromInterface()

    expect(table.createdFromInterface).toBe(true)
    expect(table.isSaved()).toBe(true)
})

test('It can save from interface with model creation', () => {
    const table = new Table({
        projectId: TestHelper.getProject().id
    })

    table.name = 'test_table'

    table.saveFromInterface(true)

    expect(table.createdFromInterface).toBe(true)
    expect(table.isSaved()).toBe(true)
})

test('It can remove and undo remove a table', () => {
    const table = TestHelper.createTableWithSchemaState()

    expect(table.removed).toBeUndefined()

    table.remove()

    expect(table.removed).toBe(true)

    table.undoRemove()

    expect(table.removed).toBe(false)
})

test('It can check if a table has changes', () => {
    const table = TestHelper.createTableWithSchemaState()

    const hasSchemaChanges = table.hasSchemaChanges({
        name: 'test_table',
    })

    expect(hasSchemaChanges).toBe(true)
})

test('It can check if a table does not have changes', () => {
    const table = TestHelper.createTableWithSchemaState()

    const hasSchemaChanges = table.hasSchemaChanges({
        name: 'users',
        oldNames: [],
        migrations: [],
    })

    expect(hasSchemaChanges).toBe(false)
})

test('It can apply table changes', () => {
    const table = TestHelper.createTable()

    Table.savingInternally()
    table.applyChanges({ name: 'test_table_2' })
    Table.notSavingInternally()

    expect(table.name).toBe('test_table_2')
    expect(table.schemaState.name).toBe('test_table_2')
})

test('It can save schema state separately', () => {
    const table = TestHelper.createTable()

    Table.savingInternally()

    table.applyChanges({ name: 'renamed' })
    
    expect(table.name).toBe('renamed')
    expect(table.schemaState.name).toBe('renamed')
    
    table.name = 'reverted'
    table.save()
    
    expect(table.fresh().name).toBe('reverted')
    expect(table.fresh().schemaState.name).toBe('renamed')
    
    table.saveSchemaState()
    
    Table.notSavingInternally()

    expect(table.fresh().name).toBe('reverted')
    expect(table.fresh().schemaState.name).toBe('reverted')
})

test('It does not apply changes when unnecessary', () => {
    const table = TestHelper.createTable()

    Table.savingInternally()

    let changesWereApplied = table.applyChanges({ 
        name: 'renamed',
        oldNames: [],
        migrations: [],
    })

    Table.notSavingInternally()

    expect(changesWereApplied).toBe(true)

    // The changes were already applied, so they should not be applied again
    changesWereApplied = table.applyChanges({ 
        name: 'renamed',
        oldNames: [],
        migrations: [],
    })

    expect(changesWereApplied).toBe(false)
})

test('A table was not considered renamed when schema state is empty', () => {
    const table = TestHelper.createTable()

    table.name = 'renamed'
    table.save()

    const wasRenamed = table.wasRenamed()

    expect(wasRenamed).toBe(false)
})

test('It can check if a table was renamed from interface', () => {
    const table = TestHelper.createTable()

    Table.savingInternally()

    table.applyChanges({ name: 'renamed' })
    
    Table.notSavingInternally()

    expect(table.wasRenamed()).toBe(false)

    table.name = 'reverted'
    table.save()

    expect(table.wasRenamed()).toBe(true)
})

test('A table can not be considered as renamed without schema state', () => {
    const table = TestHelper.createTable()

    expect(table.wasRenamed()).toBe(false)

    table.name = 'reverted'
    table.save()

    expect(table.wasRenamed()).toBe(false)
})

test('It sets the table position when creating', () => {
    const table = TestHelper.createTable()

    expect(table.positionX).toBe(0)
    expect(table.positionY).toBe(0)
})

test('It can check if a table has changes', () => {
    const table = TestHelper.createTable()

    const hasSchemaChanges = table.hasSchemaChanges({
        name: 'test_column',
        oldNames: [],
        migrations: [],
    })

    expect(hasSchemaChanges).toBe(true)
})

test('It can apply changes to a table', () => {
    const table = TestHelper.createTable()

    Table.savingInternally()
    
    table.applyChanges({
        name: 'test_column',
        oldNames: [],
        migrations: [],
    })
    
    Table.notSavingInternally()

    expect(table.name).toBe('test_column')
})

test('It can check if a table has a column', () => {
    const table = TestHelper.createTable()

    expect(table.hasColumn('test_column')).toBe(false)

    TestHelper.createColumn({ name: 'test_column', table })

    expect(table.hasColumn('test_column')).toBe(true)
})

test('It can check if a table does not have a column', () => {
    const table = TestHelper.createTable()

    expect(table.doesNotHaveColumn('test_column')).toBe(true)

    TestHelper.createColumn({ name: 'test_column', table })

    expect(table.doesNotHaveColumn('test_column')).toBe(false)
})

test('It can find a column by name', () => {
    const table = TestHelper.createTable()

    TestHelper.createColumn({ name: 'test_column', table })

    const column = table.findColumnByName('test_column')

    expect(column.name).toBe('test_column')
})

test('It can get all the columns names', () => {
    const table = TestHelper.createTable()

    TestHelper.createColumn({ name: 'test_column', table })

    const columnsNames = table.getColumnsNames()

    expect(columnsNames).toEqual(['test_column'])
})

test('It can get all the columns keyed by name', () => {
    const table = TestHelper.createTable()

    TestHelper.createColumn({ name: 'test_column', table })

    const columns = table.getAllColumnsKeyedByName()

    expect(columns.test_column.name).toBe('test_column')
})

test('It can check if a table has an index', () => {
    const table = TestHelper.createTable()

    expect(table.hasIndex('test_index')).toBe(false)

    TestHelper.createIndex({ name: 'test_index', table })

    expect(table.hasIndex('test_index')).toBe(true)
})

test('It can check if a table does not have a index', () => {
    const table = TestHelper.createTable()

    expect(table.doesNotHaveIndex('test_index')).toBe(true)

    TestHelper.createIndex({ name: 'test_index', table })

    expect(table.doesNotHaveIndex('test_index')).toBe(false)
})

test('It can find an index by name', () => {
    const table = TestHelper.createTable()

    TestHelper.createIndex({ name: 'test_index', table })

    const index = table.findIndexByName('test_index')

    expect(index.name).toBe('test_index')
})

test('It can get all the indexes names', () => {
    const table = TestHelper.createTable()

    TestHelper.createIndex({ name: 'test_index', table })

    const indexesNames = table.getIndexesNames()

    expect(indexesNames).toEqual(['test_index'])
})

test('It can get all the indexes keyed by name', () => {
    const table = TestHelper.createTable()

    TestHelper.createIndex({ name: 'test_index', table })

    const indexes = table.getAllIndexesKeyedByName()

    expect(indexes.test_index.name).toBe('test_index')
})

test('It can check if a table has related tables', () => {
    const usersTable = TestHelper.createTable(),
        postsTable = TestHelper.createTable({
            name: 'posts'
        })

    expect(usersTable.hasRelatedTables()).toBe(false)
    expect(postsTable.hasRelatedTables()).toBe(false)

    TestHelper.createColumn({
        name: 'user_id',
        table: postsTable,
    })

    TestHelper.createForeignIndex({
        name: 'posts_user_id_foreign',
        references: 'id',
        on: 'users',
        columns: ['user_id'],
        table: postsTable,
    })

    expect(usersTable.hasRelatedTables()).toBe(false)
    expect(postsTable.hasRelatedTables()).toBe(true)
})

test('It can get the related tables', () => {
    const usersTable = TestHelper.createTable(),
        postsTable = TestHelper.createTable({
            name: 'posts'
        })

    TestHelper.createColumn({
        name: 'user_id',
        table: postsTable,
    })

    TestHelper.createForeignIndex({
        name: 'posts_user_id_foreign',
        references: 'id',
        on: 'users',
        columns: ['user_id'],
        table: postsTable,
    })

    const userRelatedTables = usersTable.getRelatedTables(), 
        postsRelatedTables = postsTable.getRelatedTables()

    expect(userRelatedTables.length).toBe(0)
    expect(postsRelatedTables.length).toBe(1)
})

test('It can get the table models', () => {
    const table = TestHelper.createTable({ name: 'users' }),
        model = TestHelper.createModel({ name: 'User', table })

    const models = table.getModels()

    expect(models.length).toBe(1)

    expect(models[0].name).toBe('User')
    expect(model.table.name).toBe('users')
})

test('It can check if a table has timestamps', () => {
    const table = TestHelper.createTable({ name: 'users' })

    const createdAtColumn = TestHelper.createColumn({ name: 'created_at', table }),
        updatedAtColumn = TestHelper.createColumn({ name: 'updated_at', table })

    expect(table.hasTimestamps()).toBe(true)

    createdAtColumn.delete()
    
    expect(table.hasTimestamps()).toBe(false)

    updatedAtColumn.delete()

    expect(table.hasTimestamps()).toBe(false)
})

test('It can check if a table has soft deletes', () => {
    const table = TestHelper.createTable({ name: 'users' })

    const deletedAtColumn = TestHelper.createColumn({ name: 'deleted_at', table })

    expect(table.hasSoftDeletes()).toBe(true)

    deletedAtColumn.delete()

    expect(table.hasSoftDeletes()).toBe(false)
})

test('It can check if a table has migrations data', () => {
    const table = TestHelper.createTable({ name: 'users' })

    expect(table.hasMigrations()).toBe(false)

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
    }]
    
    Table.savingInternally()

    table.save()
    
    Table.notSavingInternally()

    expect(table.hasMigrations()).toBe(true)
})

test('It can check if latest migration created the table', () => {
    const table = TestHelper.createTableWithSchemaState({ name: 'users' })

    expect(table.latestMigrationCreatedTable()).toBe(false)

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
        createdTables: ['users'],
    }]

    Table.savingInternally()

    table.save()
    
    Table.notSavingInternally()

    expect(table.latestMigrationCreatedTable()).toBe(true)
})

test('It can get the latest migration', () => {
    const table = TestHelper.createTableWithSchemaState({ name: 'users' })

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
    }]

    Table.savingInternally()

    table.save()
    
    Table.notSavingInternally()

    expect(table.getLatestMigration().migration).toBe('2020_01_01_000000_create_users_table')
})

test('It can get the creation migration', () => {
    const table = TestHelper.createTableWithSchemaState({ name: 'users' })

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
        createdTables: ['users'],
    }]

    Table.savingInternally()

    table.save()
    
    Table.notSavingInternally()

    expect(table.getCreationMigration().migration).toBe('2020_01_01_000000_create_users_table')
})

test('It can can check if updating latest migration is possible', () => {
    const table = TestHelper.createTable({ name: 'users' })

    expect(table.canUpdateLatestMigration()).toBe(false)

    table.migrations = [{
        migration: '2020_01_01_000000_create_users_table',
    }]

    Table.savingInternally()
    
    table.save()
    
    Table.notSavingInternally()

    expect(table.canUpdateLatestMigration()).toBe(true)
})

test('It can can check if creating a new migration is possible', () => {
    const table = TestHelper.createTable({ name: 'users' })

    expect(table.canCreateNewMigration()).toBe(true)
})

test('It can can get all columns except removed ones', () => {
    const table = TestHelper.createTable({ name: 'users' })

    TestHelper.createColumn({ name: 'column0', table })
    TestHelper.createColumn({ name: 'column1', table })

    const columnToRemove = TestHelper.createColumn({ name: 'column2', table })

    let columns = table.getColumns()

    expect(columns[0].name).toBe('column0')
    expect(columns[1].name).toBe('column1')
    expect(columns[2].name).toBe('column2')

    columnToRemove.remove()

    columns = table.getColumns()

    expect(columns[0].name).toBe('column0')
    expect(columns[1].name).toBe('column1')
    expect(columns[2]).toBe(undefined)
})

test('It can get all removed columns', () => {
    const table = TestHelper.createTable({ name: 'users' })

    TestHelper.createColumn({ name: 'column0', table })
    TestHelper.createColumn({ name: 'column1', table })

    // Create a column with schema state because new columns are destroyed when removed
    const columnToRemove = TestHelper.createColumnWithSchemaState({ name: 'column2', table })

    let columns = table.getRemovedColumns()

    expect(columns.length).toBe(0)

    columnToRemove.remove()

    columns = table.getRemovedColumns()

    expect(columns[0].name).toBe('column2')
})

test('It calculates the correct order for a foreign column', () => {
    const usersTable = TestHelper.createTable({ name: 'users' }),
        usersModel = TestHelper.createModel({ name: 'User', table: usersTable }),
        postsTable = TestHelper.createTable({ name: 'posts' }),
        postsModel = TestHelper.createModel({ name: 'Post', table: postsTable })

        
        TestHelper.createColumn({ name: 'id', table: usersTable, autoIncrement: true, order: 0 })
        TestHelper.createColumn({ name: 'name', table: usersTable, order: 1 })
        TestHelper.createColumn({ name: 'created_at', table: usersTable, order: 2 }),
        TestHelper.createColumn({ name: 'updated_at', table: usersTable, order: 3 })

        TestHelper.createColumn({ name: 'id', table: postsTable, autoIncrement: true, order: 0 })
        TestHelper.createColumn({ name: 'title', table: postsTable, order: 1 })
        TestHelper.createColumn({ name: 'created_at', table: postsTable, order: 2 }),
        TestHelper.createColumn({ name: 'updated_at', table: postsTable, order: 3 })

    expect(usersTable.columns.length).toBe(4)
    expect(postsTable.columns.length).toBe(4)

    const foreignColumn = postsTable.getOrCreateForeignColumn('user_id', postsModel)

    expect(foreignColumn.order).toBe(2)
})

/**
 * This test is necessary for cases when a parent table is created after a child table. 
 * In this case, we can't change the last migration of the child table because it 
 * would break the migrations order, causing SQL errors when running the migrations.
 */
test('It cannot update the latest migration when a table has new related tables', () => {
    const childTable = TestHelper.createTableWithSchemaState({ name: 'books' }),
        parentTable = TestHelper.createTable({ name: 'authors' })

    childTable.migrations = [{
        migration: '2020_01_01_000000_create_books_table',
        createdTables: ['books'],
    }]

    parentTable.oldNames = ['writers']
    parentTable.save()

    Table.savingInternally()

    childTable.save()
    
    Table.notSavingInternally()

    expect(childTable.fresh().hasNewRelatedTables()).toBe(false)
    expect(childTable.fresh().canUpdateLatestMigration()).toBe(true)

    TestHelper.createColumn({ name: 'author_id', table: childTable })

    TestHelper.createForeignIndex({
        name: 'books_author_id_foreign',
        references: 'id',
        on: 'authors',
        columns: ['author_id'],
        table: childTable,
    })

    expect(childTable.fresh().hasNewRelatedTables()).toBe(true)
    expect(childTable.fresh().canUpdateLatestMigration()).toBe(false)
})

test('It can validate a table', () => {
    const table = new Table()

    expect(table.isValid()).toBe(false)

    table.name = 'test_table'

    expect(table.isValid()).toBe(true)
})

test('It can save from interface', () => {
    const table = new Table()
    table.name = 'test_table'

    table.saveFromInterface()

    expect(table.createdFromInterface).toBe(true)
    expect(table.isSaved()).toBe(true)
})

test('It can save from interface with model creation', () => {
    const table = new Table({
        projectId: TestHelper.getProject().id
    })
    table.name = 'test_table'

    table.saveFromInterface(true)

    expect(table.createdFromInterface).toBe(true)
    expect(table.isSaved()).toBe(true)
})

test('It can remove and undo remove a table', () => {
    const table = TestHelper.createTableWithSchemaState()

    expect(table.removed).toBeUndefined()

    table.remove()

    expect(table.removed).toBe(true)

    table.undoRemove()

    expect(table.removed).toBe(false)
})

test('It can check if table has dirty resources', () => {
    const table = TestHelper.createTableWithSchemaState()

    expect(table.hasDirtyResources()).toBe(false)

    const column = TestHelper.createColumnWithSchemaState({ name: 'test_column', table })
    column.name = 'renamed_column'
    column.save()

    expect(table.hasDirtyResources()).toBe(true)
})

test('It can check if table has dirty columns', () => {
    const table = TestHelper.createTableWithSchemaState()

    expect(table.hasDirtyColumns()).toBe(false)

    const column = TestHelper.createColumnWithSchemaState({ name: 'test_column', table })
    column.name = 'renamed_column'
    column.save()

    expect(table.hasDirtyColumns()).toBe(true)
})

test('It can check if table has dirty indexes', () => {
    const table = TestHelper.createTableWithSchemaState()

    expect(table.hasDirtyIndexes()).toBe(false)

    const index = TestHelper.createIndex({ name: 'test_index', table })
    index.name = 'renamed_index'
    index.save()

    expect(table.hasDirtyIndexes()).toBe(true)
})

test('It can check if table has local changes', () => {
    const table = TestHelper.createTableWithSchemaState()

    expect(table.hasLocalChanges()).toBe(false)

    table.name = 'renamed_table'
    table.save()

    expect(table.hasLocalChanges()).toBe(true)
})

test('It can check if table has a primary key', () => {
    const table = TestHelper.createTable()

    expect(table.hasPrimaryKey()).toBe(false)

    TestHelper.createColumn({ name: 'id', table })

    TestHelper.createIndex({ name: 'test_index', type: IndexType.PRIMARY, table, columns: ['id'] })

    expect(table.hasPrimaryKey()).toBe(true)
})

test('It can get the primary key column', () => {
    const table = TestHelper.createTable()

    expect(table.getPrimaryKeyColumn()).toBeUndefined()

    TestHelper.createColumn({ name: 'id', table })

    TestHelper.createIndex({ name: 'test_index', type: IndexType.PRIMARY, table, columns: ['id'] })

    expect(table.getPrimaryKeyColumn().name).toBe('id')
})

test('It can get the primary key name', () => {
    const table = TestHelper.createTable()

    expect(table.getPrimaryKeyName()).toBe('')

    TestHelper.createColumn({ name: 'id', table })

    TestHelper.createIndex({ name: 'test_index', type: IndexType.PRIMARY, table, columns: ['id'] })

    expect(table.getPrimaryKeyName()).toBe('id')
})

test('It can get renamed columns', () => {
    const table = TestHelper.createTableWithSchemaState()

    const column = TestHelper.createColumnWithSchemaState({ name: 'old_name', table })

    expect(table.getRenamedColumns().length).toBe(0)

    column.name = 'new_name'
    column.save()

    expect(table.getRenamedColumns().length).toBe(1)
    expect(table.getRenamedColumns()[0].name).toBe('new_name')
})

test('It can get new columns', () => {
    const table = TestHelper.createTableWithSchemaState()

    expect(table.getNewColumns().length).toBe(0)

    TestHelper.createColumn({ name: 'new_column', table })

    expect(table.getNewColumns().length).toBe(1)
    expect(table.getNewColumns()[0].name).toBe('new_column')
})

test('It can get changed columns', () => {
    const table = TestHelper.createTableWithSchemaState()

    const column = TestHelper.createColumnWithSchemaState({ name: 'test_column', table })

    expect(table.getChangedColumns().length).toBe(0)

    column.type = 'varchar'
    column.save()

    expect(table.getChangedColumns().length).toBe(1)
    expect(table.getChangedColumns()[0].name).toBe('test_column')
})

test('It can get removed columns', () => {
    const table = TestHelper.createTableWithSchemaState()

    const column = TestHelper.createColumnWithSchemaState({ name: 'test_column', table })

    expect(table.getRemovedColumns().length).toBe(0)

    column.remove()

    expect(table.getRemovedColumns().length).toBe(1)
    expect(table.getRemovedColumns()[0].name).toBe('test_column')
})

test('It can check if table is parent of another table', () => {
    const parentTable = TestHelper.createTable({ name: 'users' }),
        childTable = TestHelper.createTable({ name: 'posts' })

    expect(parentTable.isParentOf(childTable)).toBe(false)

    TestHelper.createColumn({ name: 'user_id', table: childTable })
    TestHelper.createForeignIndex({
        name: 'posts_user_id_foreign',
        references: 'id',
        on: 'users',
        columns: ['user_id'],
        table: childTable,
    })

    expect(parentTable.isParentOf(childTable)).toBe(true)
    expect(childTable.isChildrenOf(parentTable)).toBe(true)
})

test('It can check if table can be children of another table', () => {
    const parentTable = TestHelper.createTable({ name: 'users' }),
        childTable = TestHelper.createTable({ name: 'posts' })

    expect(childTable.canBeChildrenOf(parentTable)).toBe(true)
})

test('It can get children tables', () => {
    const parentTable = TestHelper.createTable({ name: 'users' }),
        childTable = TestHelper.createTable({ name: 'posts' })

    expect(parentTable.getChildrenTables().length).toBe(0)

    TestHelper.createColumn({ name: 'user_id', table: childTable })
    TestHelper.createForeignIndex({
        name: 'posts_user_id_foreign',
        references: 'id',
        on: 'users',
        columns: ['user_id'],
        table: childTable,
    })

    expect(parentTable.getChildrenTables().length).toBe(1)
    expect(parentTable.getChildrenTables()[0].name).toBe('posts')
})

test('It can get parent tables', () => {
    const parentTable = TestHelper.createTable({ name: 'users' }),
        childTable = TestHelper.createTable({ name: 'posts' })

    expect(childTable.getParentTables().length).toBe(0)

    TestHelper.createColumn({ name: 'user_id', table: childTable })
    TestHelper.createForeignIndex({
        name: 'posts_user_id_foreign',
        references: 'id',
        on: 'users',
        columns: ['user_id'],
        table: childTable,
    })

    expect(childTable.getParentTables().length).toBe(1)
    expect(childTable.getParentTables()[0].name).toBe('users')
})

test('It can add a foreign key', () => {
    const usersTable = TestHelper.createTable({ name: 'users' }),
        usersModel = TestHelper.createModel({ name: 'User', table: usersTable }),
        postsTable = TestHelper.createTable({ name: 'posts' })

    TestHelper.createColumn({ name: 'id', table: usersTable })
    TestHelper.createIndex({ name: 'users_primary', type: IndexType.PRIMARY, table: usersTable, columns: ['id'] })

    expect(postsTable.hasColumn('user_id')).toBe(false)
    expect(postsTable.hasIndex('posts_user_id_foreign')).toBe(false)

    const foreignIndex = postsTable.addForeign('user_id', usersModel)

    expect(foreignIndex.name).toBe('posts_user_id_foreign')
    expect(foreignIndex.columns).toEqual(['user_id'])

    expect(postsTable.hasColumn('user_id')).toBe(true)
    expect(postsTable.hasIndex('posts_user_id_foreign')).toBe(true)
})

test('It can get or create foreign column', () => {
    const usersTable = TestHelper.createTable({ name: 'users' }),
        usersModel = TestHelper.createModel({ name: 'User', table: usersTable }),
        postsTable = TestHelper.createTable({ name: 'posts' })

    TestHelper.createColumn({ name: 'id', table: usersTable})
    TestHelper.createIndex({ name: 'users_primary', type: IndexType.PRIMARY, table: usersTable, columns: ['id'] })

    expect(postsTable.hasColumn('user_id')).toBe(false)

    const foreignColumn = postsTable.getOrCreateForeignColumn('user_id', usersModel)

    expect(foreignColumn.name).toBe('user_id')
    expect(postsTable.hasColumn('user_id')).toBe(true)

    const existingColumn = postsTable.getOrCreateForeignColumn('user_id', usersModel)

    expect(existingColumn.id).toBe(foreignColumn.id)
})

test('It can get the label column', () => {
    const table = TestHelper.createTable()

    TestHelper.createColumn({ name: 'id', table, primaryKey: true })
    expect(table.getLabelColumn().name).toBe('id')

    TestHelper.createColumn({ name: 'name', table, type: 'varchar' })
    expect(table.getLabelColumn().name).toBe('name')

    TestHelper.createColumn({ name: 'title', table, type: 'varchar' })
    expect(table.getLabelColumn().name).toBe('name')
})

test('It can get the label column name', () => {
    const table = TestHelper.createTable()

    TestHelper.createColumn({ name: 'id', table, primaryKey: true })
    TestHelper.createColumn({ name: 'name', table, type: 'varchar' })

    expect(table.getLabelColumnName()).toBe('name')
})

test('It can undo all changes', () => {
    const table = TestHelper.createTableWithSchemaState()

    const originalName = table.name
    table.name = 'changed_name'

    const column = TestHelper.createColumnWithSchemaState({ name: 'old_column', table })
    column.name = 'new_column'

    const index = TestHelper.createIndexWithSchemaState({ name: 'old_index', table })
    index.name = 'new_index'

    table.save()
    column.save()
    index.save()

    expect(table.name).toBe('changed_name')
    expect(table.schemaState.name).toBe(originalName)

    expect(column.name).toBe('new_column')
    expect(column.schemaState.name).toBe('old_column')

    expect(index.name).toBe('new_index')
    expect(index.schemaState.name).toBe('old_index')

    table.undoAllChanges()

    expect(table.fresh().schemaState.name).toBe(originalName)
    expect(table.fresh().name).toBe(originalName)

    expect(column.fresh().schemaState.name).toBe('old_column')
    expect(column.fresh().name).toBe('old_column')

    expect(index.fresh().schemaState.name).toBe('old_index')
    expect(index.fresh().name).toBe('old_index')
})

test('It can undo all columns changes', () => {
    const table = TestHelper.createTableWithSchemaState()

    const column1 = TestHelper.createColumnWithSchemaState({ name: 'column1', table })
    const column2 = TestHelper.createColumnWithSchemaState({ name: 'column2', table })

    column1.name = 'changed_column1'
    column2.name = 'changed_column2'

    column1.save()
    column2.save()

    expect(column1.name).toBe('changed_column1')
    expect(column2.name).toBe('changed_column2')

    table.undoAllColumnsChanges()

    expect(column1.fresh().name).toBe('column1')
    expect(column2.fresh().name).toBe('column2')
})

test('It can undo all indexes changes', () => {
    const table = TestHelper.createTableWithSchemaState()

    const index1 = TestHelper.createIndexWithSchemaState({ name: 'index1', table })
    const index2 = TestHelper.createIndexWithSchemaState({ name: 'index2', table })

    index1.name = 'changed_index1'
    index2.name = 'changed_index2'

    index1.save()
    index2.save()

    expect(index1.name).toBe('changed_index1')
    expect(index2.name).toBe('changed_index2')

    table.undoAllIndexesChanges()

    expect(index1.fresh().name).toBe('index1')
    expect(index2.fresh().name).toBe('index2')
})

test('It can check if table belongs to a section', () => {
    const table = TestHelper.createTable()
    table.sectionId = null
    
    // we don't save the table because it always attach a default section when creating or updating
    // table.save()

    expect(table.belongsToASection()).toBe(false)

    const project = TestHelper.getProject()
    const section = new SchemaSection({
        name: 'Test Section',
        projectId: project.id,
        scrollX: 0,
        scrollY: 0,
        zoom: 100
    })
    section.save()

    table.sectionId = section.id
    table.save()

    expect(table.belongsToASection()).toBe(true)
})

test('It can move to a section', () => {
    const table = TestHelper.createTable()

    const project = TestHelper.getProject()
    const section = new SchemaSection({
        name: 'Test Section',
        projectId: project.id,
        scrollX: 0,
        scrollY: 0,
        zoom: 100
    })
    section.save()

    expect(table.sectionId).toBe(1)

    table.moveToSection(section)

    expect(table.sectionId).toBe(section.id)
    expect(table.positionX).toBe(0)
    expect(table.positionY).toBe(0)
})

test('It can center position', () => {
    const table = TestHelper.createTable()

    table.positionX = 100
    table.positionY = 200
    table.save()

    expect(table.positionX).toBe(100)
    expect(table.positionY).toBe(200)

    table.centerPosition()

    expect(table.positionX).toBe(0)
    expect(table.positionY).toBe(0)
})