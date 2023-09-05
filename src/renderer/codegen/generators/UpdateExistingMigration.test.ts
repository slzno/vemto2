import path from 'path'
import MockDatabase from '@Tests/base/MockDatabase'
import UpdateExistingMigration from './UpdateExistingMigration'
import { test, expect, beforeEach, jest } from '@jest/globals'
import TestHelper from '@Renderer/../../tests/base/TestHelper'
import schemaData from '@Common/services/tests/input/schema-reader-L9.json'
import TablesFromMigrationsBuilder from '@Common/services/TablesFromMigrationsBuilder'
import Column from '@Renderer/../common/models/Column'
import Index from '@Renderer/../common/models/Index'

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

    UpdateExistingMigration.setTable(table)

    expect(UpdateExistingMigration.getName()).toBe('/database/migrations/2019_12_14_000002_change_users_table.php')
})

test('It can add the migration to the generation queue and remove the table from changed tables', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    const table = project.findTableByName('users')
    table.markAsChanged()

    UpdateExistingMigration.setTable(table)

    expect(table.project.hasSchemaChanges()).toBe(true)

    await UpdateExistingMigration.run()

    expect(table.project.hasSchemaChanges()).toBe(false)
})

test('It can change a creation migration when a column was renamed', async () => {
    const project = TestHelper.getProject()
    
    processSchemaData(project)
    
    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        column = table.findColumnByName('email')

    column.name = 'email_renamed'
    column.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-renaming-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when a column was changed', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        column = table.findColumnByName('email')

    column.length = null
    column.type = 'text'
    column.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-changing-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when a column was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        column = new Column

    column.name = 'new_column'
    column.tableId = table.id
    column.type = 'string'
    column.length = 255
    column.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-adding-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when a column was removed', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        column = table.findColumnByName('email')

    column.remove()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-removing-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when an index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'index'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-adding-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when a multiple columns index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token', 'email']
    index.type = 'index'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-adding-multiple-columns-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when a foreign index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['user_id']
    index.type = 'foreign'
    index.references = 'users'
    index.on = 'id'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-adding-foreign-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when a foreign index with cascades was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['user_id']
    index.type = 'foreign'
    index.references = 'users'
    index.on = 'id'
    index.onDelete = 'cascade'
    index.onUpdate = 'cascade'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-adding-foreign-index-with-cascades.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when a primary index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'primary'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-adding-primary-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when an unique index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'unique'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-adding-unique-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when a fulltext index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'fulltext'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-adding-fulltext-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change a creation migration when a spatial index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using password_resets table as it has a creation migration
    const table = project.findTableByName('password_resets'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'spatialIndex'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeCreationMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-creation-migration-adding-spatial-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a column was renamed', async () => {
    const project = TestHelper.getProject()
    
    processSchemaData(project)
    
    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        column = table.findColumnByName('email')

    column.name = 'email_renamed'
    column.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-renaming-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a column was changed', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        column = table.findColumnByName('email')

    column.length = null
    column.type = 'text'
    column.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-changing-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a column was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        column = new Column

    column.name = 'new_column'
    column.tableId = table.id
    column.type = 'string'
    column.length = 255
    column.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-adding-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a column was removed', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        column = table.findColumnByName('email')

    column.remove()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-removing-column.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when an index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'index'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-adding-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a multiple columns index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token', 'email']
    index.type = 'index'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-adding-multiple-columns-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a foreign index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'foreign'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-adding-foreign-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a foreign index with cascades was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'foreign'
    index.onDelete = 'cascade'
    index.onUpdate = 'cascade'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-adding-foreign-index-with-cascades.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a foreign index was removed', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users')

    const index = TestHelper.createIndexWithSchemaState({
        table,
        name: 'new_index',
        columns: ['company_id'],
        type: 'foreign',
    })

    index.remove()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-removing-foreign-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a primary index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'primary'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-adding-primary-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a unique index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'unique'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-adding-unique-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a spatial index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'spatialIndex'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-adding-spatial-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can change an updater migration when a fulltext index was added', async () => {
    const project = TestHelper.getProject()

    processSchemaData(project)

    // Using users table as it has an updater migration
    const table = project.findTableByName('users'),
        index = new Index

    index.name = 'new_index'
    index.tableId = table.id
    index.columns = ['token']
    index.type = 'fulltext'
    index.saveFromInterface()

    UpdateExistingMigration.setTable(table)

    const renderedTemplateContent = await UpdateExistingMigration.changeUpdaterMigration(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/change-updater-migration-adding-fulltext-index.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})