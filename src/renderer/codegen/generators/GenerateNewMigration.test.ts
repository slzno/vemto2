import path from 'path'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach, jest } from '@jest/globals'
import GenerateNewMigration from './GenerateNewMigration'
import TestHelper from '@Renderer/../../tests/base/TestHelper'

import Main from "@Renderer/services/wrappers/Main"

jest.mock('@Renderer/services/wrappers/Main')

beforeEach(() => {
    MockDatabase.start()
})

test('It can get the migration name', () => {
    const table = TestHelper.createTable({ name: 'posts' })

    TestHelper.createColumn({ name: 'title', table })
    TestHelper.createColumn({ name: 'body', table })

    GenerateNewMigration.setTable(table)

    expect(GenerateNewMigration.getName()).toBe('/database/migrations/2022_11_29_000001_update_posts_table.php')
})

test('It generates a migration to rename a table column', async () => {
    const table = TestHelper.createTable({ name: 'posts' }),
        column = TestHelper.createColumnWithSchemaState({ name: 'name', table })

    column.name = 'title'
    column.saveFromInterface()

    GenerateNewMigration.setTable(table)

    const renderedTemplateContent = await GenerateNewMigration.generateUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/input/new-migration-renaming-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})