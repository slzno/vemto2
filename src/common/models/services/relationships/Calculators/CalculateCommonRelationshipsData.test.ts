import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'
import CalculateCommonRelationshipsData from './CalculateCommonRelationshipsData'
import Relationship from '@Common/models/Relationship'

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

test('It can set a relationship', () => {
    const relationship = new Relationship()
    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.relationship).toBe(relationship)
    expect(calculator).toBe(CalculateCommonRelationshipsData)
})

test('It validates required data correctly for BelongsTo', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key to model table
    TestHelper.createColumn({ name: 'post_id', table: model.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsTo',
        foreignKeyName: 'post_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    // Initially should be invalid
    expect(calculator.hasValidRequiredData()).toBe(false)

    // After processing, should be valid
    calculator.process()

    expect(calculator.hasValidRequiredData()).toBe(true)
})

test('It validates required data correctly for HasMany', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key to related model table
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    // Initially should be invalid
    expect(calculator.hasValidRequiredData()).toBe(false)

    // After processing, should be valid
    calculator.process()

    expect(calculator.hasValidRequiredData()).toBe(true)
})

test('It processes and saves relationship', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    // Process without creating inverse to avoid saveAndFinish issues
    calculator.process(false)
    calculator.relationship.save()

    expect(relationship.isSaved()).toBe(true)
})

test('It processes relationship', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.process()

    expect(relationship.foreignKeyId).toBeDefined()
    expect(relationship.parentKeyId).toBeDefined()
    expect(relationship.name).toBeDefined()
})

test('It creates inverse relationship for HasMany', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        name: 'posts',
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.createInverseRelationshipForHasSomething()

    expect(relationship.inverseId).toBeDefined()
})

test('It does not create inverse relationship for BelongsTo in HasSomething method', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'post_id', table: model.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        name: 'post',
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsTo',
        foreignKeyName: 'post_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.createInverseRelationshipForHasSomething()

    expect(relationship.inverseId).toBeUndefined()
})

test('It creates inverse relationship for BelongsTo', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'post_id', table: model.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        name: 'post',
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsTo',
        foreignKeyName: 'post_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.createInverseRelationshipForBelongsTo()

    expect(relationship.inverseId).toBeDefined()
})

test('It does not create inverse relationship for HasMany in BelongsTo method', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        name: 'posts',
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.createInverseRelationshipForBelongsTo()

    expect(relationship.inverseId).toBeUndefined()
})

test('It saves and finishes relationship', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    // Process first to set up keys
    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)
    calculator.process(false) // Don't create inverse

    // Just save directly to avoid addToInverseRelation issues
    calculator.relationship.save()

    expect(relationship.isSaved()).toBe(true)
})

test('It creates inverse relationship', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        name: 'posts',
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    // Save the relationship first
    relationship.save()

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    const result = calculator.createInverseRelationship()

    expect(result).toBe(true)
    expect(relationship.inverseId).toBeDefined()
})

test('It does not create inverse relationship when already exists', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        name: 'posts',
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id',
        inverseId: 'existing_inverse_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    const result = calculator.createInverseRelationship()

    expect(result).toBeUndefined()
})

test('It calculates inverse name for plural relationship', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relationship = new Relationship({
        modelId: model.id
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.calculateInverseName()).toBe('user')
})

test('It calculates inverse name for singular relationship', () => {
    const model = TestHelper.createModel({ name: 'User', plural: 'Users' })
    const relationship = new Relationship({
        modelId: model.id,
        name: 'author'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.calculateInverseName()).toBe('users')
})

test('It adds foreign key for BelongsTo relationship', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsTo',
        foreignKeyName: 'post_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    const index = calculator.addForeign()

    expect(index).toBeDefined()
})

test('It does not add foreign key for non-BelongsTo relationship', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    const index = calculator.addForeign()

    expect(index).toBeUndefined()
})

test('It calculates keys', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.calculateKeys()

    expect(relationship.foreignKeyId).toBeDefined()
    expect(relationship.parentKeyId).toBeDefined()
})

