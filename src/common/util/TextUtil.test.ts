import TextUtil from './TextUtil'
import { test, expect } from '@jest/globals'

test('It can get the text between two strings', () => {
    const content = 'This is a test string',
        start = 'is a',
        end = 'string'

    expect(TextUtil.textBetween(content, start, end)).toBe('is a test ')
})

test('It can trim a character from a string', () => {
    const content = 'aabbbaa',
        character = 'a'

    expect(TextUtil.trimChar(content, character)).toBe('bbb')
})

test('It can get surrounding lines from a content', () => {
    const content = `Line 1
Line 2
Line 3
Line 4
Line 5
Line 6`,
        fromLine = 3,
        extraLines = 2

    const result = TextUtil.getSurroundingLinesFromContent(content, fromLine, extraLines)

    expect(result).toEqual([
        { number: 2, content: 'Line 2' },
        { number: 3, content: 'Line 3' },
        { number: 4, content: 'Line 4' },
    ])
})