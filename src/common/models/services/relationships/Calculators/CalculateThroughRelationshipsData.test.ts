import CalculateThroughRelationshipsData from './CalculateThroughRelationshipsData'
import Relationship from '@Common/models/Relationship'
import MockDatabase from '@Tests/base/MockDatabase'
import TestHelper from '@Tests/base/TestHelper'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

test('It can set a relationship', () => {
    const relationship = new Relationship()
    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    expect(calculator.relationship).toBe(relationship)
    expect(calculator).toBe(CalculateThroughRelationshipsData)
})

test('It validates required data correctly for through relationships', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })
    const throughModel = TestHelper.createModel({ name: 'Comment', plural: 'Comments' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: throughModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasManyThrough',
        throughId: throughModel.id
    })

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    // Initially should be invalid
    expect(calculator.hasValidRequiredData()).toBe(false)

    // After setting through and keys, should be valid
    relationship.through = throughModel
    relationship.firstKeyName = 'user_id'
    relationship.secondKeyName = 'post_id'

    expect(calculator.hasValidRequiredData()).toBe(true)
})

test('It calculates default data', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })
    const throughModel = TestHelper.createModel({ name: 'Comment', plural: 'Comments' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: throughModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasManyThrough',
        throughId: throughModel.id
    })

    relationship.through = throughModel

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    calculator.calculateDefaultData()

    expect(relationship.name).toBeDefined()
    expect(relationship.firstKeyName).toBe('user_id')
    expect(relationship.secondKeyName).toBe('comment_id')
})

test('It calculates name', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })
    const throughModel = TestHelper.createModel({ name: 'Comment', plural: 'Comments' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasManyThrough',
        throughId: throughModel.id
    })

    relationship.model = model
    relationship.relatedModel = relatedModel
    relationship.through = throughModel

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    calculator.calculateName()

    expect(relationship.name).toBe('posts')
})

test('It calculates first key name', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })
    const throughModel = TestHelper.createModel({ name: 'Comment', plural: 'Comments' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasManyThrough',
        throughId: throughModel.id
    })

    relationship.through = throughModel

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    calculator.calculateFirstKeyName()

    expect(relationship.firstKeyName).toBe('user_id')
})

test('It calculates second key name', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })
    const throughModel = TestHelper.createModel({ name: 'Comment', plural: 'Comments' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasManyThrough',
        throughId: throughModel.id
    })

    relationship.through = throughModel

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    calculator.calculateSecondKeyName()

    expect(relationship.secondKeyName).toBe('comment_id')
})

test('It gets default model key name', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasManyThrough'
    })

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    expect(calculator.getDefaultModelKeyName()).toBe('user_id')
})

test('It gets default through model key', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })
    const throughModel = TestHelper.createModel({ name: 'Comment', plural: 'Comments' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasManyThrough',
        throughId: throughModel.id
    })

    relationship.through = throughModel

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    expect(calculator.getDefaultThroughModelKey()).toBe('comment_id')
})

test('It checks if has different first key name', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })
    const throughModel = TestHelper.createModel({ name: 'Comment', plural: 'Comments' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasManyThrough',
        throughId: throughModel.id,
        firstKeyName: 'custom_user_id'
    })

    relationship.through = throughModel

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    expect(calculator.hasDifferentFirstKeyName()).toBe(true)
})

test('It checks if has different second key name', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })
    const throughModel = TestHelper.createModel({ name: 'Comment', plural: 'Comments' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasManyThrough',
        throughId: throughModel.id,
        secondKeyName: 'custom_comment_id'
    })

    relationship.through = throughModel

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    expect(calculator.hasDifferentSecondKeyName()).toBe(true)
})

test('It checks if needs to add first key name to model template', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relatedModel = TestHelper.createModel({ name: 'Post', plural: 'Posts' })
    const throughModel = TestHelper.createModel({ name: 'Comment', plural: 'Comments' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasManyThrough',
        throughId: throughModel.id,
        firstKeyName: 'custom_user_id'
    })

    relationship.through = throughModel

    const calculator = CalculateThroughRelationshipsData.setRelationship(relationship)

    expect(calculator.needsToAddFirstKeyNameToModelTemplate()).toBe(true)
})