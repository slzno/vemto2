import path from 'path'
import MockDatabase from '@Tests/base/MockDatabase'
import GenerateNewMigration from './GenerateNewMigration'
import { test, expect, beforeEach, jest } from '@jest/globals'
import TestHelper from '@Renderer/../../tests/base/TestHelper'
import Index from '@Renderer/../common/models/Index'

jest.mock('@Renderer/services/wrappers/Main')

jest.useFakeTimers()
    .setSystemTime(new Date('2022-01-01T00:00:00.000Z'))

beforeEach(() => {
    MockDatabase.start()
})

test('It can get the migration name', () => {
    const table = TestHelper.createTable({ name: 'posts' })

    TestHelper.createColumn({ name: 'title', table })
    TestHelper.createColumn({ name: 'body', table })

    GenerateNewMigration.setTable(table)

    expect(GenerateNewMigration.getName()).toBe('/database/migrations/2022_01_01_000000_update_posts_table.php')
})

test('It can add the migration to the generation queue and remove the table from changed tables', async () => {
    const table = TestHelper.createTable({ name: 'posts' })
    table.markAsChanged()

    GenerateNewMigration.setTable(table)

    expect(table.project.hasChangedTables()).toBe(true)

    await GenerateNewMigration.run()

    expect(table.project.hasChangedTables()).toBe(false)
})

test('It can generate a migration to rename a table column', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        column = TestHelper.createColumnWithSchemaState({ name: 'name', table })

    column.name = 'title'
    column.saveFromInterface()

    GenerateNewMigration.setTable(table)

    const renderedTemplateContent = await GenerateNewMigration.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-renaming-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to add a new column', async () => {
    const table = TestHelper.createTable({ name: 'posts' })
    
    TestHelper.createColumnWithSchemaState({ name: 'id', order: 0, table })
    TestHelper.createColumn({ name: 'tag', order: 1, table })

    GenerateNewMigration.setTable(table)

    const renderedTemplateContent = await GenerateNewMigration.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-adding-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to change an existing column', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        column = TestHelper.createColumnWithSchemaState({ name: 'title', table })

    column.length = 64
    column.saveFromInterface()

    GenerateNewMigration.setTable(table)

    const renderedTemplateContent = await GenerateNewMigration.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-changing-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to remove a column', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        column = TestHelper.createColumnWithSchemaState({ name: 'title', table })

    column.remove()

    GenerateNewMigration.setTable(table)

    const renderedTemplateContent = await GenerateNewMigration.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-removing-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to add an index', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        index = new Index

        index.name = 'new_index'
        index.tableId = table.id
        index.columns = ['token']
        index.type = 'index'
        index.saveFromInterface()

    GenerateNewMigration.setTable(table)

    const renderedTemplateContent = await GenerateNewMigration.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-adding-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to add a multiple columns index', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        index = new Index

        index.name = 'new_index'
        index.tableId = table.id
        index.columns = ['token', 'email']
        index.type = 'index'
        index.saveFromInterface()

    GenerateNewMigration.setTable(table)

    const renderedTemplateContent = await GenerateNewMigration.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-adding-multiple-columns-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to add a foreign index', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        index = new Index

        index.name = 'new_index'
        index.tableId = table.id
        index.columns = ['user_id']
        index.type = 'foreign'
        index.references = 'users'
        index.on = 'id'
        index.saveFromInterface()

    GenerateNewMigration.setTable(table)

    const renderedTemplateContent = await GenerateNewMigration.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-adding-foreign-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to remove an index', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        index = TestHelper.createIndexWithSchemaState({ name: 'new_index', table })

    index.remove()

    GenerateNewMigration.setTable(table)

    const renderedTemplateContent = await GenerateNewMigration.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-removing-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})