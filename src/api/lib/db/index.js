/* eslint-disable no-console */
'use strict'
import Sequelize from 'sequelize'
import dotenv from 'dotenv'
// Configura dotenv
dotenv.config()

let sequelize = null
const dialectOptions = {
  postgres: {
    ssl: {
      rejectUnauthorized: false
    }
  }
}

function connect () {
  try {
    if (sequelize) return sequelize
    sequelize = new Sequelize(
      process.env.NAME_DB, // name of the database
      process.env.USER_DB, // name of the user database
      process.env.PASS_DB, // password of the database
      {
        host: process.env.HOST_DB,
        logging: true,
        port: process.env.PORT_DB,
        dialect: process.env.DIALECT_DB,
        dialectOptions: dialectOptions[process.env.DIALECT_DB] || {}
      }
    )
  } catch (error) {
    console.log(error)

    throw new Error(error)
  }
  return sequelize
}

export default connect
