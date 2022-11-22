import Table from './Table'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
})

test('The Table model identifier is correct', () => {
    expect(Table.identifier()).toBe('Table')
})

test('It can save a new table', () => {
    const table = new Table()
    
    table.name = 'test_table'
    table.save()

    expect(table.id).toBe(1)
})

test('It sets the Table position when creating', () => {
    const table = TestHelper.createTable()

    expect(table.positionX).toBe(0)
    expect(table.positionY).toBe(0)
})

test('It can check if a table has changes', () => {
    const table = TestHelper.createTable()

    const hadChanges = table.hadChanges({
        name: 'test_column',
    })

    expect(hadChanges).toBe(true)
})

test('It can apply changes to a table', () => {
    const table = TestHelper.createTable()

    table.applyChanges({
        name: 'test_column',
    })

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

test('It can check if a table has related tables', () => {
    const table = TestHelper.createTable()

    expect(table.hasRelatedTables()).toBe(true)
})

test('It can get the related tables', () => {
    const table = TestHelper.createTable({ name: 'users' })

    const relatedTables = table.getRelatedTables()

    expect(relatedTables.length).toBe(2)
})