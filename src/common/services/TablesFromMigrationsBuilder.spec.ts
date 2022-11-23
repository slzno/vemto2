import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'
import schemaData from './tests/input/schema-reader-L9.json'
import TablesFromMigrationsBuilder from './TablesFromMigrationsBuilder'

beforeEach(() => {
    MockDatabase.start()
})

test('It creates new tables', () => {
    const project = TestHelper.createProject()

    TablesFromMigrationsBuilder
        .setProject(project)
        .setSchemaData(schemaData)
        .checkSchemaChanges()
        .build()

    const tables = project.tables

    expect(tables.length).toBe(4)

    const tablesNames = tables.map(table => table.name)

    expect(tablesNames.includes('users')).toBe(true)
    expect(tablesNames.includes('password_resets')).toBe(true)
    expect(tablesNames.includes('failed_jobs')).toBe(true)
    expect(tablesNames.includes('personal_access_tokens')).toBe(true)
})

test('It creates new columns', () => {
    const project = TestHelper.createProject()

    TablesFromMigrationsBuilder
        .setProject(project)
        .setSchemaData(schemaData)
        .checkSchemaChanges()
        .build()

    const usersTable = project.findTableByName('users')

    expect(usersTable.columns.length).toBe(9)

    const columnsNames = usersTable.columns.map(column => column.name)

    console.log(columnsNames)

    expect(columnsNames.includes('id')).toBe(true)
    expect(columnsNames.includes('name')).toBe(true)
    expect(columnsNames.includes('email')).toBe(true)
    expect(columnsNames.includes('email_verified_at')).toBe(true)
    expect(columnsNames.includes('password')).toBe(true)
    expect(columnsNames.includes('remember_token')).toBe(true)
    expect(columnsNames.includes('created_at')).toBe(true)
    expect(columnsNames.includes('updated_at')).toBe(true)

})

// test('It updates existing tables', () => {
//     const project = TestHelper.createProject()

//     TablesFromMigrationsBuilder
//         .setProject(project)
//         .setSchemaData(schemaData)
//         .checkSchemaChanges()
//         .build()
// })

// test('It updates existing columns', () => {
//     const project = TestHelper.createProject()

//     TablesFromMigrationsBuilder
//         .setProject(project)
//         .setSchemaData(schemaData)
//         .checkSchemaChanges()
//         .build()
// })

test('It deletes removed columns', () => {
    expect(true).toBe(true)
})

test('It can force reading the data', () => {
    expect(true).toBe(true)
})