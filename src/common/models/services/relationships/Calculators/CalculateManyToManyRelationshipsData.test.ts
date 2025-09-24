import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'
import CalculateManyToManyRelationshipsData from './CalculateManyToManyRelationshipsData'
import Relationship from '@Common/models/Relationship'
import Table from '@Common/models/Table'

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

test('It can set a relationship', () => {
    const relationship = new Relationship()
    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.relationship).toBe(relationship)
    expect(calculator).toBe(CalculateManyToManyRelationshipsData)
})

test('It validates required data correctly', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsToMany'
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    // Initially should be invalid
    expect(calculator.hasValidRequiredData()).toBe(false)

    // After processing, should be valid
    calculator.process()

    expect(calculator.hasValidRequiredData()).toBe(true)
})

test('It calculates default data', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsToMany'
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    calculator.calculateDefaultData()

    expect(relationship.relatedPivotKeyName).toBe('post_id')
    expect(relationship.foreignPivotKeyName).toBe('user_id')
    expect(relationship.pivotTableName).toBe('post_user')
})

test('It calculates foreign keys names', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'BelongsToMany'
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    calculator.calculateForeignsKeysNames()

    expect(relationship.relatedPivotKeyName).toBe('post_id')
    expect(relationship.foreignPivotKeyName).toBe('user_id')
})

test('It gets default related pivot key name', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.getDefaultRelatedPivotKeyName()).toBe('post_id')
})

test('It gets default foreign pivot key name', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.getDefaultForeignPivotKeyName()).toBe('user_id')
})

test('It calculates pivot name', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    calculator.calculatePivotName()

    expect(relationship.pivotTableName).toBe('post_user')
})

test('It gets default pivot name', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.getDefaultPivotName()).toBe('post_user')
})

test('It returns undefined for default pivot name when model IDs are missing', () => {
    const relationship = new Relationship()
    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.getDefaultPivotName()).toBeUndefined()
})

test('It processes and saves relationship', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsToMany'
    })

    // Save the relationship first
    relationship.save()

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    calculator.processAndSave(true)

    expect(relationship.pivot).toBeDefined()
    expect(relationship.pivotId).toBeDefined()
    expect(relationship.foreignPivotKeyId).toBeDefined()
    expect(relationship.relatedPivotKeyId).toBeDefined()
})

test('It creates or updates pivot table when none exists', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsToMany'
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    calculator.createOrUpdatePivot()

    expect(relationship.pivot).toBeDefined()
    expect(relationship.pivot.name).toBe('post_user')
    expect(relationship.pivotId).toBe(relationship.pivot.id)
})

test('It does not update pivot when pivotId exists and forceUpdate is false', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const pivot = TestHelper.createTable({ name: 'custom_pivot' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id,
        type: 'BelongsToMany'
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    calculator.createOrUpdatePivot()

    expect(relationship.pivot).toStrictEqual(pivot)
})

test('It creates pivot data with foreign keys', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const pivot = TestHelper.createTable({ name: 'user_post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id,
        type: 'BelongsToMany'
    })

    // Save the relationship first
    relationship.save()

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    calculator.createPivotData(pivot)

    const userIdColumn = pivot.findColumnByName('user_id')
    const postIdColumn = pivot.findColumnByName('post_id')

    expect(userIdColumn).toBeDefined()
    expect(postIdColumn).toBeDefined()
    expect(userIdColumn.isForeign()).toBe(true)
    expect(postIdColumn.isForeign()).toBe(true)
})

test('It calculates keys', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsToMany'
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    calculator.process()

    expect(relationship.foreignPivotKeyId).toBeDefined()
    expect(relationship.relatedPivotKeyId).toBeDefined()
})

test('It calculates foreign pivot key', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsToMany'
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    // Set up pivot first
    calculator.createOrUpdatePivot()

    calculator.calculateForeignPivotKey()

    expect(relationship.foreignPivotKeyId).toBeDefined()
})

test('It calculates related pivot key', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsToMany'
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    // Set up pivot first
    calculator.createOrUpdatePivot()

    calculator.calculateRelatedPivotKey()

    expect(relationship.relatedPivotKeyId).toBeDefined()
})

test('It throws error when getting default keys without pivot', () => {
    const relationship = new Relationship()
    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(() => calculator.getDefaultKeys()).toThrow('It is necessary to specify the pivot table before getting keys')
})

