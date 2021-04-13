import fs from 'fs'
import path from 'path'
import database from '../../database'
import async from 'async'
import crypt from './crypt'
import readdirp from 'readdirp'
import Logger from '../../libs/logger'
import Auth from './utils/Auth'
import ConfigStore from '../../main/config-store'
import NameTest from './utils/nameTest'

const IgnoredFiles = ['^\\.[]*', '^~.*', '[\\\\/]|[. ]$']

function getListFromFolder(folderPath) {
  return new Promise(resolve => {
    const results = []
    readdirp(folderPath, {
      type: 'files'
    })
      .on('data', data => {
        const invalid = IgnoredFiles.find(regex =>
          new RegExp(regex).test(data.basename)
        )

        if (typeof invalid === 'undefined') {
          results.push(data.fullPath)
        }
      })
      .on('warn', warn => Logger.error('READDIRP non-fatal error', warn))
      .on('error', err => Logger.error('READDIRP fatal error', err.message))
      .on('end', () => {
        resolve(results)
      })
  })
}

function getStat(filepath) {
  try {
    return fs.lstatSync(filepath)
  } catch (err) {
    return null
  }
}

function generatePath(pathDict, item) {
  if (!pathDict[item.parent]) return
  if (pathDict[item.parent].full) {
    return pathDict[item.parent].path
  } else {
    var parentPath = generatePath(pathDict, pathDict[item.parent])
    if (parentPath === undefined) {
      return
    }
    pathDict[item.parent].path = path.join(
      parentPath,
      pathDict[item.parent].path
    )
    pathDict[item.parent].full = true
    return pathDict[item.parent].path
  }
}

async function regenerateDbFolderCloud(tree) {
  const finalDict = {}
  const dbEntrys = []
  const ignoreHideFolder = new RegExp('^\\.[]*')
  const basePath = await database.Get('xPath')
  await database.ClearFoldersCloud
  const nameTestFolder = path.join(basePath, '.internxt_name_test')
  for (const item of tree.folders) {
    if (!item.parent_id) {
      finalDict[item.id] = {
        path: basePath,
        parent: item.parent_id,
        full: true
      }
      continue
    }
    finalDict[item.id] = {
      path: crypt.decryptName(item.name, item.parent_id),
      parent: item.parent_id,
      full: false
    }
  }
  for (const item of tree.folders) {
    if (ConfigStore.get('stopSync')) {
      throw Error('stop sync')
    }
    if (!item.parent_id || !finalDict[item.parent_id]) {
      continue
    }
    if (!finalDict[item.id].full) {
      var parentPath = generatePath(finalDict, finalDict[item.id])
      if (parentPath === undefined) {
        delete finalDict[item.id]
        continue
      }
      finalDict[item.id].path = path.join(parentPath, finalDict[item.id].path)
      finalDict[item.id].full = true
    }
    const fullNewPath = finalDict[item.id].path
    const cloneObject = JSON.parse(JSON.stringify(item))
    const finalObject = { key: fullNewPath, value: cloneObject }
    if (ignoreHideFolder.test(path.basename(fullNewPath))) {
      Logger.info('Ignoring folder %s, hidden folder', finalObject.key)
      delete finalDict[item.id]
      continue
    }
    if (
      NameTest.invalidFolderName(path.basename(fullNewPath), nameTestFolder)
    ) {
      Logger.info('Ignoring folder %s, invalid name', finalObject.key)
      delete finalDict[item.id]
      continue
    }
    dbEntrys.push(finalObject)
    // return
  }
  await database.ClearFoldersCloud()
  await database.dbInsert(database.dbFoldersCloud, dbEntrys)
  return finalDict
}

async function regenerateDbFileCloud(tree, folderDict) {
  const dbEntrys = []

  await database.ClearFilesCloud()
  for (const item of tree.files) {
    if (ConfigStore.get('stopSync')) {
      throw Error('stop sync')
    }
    if (!folderDict[item.folder_id]) {
      continue
    }
    const filePath = folderDict[item.folder_id].path
    item.filename = crypt.decryptName(item.name, item.folder_id)

    item.fullpath = path.join(
      filePath,
      item.filename + (item.type ? '.' + item.type : '')
    )

    const cloneObject = JSON.parse(JSON.stringify(item))
    const finalObject = { key: item.fullpath, value: cloneObject }
    dbEntrys.push(finalObject)
    // return
  }
  await database.ClearFilesCloud()
  await database.dbInsert(database.dbFilesCloud, dbEntrys)
}

