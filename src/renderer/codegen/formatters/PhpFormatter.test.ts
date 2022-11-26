import path from 'path'
import PhpFormatter from './PhpFormatter'
import { test, expect } from '@jest/globals'
import TestHelper from '@Renderer/../../tests/base/TestHelper'

test('It can format a PHP file', () => {
    const unformattedMigration = TestHelper.readInputFile(__dirname, 'unformatted-migration.php')

    console.log(expect.getState().currentTestName)

    PhpFormatter.setContent(unformattedMigration)

    const formattedContent = PhpFormatter.format(),
        formattedMigration = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/input/formatted-migration.php'), formattedContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(formattedContent, formattedMigration, true)

    expect(contentIsEqual).toBe(true)
})