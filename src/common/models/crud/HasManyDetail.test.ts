import MockDatabase from '@Tests/base/MockDatabase'
import TestHelper from '@Tests/base/TestHelper'
import { test, expect, beforeEach, jest } from '@jest/globals'
import { CrudType } from './Crud'

jest.mock('@Renderer/services/wrappers/Main')

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

test('It correctly create a belongsToMany detail within a API CRUD', async () => {
    const userModel = TestHelper.createModel()
    
    TestHelper.createColumn({ name: 'id', table: userModel.table, type: 'integer' })
    
    const tagsTable = TestHelper.createTable({ name: 'tags' })
    
    TestHelper.createColumn({ name: 'id', table: tagsTable, type: 'integer' })

    const tagsModel = TestHelper.createModel({ name: 'Tag', plural: 'Tags', table: tagsTable })
    
    TestHelper.createHasManyRelation(userModel, tagsModel)

    const userCrud = TestHelper.createCrud({ model: userModel, type: CrudType.API, generateDetails: true })

    expect(userCrud.hasManyDetails.length).toBe(1)
})