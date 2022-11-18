import Column from './Column'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeAll } from '@jest/globals'

beforeAll(() => {
    MockDatabase.start()
})

test('The column model identifier is correct', () => {
    expect(Column.identifier()).toBe('Column')
})