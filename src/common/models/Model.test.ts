import MockDatabase from '@Tests/base/MockDatabase'
import TestHelper from '@Tests/base/TestHelper'
import { test, expect, beforeEach, jest } from '@jest/globals'
import Relationship from './Relationship'
import path from "path"
import RenderableModel from '@Renderer/codegen/sequential/services/model/RenderableModel'

jest.mock('@Renderer/services/wrappers/Main')

beforeEach(() => {
    MockDatabase.start()
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

    const renderedTemplateContent = await new RenderableModel(userModel).compileWithErrorThreatment(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/model/template-with-invalid-relationship.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})