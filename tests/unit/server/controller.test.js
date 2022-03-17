import { jest, expect, describe, test, beforeEach } from '@jest/globals'
import config from '../../../server/config.js'
import { Controller } from '../../../server/controller.js'
import { Service } from '../../../server/service.js'
import TestUtil from '../_util/testUtil.js'

const { pages } = config

describe('#Controller - test controller to get file stream', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('getFileStream() Should return fileStream', async () => {
    const controller = new Controller()
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    const expectedType = '.html'

    const getFileStream = jest
      .spyOn(Service.prototype, Service.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      })

    await controller.getFileStream(pages.homeHTML)

    expect(getFileStream).toBeCalledWith(pages.homeHTML)
  })
})
