import { jest, expect, describe, test, beforeEach } from '@jest/globals'
import config from '../../../server/config.js'
import { Controller } from '../../../server/controller.js'
import { handler } from '../../../server/routes.js'
import TestUtil from '../_util/testUtil.js'

const {
  pages,
  location,
  constants: { CONTENT_TYPE },
} = config

describe('#Routes - test site for API response', () => {
  beforeEach(() => {
    jest.restoreAllMocks()
    jest.clearAllMocks()
  })

  test('GET / - should redirect to home page', async () => {
    const params = TestUtil.defaultHandleParameters()
    params.request.method = 'GET'
    params.request.url = '/'

    await handler(...params.values())

    expect(params.response.writeHead).toBeCalledWith(302, {
      Location: location.home,
    })
    expect(params.response.end).toHaveBeenCalled()
  })

  test(`GET /home - should respond with ${pages.homeHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParameters()
    params.request.method = 'GET'
    params.request.url = '/home'
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      })

    jest
      .spyOn(
        mockFileStream,
        'pipe' //pipe function doesn't have a name property
      )
      .mockReturnValue()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toBeCalledWith(pages.homeHTML)
    expect(mockFileStream.pipe).toHaveBeenLastCalledWith(params.response)
  })

  test(`GET /controller - should respond with ${pages.controllerHTML} file stream`, async () => {
    const params = TestUtil.defaultHandleParameters()
    params.request.method = 'GET'
    params.request.url = '/controller'
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
      })

    jest
      .spyOn(
        mockFileStream,
        'pipe' //pipe function doesn't have a name property
      )
      .mockReturnValue()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toBeCalledWith(
      pages.controllerHTML
    )
    expect(mockFileStream.pipe).toHaveBeenLastCalledWith(params.response)
  })

  test(`GET /index.html - should respond with file stream`, async () => {
    const params = TestUtil.defaultHandleParameters()
    const fileName = '/index.html'
    params.request.method = 'GET'
    params.request.url = fileName
    const expectedType = '.html'
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      })

    jest
      .spyOn(
        mockFileStream,
        'pipe' //pipe function doesn't have a name property
      )
      .mockReturnValue()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toBeCalledWith(fileName)
    expect(mockFileStream.pipe).toHaveBeenLastCalledWith(params.response)
    expect(params.response.writeHead).toHaveBeenCalledWith(200, {
      'Content-Type': CONTENT_TYPE[expectedType],
    })
  })

  test(`GET /file.ext - should respond with file stream`, async () => {
    const params = TestUtil.defaultHandleParameters()
    const fileName = '/file.ext'
    params.request.method = 'GET'
    params.request.url = fileName
    const expectedType = '.ext'
    const mockFileStream = TestUtil.generateReadableStream(['data'])

    jest
      .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
      .mockResolvedValue({
        stream: mockFileStream,
        type: expectedType,
      })

    jest
      .spyOn(
        mockFileStream,
        'pipe' //pipe function doesn't have a name property
      )
      .mockReturnValue()

    await handler(...params.values())

    expect(Controller.prototype.getFileStream).toBeCalledWith(fileName)
    expect(mockFileStream.pipe).toHaveBeenLastCalledWith(params.response)
    expect(params.response.writeHead).not.toHaveBeenCalledWith()
  })

  test(`POST /unknown - given an inexistent route, it should respond with 404`, async () => {
    const params = TestUtil.defaultHandleParameters()
    params.request.method = 'POST'
    params.request.url = '/unknown'

    await handler(...params.values())

    expect(params.response.writeHead).toHaveBeenCalledWith(404)
    expect(params.response.end).toHaveBeenCalled()
  })

  describe('Exceptions', () => {
    test('given an inexistent file, it should respond with 404', async () => {
      const params = TestUtil.defaultHandleParameters()
      params.request.method = 'GET'
      params.request.url = '/index.png'

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(
          new Error('Error: ENOENT: no such file or directory')
        )

      await handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(404)
      expect(params.response.end).toHaveBeenCalled()
    })
    test('given an error, it should respond with 500', async () => {
      const params = TestUtil.defaultHandleParameters()
      params.request.method = 'GET'
      params.request.url = '/index.png'

      jest
        .spyOn(Controller.prototype, Controller.prototype.getFileStream.name)
        .mockRejectedValue(new Error('Error'))

      await handler(...params.values())

      expect(params.response.writeHead).toHaveBeenCalledWith(500)
      expect(params.response.end).toHaveBeenCalled()
    })
  })
})
