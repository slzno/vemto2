import CalculateMorphRelationshipsData from "./CalculateMorphRelationshipsData"
import Relationship from "@Common/models/Relationship"
import MockDatabase from "@Tests/base/MockDatabase"
import TestHelper from "@Tests/base/TestHelper"
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
})

test('It can set a relationship', () => {
    const relationship = new Relationship()
    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    expect(calculator.relationship).toBe(relationship)
    expect(calculator).toBe(CalculateMorphRelationshipsData)
})

test('It validates required data correctly for morph relationships', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

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
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.calculateDefaultData()

    expect(relationship.name).toBeDefined()
    expect(relationship.morphToName).toBe('postable')
})

test('It calculates morph to name', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.calculateMorphTo()

    expect(relationship.morphToName).toBe('postable')
})

test('It calculates morph to name with exception', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Tag' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.calculateMorphTo()

    expect(relationship.morphToName).toBe('taggable')
})

test('It gets correct able suffix', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    expect(calculator.getCorrectAbleSuffix()).toBe('postable')
})

test('It gets correct able suffix with exception', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Tag' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    expect(calculator.getCorrectAbleSuffix()).toBe('taggable')
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
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.processAndSave()

    expect(relationship.isSaved()).toBe(true)
})

test('It processes relationship for common morph', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.process()

    expect(relationship.idColumn).toBeDefined()
    expect(relationship.typeColumn).toBeDefined()
})

test('It processes relationship for many to many morph', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'MorphToMany'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.process()

    expect(relationship.pivot).toBeDefined()
})

test('It adds pivot table for many to many morph', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'MorphToMany'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.calculateDefaultData()
    calculator.addPivotTable()

    expect(relationship.pivot).toBeDefined()
    expect(relationship.pivot.name).toBe('postables')
})

test('It creates pivot data', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'MorphToMany'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.addPivotTable()
    calculator.createPivotData()

    const pivot = relationship.pivot
    expect(pivot.columns.length).toBeGreaterThan(0)
})

test('It gets default model key name', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        type: 'MorphToMany'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    expect(calculator.getDefaultModelKeyName()).toBe('post_id')
})

test('It adds morphable fields to itself', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.addMorphableFieldsToItself()

    expect(relationship.idColumn).toBeDefined()
    expect(relationship.typeColumn).toBeDefined()
})

test('It adds morphable fields to table if necessary', () => {
    const model = TestHelper.createModel({ name: 'User' })
    const relatedModel = TestHelper.createModel({ name: 'Post' })

    // Add primary keys
    TestHelper.createColumn({ name: 'id', table: model.table, autoIncrement: true })
    TestHelper.createColumn({ name: 'id', table: relatedModel.table, autoIncrement: true })

    const relationship = new Relationship({
        modelId: model.id,
        relatedModelId: relatedModel.id,
        projectId: model.projectId,
        type: 'MorphOne'
    })

    const calculator = CalculateMorphRelationshipsData.setRelationship(relationship)

    calculator.calculateDefaultData()
    calculator.addMorphableFieldsToTableIfNecessary(relatedModel.table)

    const idColumn = relatedModel.table.getColumnByName('postable_id')
    const typeColumn = relatedModel.table.getColumnByName('postable_type')

    expect(idColumn).toBeDefined()
    expect(typeColumn).toBeDefined()
    expect(relationship.idColumnId).toBe(idColumn.id)
    expect(relationship.typeColumnId).toBe(typeColumn.id)
})