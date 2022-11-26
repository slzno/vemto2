import TestHelper from './base/TestHelper'

beforeEach(() => {
    TestHelper.setCurrentTestName(expect.getState().currentTestName)
})