import MockDatabase from '@Tests/base/MockDatabase'
import TestHelper from '@Tests/base/TestHelper'
import { test, expect, beforeEach, jest } from '@jest/globals'
import { CrudType } from './Crud'
import RenderableApiBelongsToManyController from '@Renderer/codegen/sequential/services/crud/controllers/RenderableApiBelongsToManyController'
import path from 'path'

jest.mock('@Renderer/services/wrappers/Main')

beforeEach(() => {
    MockDatabase.start()
})

test('It correctly create a belongsToMany detail within a API CRUD', async () => {
    const userModel = TestHelper.createModel()
    
    TestHelper.createColumn({ name: 'id', table: userModel.table, type: 'integer' })
    
    const tagsTable = TestHelper.createTable({ name: 'tags' })
    
    TestHelper.createColumn({ name: 'id', table: tagsTable, type: 'integer' })

    const tagsModel = TestHelper.createModel({ name: 'Tag', plural: 'Tags', table: tagsTable })
    
    TestHelper.createBelongsToManyRelation(userModel, tagsModel)

    const userCrud = TestHelper.createCrud({ model: userModel, type: CrudType.API, generateDetails: true })

    expect(userCrud.belongsToManyDetails.length).toBe(1)
})

test('It correctly generates a belongsToMany detail controller', async () => {
    const userModel = TestHelper.createModel()
    
    TestHelper.createColumn({ name: 'id', table: userModel.table, type: 'integer' })
    
    const tagsTable = TestHelper.createTable({ name: 'tags' })
    
    TestHelper.createColumn({ name: 'id', table: tagsTable, type: 'integer' })

    const tagsModel = TestHelper.createModel({ name: 'Tag', plural: 'Tags', table: tagsTable })
    
    TestHelper.createBelongsToManyRelation(userModel, tagsModel)

    const renderedTemplateContent = await new RenderableApiBelongsToManyController(userModel).compileWithErrorThreatment(),
        renderedTemplateFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/output/model/template-with-invalid-relationship.php'), renderedTemplateContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(renderedTemplateFile, renderedTemplateContent)

    expect(contentIsEqual).toBe(true)
})