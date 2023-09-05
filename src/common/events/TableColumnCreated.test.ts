import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'
import TableColumnCreated from './TableColumnCreated'

beforeEach(() => {
    MockDatabase.start()
})

test('it can mark a table as changed', () => {
    const project = TestHelper.getProject(),
        column = TestHelper.createColumn()

    new TableColumnCreated(column).handle()

    expect(project.fresh().hasSchemaChanges()).toBe(true)
})