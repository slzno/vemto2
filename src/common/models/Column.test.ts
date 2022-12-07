import Column from './Column'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
})

test('The Column model identifier is correct', () => {
    expect(Column.identifier()).toBe('Column')
})

test('It can save a new column', () => {
    const column = new Column()
    
    column.name = 'test_column'
    column.save()

    expect(column.id).toBe(1)
})

test('A column has changes when schema state is empty', () => {
    const column = new Column()
    
    column.name = 'test_column'
    column.save()

    expect(column.hadChanges({})).toBe(true)
})

test('It can check if a column has changes', () => {
    const column = TestHelper.createColumnWithSchemaState()

    const hadChanges = column.hadChanges({
        name: 'test_column',
        order: 1,
        length: 255,
        type: 'string',
        autoIncrement: false,
        nullable: false,
        unsigned: false,
    })

    expect(hadChanges).toBe(true)
})

test('It can check if a column does not have changes', () => {
    const column = TestHelper.createColumnWithSchemaState()

    const hadChanges = column.hadChanges({
        name: 'name',
        length: 255,
        type: 'string',
        autoIncrement: false,
        nullable: false,
        unsigned: false,
    })

    expect(hadChanges).toBe(false)
})

test('It can apply column changes', () => {
    const column = TestHelper.createColumn()

    column.applyChanges({ name: 'test_column_2' })

    expect(column.name).toBe('test_column_2')
    expect(column.schemaState.name).toBe('test_column_2')
})

test('It can save schema state separately', () => {
    const column = TestHelper.createColumn()

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
})

test('It does not apply changes when unnecessary', () => {
    const column = TestHelper.createColumn()

    let changesWereApplied = column.applyChanges({ name: 'renamed' })

    expect(changesWereApplied).toBe(true)

    // The changes were already applied, so they should not be applied again
    changesWereApplied = column.applyChanges({ name: 'renamed' })

    expect(changesWereApplied).toBe(false)
})

test('A column was not considered renamed when schema state is empty', () => {
    const column = TestHelper.createColumn()

    column.name = 'renamed'
    column.save()

    const wasRenamed = column.wasRenamed()

    expect(wasRenamed).toBe(false)
})

test('It can check if a column was renamed from interface', () => {
    const column = TestHelper.createColumn()

    column.applyChanges({ name: 'renamed' })

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

    const wasChanged = column.wasChanged()

    expect(wasChanged).toBe(false)
})

test('It can check if a column was changed after renamed', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.wasChanged()).toBe(false)

    column.name = 'renamed'
    column.save()

    expect(column.wasChanged()).toBe(true)
})

test('It can check if a column was changed after changing the length attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.wasChanged()).toBe(false)

    column.length = 64
    column.save()

    expect(column.wasChanged()).toBe(true)
})

test('It can check if a column was changed after changing the nullable attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.wasChanged()).toBe(false)

    column.nullable = true
    column.save()

    expect(column.wasChanged()).toBe(true)
})

test('It can check if a column was changed after changing the unsigned attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.wasChanged()).toBe(false)

    column.unsigned = true
    column.save()

    expect(column.wasChanged()).toBe(true)
})

test('It can check if a column was changed after changing the autoIncrement attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.wasChanged()).toBe(false)

    column.autoIncrement = true
    column.save()

    expect(column.wasChanged()).toBe(true)
})

test('It can check if a column was changed after changing the typeDefinition attr', () => {
    const column = TestHelper.createColumnWithSchemaState()

    expect(column.wasChanged()).toBe(false)

    column.typeDefinition = 'text'
    column.save()

    expect(column.wasChanged()).toBe(true)
})

test('It can check if a column is a PK', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'id'
    column.save()

    expect(column.isPrimaryKey()).toBe(true)
})

test('It can check if a column is an FK', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'user_id'
    column.save()

    expect(column.isForeign()).toBe(true)
})

test('It can check if a column is unique', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'password'
    column.save()

    expect(column.isUnique()).toBe(true)
})

test('It can check if a column is a special PK', () => {
    const column = TestHelper.createColumnWithSchemaState()

    column.name = 'special_primary_key'
    column.save()

    expect(column.isSpecialPrimaryKey()).toBe(true)
})

test('it fires TableColumnCreated when saving from interface', () => {
    const project = TestHelper.getProject()

    TestHelper.createTable()

    const column = new Column()
    column.name = 'test_column'
    column.tableId = project.tables[0].id
    column.saveFromInterface()

    expect(project.fresh().hasChangedTables()).toBe(true)
})

test('it fires TableColumnUpdated when saving from interface', () => {
    const column = TestHelper.createColumnWithSchemaState(),
        project = TestHelper.getProject()

    column.name = 'special_primary_key'
    column.saveFromInterface()

    expect(project.fresh().hasChangedTables()).toBe(true)
})