import Crud from './Crud'
import MockDatabase from '@Tests/base/MockDatabase'
import TestHelper from '@Tests/base/TestHelper'
import { test, expect, beforeEach, jest } from '@jest/globals'
import AppSection from '../AppSection'

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