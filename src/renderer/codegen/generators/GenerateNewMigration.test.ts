import path from 'path'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach, jest, beforeAll } from '@jest/globals'
import GenerateNewMigration from './GenerateNewMigration'
import TestHelper from '@Renderer/../../tests/base/TestHelper'

import Main from "@Renderer/services/wrappers/Main"
jest.mock('@Renderer/services/wrappers/Main')

// jest.mock('@Renderer/services/wrappers/Main', () => {
//     return jest.fn().mockImplementation(() => {
//         return {
//             API: {
//                 readTemplateFile: () => {
//                     return 'template content'
//                 },
//             }
//         }
//     })
// })

// jest.mock('@Renderer/services/wrappers/Main', () => {
//     return {
//         API: {
//             readTemplateFile: () => {
//                 return 'template content'
//             },
//         }
//     }
// })

beforeEach(() => {
    MockDatabase.start()
    // Main.mockClear()
})

test('It can get the migration name', () => {
    const table = TestHelper.createTable({ name: 'posts' })

    TestHelper.createColumn({ name: 'title', table })
    TestHelper.createColumn({ name: 'body', table })

    GenerateNewMigration.setTable(table)

    expect(GenerateNewMigration.getName()).toBe('/database/migrations/2022_11_29_000001_update_posts_table.php')
})

test('It generates a migration for updating a ', async () => {
    const table = TestHelper.createTable({ name: 'posts' })

    TestHelper.createColumn({ name: 'title', table })
    TestHelper.createColumn({ name: 'body', table })

    GenerateNewMigration.setTable(table)

    console.log(Main.API)

    // const content = await GenerateNewMigration.generateUpdaterMigration()

    // console.log(content)

    // const formattedContent = GenerateNewMigration.format(),
    //     formattedFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/input/formatted-migration.php'), formattedContent)

    // const contentIsEqual = TestHelper.filesRelevantContentIsEqual(formattedFile, formattedContent, true)

    // expect(contentIsEqual).toBe(true)
})