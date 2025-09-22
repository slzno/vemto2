import Project from './Project'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
    TestHelper.setCurrentTestsPath(__dirname)
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
        table = TestHelper.createTableWithSchemaState({ name: 'users' }),    
        column = TestHelper.createColumnWithSchemaState({ table })

    expect(project.fresh().hasSchemaChanges()).toBe(false)
    
    column.name = 'special_primary_key'
    column.saveFromInterface()
    
    expect(project.fresh().hasSchemaChanges()).toBe(true)
})

test('It can get default code generation settings', () => {
    const project = TestHelper.getProject()

    const defaultSettings = project.getDefaultCodeGenerationSettings()

    expect(defaultSettings).toHaveProperty('models', true)
    expect(defaultSettings).toHaveProperty('factories', true)
    expect(defaultSettings).toHaveProperty('seeders', true)
    expect(defaultSettings).toHaveProperty('policies', true)
    expect(defaultSettings).toHaveProperty('requests', true)
    expect(defaultSettings).toHaveProperty('controllers', true)
    expect(defaultSettings).toHaveProperty('routes', true)
    expect(defaultSettings).toHaveProperty('views')
    expect(defaultSettings).toHaveProperty('uiComponents')
    expect(defaultSettings).toHaveProperty('livewireLayout')
    expect(defaultSettings).toHaveProperty('translationsOnViews', true)
    expect(defaultSettings).toHaveProperty('translationsFormat')
})

test('It can fix code generation settings', () => {
    const project = TestHelper.getProject()

    // Set incomplete settings
    project.codeGenerationSettings = { models: true }

    project.fixCodeGenerationSettings()

    expect(project.codeGenerationSettings.models).toBe(true)
    expect(project.codeGenerationSettings.factories).toBe(true)
    expect(project.codeGenerationSettings.seeders).toBe(true)
})

test('It can start code generation settings', () => {
    const project = TestHelper.getProject()

    project.startCodeGenerationSettings()

    expect(project.codeGenerationSettings).toBeDefined()
    expect(project.codeGenerationSettings.models).toBe(true)
})

test('It can find a model by name', () => {
    const project = TestHelper.getProject()

    TestHelper.createModel({ name: 'User' })

    expect(project.findModelByName('User').name).toBe('User')
    expect(project.findModelByName('NonExistent')).toBeUndefined()
})

test('It can find a model by id', () => {
    const project = TestHelper.getProject(),
        model = TestHelper.createModel({ name: 'User' })

    expect(project.findModelById(model.id).name).toBe('User')
    expect(project.findModelById(999)).toBeUndefined()
})

test('It can find a model by class', () => {
    const project = TestHelper.getProject(),
        model = TestHelper.createModel({ name: 'User' })

    model.class = 'App\\Models\\User'
    model.save()

    expect(project.findModelByClass('App\\Models\\User').name).toBe('User')
    expect(project.findModelByClass('NonExistent')).toBeUndefined()
})

test('It can get all model names', () => {
    const project = TestHelper.getProject()

    TestHelper.createModel({ name: 'User' })
    TestHelper.createModel({ name: 'Post' })

    expect(project.getModelsNames()).toEqual(['User', 'Post'])
})

test('It can get all model plurals', () => {
    const project = TestHelper.getProject()

    TestHelper.createModel({ name: 'User', plural: 'Users' })
    TestHelper.createModel({ name: 'Post', plural: 'Posts' })

    expect(project.getModelsPlurals()).toEqual(['Users', 'Posts'])
})

test('It can get all models keyed by name', () => {
    const project = TestHelper.getProject()

    const userModel = TestHelper.createModel({ name: 'User' })
    const postModel = TestHelper.createModel({ name: 'Post' })

    const models = project.getAllModelsKeyedByName()

    expect(models.User.name).toBe('User')
    expect(models.Post.name).toBe('Post')
})

test('It can schedule schema sync', () => {
    const project = TestHelper.getProject()

    project.scheduleSchemaSync(true, false)

    expect(project.scheduledSchemaSync.tables).toBe(true)
    expect(project.scheduledSchemaSync.models).toBe(false)
})

test('It can check if schema sync is scheduled', () => {
    const project = TestHelper.getProject()

    expect(project.hasScheduledSchemaSync()).toBe(false)

    project.scheduleSchemaSync(true, false)

    expect(project.hasScheduledSchemaSync()).toBe(true)
})

test('It can reset scheduled schema sync', () => {
    const project = TestHelper.getProject()

    project.scheduleSchemaSync(true, true)
    expect(project.hasScheduledSchemaSync()).toBe(true)

    project.resetScheduledSchemaSync()

    expect(project.scheduledSchemaSync).toBeNull()
    expect(project.hasScheduledSchemaSync()).toBe(false)
})

test('It can check if project uses Jetstream', () => {
    const project = TestHelper.getProject()

    project.settings.uiStarterKit = 'jetstream'
    expect(project.isJetstream()).toBe(true)

    project.settings.uiStarterKit = 'breeze'
    expect(project.isJetstream()).toBe(false)
})

test('It can check if project uses Breeze', () => {
    const project = TestHelper.getProject()

    project.settings.uiStarterKit = 'breeze'
    expect(project.isBreeze()).toBe(true)

    project.settings.uiStarterKit = 'jetstream'
    expect(project.isBreeze()).toBe(false)
})

