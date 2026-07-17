const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/rbac.middleware');
const restaurantController = require('../../controllers/restaurant.controller');

const router = express.Router();

// Require authorization for all restaurant profile actions
router.use(auth);

// Restaurant Profile routes
router.route('/')
  .get(restaurantController.getRestaurantProfile)
  .patch(checkPermission('update_branch'), restaurantController.updateRestaurantProfile);

router.route('/dashboard')
  .get(restaurantController.getDashboardStats);

// Branch routes
router.route('/branches')
  .get(restaurantController.getRestaurantBranches)
  .post(checkPermission('create_branch'), restaurantController.createRestaurantBranch);

router.route('/branches/:id')
  .patch(checkPermission('update_branch'), restaurantController.updateRestaurantBranch)
  .delete(checkPermission('delete_branch'), restaurantController.deleteRestaurantBranch);

// Floor levels routes
router.route('/floors')
  .get(restaurantController.getRestaurantFloors)
  .post(checkPermission('create_branch'), restaurantController.createRestaurantFloor);

// Tables layout routes
router.route('/tables')
  .get(restaurantController.getFloorTables)
  .post(checkPermission('update_branch'), restaurantController.createFloorTable);

router.route('/tables/layout')
  .put(checkPermission('update_branch'), restaurantController.updateTableLayoutBatch);

router.route('/tables/:id')
  .patch(checkPermission('update_branch'), restaurantController.updateFloorTable);

module.exports = router;
