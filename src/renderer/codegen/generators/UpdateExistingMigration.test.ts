import path from 'path'
import MockDatabase from '@Tests/base/MockDatabase'
import UpdateExistingMigration from './UpdateExistingMigration'
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
        .build()

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

    UpdateExistingMigration.setTable(table)

    expect(UpdateExistingMigration.getName()).toBe('/database/migrations/2019_12_14_000002_change_users_table.php')
})

test('It can add the migration to the generation queue and remove the table from changed tables', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const table = project.findTableByName('users')
    table.markAsChanged()

    UpdateExistingMigration.setTable(table)

    expect(table.project.hasChangedTables()).toBe(true)

    await UpdateExistingMigration.run()

    expect(table.project.hasChangedTables()).toBe(false)
})

test('It can change a creation migration', async () => {
    const project = TestHelper.getProject()
    
    processSchemaData(project)
    
    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        column = table.findColumnByName('email')

    column.applyChanges({ name: 'email_renamed' })

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-renaming-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration', async () => {
    const project = TestHelper.getProject()
    
    processSchemaData(project)
    
    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        column = table.findColumnByName('email')

    column.name = 'email_renamed'
    column.saveFromInterface()

    console.log(column.wasRenamed())

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-renaming-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})