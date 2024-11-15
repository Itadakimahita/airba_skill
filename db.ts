import { Sequelize, DataTypes } from 'sequelize';

require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME as string, process.env.DB_SERVER as string, process.env.DB_PASSWORD, {
  host: 'localhost',
  port: 8000,
  dialect: 'postgres',
});

// Define the Dialog model
const Dialog = sequelize.define('dialog', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  type: { type: DataTypes.STRING, allowNull: false },
}, { tableName: 'dialogs', timestamps: false });

// Define the DialogState model
const DialogState = sequelize.define('dialog_state', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  step_name: { type: DataTypes.STRING, allowNull: false },
  step: { type: DataTypes.INTEGER, allowNull: false },
  function_call: { type: DataTypes.STRING, allowNull: true },
}, { tableName: 'dialog_states', timestamps: false });

// Define the UserAccount model
const UserAccount = sequelize.define('user_account', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  yandex_id: { type: DataTypes.STRING, unique: true, allowNull: false },
  status: { type: DataTypes.ENUM('в процессе', 'в ожидании', 'завершен'), allowNull: false },
  workflow_id: { type: DataTypes.STRING, allowNull: true },
  response_refreshed: { type: DataTypes.BOOLEAN, defaultValue: false },
  last_response: { type: DataTypes.TEXT, allowNull: true },
  created_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  last_session_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'user_accounts', timestamps: false });

// Define the User model with foreign key to UserAccount
const User = sequelize.define('user', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: { type: DataTypes.STRING, allowNull: false },
  number: { type: DataTypes.STRING, allowNull: false },
  auth_token: { type: DataTypes.STRING, allowNull: true },
  refresh_token: { type: DataTypes.STRING, allowNull: true },
  active: { type: DataTypes.BOOLEAN, defaultValue: false },
  confirmed: { type: DataTypes.BOOLEAN, defaultValue: false},
  user_account_id: { // foreign key to UserAccount
    type: DataTypes.INTEGER,
    references: { model: UserAccount, key: 'id' },
    allowNull: false,
    onDelete: 'CASCADE'
  },
  created_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  last_session_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  updated_date: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
}, { tableName: 'users', timestamps: false });

// Define the UserDialogState join model to manage steps per UserAccount and Dialog
const UserDialogState = sequelize.define('user_dialog_state', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  step: { type: DataTypes.INTEGER, allowNull: false },
  user_account_id: {
    type: DataTypes.INTEGER,
    references: { model: UserAccount, key: 'id' },
    allowNull: false,
    onDelete: 'CASCADE'
  },
  dialog_id: {
    type: DataTypes.INTEGER,
    references: { model: Dialog, key: 'id' },
    allowNull: false,
    onDelete: 'CASCADE'
  },
  dialog_state_id: {
    type: DataTypes.INTEGER,
    references: { model: DialogState, key: 'id' },
    allowNull: false,
    onDelete: 'CASCADE'
  },
}, { tableName: 'user_dialog_states', timestamps: false });

// Set up associations
Dialog.hasMany(DialogState, { foreignKey: 'dialog_id' });
DialogState.belongsTo(Dialog, { foreignKey: 'dialog_id' });

UserAccount.hasMany(User, { foreignKey: 'user_account_id' }); // UserAccount can have many Users

// Define the many-to-many relationship through UserDialogState
UserAccount.belongsToMany(Dialog, { through: UserDialogState, foreignKey: 'user_account_id' });
Dialog.belongsToMany(UserAccount, { through: UserDialogState, foreignKey: 'dialog_id' });

DialogState.hasMany(UserDialogState, { foreignKey: 'dialog_state_id' });
UserDialogState.belongsTo(DialogState, { foreignKey: 'dialog_state_id' });

UserAccount.hasMany(UserDialogState, { foreignKey: 'user_account_id' });
Dialog.hasMany(UserDialogState, { foreignKey: 'dialog_id' });

// Sync models with the database
sequelize.sync({ force: false })
  .then(() => {
    console.log('Models synced successfully');
  })
  .catch((error) => {
    console.error('Error syncing models:', error);
  });

export { sequelize, Dialog, DialogState, UserAccount, User, UserDialogState };
