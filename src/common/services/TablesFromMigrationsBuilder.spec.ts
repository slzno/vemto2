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
    
    TablesFromMigrationsBuilder.build()

    return schemaDataClone
}

test('It can force reading the data', () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const tables = project.tables

    expect(tables.length).toBe(6)
})

test('It creates new tables', () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const tables = project.tables

    expect(tables.length).toBe(6)

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

    expect(project.tables.length).toBe(6)
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

    expect(usersTable.columns.length).toBe(10)

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

    expect(usersTable.columns.length).toBe(10)
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

test('It reads the columns order', () => {
    const project = TestHelper.getProject()

    const readSchemaData = processSchemaData(project)

    const usersTable = project.findTableByName('users')

    expect(usersTable.columns[0].order).toBe(0)
    expect(usersTable.columns[0].name).toBe('id')
    expect(readSchemaData.users.columns['id'].order).toBe(0)
    expect(readSchemaData.users.columns['id'].creationOrder).toBe(1)

    expect(usersTable.columns[1].order).toBe(1)
    expect(usersTable.columns[1].name).toBe('name')
    expect(readSchemaData.users.columns['name'].order).toBe(1)
    expect(readSchemaData.users.columns['name'].creationOrder).toBe(2)

    // Creation order here is 10 because the column was created
    // by another migration, not the one that created the table
    expect(usersTable.columns[2].order).toBe(2)
    expect(usersTable.columns[2].name).toBe('last_name')
    expect(readSchemaData.users.columns['last_name'].order).toBe(2)
    expect(readSchemaData.users.columns['last_name'].creationOrder).toBe(10)
})

test('It creates new indexes', () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const usersTable = project.findTableByName('videos')

    expect(usersTable.indexes.length).toBe(4)

    const indexesNames = usersTable.indexes.map(column => column.name)

    expect(indexesNames.includes('videos_id_primary')).toBe(true)
    expect(indexesNames.includes('videos_user_id_slug_unique')).toBe(true)
    expect(indexesNames.includes('videos_description_fulltext')).toBe(true)
    expect(indexesNames.includes('videos_location_spatialindex')).toBe(true)
})

test('It deletes removed indexes', () => {
    const project = TestHelper.getProject(),
        usersTable = TestHelper.createTable({ name: 'failed_jobs' })

    TestHelper.createIndex({ name: 'test', table: usersTable })

    expect(usersTable.fresh().indexes.length).toBe(1)

    processSchemaData(project)

    expect(usersTable.indexes.length).toBe(0)
})

test('It updates existing indexes', () => {
    const project = TestHelper.getProject(),
        usersTable = TestHelper.createTable({ name: 'videos' })

    TestHelper.createIndex({ 
        name: 'videos_description_fulltext', 
        columns: ['description'],
        algorithm: 'BTREE',
        type: 'index',
        table: usersTable
    })

    expect(usersTable.fresh().findIndexByName('videos_description_fulltext').type).toBe('index')

    processSchemaData(project)

    expect(usersTable.fresh().findIndexByName('videos_description_fulltext').type).toBe('fulltext')
})

test('It can correctly read foreign indexes', () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const usersTable = project.findTableByName('posts'),
        foreignIndex = usersTable.fresh().findIndexByName('posts_user_id_foreign')

    expect(foreignIndex.type).toBe('foreign')
    expect(foreignIndex.columns).toEqual(['user_id'])
    expect(foreignIndex.references).toBe('id')
    expect(foreignIndex.on).toBe('users')
})