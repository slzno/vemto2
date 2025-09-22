import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'
import TablesBuilder from './TablesBuilder'
import schemaData from '@Renderer/services/schema/tests/input/schema-reader-L9.json'

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

const processSchemaData = async (project) => {
    // Clone data to avoid mutation (as data is being manipulated in the RAM)
    const schemaDataClone = JSON.parse(JSON.stringify(schemaData))

    const tablesBuilder = new TablesBuilder(project)
    
    tablesBuilder
        .setSchemaData(schemaDataClone)
    
    await tablesBuilder.build()

    return schemaDataClone
}

test('It can force reading the data', async () => {
    const project = TestHelper.getProject()

    await processSchemaData(project)

    const tables = project.tables

    expect(tables.length).toBe(7)
})

test('It creates new tables', async () => {
    const project = TestHelper.getProject()

    await processSchemaData(project)

    const tables = project.tables

    expect(tables.length).toBe(7)

    const tablesNames = tables.map(table => table.name)

    expect(tablesNames.includes('users')).toBe(true)
    expect(tablesNames.includes('password_resets')).toBe(true)
    expect(tablesNames.includes('failed_jobs')).toBe(true)
    expect(tablesNames.includes('personal_access_tokens')).toBe(true)
})

test('It deletes removed tables', async () => {
    const project = TestHelper.getProject()

    TestHelper.createTable({ name: 'test' })

    expect(project.fresh().tables.length).toBe(1)

    await processSchemaData(project)

    expect(project.tables.length).toBe(7)
})

test('It updates existing tables', async () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' })

    expect(table.hasMigrations()).toBe(false)

    await processSchemaData(project)

    expect(table.fresh().hasMigrations()).toBe(true)
})

test('It creates new columns', async () => {
    const project = TestHelper.getProject()

    await processSchemaData(project)

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

test('It deletes removed columns', async () => {
    const project = TestHelper.getProject(),
        usersTable = TestHelper.createTable({ name: 'users' })

    TestHelper.createColumn({ name: 'test', table: usersTable })

    expect(usersTable.fresh().columns.length).toBe(1)

    await processSchemaData(project)

    expect(usersTable.columns.length).toBe(10)
})

test('It updates existing columns', async () => {
    const project = TestHelper.getProject(),
        usersTable = TestHelper.createTable({ name: 'users' })

    TestHelper.createColumn({ 
        name: 'name', 
        length: 64,
        table: usersTable 
    })

    expect(usersTable.fresh().findColumnByName('name').length).toBe(64)

    await processSchemaData(project)

    expect(usersTable.findColumnByName('name').fresh().length).toBe(255)
})

test('It reads the columns order', async () => {
    const project = TestHelper.getProject()

    const readSchemaData = await processSchemaData(project)

    console.log('Read schema data', readSchemaData)

    const usersTable = project.findTableByName('users')

    expect(usersTable.columns[0].order).toBe(0)
    expect(usersTable.columns[0].name).toBe('id')
    expect(readSchemaData.tables.users.columns['id'].order).toBe(0)
    expect(readSchemaData.tables.users.columns['id'].creationOrder).toBe(1)

    expect(usersTable.columns[1].order).toBe(1)
    expect(usersTable.columns[1].name).toBe('name')
    expect(readSchemaData.tables.users.columns['name'].order).toBe(1)
    expect(readSchemaData.tables.users.columns['name'].creationOrder).toBe(2)

    // Creation order here is 10 because the column was created
    // by another migration, not the one that created the table
    expect(usersTable.columns[2].order).toBe(2)
    expect(usersTable.columns[2].name).toBe('last_name')
    expect(readSchemaData.tables.users.columns['last_name'].order).toBe(2)
    expect(readSchemaData.tables.users.columns['last_name'].creationOrder).toBe(10)
})

test('It creates new indexes', async () => {
    const project = TestHelper.getProject()

    await processSchemaData(project)

    const usersTable = project.findTableByName('videos')

    expect(usersTable.indexes.length).toBe(4)

    const indexesNames = usersTable.indexes.map(column => column.name)

    expect(indexesNames.includes('videos_id_primary')).toBe(true)
    expect(indexesNames.includes('videos_user_id_slug_unique')).toBe(true)
    expect(indexesNames.includes('videos_description_fulltext')).toBe(true)
    expect(indexesNames.includes('videos_location_spatialindex')).toBe(true)
})

test('It deletes removed indexes', async () => {
    const project = TestHelper.getProject(),
        usersTable = TestHelper.createTable({ name: 'failed_jobs' })

    TestHelper.createIndex({ name: 'test', table: usersTable })

    expect(usersTable.fresh().indexes.length).toBe(1)

    await processSchemaData(project)

    expect(usersTable.indexes.length).toBe(0)
})

test('It updates existing indexes', async () => {
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

    await processSchemaData(project)

    expect(usersTable.fresh().findIndexByName('videos_description_fulltext').type).toBe('fulltext')
})

test('It can correctly read foreign indexes', async () => {
    const project = TestHelper.getProject()

    await processSchemaData(project)

    const usersTable = project.findTableByName('posts'),
        foreignIndex = usersTable.fresh().findIndexByName('posts_user_id_foreign')

    expect(foreignIndex.type).toBe('foreign')
    expect(foreignIndex.columns).toEqual(['user_id'])
    expect(foreignIndex.references).toBe('id')
    expect(foreignIndex.on).toBe('users')
})