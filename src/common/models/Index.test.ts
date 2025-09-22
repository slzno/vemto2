import Index, { IndexType } from './Index'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
})

test('The Index model identifier is correct', () => {
    expect(Index.identifier()).toBe('Index')
})

test('It can save a new index', () => {
    const index = TestHelper.createIndex()
    
    index.name = 'test_index'
    index.save()

    expect(index.id).toBe(1)
})

test('An index has changes when schema state is empty', () => {
    const index = TestHelper.createIndex()
    
    index.name = 'test_index'
    index.save()

    expect(index.hasSchemaChanges({})).toBe(true)
})

test('It can check if an index has changes', () => {
    const index = TestHelper.createIndexWithSchemaState()

    const hasSchemaChanges = index.hasSchemaChanges({
        name: 'test_index',
        columns: ['test_column'],
        type: 'index',
    })

    expect(hasSchemaChanges).toBe(true)
})

test('It can check if an index does not have changes', () => {
    const index = TestHelper.createIndexWithSchemaState()

    const hasSchemaChanges = index.hasSchemaChanges({
        name: 'index_name',
        type: 'index',
        algorithm: 'BTREE',
        columns: ['name'],
    })

    expect(hasSchemaChanges).toBe(false)
})

test('It can apply index changes', () => {
    const index = TestHelper.createIndex()

    const indexData = index.export()
    indexData.type = IndexType.UNIQUE

    Index.savingInternally()

    index.applyChanges(indexData)

    Index.notSavingInternally()

    expect(index.type).toBe('unique')
    expect(index.schemaState.type).toBe('unique')
})

test('It can not apply index changes when not saving internally', () => {
    const index = TestHelper.createIndex()

    expect(() => {
        index.applyChanges({ type: 'unique' })
    }).toThrow()
})

test('It can save schema state separately', () => {
    const index = TestHelper.createIndex()

    const indexData = index.export()
    indexData.type = IndexType.UNIQUE

    Index.savingInternally()

    index.applyChanges(indexData)

    Index.notSavingInternally()

    expect(index.type).toBe(IndexType.UNIQUE)
    expect(index.schemaState.type).toBe(IndexType.UNIQUE)

    index.type = IndexType.INDEX
    index.save()

    expect(index.fresh().type).toBe(IndexType.INDEX)
    expect(index.fresh().schemaState.type).toBe(IndexType.UNIQUE)

    Index.savingInternally()

    index.saveSchemaState()

    Index.notSavingInternally()

    expect(index.fresh().type).toBe(IndexType.INDEX)
    expect(index.fresh().schemaState.type).toBe(IndexType.INDEX)
})

test('An index was not considered renamed when schema state is empty', () => {
    const index = TestHelper.createIndex()

    index.name = 'renamed'
    index.save()

    const wasRenamed = index.wasRenamed()

    expect(wasRenamed).toBe(false)
})

test('It can check if an index was renamed from interface', () => {
    const index = TestHelper.createIndex()

    Index.savingInternally()

    const indexData = index.export()
    indexData.name = 'renamed'

    index.applyChanges(indexData)

    Index.notSavingInternally()

    expect(index.wasRenamed()).toBe(false)

    index.name = 'reverted'
    index.save()

    expect(index.wasRenamed()).toBe(true)
})

test('An index can not be considered as renamed without schema state', () => {
    const index = TestHelper.createIndex()

    expect(index.wasRenamed()).toBe(false)

    index.name = 'reverted'
    index.save()

    expect(index.wasRenamed()).toBe(false)
})

test('It can get the old index name after rename', () => {
    const index = TestHelper.createIndexWithSchemaState()

    index.name = 'renamed'
    index.save()

    expect(index.getOldName()).toBe('index_name')
})

test('An index was not considered changed when schema state is empty', () => {
    const index = TestHelper.createIndex()

    index.type = IndexType.UNIQUE
    index.save()

    const hasLocalChanges = index.hasLocalChanges()

    expect(hasLocalChanges).toBe(false)
})

test('It can check if an index was changed after changing the type attr', () => {
    const index = TestHelper.createIndexWithSchemaState()

    expect(index.hasLocalChanges()).toBe(false)

    index.type = IndexType.UNIQUE
    index.save()

    expect(index.hasLocalChanges()).toBe(true)
})

test('It can check if an index was changed after changing the columns attr', () => {
    const index = TestHelper.createIndexWithSchemaState()

    expect(index.hasLocalChanges()).toBe(false)

    index.columns = ['title']
    index.save()

    expect(index.hasLocalChanges()).toBe(true)
})

test('It can check if an index was changed after changing the algorithm attr', () => {
    const index = TestHelper.createIndexWithSchemaState()

    expect(index.hasLocalChanges()).toBe(false)

    index.algorithm = 'OTHER'
    index.save()

    expect(index.hasLocalChanges()).toBe(true)
})

test('It can check if an index was changed after changing the references attr', () => {
    const index = TestHelper.createIndexWithSchemaState()

    expect(index.hasLocalChanges()).toBe(false)

    index.references = 'id'
    index.save()

    expect(index.hasLocalChanges()).toBe(true)
})

test('It can check if an index was changed after changing the on attr', () => {
    const index = TestHelper.createIndexWithSchemaState()

    expect(index.hasLocalChanges()).toBe(false)

    index.on = 'users'
    index.save()

    expect(index.hasLocalChanges()).toBe(true)
})

test('It can check if an index was changed after changing the language attr', () => {
    const index = TestHelper.createIndexWithSchemaState()

    expect(index.hasLocalChanges()).toBe(false)

    index.language = 'users'
    index.save()

    expect(index.hasLocalChanges()).toBe(true)
})

test('It can check if an index type is a common index', () => {
    const index = TestHelper.createIndexWithSchemaState()

    expect(index.isCommon()).toBe(true)
})

test('It can check if an index is a primary', () => {
    const index = TestHelper.createIndexWithSchemaState()

    index.type = IndexType.PRIMARY
    index.save()

    expect(index.isPrimary()).toBe(true)
})

test('It can check if an index is an FK', () => {
    const index = TestHelper.createIndexWithSchemaState()

    index.type = IndexType.FOREIGN
    index.save()

    expect(index.isForeign()).toBe(true)
})

test('It can check if an index is unique', () => {
    const index = TestHelper.createIndexWithSchemaState()

    index.type = IndexType.UNIQUE
    index.save()

    expect(index.isUnique()).toBe(true)
})

test('It can check if an index is fulltext', () => {
    const index = TestHelper.createIndexWithSchemaState()

    index.type = IndexType.FULLTEXT
    index.save()

    expect(index.isFullText()).toBe(true)
})

test('It can check if an index is spatial', () => {
    const index = TestHelper.createIndexWithSchemaState()

    index.type = IndexType.SPATIAL
    index.save()

    expect(index.isSpatial()).toBe(true)
})

test('It can mark an index as removed', () => {
    const index = TestHelper.createIndexWithSchemaState()

    expect(index.isRemoved()).toBe(false)

    index.remove()

    expect(index.isRemoved()).toBe(true)
})

test('It deletes a new index when removing it', () => {
    const index = TestHelper.createIndex()

    expect(index.isRemoved()).toBe(false)

    index.remove()

    expect(index.id).toBe(undefined)
})