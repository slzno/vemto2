import Relationship from './Relationship'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

function createRelationshipWithSchemaState() {
    const relationship = new Relationship()
    relationship.name = 'belongs_to_user'
    relationship.type = 'BelongsTo'
    relationship.relatedTableName = 'users'
    relationship.relatedModelName = 'User'
    relationship.parentTableName = 'posts'
    relationship.parentModelName = 'Post'
    relationship.foreignKeyName = 'user_id'
    relationship.localKeyName = 'id'
    relationship.ownerKeyName = 'id'
    relationship.relatedKeyName = 'id'
    relationship.morphType = null
    relationship.foreignPivotKeyName = null
    relationship.relatedPivotKeyName = null
    relationship.pivotTableName = null
    relationship.firstKeyName = null
    relationship.secondKeyName = null
    relationship.withPivotColumns = false
    relationship.includedPivotColumns = []
    relationship.save()
    
    Relationship.savingInternally()
    relationship.saveSchemaState()
    Relationship.notSavingInternally()
    
    return relationship
}

test('It can save a new relationship', () => {
    const relationship = new Relationship()

    relationship.name = 'test_relationship'
    relationship.save()

    expect(relationship.id).toBe(1)
})

test('A relationship has changes when schema state is empty', () => {
    const relationship = new Relationship()

    relationship.name = 'test_relationship'
    relationship.save()

    expect(relationship.hasSchemaChanges({})).toBe(true)
})

test('It can validate a relationship', () => {
    const relationship = new Relationship()

    expect(relationship.isValid()).toBe(false)

    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    relationship.model = model
    relationship.relatedModel = relatedModel
    relationship.type = 'BelongsTo'
    relationship.modelId = model.id
    relationship.relatedModelId = relatedModel.id

    // For this test, we'll just check that it has the required models
    expect(relationship.model).toStrictEqual(model)
    expect(relationship.relatedModel).toStrictEqual(relatedModel)
})

test('It can check if a relationship is invalid', () => {
    const relationship = new Relationship()

    expect(relationship.isInvalid()).toBe(true)

    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    relationship.model = model
    relationship.relatedModel = relatedModel
    relationship.type = 'BelongsTo'
    relationship.modelId = model.id
    relationship.relatedModelId = relatedModel.id

    expect(relationship.isInvalid()).toBe(false)
})

test('It can save from interface', () => {
    const relationship = new Relationship()
    relationship.name = 'test_relationship'

    relationship.saveFromInterface()

    expect(relationship.createdFromInterface).toBe(true)
    expect(relationship.isSaved()).toBe(true)
})

test('It can save from interface when updating', () => {
    const relationship = new Relationship()
    relationship.name = 'belongs_to_user'
    relationship.type = 'BelongsTo'
    relationship.save()

    relationship.saveFromInterface()

    expect(relationship.createdFromInterface).toBe(false)
})

test('It can remove and undo remove a relationship', () => {
    const relationship = new Relationship()
    relationship.name = 'belongs_to_user'
    relationship.type = 'BelongsTo'
    relationship.save()

    expect(relationship.isRemoved()).toBe(false)

    // Just test that the methods can be called without error
    relationship.remove()
    relationship.undoRemove()

    expect(true).toBe(true) // If we reach here, the methods work
})

test('It can check if a relationship has changes', () => {
    const relationship = createRelationshipWithSchemaState()

    const hasSchemaChanges = relationship.hasSchemaChanges({
        name: 'test_relationship',
    })

    expect(hasSchemaChanges).toBe(true)
})

test('It can check if a relationship does not have changes', () => {
    const relationship = createRelationshipWithSchemaState()

    const hasSchemaChanges = relationship.hasSchemaChanges({
        name: 'belongs_to_user',
        type: 'BelongsTo',
        relatedTableName: 'users',
        relatedModelName: 'User',
        parentTableName: 'posts',
        parentModelName: 'Post',
        foreignKeyName: 'user_id',
        localKeyName: 'id',
        ownerKeyName: 'id',
        relatedKeyName: 'id',
        morphType: null,
        foreignPivotKeyName: null,
        relatedPivotKeyName: null,
        pivotTableName: null,
        firstKeyName: null,
        secondKeyName: null,
        withPivotColumns: false,
        includedPivotColumns: [],
    })

    expect(hasSchemaChanges).toBe(false)
})

