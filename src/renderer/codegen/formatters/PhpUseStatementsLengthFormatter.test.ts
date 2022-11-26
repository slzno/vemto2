import path from 'path'
import PhpUseStatementsLengthFormatter from './PhpUseStatementsLengthFormatter'
import { test, expect } from '@jest/globals'
import TestHelper from '@Renderer/../../tests/base/TestHelper'

test('It can order use statements by length on a PHP file', () => {
    const unformattedFile = TestHelper.readInputFile(__dirname, 'alpha-sorted-use-statements.php')

    PhpUseStatementsLengthFormatter.setContent(unformattedFile)

    const formattedContent = PhpUseStatementsLengthFormatter.format(),
        formattedFile = TestHelper.readOrCreateFile(path.join(__dirname, 'tests/input/length-sorted-use-statements.php'), formattedContent)

    const contentIsEqual = TestHelper.filesRelevantContentIsEqual(formattedFile, formattedContent, true)

    expect(contentIsEqual).toBe(true)
})