import path from 'path'
import MockDatabase from '@Tests/base/MockDatabase'
import GenerateNewMigration from './GenerateNewMigration'
import { test, expect, beforeEach, jest } from '@jest/globals'
import TestHelper from '@Renderer/../../tests/base/TestHelper'

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