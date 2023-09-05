import path from 'path'
import MockDatabase from '@Tests/base/MockDatabase'
import GenerateTableChangerMigration from './GenerateTableChangerMigration'
import { test, expect, beforeEach, jest } from '@jest/globals'
import TestHelper from '@Renderer/../../tests/base/TestHelper'
import schemaData from '@Common/services/tests/input/schema-reader-L9.json'
import TablesFromMigrationsBuilder from '@Common/services/TablesFromMigrationsBuilder'

jest.mock('@Renderer/services/wrappers/Main')

beforeEach(() => {
    MockDatabase.start()
})

const processSchemaData = (project, mockMigrationsPaths = true) => {
    // Clone data to avoid mutation (as data is being manipulated in the RAM)
    const schemaDataClone = JSON.parse(JSON.stringify(schemaData))

    TablesFromMigrationsBuilder
        .setProject(project)
        .setSchemaData(schemaDataClone)
        .checkSchemaChanges()
        
    TablesFromMigrationsBuilder.build()

    // Mock paths to get migrations files from the tests directory
    // instead of the real project migrations directory
    if (mockMigrationsPaths) {
        project.tables.forEach(table => {
            table.migrations.forEach(migration => {
                migration.relativePath = path.join(__dirname, 'tests/input', migration.relativePath)
                table.save()
            })
        })
    }
}

test('It can get the migration name', () => {
    const project = TestHelper.getProject()

    processSchemaData(project, false)

    const table = project.findTableByName('users')

    GenerateTableChangerMigration.setTable(table)

    expect(GenerateTableChangerMigration.getName().includes('change_users_table.php')).toBe(true)
})

test('It can add the migration to the generation queue and remove the table from changed tables', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const table = project.findTableByName('users')
    table.markAsChanged()

    GenerateTableChangerMigration.setTable(table)

    expect(table.project.hasSchemaChanges()).toBe(true)

    await GenerateTableChangerMigration.run()

    expect(table.project.hasSchemaChanges()).toBe(false)
})

test('It can generate a migration to rename a table', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const table = project.findTableByName('users')
    table.name = 'users2'
    table.saveFromInterface()

    GenerateTableChangerMigration.setTable(table)

    const renderedTemplateContent = await GenerateTableChangerMigration.getContent(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-renaming-table.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can generate a migration to drop a table', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const table = project.findTableByName('users')
    table.remove()

    GenerateTableChangerMigration.setTable(table)

    const renderedTemplateContent = await GenerateTableChangerMigration.getContent(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/new-migration-dropping-table.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})