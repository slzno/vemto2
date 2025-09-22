import Crud, { CrudType } from './Crud'
import MockDatabase from '@Tests/base/MockDatabase'
import TestHelper from '@Tests/base/TestHelper'
import { test, expect, beforeEach, jest } from '@jest/globals'
import Relationship from '../Relationship'

jest.mock('@Renderer/services/wrappers/Main')

beforeEach(() => {
    MockDatabase.start()
})

test('It correctly fills a crud name and plural when a model has a composed name', async () => {
    const model = TestHelper.createModel({
        name: 'PostComment',
        plural: 'PostComments',
    })

    const crud = Crud.createFromModel(model)

    expect(crud.name).toBe('PostComment')
    expect(crud.plural).toBe('PostComments')
})

test('It generates a correct API crud routes', async () => {
    const userCrud = TestHelper.createCrud({
        type: CrudType.API
    })

    expect(userCrud.routes.length).toBe(5)

    expect(userCrud.routes[0].name).toBe('users.index')
    expect(userCrud.routes[0].method).toBe('get')
    expect(userCrud.routes[0].path).toBe('/users')

    expect(userCrud.routes[1].name).toBe('users.store')
    expect(userCrud.routes[1].method).toBe('post')
    expect(userCrud.routes[1].path).toBe('/users')

    expect(userCrud.routes[2].name).toBe('users.show')
    expect(userCrud.routes[2].method).toBe('get')
    expect(userCrud.routes[2].path).toBe('/users/{user}')

    expect(userCrud.routes[3].name).toBe('users.update')
    expect(userCrud.routes[3].method).toBe('put')
    expect(userCrud.routes[3].path).toBe('/users/{user}')

    expect(userCrud.routes[4].name).toBe('users.destroy')
    expect(userCrud.routes[4].method).toBe('delete')
    expect(userCrud.routes[4].path).toBe('/users/{user}')
})

test('It generates a correct API crud routes when it has a hasMany relationship', async () => {
    const userModel = TestHelper.createModel()

    const postTable = TestHelper.createTable({ name: 'posts' }),
        postModel = TestHelper.createModel({ name: 'Post', plural: 'Posts', table: postTable }),
        relationship = TestHelper.createHasManyRelation(userModel, postModel),
        userCrud = TestHelper.createCrud({ model: userModel, type: CrudType.API, generateDetails: true })

    expect(userCrud.hasManyDetails[0].detailCrud.routes.length).toBe(2)

    expect(userCrud.hasManyDetails[0].detailCrud.routes[0].name).toBe('users.posts.index')
    expect(userCrud.hasManyDetails[0].detailCrud.routes[0].method).toBe('get')
    expect(userCrud.hasManyDetails[0].detailCrud.routes[0].path).toBe('/users/{user}/posts')

    expect(userCrud.hasManyDetails[0].detailCrud.routes[1].name).toBe('users.posts.store')
    expect(userCrud.hasManyDetails[0].detailCrud.routes[1].method).toBe('post')
    expect(userCrud.hasManyDetails[0].detailCrud.routes[1].path).toBe('/users/{user}/posts')
})

test('It generates a correct API crud routes when it has a belongsToMany relationship', async () => {
    const userModel = TestHelper.createModel()
    
    TestHelper.createColumn({ name: 'id', table: userModel.table, type: 'integer' })
    
    const tagsTable = TestHelper.createTable({ name: 'tags' })
    
    TestHelper.createColumn({ name: 'id', table: tagsTable, type: 'integer' })

    const tagsModel = TestHelper.createModel({ name: 'Tag', plural: 'Tags', table: tagsTable })
    
    TestHelper.createBelongsToManyRelation(userModel, tagsModel)

    const userCrud = TestHelper.createCrud({ model: userModel, type: CrudType.API, generateDetails: true })

    expect(userCrud.belongsToManyDetails[0].detailCrud.routes.length).toBe(3)

    expect(userCrud.belongsToManyDetails[0].detailCrud.routes[0].name).toBe('users.tags.index')
    expect(userCrud.belongsToManyDetails[0].detailCrud.routes[0].method).toBe('get')
    expect(userCrud.belongsToManyDetails[0].detailCrud.routes[0].path).toBe('/users/{user}/tags')

    expect(userCrud.belongsToManyDetails[0].detailCrud.routes[1].name).toBe('users.tags.store')
    expect(userCrud.belongsToManyDetails[0].detailCrud.routes[1].method).toBe('post')
    expect(userCrud.belongsToManyDetails[0].detailCrud.routes[1].path).toBe('/users/{user}/tags/{tag}')

    expect(userCrud.belongsToManyDetails[0].detailCrud.routes[2].name).toBe('users.tags.destroy')
    expect(userCrud.belongsToManyDetails[0].detailCrud.routes[2].method).toBe('delete')
    expect(userCrud.belongsToManyDetails[0].detailCrud.routes[2].path).toBe('/users/{user}/tags/{tag}')
})