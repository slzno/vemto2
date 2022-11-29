import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'
import schemaData from './tests/input/schema-reader-L9.json'
import TablesFromMigrationsBuilder from './TablesFromMigrationsBuilder'

beforeEach(() => {
    MockDatabase.start()
})

const processSchemaData = (project) => {
    // Clone data to avoid mutation (as data is being manipulated in the RAM)
    const schemaDataClone = JSON.parse(JSON.stringify(schemaData))

    TablesFromMigrationsBuilder
        .setProject(project)
        .setSchemaData(schemaDataClone)
        .checkSchemaChanges()
        .build()
}

test('It creates new tables', () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const tables = project.tables

    expect(tables.length).toBe(4)

    const tablesNames = tables.map(table => table.name)

    expect(tablesNames.includes('users')).toBe(true)
    expect(tablesNames.includes('password_resets')).toBe(true)
    expect(tablesNames.includes('failed_jobs')).toBe(true)
    expect(tablesNames.includes('personal_access_tokens')).toBe(true)
})

test('It deletes removed tables', () => {
    const project = TestHelper.getProject()

    TestHelper.createTable({ name: 'test' })

    expect(project.fresh().tables.length).toBe(1)

    processSchemaData(project)

    expect(project.tables.length).toBe(4)
})

test('It updates existing tables', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' })

    expect(table.hasMigrations()).toBe(false)

    processSchemaData(project)

    expect(table.fresh().hasMigrations()).toBe(true)
})

test('It creates new columns', () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const usersTable = project.findTableByName('users')

    expect(usersTable.columns.length).toBe(9)

    const columnsNames = usersTable.columns.map(column => column.name)

    expect(columnsNames.includes('id')).toBe(true)
    expect(columnsNames.includes('name')).toBe(true)
    expect(columnsNames.includes('email')).toBe(true)
    expect(columnsNames.includes('email_verified_at')).toBe(true)
    expect(columnsNames.includes('password')).toBe(true)
    expect(columnsNames.includes('remember_token')).toBe(true)
    expect(columnsNames.includes('created_at')).toBe(true)
    expect(columnsNames.includes('updated_at')).toBe(true)
})

test('It deletes removed columns', () => {
    const project = TestHelper.getProject(),
        usersTable = TestHelper.createTable({ name: 'users' })

    TestHelper.createColumn({ name: 'test', table: usersTable })

    expect(usersTable.fresh().columns.length).toBe(1)

    processSchemaData(project)

    expect(usersTable.columns.length).toBe(9)
})

test('It updates existing columns', () => {
    const project = TestHelper.getProject(),
        usersTable = TestHelper.createTable({ name: 'users' })

    TestHelper.createColumn({ 
        name: 'name', 
        length: 64,
        table: usersTable 
    })

    expect(usersTable.fresh().findColumnByName('name').length).toBe(64)

    processSchemaData(project)

    expect(usersTable.findColumnByName('name').fresh().length).toBe(255)
})

test('It can force reading the data', () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const tables = project.tables

    expect(tables.length).toBe(4)
})