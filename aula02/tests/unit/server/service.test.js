import { jest, expect, describe, test, beforeEach } from '@jest/globals'
import fs from 'fs'
import fsPromises from 'fs/promises'
import path from 'path'
import config from '../../../server/config.js'
import { Controller } from '../../../server/controller.js'
import { Service } from '../../../server/service.js'
import TestUtil from '../_util/testUtil.js'

const {
  dir: { publicDirectory },
} = config

describe('#Service - test controller to get file stream', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('createReadStream() Should create a fileStream and return it', async () => {
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    const file = '/index.html'

    const createReadStream = jest
      .spyOn(fs, fs.createReadStream.name)
      .mockReturnValue(mockFileStream)

    const service = new Service()
    const serviceReturn = service.createFileStream(file)

    expect(createReadStream).toBeCalledWith(file)
    expect(serviceReturn).toStrictEqual(mockFileStream)
  })

  test('getFileInfo - Should return file info', async () => {
    const file = '/index.html'
    const expectedType = '.html'
    const expectedFilePath = publicDirectory + file

    jest.spyOn(path, path.join.name).mockReturnValue(file)
    jest.spyOn(fsPromises, fsPromises.access.name).mockResolvedValue()
    jest.spyOn(path, path.extname.name).mockReturnValue(expectedType)

    const service = new Service()
    const serviceReturn = await service.getFileInfo(file)

    expect(fsPromises.access).toHaveBeenCalledWith(expectedFilePath)
    expect(serviceReturn).toStrictEqual({
      name: expectedFilePath,
      type: expectedType,
    })
  })

  test('getFileStream - Should return fileStream', async () => {
    const mockFileStream = TestUtil.generateReadableStream(['data'])
    const file = '/index.html'
    const expectedType = '.html'

    jest
      .spyOn(Service.prototype, Service.prototype.getFileInfo.name)
      .mockResolvedValue({
        name: mockFileStream,
        type: expectedType,
      })

    jest
      .spyOn(Service.prototype, Service.prototype.createFileStream.name)
      .mockReturnValue(mockFileStream)

    const service = new Service()
    const serviceReturn = await service.getFileStream(file)

    expect(Service.prototype.getFileInfo).toHaveBeenCalledWith(file)
    expect(serviceReturn).toStrictEqual({
      stream: mockFileStream,
      type: expectedType,
    })
  })
})