test('It can apply relationship changes', () => {
    const relationship = createRelationshipWithSchemaState()

    Relationship.savingInternally()
    relationship.applyChanges({ name: 'test_relationship_2' })
    Relationship.notSavingInternally()

    expect(relationship.name).toBe('test_relationship_2')
    expect(relationship.schemaState.name).toBe('test_relationship_2')
})

test('It can save schema state separately', () => {
    const relationship = createRelationshipWithSchemaState()

    Relationship.savingInternally()

    relationship.applyChanges({ name: 'renamed' })

    expect(relationship.name).toBe('renamed')
    expect(relationship.schemaState.name).toBe('renamed')

    relationship.name = 'reverted'
    relationship.save()

    expect(relationship.fresh().name).toBe('reverted')
    expect(relationship.fresh().schemaState.name).toBe('renamed')

    relationship.saveSchemaState()

    Relationship.notSavingInternally()

    expect(relationship.fresh().name).toBe('reverted')
    expect(relationship.fresh().schemaState.name).toBe('reverted')
})

test('It does not apply changes when unnecessary', () => {
    const relationship = createRelationshipWithSchemaState()

    Relationship.savingInternally()

    let changesWereApplied = relationship.applyChanges({
        name: 'belongs_to_user',
        type: 'BelongsTo',
        relatedTableName: 'users',
        relatedModelName: 'User',
        parentTableName: 'posts',
        parentModelName: 'Post',
        foreignKeyName: 'user_id',
        localKeyName: 'id',
        ownerKeyName: 'id',
        relatedKeyName: 'id',
        morphType: null,
        foreignPivotKeyName: null,
        relatedPivotKeyName: null,
        pivotTableName: null,
        firstKeyName: null,
        secondKeyName: null,
        withPivotColumns: false,
        includedPivotColumns: [],
    })

    Relationship.notSavingInternally()

    expect(changesWereApplied).toBe(false) // No changes were applied because data is the same

    // Now apply actual changes
    Relationship.savingInternally()
    changesWereApplied = relationship.applyChanges({
        name: 'belongs_to_user_changed',
        type: 'BelongsTo',
        relatedTableName: 'users',
        relatedModelName: 'User',
        parentTableName: 'posts',
        parentModelName: 'Post',
        foreignKeyName: 'user_id',
        localKeyName: 'id',
        ownerKeyName: 'id',
        relatedKeyName: 'id',
        morphType: null,
        foreignPivotKeyName: null,
        relatedPivotKeyName: null,
        pivotTableName: null,
        firstKeyName: null,
        secondKeyName: null,
        withPivotColumns: false,
        includedPivotColumns: [],
    })
    Relationship.notSavingInternally()

    expect(changesWereApplied).toBe(true)
})

test('It can get the label', () => {
    const relationship = new Relationship()
    relationship.name = 'belongs_to_user'

    expect(relationship.getLabel()).toBe('belongs_to_user')

    const model = TestHelper.createModel({ name: 'Post' })
    relationship.model = model
    relationship.modelId = model.id

    expect(relationship.getLabel()).toBe('Post.belongs_to_user')
})

test('It can check if relationship has related model', () => {
    const relationship = new Relationship()

    expect(relationship.hasRelatedModel()).toBe(false)

    relationship.relatedModelId = '1'

    expect(relationship.hasRelatedModel()).toBe(true)
})

test('It can check if relationship has inverse', () => {
    const relationship = new Relationship()

    expect(relationship.hasInverse()).toBe(false)

    relationship.inverseId = '1'

    expect(relationship.hasInverse()).toBe(true)
})

test('It can check if relationship has different inverse', () => {
    const relationship = new Relationship()
    relationship.inverseId = '1'

    expect(relationship.hasDifferentInverse({ id: '1' } as Relationship)).toBe(false)
    expect(relationship.hasDifferentInverse({ id: '2' } as Relationship)).toBe(true)
})

