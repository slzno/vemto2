import TestHelper from '@Tests/base/TestHelper'
import MockDatabase from '@Tests/base/MockDatabase'
import { test, expect, beforeEach } from '@jest/globals'
import TableColumnChanged from './TableColumnChanged'

beforeEach(() => {
    MockDatabase.start()
})

test('it can mark a table as changed', () => {
    const project = TestHelper.getProject(),
        column = TestHelper.createColumn()

    new TableColumnChanged(column).handle()

    expect(project.fresh().hasChangedTables()).toBe(true)
})