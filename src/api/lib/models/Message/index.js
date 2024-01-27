import { INTEGER, STRING, UUID, UUIDV4, literal } from 'sequelize'

import { enCode } from '../../utils/util'
import connect from '../../db'

const sequelize = connect()

const MessagesModel = sequelize.define('messages', {
  id: {
    type: INTEGER,
    primaryKey: true,
    autoIncrement: true,
    get (x) { return enCode(this.getDataValue(x)) }
  },
  content: {
    type: STRING,
    allowNull: false
  },
  codeRoom: {
    type: STRING,
    allowNull: false
  },
  uuid: {
    type: UUID,
    defaultValue: UUIDV4,
    allowNull: false
  },
  from: {
    type: STRING,
    allowNull: false
  },
  to: {
    type: STRING,
    allowNull: false
  },
  aDatCre: {
    defaultValue: literal('CURRENT_TIMESTAMP'),
    allowNull: false,
    type: 'TIMESTAMP'
  },
  aDatMod: {
    defaultValue: literal('CURRENT_TIMESTAMP'),
    allowNull: false,
    type: 'TIMESTAMP'
  }
}, {
  timestamps: false
})

export default MessagesModel
