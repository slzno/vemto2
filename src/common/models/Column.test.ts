import Column from './Column'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeAll } from '@jest/globals'

beforeAll(() => {
    MockDatabase.start()
})

test('The column model identifier is correct', () => {
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