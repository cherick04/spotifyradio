import fs from 'fs'
import fsPromises from 'fs/promises'

import { join, extname } from 'path'
import config from './config.js'

const {
  dir: { publicDirectory },
} = config

export class Service {
  createFileStream(filename) {
    return fs.createReadStream(filename)
  }

  async getFileInfo(file) {
    // file = home/index.html
    const fullFilePath = join(publicDirectory, file)
    // validates if it exists, if not, throws an error
    await fsPromises.access(fullFilePath)
    const fileType = extname(fullFilePath)
    return {
      type: fileType,
      name: fullFilePath,
    }
  }

  async getFileStream(file) {
    const { name, type } = await this.getFileInfo(file)
    return {
      stream: this.createFileStream(name),
      type,
    }
  }
}
