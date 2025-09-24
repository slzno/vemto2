import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach, jest } from '@jest/globals'
import Project from '@Common/models/Project'

// Mock Main and ProjectManager
const mockLoadSchema = jest.fn() as any
const mockGetCurrentOpenProjectUuid = jest.fn() as any
const mockIsClosed = jest.fn() as any

jest.mock('@Renderer/services/wrappers/Main', () => ({
    default: {
        API: {
            loadSchema: mockLoadSchema
        }
    }
}))

jest.mock('../project/ProjectManager', () => ({
    default: {
        getCurrentOpenProjectUuid: mockGetCurrentOpenProjectUuid,
        isClosed: mockIsClosed
    },
    __esModule: true
}))

// Import after mocks
const Main = require('@Renderer/services/wrappers/Main').default
const ProjectManager = require('../project/ProjectManager').default
const SchemaBuilder = require('./SchemaBuilder').default

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)

    // Reset mocks
    jest.clearAllMocks()

    // Reset static properties
    SchemaBuilder.processing = false
    SchemaBuilder.canCheckSchemaChanges = true
    SchemaBuilder.currentlyReadingProjectUuid = ""
})

test('Constructor sets currentlyReadingProjectUuid', () => {
    const project = TestHelper.getProject()
    const builder = new SchemaBuilder(project)

    expect(SchemaBuilder.currentlyReadingProjectUuid).toBe(project.uuid)
})

test('hasChanges returns true if hashes differ', () => {
    const project = TestHelper.getProject()
    project.schemaDataHash = 'oldHash'

    const builder = new SchemaBuilder(project)
    builder.schemaDataHash = 'newHash'

    expect(builder.hasChanges()).toBe(true)
})

test('hasChanges returns false if hashes are same', () => {
    const project = TestHelper.getProject()
    project.schemaDataHash = 'sameHash'

    const builder = new SchemaBuilder(project)
    builder.schemaDataHash = 'sameHash'

    expect(builder.hasChanges()).toBe(false)
})

test('schemaDataIsValid returns true for valid data', () => {
    const project = TestHelper.getProject()
    const builder = new SchemaBuilder(project)

    builder.schemaData = { tables: {}, models: [] }

    expect(builder.schemaDataIsValid()).toBe(true)
})

test('schemaDataIsValid returns false for invalid data', () => {
    const project = TestHelper.getProject()
    const builder = new SchemaBuilder(project)

    // Null
    builder.schemaData = null
    expect(builder.schemaDataIsValid()).toBe(false)

    // Empty object
    builder.schemaData = {}
    expect(builder.schemaDataIsValid()).toBe(false)

    // With error
    builder.schemaData = { error: 'some error' }
    expect(builder.schemaDataIsValid()).toBe(false)
})

test('disableSchemaChangesCheck sets flag', () => {
    SchemaBuilder.disableSchemaChangesCheck()
    expect(SchemaBuilder.canCheckSchemaChanges).toBe(false)
})

test('enableSchemaChangesCheck sets flag', () => {
    SchemaBuilder.enableSchemaChangesCheck()
    expect(SchemaBuilder.canCheckSchemaChanges).toBe(true)
})