test('It can check if project uses empty starter kit', () => {
    const project = TestHelper.getProject()

    project.settings.uiStarterKit = 'empty'
    expect(project.isEmptyStarterKit()).toBe(true)

    project.settings.uiStarterKit = 'jetstream'
    expect(project.isEmptyStarterKit()).toBe(false)
})

test('It can check if project uses API starter kit', () => {
    const project = TestHelper.getProject()

    project.settings.uiStarterKit = 'api'
    expect(project.isApiStarterKit()).toBe(true)

    project.settings.uiStarterKit = 'jetstream'
    expect(project.isApiStarterKit()).toBe(false)
})

test('It can check if starter kit needs views and UI components', () => {
    const project = TestHelper.getProject()

    project.settings.uiStarterKit = 'jetstream'
    expect(project.starterKitNeedsViewsAndUiComponents()).toBe(true)

    project.settings.uiStarterKit = 'api'
    expect(project.starterKitNeedsViewsAndUiComponents()).toBe(false)

    project.settings.uiStarterKit = 'empty'
    expect(project.starterKitNeedsViewsAndUiComponents()).toBe(false)
})

test('It can compare Laravel versions', () => {
    const project = TestHelper.getProject()
    project.settings.laravelVersion = '10.0'

    expect(project.laravelVersionEqualTo('10.0')).toBe(true)
    expect(project.laravelVersionEqualTo('11.0')).toBe(false)

    expect(project.laravelVersionGreaterThan('9.0')).toBe(true)
    expect(project.laravelVersionGreaterThan('11.0')).toBe(false)

    expect(project.laravelVersionGreaterThanOrEqualTo('10.0')).toBe(true)
    expect(project.laravelVersionGreaterThanOrEqualTo('9.0')).toBe(true)
    expect(project.laravelVersionGreaterThanOrEqualTo('11.0')).toBe(false)

    expect(project.laravelVersionLessThan('11.0')).toBe(true)
    expect(project.laravelVersionLessThan('9.0')).toBe(false)

    expect(project.laravelVersionLessThanOrEqualTo('10.0')).toBe(true)
    expect(project.laravelVersionLessThanOrEqualTo('11.0')).toBe(true)
    expect(project.laravelVersionLessThanOrEqualTo('9.0')).toBe(false)
})

test('It can handle zoom functionality', () => {
    const project = TestHelper.getProject()

    project.initZoom()
    expect(project.currentZoom).toBe(100)

    project.zoomIn()
    expect(project.currentZoom).toBe(110)

    project.zoomOut()
    expect(project.currentZoom).toBe(100)

    expect(project.getZoomAsScale()).toBe(1.0)
})

test('It can save and check scroll position', () => {
    const project = TestHelper.getProject()

    expect(project.hasScroll()).toBe(false)

    project.saveScroll(100, 200)
    expect(project.scrollX).toBe(100)
    expect(project.scrollY).toBe(200)
    expect(project.hasScroll()).toBe(true)

    project.centerScroll(800, 600)
    expect(project.scrollX).toBe(24600) // (50000 / 2) - (800 / 2)
    expect(project.scrollY).toBe(24700) // (50000 / 2) - (600 / 2)
})

test('It can handle vtheme CDN', () => {
    const project = TestHelper.getProject()

    expect(project.getVthemeCdn()).toBeNull()

    project.setVthemeCdn('https://cdn.example.com')
    expect(project.getVthemeCdn()).toBe('https://cdn.example.com')
})

test('It can handle vtheme keys', () => {
    const project = TestHelper.getProject()

    expect(project.getVthemeKeys()).toEqual({})

    project.setVthemeKey('primary', '#007bff')
    expect(project.hasVthemeKey('primary')).toBe(true)
    expect(project.getVthemeKey('primary')).toBe('#007bff')
    expect(project.getVthemeKey('secondary')).toBeNull()

    project.saveVthemeKeys({ primary: '#ff0000', secondary: '#00ff00' })
    expect(project.getVthemeKey('primary')).toBe('#ff0000')
    expect(project.getVthemeKey('secondary')).toBe('#00ff00')
})

test('It can handle translations', () => {
    const project = TestHelper.getProject()
    project.defaultLanguage = 'en'
    project.languages = ['en', 'pt']

    project.setTranslation('en', 'hello', 'Hello')
    project.setTranslation('pt', 'hello', 'Olá')

    expect(project.getTranslation('en', 'hello')).toBe('Hello')
    expect(project.getTranslation('pt', 'hello')).toBe('Olá')
    expect(project.getDefaultTranslation('hello')).toBe('Hello')
    expect(project.getTranslation('en', 'nonexistent')).toBeNull()

    project.setTranslationOnAllLanguages('bye', 'Goodbye')
    expect(project.getTranslation('en', 'bye')).toBe('Goodbye')
    expect(project.getTranslation('pt', 'bye')).toBe('Goodbye')

    project.deleteTranslation('en', 'hello')
    expect(project.getTranslation('en', 'hello')).toBeNull()

    project.deleteTranslationOnAllLanguages('bye')
    expect(project.getTranslation('en', 'bye')).toBeNull()
    expect(project.getTranslation('pt', 'bye')).toBeNull()
})