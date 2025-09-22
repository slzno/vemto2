import path from 'path'
import MockDatabase from '@Tests/base/MockDatabase'
import GenerateNewMigration from './GenerateNewMigration'
import { test, expect, beforeEach, jest } from '@jest/globals'
import TestHelper from '@Renderer/../../tests/base/TestHelper'
import Index, { IndexType } from '@Renderer/../common/models/Index'

jest.mock('@Renderer/services/wrappers/Main')

jest.useFakeTimers()
    .setSystemTime(new Date('2022-01-01T00:00:00.000Z'))

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

test('It can get the migration name', () => {
    const table = TestHelper.createTable({ name: 'posts' })

    TestHelper.createColumn({ name: 'title', table })
    TestHelper.createColumn({ name: 'body', table })

    const migrationGenerator = new GenerateNewMigration(table)

    expect(migrationGenerator.getName()).toBe('/database/migrations/2022_01_01_000000_001_create_posts_table.php')
})

test('It can generate a migration to rename a table column', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        column = TestHelper.createColumnWithSchemaState({ name: 'name', table })

    column.name = 'title'
    column.saveFromInterface()

    const migrationGenerator = new GenerateNewMigration(table)

    const renderedTemplateContent = await migrationGenerator.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-renaming-column.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to add a new column', async () => {
    const table = TestHelper.createTable({ name: 'posts' })
    
    TestHelper.createColumnWithSchemaState({ name: 'id', order: 0, table })
    TestHelper.createColumn({ name: 'tag', order: 1, table })

    const migrationGenerator = new GenerateNewMigration(table)

    const renderedTemplateContent = await migrationGenerator.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-adding-column.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to change an existing column', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        column = TestHelper.createColumnWithSchemaState({ name: 'title', table })

    column.length = 64
    column.saveFromInterface()

    const migrationGenerator = new GenerateNewMigration(table)

    const renderedTemplateContent = await migrationGenerator.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-changing-column.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to remove a column', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        column = TestHelper.createColumnWithSchemaState({ name: 'title', table })

    column.remove()

    const migrationGenerator = new GenerateNewMigration(table)

    const renderedTemplateContent = await migrationGenerator.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-removing-column.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to add an index', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        index = new Index

        index.name = 'new_index'
        index.tableId = table.id
        index.columns = ['token']
        index.type = IndexType.INDEX
        index.saveFromInterface()

    const migrationGenerator = new GenerateNewMigration(table)

    const renderedTemplateContent = await migrationGenerator.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-adding-index.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to add a multiple columns index', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        index = new Index

        index.name = 'new_index'
        index.tableId = table.id
        index.columns = ['token', 'email']
        index.type = IndexType.INDEX
        index.saveFromInterface()

    const migrationGenerator = new GenerateNewMigration(table)

    const renderedTemplateContent = await migrationGenerator.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-adding-multiple-columns-index.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to add a foreign index', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        index = new Index

        index.name = 'new_index'
        index.tableId = table.id
        index.columns = ['user_id']
        index.type = IndexType.FOREIGN
        index.references = 'users'
        index.on = 'id'
        index.saveFromInterface()

    const migrationGenerator = new GenerateNewMigration(table)

    const renderedTemplateContent = await migrationGenerator.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-adding-foreign-index.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to remove an index', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        index = TestHelper.createIndexWithSchemaState({ name: 'new_index', table })

    index.remove()

    const migrationGenerator = new GenerateNewMigration(table)

    const renderedTemplateContent = await migrationGenerator.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-removing-index.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to create a new table', async () => {
    const table = TestHelper.createTable({ name: 'posts' })

    // add primary
    TestHelper.createColumn({ name: 'id', type: 'unsignedBigInteger', order: 0, table, autoIncrement: true })
    TestHelper.createColumn({ name: 'title', order: 1, table })
    TestHelper.createColumn({ name: 'content', order: 2, table })
    TestHelper.createColumn({ name: 'token', order: 3, table })
    TestHelper.createColumn({ name: 'user_id', order: 4, table })

    TestHelper.createIndex({ name: 'new_index', columns: ['token'], table })
    TestHelper.createForeignIndex({ name: 'new_foreign_index', columns: ['user_id'], references: 'users', on: 'id', table })

    const migrationGenerator = new GenerateNewMigration(table)

    const renderedTemplateContent = await migrationGenerator.getContent(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-creating-table.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})