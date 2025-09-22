import MockDatabase from '@Tests/base/MockDatabase'
import TestHelper from '@Tests/base/TestHelper'
import { test, expect, beforeEach, jest } from '@jest/globals'
import Relationship from './Relationship'
import path from "path"
import ModelRenderable from '@Renderer/codegen/sequential/services/model/ModelRenderable'

jest.mock('@Renderer/services/wrappers/Main')

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

test('It returns only valid model traits', async () => {
    const userModel = TestHelper.createModel()

    expect(userModel.hasTraits()).toBe(false)

    userModel.traits = [
        'HasFactory',
        'SoftDeletes',
        ''
    ]

    userModel.save()

    const traits = userModel.getTraits()

    expect(traits.length).toBe(2)
    expect(userModel.hasTraits()).toBe(true)
    expect(traits.includes('HasFactory')).toBe(true)
    expect(traits.includes('SoftDeletes')).toBe(true)
})

test('It returns only valid model interaces', async () => {
    const userModel = TestHelper.createModel()

    expect(userModel.hasInterfaces()).toBe(false)

    userModel.interfaces = [
        'UserInterface',
        'ModelInterface',
        ''
    ]

    userModel.save()

    const interfaces = userModel.getInterfaces()

    expect(interfaces.length).toBe(2)
    expect(userModel.hasInterfaces()).toBe(true)
    expect(interfaces.includes('UserInterface')).toBe(true)
    expect(interfaces.includes('ModelInterface')).toBe(true)
})

test('It can render the template with an empty model name', async () => {
    const userModel = TestHelper.createModel()

    userModel.name = ''

    userModel.save()

    expect(userModel.isInvalid()).toBe(true)

    const renderedTemplateContent = await new ModelRenderable(userModel).compileWithErrorThreatment(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/model/template-with-empty-name.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can render the template with a model with invalid relationships', async () => {
    const userModel = TestHelper.createModel(),
        postsModel = TestHelper.createModel()

    // Making the posts model invalid to invalidate the relationship
    postsModel.name = ''
    postsModel.save()

    const relationship = new Relationship()

    relationship.name = "posts"
    relationship.projectId = userModel.projectId
    relationship.type = 'HasMany'

    relationship.modelId = userModel.id
    relationship.relatedModelId = postsModel.id

    relationship.save()

    expect(relationship.isInvalid()).toBe(true)

    const renderedTemplateContent = await new ModelRenderable(userModel).compileWithErrorThreatment(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/model/template-with-invalid-relationship.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can render the template with a model with invalid relationship data', async () => {
    const userModel = TestHelper.createModel(),
        postsModel = TestHelper.createModel()

    // create a relationship without keys (in this case, parentkey and foreignkey)
    const relationship = new Relationship()
    relationship.name = "posts"
    relationship.projectId = userModel.projectId
    relationship.type = 'HasMany'
    relationship.modelId = userModel.id
    relationship.relatedModelId = postsModel.id

    relationship.save()

    expect(relationship.isInvalid()).toBe(true)

    const renderedTemplateContent = await new ModelRenderable(userModel).compileWithErrorThreatment(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/model/template-with-invalid-relationship.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})

test('It can render the template with an invalid relationship', async () => {
    const userModel = TestHelper.createModel()

    const relationship = new Relationship()

    relationship.name = "posts"
    relationship.projectId = userModel.projectId
    relationship.type = 'HasMany'

    relationship.modelId = userModel.id
    relationship.relatedModelId = null

    relationship.save()

    expect(relationship.isInvalid()).toBe(true)

    const renderedTemplateContent = await new ModelRenderable(userModel).compileWithErrorThreatment(),
        renderedTemplateFile = TestHelper.readOrCreateOutputFile('/model/template-with-invalid-relationship.php', renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})