import { utils as coreUtils } from 'ern-core'
import { publishContainer } from 'ern-container-publisher'
import { getContainerPlatform } from 'ern-container-gen'
import utils from '../lib/utils'
import fs from 'fs'
import path from 'path'
import os from 'os'
import { Argv } from 'yargs'

export const command = 'publish-container <containerPath>'
export const desc = 'Publish a local Container'

export const builder = (argv: Argv) => {
  return argv
    .option('version', {
      alias: 'v',
      default: '1.0.0',
      describe: 'Container version to use for publication',
      type: 'string',
    })
    .option('publisher', {
      alias: 'p',
      demandOption: true,
      describe: 'The publisher to use',
      type: 'string',
    })
    .option('url', {
      alias: 'u',
      describe: 'The publication url',
      type: 'string',
    })
    .option('config', {
      alias: 'c',
      describe: 'Optional publisher configuration (as a JSON string)',
      type: 'string',
    })
    .epilog(utils.epilog(exports))
}

export const handler = async ({
  containerPath,
  version,
  publisher,
  url,
  config,
}: {
  containerPath: string
  version: string
  publisher: string
  url: string
  config?: string
}) => {
  try {
    await utils.logErrorAndExitIfNotSatisfied({
      isValidContainerVersion: { containerVersion: version },
    })

    // Container path validation
    if (!fs.existsSync(containerPath)) {
      throw new Error('containerPath path does not exist')
    }

    // JSON config validation
    if (config) {
      try {
        JSON.parse(config)
      } catch (e) {
        throw new Error('config should be valid JSON')
      }
    }

    await publishContainer({
      containerPath,
      containerVersion: version,
      extra: config ? JSON.parse(config) : undefined,
      platform: getContainerPlatform(containerPath),
      publisher,
      url,
    })
  } catch (e) {
    coreUtils.logErrorAndExitProcess(e)
  }
}
