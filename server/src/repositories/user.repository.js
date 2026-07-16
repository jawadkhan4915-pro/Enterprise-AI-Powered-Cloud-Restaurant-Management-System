const User = require('../models/User.model');

/**
 * Find user by ID
 * @param {string} id 
 * @returns {Promise<User>}
 */
const findById = async (id) => {
  return User.findOne({ _id: id, isDeleted: false });
};

/**
 * Find user by email
 * @param {string} email 
 * @returns {Promise<User>}
 */
const findByEmail = async (email) => {
  return User.findOne({ email: email.toLowerCase(), isDeleted: false });
};

/**
 * Create a new user
 * @param {Object} userData 
 * @returns {Promise<User>}
 */
const createUser = async (userData) => {
  return User.create(userData);
};

/**
 * Update user by ID
 * @param {string} id 
 * @param {Object} updateBody 
 * @returns {Promise<User>}
 */
const updateUserById = async (id, updateBody) => {
  const user = await findById(id);
  if (!user) {
    return null;
  }
  Object.assign(user, updateBody);
  await user.save();
  return user;
};

/**
 * Soft delete user by ID
 * @param {string} id 
 * @returns {Promise<User>}
 */
const deleteUserById = async (id) => {
  const user = await findById(id);
  if (!user) {
    return null;
  }
  user.isDeleted = true;
  user.deletedAt = new Date();
  await user.save();
  return user;
};

module.exports = {
  findById,
  findByEmail,
  createUser,
  updateUserById,
  deleteUserById,
};