test('It gets default keys', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const pivot = TestHelper.createTable({ name: 'user_post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id
    })

    // Create pivot columns
    TestHelper.createColumn({ name: 'user_id', table: pivot, type: 'integer' })
    TestHelper.createColumn({ name: 'post_id', table: pivot, type: 'integer' })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    const keys = calculator.getDefaultKeys()

    expect(keys.foreignPivotKey).toBeDefined()
    expect(keys.relatedPivotKey).toBeDefined()
})

test('It gets original pivot name', () => {
    const relationship = new Relationship()
    relationship.pivotTableName = 'custom_pivot'

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.getOriginalPivotName()).toBe('custom_pivot')
})

test('It gets related pivot key name', () => {
    const relationship = new Relationship()
    relationship.relatedPivotKeyName = 'custom_post_id'

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.getRelatedPivotKeyName()).toBe('custom_post_id')
})

test('It gets foreign pivot key name', () => {
    const relationship = new Relationship()
    relationship.foreignPivotKeyName = 'custom_user_id'

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.getForeignPivotKeyName()).toBe('custom_user_id')
})

test('It creates inverse relationship', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    
    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })
    
    const relationship = new Relationship({
        name: 'posts',
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsToMany'
    })

    // Save the relationship first
    relationship.save()

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    // Process the relationship first to set up pivot and keys
    calculator.process()

    const result = calculator.createInverseRelationship()

    expect(result).toBe(true)
    expect(relationship.inverseId).toBeDefined()
})

test('It calculates inverse name', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relationship = new Relationship({
        modelId: model.id
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.calculateInverseName()).toBe('users')
})

test('It checks if needs to add pivot to model template - different pivot', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const pivot = TestHelper.createTable({ name: 'custom_pivot' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.needsToAddPivotToModelTemplate()).toBe(true)
})

test('It checks if needs to add pivot to model template - different related pivot', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const pivot = TestHelper.createTable({ name: 'user_post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id
    })

    // Create custom related pivot key
    const customRelatedKey = TestHelper.createColumn({ name: 'custom_post_id', table: pivot, type: 'integer' })
    relationship.relatedPivotKeyId = customRelatedKey.id
    relationship.relatedPivotKey = customRelatedKey

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.needsToAddPivotToModelTemplate()).toBe(true)
})

test('It checks if needs to add pivot to model template - different foreign key', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const pivot = TestHelper.createTable({ name: 'user_post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id
    })

    // Create custom foreign pivot key
    const customForeignKey = TestHelper.createColumn({ name: 'custom_user_id', table: pivot, type: 'integer' })
    relationship.foreignPivotKeyId = customForeignKey.id
    relationship.foreignPivotKey = customForeignKey

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.needsToAddPivotToModelTemplate()).toBe(true)
})

test('It checks if has different pivot', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const pivot = TestHelper.createTable({ name: 'custom_pivot' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id
    })

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.hasDifferentPivot()).toBe(true)
})

test('It checks if has different related pivot', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const pivot = TestHelper.createTable({ name: 'user_post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id
    })

    // Create custom related pivot key
    const customRelatedKey = TestHelper.createColumn({ name: 'custom_post_id', table: pivot, type: 'integer' })
    relationship.relatedPivotKeyId = customRelatedKey.id
    relationship.relatedPivotKey = customRelatedKey

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.hasDifferentRelatedPivot()).toBe(true)
})

test('It checks if has different foreign key', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const pivot = TestHelper.createTable({ name: 'user_post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id
    })

    // Create custom foreign pivot key
    const customForeignKey = TestHelper.createColumn({ name: 'custom_user_id', table: pivot, type: 'integer' })
    relationship.foreignPivotKeyId = customForeignKey.id
    relationship.foreignPivotKey = customForeignKey

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.hasDifferentForeignKey()).toBe(true)
})

test('It checks if has different foreign or related pivot keys', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const pivot = TestHelper.createTable({ name: 'user_post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        pivotId: pivot.id
    })

    // Create custom foreign pivot key
    const customForeignKey = TestHelper.createColumn({ name: 'custom_user_id', table: pivot, type: 'integer' })
    relationship.foreignPivotKeyId = customForeignKey.id
    relationship.foreignPivotKey = customForeignKey

    const calculator = CalculateManyToManyRelationshipsData.setRelationship(relationship)

    expect(calculator.hasDifferentForeignOrRelatedPivotKeys()).toBe(true)
})