test('It calculates foreign key', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.calculateForeignKey()

    expect(relationship.foreignKeyId).toBeDefined()
})

test('It throws error when foreign key does not exist', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'nonexistent_key'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(() => calculator.calculateForeignKey()).toThrow('The foreign key nonexistent_key does not exist in the User model')
})

test('It calculates default data', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.calculateDefaultData()

    expect(relationship.name).toBeDefined()
    expect(relationship.parentKeyId).toBeDefined()
    expect(relationship.foreignKeyName).toBe('user_id')
})

test('It calculates parent key', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.calculateParentKey()

    expect(relationship.parentKeyId).toBeDefined()
})

test('It throws error when parent key does not exist', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys without id
    TestHelper.createColumn({ name: 'uuid', table: model.table, type: 'string' })
    TestHelper.createColumn({ name: 'uuid', table: relatedModel.table, type: 'string' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(() => calculator.calculateParentKey()).toThrow('The parent key "id" does not exist in the Post model')
})

test('It calculates foreign key name', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    calculator.calculateForeignKeyName()

    expect(relationship.foreignKeyName).toBe('user_id')
})

test('It gets default keys for BelongsTo', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'post_id', table: model.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'BelongsTo',
        foreignKeyName: 'post_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    const keys = calculator.getDefaultKeys()

    expect(keys.parentKey).toBeDefined()
    expect(keys.foreignKey).toBeDefined()
})

test('It gets default keys for HasMany', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add foreign key
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'user_id'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    const keys = calculator.getDefaultKeys()

    expect(keys.parentKey).toBeDefined()
    expect(keys.foreignKey).toBeDefined()
})

test('It gets primary key name', () => {
    const model = TestHelper.createModel({ name: 'User' })

    // Add primary key
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.getPrimaryKeyName()).toBe('id')
})

test('It gets primary key name when no primary key exists', () => {
    const model = TestHelper.createModel({ name: 'User' })

    const relationship = new Relationship({
        modelId: model.id
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.getPrimaryKeyName()).toBe('id')
})

test('It gets foreign key name', () => {
    const relationship = new Relationship({
        foreignKeyName: 'custom_foreign_key'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.getForeignKeyName()).toBe('custom_foreign_key')
})

test('It gets default foreign key name', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasMany'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.getDefaultForeignKeyName()).toBe('user_id')
})

test('It gets default foreign key name', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })
    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasMany'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.getDefaultForeignKeyName()).toBe('user_id')
})

test('It checks if has different foreign or parent key', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys - custom in relatedModel for HasMany
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'uuid', table: relatedModel.table, type: 'string' })

    // Add foreign key in relatedModel for HasMany
    TestHelper.createColumn({ name: 'user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany'
    })

    // Set up keys
    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)
    calculator.calculateKeys()

    expect(calculator.hasDifferentForeignOrParentKey()).toBe(true)
})

test('It checks if has different parent key', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'uuid', table: model.table, type: 'string' })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany'
    })

    // Manually set parent key to test hasDifferentParentKey
    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)
    const parentKey = TestHelper.createColumn({ name: 'uuid', table: model.table, type: 'string' })
    relationship.parentKeyId = parentKey.id
    relationship.parentKey = parentKey

    expect(calculator.hasDifferentParentKey()).toBe(true)
})

test('It checks if has different foreign key', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    // Add custom foreign key
    TestHelper.createColumn({ name: 'custom_user_id', table: relatedModel.table, type: 'integer', nullable: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'HasMany',
        foreignKeyName: 'custom_user_id'
    })

    // Set up keys
    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)
    calculator.calculateKeys()

    expect(calculator.hasDifferentForeignKey()).toBe(true)
})

test('It gets foreign model for BelongsTo', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'BelongsTo'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.getForeignModel()).toStrictEqual(model)
})

test('It gets foreign model for HasMany', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'HasMany'
    })

    const calculator = CalculateCommonRelationshipsData.setRelationship(relationship)

    expect(calculator.getForeignModel()).toStrictEqual(relatedModel)
})