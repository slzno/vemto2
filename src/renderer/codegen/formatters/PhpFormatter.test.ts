import path from 'path'
import PhpFormatter from './PhpFormatter'
import { test, expect } from '@jest/globals'
import TestHelper from '@Renderer/../../tests/base/TestHelper'

test('It can format a PHP file', () => {
    const unformattedFile = TestHelper.readInputFile(__dirname, 'unformatted-migration.php')

    PhpFormatter.setContent(unformattedFile)

    const formattedContent = PhpFormatter.format(),
        formattedFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/input/formatted-migration.php'), formattedContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(formattedFile, formattedContent, true)

    expect(contentIsEqual).toBe(true)
})