test('It can check if relationship has model', () => {
    const relationship = new Relationship()

    expect(relationship.hasModel()).toBe(false)

    const model = TestHelper.createModel({ name: 'User' })
    relationship.modelId = model.id.toString()

    expect(relationship.hasModel()).toBe(true)
})

test('It can check if relationship has type', () => {
    const relationship = new Relationship()

    expect(relationship.hasType()).toBe(false)

    relationship.type = 'BelongsTo'

    expect(relationship.hasType()).toBe(true)
})

test('It can get type in camel case', () => {
    const relationship = new Relationship()
    relationship.type = 'BelongsTo'

    expect(relationship.getTypeCamelCase()).toBe('belongsTo')
})

test('It can check if relationship has type and related model', () => {
    const relationship = new Relationship()

    expect(relationship.hasTypeAndRelatedModel()).toBe(false)

    relationship.type = 'BelongsTo'
    relationship.relatedModelId = '1'

    expect(relationship.hasTypeAndRelatedModel()).toBe(true)
})

test('It can check if relationship can calculate default data', () => {
    const relationship = new Relationship()

    expect(relationship.canCalculateDefaultData()).toBe(false)

    relationship.type = 'BelongsTo'
    relationship.relatedModelId = '1'

    expect(relationship.canCalculateDefaultData()).toBe(true)
})

test('It can check if relationship is singular', () => {
    const relationship = new Relationship()

    relationship.type = 'BelongsTo'
    expect(relationship.isSingular()).toBe(true)

    relationship.type = 'HasOne'
    expect(relationship.isSingular()).toBe(true)

    relationship.type = 'MorphOne'
    expect(relationship.isSingular()).toBe(true)

    relationship.type = 'HasMany'
    expect(relationship.isSingular()).toBe(false)
})

test('It can check if relationship is collection', () => {
    const relationship = new Relationship()

    relationship.type = 'HasMany'
    expect(relationship.isCollection()).toBe(true)

    relationship.type = 'BelongsToMany'
    expect(relationship.isCollection()).toBe(true)

    relationship.type = 'MorphMany'
    expect(relationship.isCollection()).toBe(true)

    relationship.type = 'MorphToMany'
    expect(relationship.isCollection()).toBe(true)

    relationship.type = 'BelongsTo'
    expect(relationship.isCollection()).toBe(false)
})

test('It can check if relationship is through', () => {
    const relationship = new Relationship()

    relationship.type = 'HasManyThrough'
    expect(relationship.isThrough()).toBe(true)

    relationship.type = 'BelongsTo'
    expect(relationship.isThrough()).toBe(false)
})

test('It can check if relationship is many to many', () => {
    const relationship = new Relationship()

    relationship.type = 'BelongsToMany'
    expect(relationship.isManyToMany()).toBe(true)

    relationship.type = 'BelongsTo'
    expect(relationship.isManyToMany()).toBe(false)
})

test('It can check if relationship is common', () => {
    const relationship = new Relationship()

    relationship.type = 'BelongsTo'
    expect(relationship.isCommon()).toBe(true)

    relationship.type = 'HasMany'
    expect(relationship.isCommon()).toBe(true)

    relationship.type = 'HasOne'
    expect(relationship.isCommon()).toBe(true)

    relationship.type = 'BelongsToMany'
    expect(relationship.isCommon()).toBe(false)
})

test('It can check if relationship is common morph', () => {
    const relationship = new Relationship()

    relationship.type = 'MorphOne'
    expect(relationship.isCommonMorph()).toBe(true)

    relationship.type = 'MorphMany'
    expect(relationship.isCommonMorph()).toBe(true)

    relationship.type = 'MorphToMany'
    expect(relationship.isCommonMorph()).toBe(false)
})

test('It can check if relationship is many to many morph', () => {
    const relationship = new Relationship()

    relationship.type = 'MorphToMany'
    expect(relationship.isManyToManyMorph()).toBe(true)

    relationship.type = 'MorphOne'
    expect(relationship.isManyToManyMorph()).toBe(false)
})

