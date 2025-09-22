import path from 'path'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach, jest } from '@jest/globals'
import TablesBuilder from '@Renderer/services/schema/TablesBuilder'
import GenerateTableChangerMigration from './GenerateTableChangerMigration'
import schemaData from '@Renderer/services/schema/tests/input/schema-reader-L9.json'
import Table from '@Common/models/Table'

jest.mock('@Renderer/services/wrappers/Main')

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

const processSchemaData = async (project, mockMigrationsPaths = true) => {
    // Clone data to avoid mutation (as data is being manipulated in the RAM)
    const schemaDataClone = JSON.parse(JSON.stringify(schemaData))

    const tablesBuilder = new TablesBuilder(project)

    tablesBuilder
        .setSchemaData(schemaDataClone)
        
    await tablesBuilder.build()
}

test('It can get the migration name', async () => {
    const project = TestHelper.getProject()

    await processSchemaData(project, false)

    const table = project.findTableByName('users')

    GenerateTableChangerMigration.setTable(table)

    expect(GenerateTableChangerMigration.getName().includes('change_users_table.php')).toBe(true)
})

test('It can generate a migration to rename a table', async () => {
    const project = TestHelper.getProject()

    await processSchemaData(project)

    const table = project.findTableByName('users')
    table.name = 'users2'
    table.saveFromInterface()

    GenerateTableChangerMigration.setTable(table)

    const renderedTemplateContent = await GenerateTableChangerMigration.getContent(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-renaming-table.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to drop a table', async () => {
    const project = TestHelper.getProject()

    await processSchemaData(project)

    const table = project.findTableByName('users')
    table.remove()

    GenerateTableChangerMigration.setTable(table)

    const renderedTemplateContent = await GenerateTableChangerMigration.getContent(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/new-migration-dropping-table.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})