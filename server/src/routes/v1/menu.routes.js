const express = require('express');
const auth = require('../../middlewares/auth.middleware');
const { checkPermission } = require('../../middlewares/rbac.middleware');
const upload = require('../../middlewares/upload.middleware');
const menuController = require('../../controllers/menu.controller');

const router = express.Router();

// Require authorization for all menu actions
router.use(auth);

// Categories routes
router.route('/categories')
  .get(menuController.getCategories)
  .post(checkPermission('create_menu'), menuController.createCategory);

router.route('/categories/:id')
  .patch(checkPermission('update_menu'), menuController.updateCategory)
  .delete(checkPermission('delete_menu'), menuController.deleteCategory);

// Menu Items routes
router.route('/items')
  .get(menuController.getMenuItemsList)
  .post(checkPermission('create_menu'), upload.single('image'), menuController.createMenuItem);

router.route('/items/:id')
  .get(menuController.getMenuItemDetail)
  .patch(checkPermission('update_menu'), upload.single('image'), menuController.updateMenuItem)
  .delete(checkPermission('delete_menu'), menuController.deleteMenuItem);

module.exports = router;