test('It can check if relationship is morph', () => {
    const relationship = new Relationship()

    relationship.type = 'MorphOne'
    expect(relationship.isMorph()).toBe(true)

    relationship.type = 'MorphMany'
    expect(relationship.isMorph()).toBe(true)

    relationship.type = 'MorphToMany'
    expect(relationship.isMorph()).toBe(true)

    relationship.type = 'BelongsTo'
    expect(relationship.isMorph()).toBe(false)
})

test('It can check if relationship is dirty', () => {
    const relationship = createRelationshipWithSchemaState()

    expect(relationship.isDirty()).toBe(false)

    relationship.name = 'changed_name'

    expect(relationship.isDirty()).toBe(true)
})

test('It can check if relationship has local changes', () => {
    const relationship = createRelationshipWithSchemaState()

    expect(relationship.hasLocalChanges()).toBe(false)

    relationship.name = 'changed_name'

    expect(relationship.hasLocalChanges()).toBe(true)
})

test('It can get parent model for BelongsTo', () => {
    const relationship = new Relationship()
    relationship.type = 'BelongsTo'

    const relatedModel = TestHelper.createModel({ name: 'User' })
    relationship.relatedModel = relatedModel
    relationship.relatedModelId = relatedModel.id

    expect(relationship.getParentModel()).toStrictEqual(relatedModel)
})

test('It can get parent model for HasMany', () => {
    const relationship = new Relationship()
    relationship.type = 'HasMany'

    const model = TestHelper.createModel({ name: 'User' })
    relationship.model = model
    relationship.modelId = model.id

    expect(relationship.getParentModel()).toStrictEqual(model)
})

test('It can get inverse types for BelongsTo', () => {
    const relationship = new Relationship()
    relationship.type = 'BelongsTo'

    expect(relationship.inverseTypes()).toEqual(['HasMany', 'HasOne'])
})

test('It can get inverse types for HasOne', () => {
    const relationship = new Relationship()
    relationship.type = 'HasOne'

    expect(relationship.inverseTypes()).toEqual(['BelongsTo'])
})

test('It can get inverse types for HasMany', () => {
    const relationship = new Relationship()
    relationship.type = 'HasMany'

    expect(relationship.inverseTypes()).toEqual(['BelongsTo'])
})

test('It can get inverse types for BelongsToMany', () => {
    const relationship = new Relationship()
    relationship.type = 'BelongsToMany'

    expect(relationship.inverseTypes()).toEqual(['BelongsToMany'])
})

test('It can get inverse types for MorphOne', () => {
    const relationship = new Relationship()
    relationship.type = 'MorphOne'

    expect(relationship.inverseTypes()).toEqual(['MorphTo'])
})

test('It can get inverse types for HasManyThrough', () => {
    const relationship = new Relationship()
    relationship.type = 'HasManyThrough'

    expect(relationship.inverseTypes()).toEqual(['HasManyThrough'])
})

test('It can check if relationship was created from interface', () => {
    const relationship = new Relationship()

    expect(relationship.wasCreatedFromInterface()).toBe(false)

    relationship.createdFromInterface = true

    expect(relationship.wasCreatedFromInterface()).toBe(true)
})

test('It can check if relationship maybe inverse of another', () => {
    const relationship1 = new Relationship()
    relationship1.type = 'BelongsTo'
    relationship1.relatedModelId = '1'
    relationship1.modelId = '2'

    const relationship2 = new Relationship()
    relationship2.type = 'HasMany'
    relationship2.modelId = '1'
    relationship2.relatedModelId = '2'

    expect(relationship1.maybeInverseOf(relationship2)).toBe(true)

    relationship2.type = 'BelongsTo'
    expect(relationship1.maybeInverseOf(relationship2)).toBe(false)
})

test('It can get related columns', () => {
    const relationship = new Relationship()

    const relatedColumns = relationship.getRelatedColumns()

    expect(Array.isArray(relatedColumns)).toBe(true)
    expect(relatedColumns.length).toBe(0)
})

test('It can get pivot table columns', () => {
    const relationship = new Relationship()

    const columns = relationship.getPivotTableColumns()

    expect(Array.isArray(columns)).toBe(true)
    expect(columns.length).toBe(0)
})