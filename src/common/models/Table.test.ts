import Table from './Table'
import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeAll } from '@jest/globals'

beforeAll(() => {
    MockDatabase.start()
})

test('The column model identifier is correct', () => {
    expect(Table.identifier()).toBe('Table')
})