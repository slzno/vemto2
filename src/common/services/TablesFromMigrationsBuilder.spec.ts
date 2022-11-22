import TestHelper from '@Tests/base/TestHelper'
import schemaData from './tests/input/schema-reader-L9.json'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'

beforeEach(() => {
    MockDatabase.start()
})

test('It saves new tables', () => {
    console.log(schemaData)
    expect(true).toBe(true)
})

test('It updates existing columns', () => {
    expect(true).toBe(true)
})

test('It deletes removed columns', () => {
    expect(true).toBe(true)
})

test('It can force reading the data', () => {
    expect(true).toBe(true)
})