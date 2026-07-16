const Restaurant = require('../models/Restaurant.model');
const Branch = require('../models/Branch.model');
const Floor = require('../models/Floor.model');
const Table = require('../models/Table.model');

// Restaurant Profile CRUD
const getProfile = async () => {
  return Restaurant.findOne({ isDeleted: false });
};

const updateProfile = async (updateBody) => {
  let profile = await getProfile();
  if (!profile) {
    profile = new Restaurant({ name: 'My Restaurant' });
  }
  Object.assign(profile, updateBody);
  await profile.save();
  return profile;
};

// Branch CRUD
const getBranches = async (restaurantId) => {
  return Branch.find({ restaurantId, isDeleted: false });
};

const createBranch = async (branchBody) => {
  return Branch.create(branchBody);
};

const updateBranch = async (id, updateBody) => {
  return Branch.findOneAndUpdate({ _id: id, isDeleted: false }, updateBody, { new: true });
};

const deleteBranch = async (id) => {
  return Branch.findOneAndUpdate({ _id: id }, { isDeleted: true }, { new: true });
};

// Floor Levels CRUD
const getFloors = async (branchId) => {
  return Floor.find({ branchId, isDeleted: false }).sort({ level: 1 });
};

const createFloor = async (floorBody) => {
  return Floor.create(floorBody);
};

const updateFloor = async (id, updateBody) => {
  return Floor.findOneAndUpdate({ _id: id, isDeleted: false }, updateBody, { new: true });
};

// Tables CRUD
const getTablesByFloor = async (floorId) => {
  return Table.find({ floorId, isDeleted: false });
};

const getTablesByBranch = async (branchId) => {
  return Table.find({ branchId, isDeleted: false });
};

const createTable = async (tableBody) => {
  return Table.create(tableBody);
};

const updateTable = async (id, updateBody) => {
  return Table.findOneAndUpdate({ _id: id, isDeleted: false }, updateBody, { new: true });
};

const batchUpdateTablePositions = async (layoutArray) => {
  const bulkOps = layoutArray.map((tbl) => ({
    updateOne: {
      filter: { _id: tbl.id },
      update: { 
        $set: { 
          'position.x': tbl.position.x, 
          'position.y': tbl.position.y,
          'size.width': tbl.size?.width || 80,
          'size.height': tbl.size?.height || 80,
          'capacity': tbl.capacity || 4,
          'shape': tbl.shape || 'square',
          'number': tbl.number
        } 
      },
    },
  }));
  return Table.bulkWrite(bulkOps);
};

module.exports = {
  getProfile,
  updateProfile,
  getBranches,
  createBranch,
  updateBranch,
  deleteBranch,
  getFloors,
  createFloor,
  updateFloor,
  getTablesByFloor,
  getTablesByBranch,
  createTable,
  updateTable,
  batchUpdateTablePositions,
};
