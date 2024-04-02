import Project from './Project'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
})

test('The Project model identifier is correct', () => {
    expect(Project.identifier()).toBe('Project')
})

test('It can find or create a project', () => {
    const project = Project.findOrCreate()

    expect(project.id).toBe(1)
})

test('It can check if a project is empty (not saved yet)', () => {
    const project = new Project

    expect(project.isEmpty()).toBe(true)
})

test('It can set the project path', () => {
    const project = TestHelper.getProject()

    project.setPath('test_path')

    expect(project.getPath()).toBe('test_path')
})

test('It can check if a project has a table', () => {
    const project = TestHelper.getProject()

    expect(project.hasTable('users')).toBe(false)

    TestHelper.createTable({ name: 'users' })

    expect(project.hasTable('users')).toBe(true)
})

test('It can check if a project does not have a table', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' })

    expect(project.doesNotHaveTable('users')).toBe(false)

    table.delete()

    expect(project.doesNotHaveTable('users')).toBe(true)
})

test('It can find a project table by name', () => {
    const project = TestHelper.getProject()

    TestHelper.createTable({ name: 'users' })

    expect(project.findTableByName('users').name).toBe('users')
})

test('It can find a project table by id', () => {
    const project = TestHelper.getProject()

    TestHelper.createTable({ name: 'users' })

    expect(project.findTableById(1).name).toBe('users')
})

test('It can find all project tables names', () => {
    const project = TestHelper.getProject()

    TestHelper.createTable({ name: 'users' })
    TestHelper.createTable({ name: 'posts' })

    expect(project.getTablesNames()).toEqual(['users', 'posts'])
})

test('It can get all project tables keyed by name', () => {
    const project = TestHelper.getProject()

    TestHelper.createTable({ name: 'users' })
    TestHelper.createTable({ name: 'posts' })

    expect(project.getAllTablesKeyedByName()).toEqual({
        users: project.findTableByName('users'),
        posts: project.findTableByName('posts'),
    })
})

test('It can check if the project has changed tables', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' }),    
        column = TestHelper.createColumnWithSchemaState({ table })

    expect(project.fresh().hasSchemaChanges()).toBe(false)
    
    column.name = 'special_primary_key'
    column.saveFromInterface()
    
    expect(project.fresh().hasSchemaChanges()).toBe(true)
})

test('It can the project changed tables', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' }),    
        column = TestHelper.createColumnWithSchemaState({ table })

    column.name = 'special_primary_key'
    column.saveFromInterface()
    
    expect(project.fresh().getChangedTables()).toEqual([table])
})

test('It can mark a project table as changed', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' })
    
    expect(project.fresh().hasSchemaChanges()).toBe(false)

    project.markTableAsChanged(table)

    expect(project.fresh().hasSchemaChanges()).toBe(true)
})

test('It can clear project changed tables', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' })
    
    project.markTableAsChanged(table)
    
    expect(project.fresh().hasSchemaChanges()).toBe(true)

    project.clearChangedTables()

    expect(project.fresh().hasSchemaChanges()).toBe(false)
})

test('It can remove a table from changed tables', () => {
    const project = TestHelper.getProject(),
        table = TestHelper.createTable({ name: 'users' })
    
    project.markTableAsChanged(table)
    
    expect(project.fresh().hasSchemaChanges()).toBe(true)

    project.removeTableFromChangedTables(table)

    expect(project.fresh().hasSchemaChanges()).toBe(false)
})