function getLocalFolderList(localPath) {
  return new Promise(resolve => {
    const results = []
    const ignoreHideFolder = new RegExp('^\\.[]*')
    const invalidName = /[\\/]|[. ]$/
    readdirp(localPath, {
      type: 'directories',
      directoryFilter: ['!.*']
    })
      .on('data', data => {
        if (invalidName.test(data.basename)) {
          return Logger.info(
            'Directory %s ignored, name is not compatible',
            data.basename
          )
        }
        if (ignoreHideFolder.test(data.basename)) {
          console.log('ignored')
          return
        }
        results.push(data.fullPath)
      })
      .on('warn', warn => console.error('READDIRP non-fatal error', warn))
      .on('error', err => console.error('READDIRP fatal error', err.message))
      .on('end', () => {
        resolve(results)
      })
  })
}

function getLocalFileList(localPath) {
  return getListFromFolder(localPath)
}

function getTree() {
  return new Promise(async (resolve, reject) => {
    fetch(`${process.env.API_URL}/api/storage/tree`, {
      headers: await Auth.getAuthHeader()
    })
      .then(async res => {
        const text = await res.text()
        try {
          return { res, data: JSON.parse(text) }
        } catch (err) {
          throw new Error(err + ' data: ' + text)
        }
      })
      .then(async res => {
        resolve(res.data)
      })
      .catch(reject)
  })
}

async function updateUserObject() {
  const headers = await Auth.getAuthHeader()
  const lastUser = await database.Get('xUser')
  return new Promise((resolve, reject) => {
    fetch(`${process.env.API_URL}/api/user/refresh`, {
      method: 'GET',
      headers: headers
    })
      .then(res => {
        return res.text()
      })
      .then(text => {
        try {
          return { data: JSON.parse(text) }
        } catch (err) {
          throw new Error(err + ' data: ' + text)
        }
      })
      .then(data => {
        if (data.data.user) {
          data.data.user.email = lastUser.user.email
          data.data.user.mnemonic = lastUser.user.mnemonic
          return database.Set('xUser', data.data).then(() => {
            resolve()
          })
        }
        throw Error('no user')
      })
      .catch(reject)
  })
}
async function getList() {
  const headers = await Auth.getAuthHeader()
  let finished = false
  let index = 0
  const offset = 5000
  const result = { folders: [], files: [] }
  while (!finished) {
    const fetchRes = await fetch(
      `${process.env.API_URL}/api/desktop/list/${index}`,
      {
        headers: headers
      }
    )
    const text = await fetchRes.text()
    let data
    try {
      data = JSON.parse(text)
    } catch (err) {
      throw new Error(err + ' data: ' + text)
    }
    result.folders = result.folders.concat(data.folders)
    result.files = result.files.concat(data.files)
    if (data.folders.length < offset) {
      finished = true
    } else {
      index += offset
    }
  }
  return result
}

function updateDbCloud() {
  return new Promise((resolve, reject) => {
    getList()
      .then(tree => {
        regenerateDbFolderCloud(tree)
          .then(result => {
            regenerateDbFileCloud(tree, result)
              .then(resolve)
              .catch(reject)
          })
          .catch(reject)
      })
      .catch(err => {
        Logger.error('Error updating localDb', err)
        reject(err)
      })
  })
}

function updateTree() {
  return new Promise((resolve, reject) => {
    getTree()
      .then(tree => {
        database
          .Set('tree', tree)
          .then(() => {
            resolve()
          })
          .catch(err => {
            reject(err)
          })
      })
      .catch(err => {
        Logger.error('Error updating tree', err)
        reject(err)
      })
  })
}

function updateDbAndCompact() {
  return new Promise((resolve, reject) => {
    async.waterfall(
      [
        next =>
          updateDbCloud()
            .then(() => next())
            .catch(next)
      ],
      err => {
        database.compactAllDatabases()
        if (err) {
          reject(err)
        } else {
          resolve()
        }
      }
    )
  })
}

export default {
  getListFromFolder,
  getStat,
  getLocalFolderList,
  getLocalFileList,
  getTree,
  getList,
  updateTree,
  updateLocalDb: updateDbCloud,
  updateDbAndCompact,
  updateUserObject
}
