const express = require('express');
const { handleHomePageView, handleCategoryView, handleAddCategoryPageView, handleCategoryAdd,
    handleEditCategoryPageView, handleCategoryEdit,
    handleCategoryDelete, handleAddUserPageView, handleUserAdd, handleUserView, handleEditCustomerPageView, handleCustomerEdit,
    handleCustomerDelete, handleProductAdd, handleProductsView, handleProductUpdatePageView, handleProductUpdate,
    handleProdcutDelete, handleCustomerBlock, handleCustomerUnblock, handleImageDelete, handleCategorySearch, handleUserSearch, handleAddProductPageView, handleOrdersView,
    handleOrderDetailedView, handleChangeOrderStatus, handleChangePaymentStatus, handleAddCoupon, handleAddCouponView,
    handleCouponsView, handleEditCouponPageView, handleEditCoupon, handleDeleteCoupon, handleDashBoardView,
    handleSalesReportView } = require('../controllers/admin');

const productValidator = require('../middleware/productValidator');
const addressValidator = require('../middleware/addressValidator');
const categoryValidator = require('../middleware/categoryValidator');
const customerValidator = require('../middleware/customerValidation');
const couponValidator = require('../middleware/couponValidator');

const router = express.Router();

router.get("/", handleHomePageView);


router.get("/categories", handleCategoryView,);
router.post("/category-search", handleCategorySearch);
router.get("/add-category-page", handleAddCategoryPageView);
router.post("/addCategories",categoryValidator, handleCategoryAdd);
router.get("/edit-categoriy-page/:id", handleEditCategoryPageView);
router.post("/editCategories/:id",categoryValidator, handleCategoryEdit);
router.delete("/deleteCategories/:id", handleCategoryDelete);


router.get("/user", handleUserView);
router.post("/customer-search", handleUserSearch);
router.get("/add-customer-page", handleAddUserPageView);
router.post("/addUser",customerValidator, handleUserAdd);
router.get("/edit-customer-page/:id", handleEditCustomerPageView);
router.post("/editCustomers/:id",customerValidator, handleCustomerEdit);
router.get("/deleteCustomers/:id", handleCustomerDelete);
router.post("/blockCustomers/:id", handleCustomerBlock);
router.post("/unBlockCustomers/:id", handleCustomerUnblock);


router.get("/products", handleProductsView);
router.get("/addProduct-view", handleAddProductPageView);
router.post("/addProduct", productValidator, handleProductAdd);
router.get("/edit-product-page/:id", handleProductUpdatePageView)
router.post("/editProducts/:id",productValidator, handleProductUpdate);
router.get("/deleteProducts/:id", handleProdcutDelete);
router.get("/deleteImages", handleImageDelete);

router.get("/orders-view", handleOrdersView);
router.get('/orders-detailed-view', handleOrderDetailedView);
router.post('/change-order-status', handleChangeOrderStatus);
router.post('/change-payment-status', handleChangePaymentStatus);


router.get("/coupons-view", handleCouponsView);
router.get("/addCoupon-view", handleAddCouponView);
router.post('/add-coupons',couponValidator, handleAddCoupon);
router.get('/view-edit-coupon-page', handleEditCouponPageView);
router.post('/editCoupon',couponValidator, handleEditCoupon);
router.get('/deleteCoupon/:id', handleDeleteCoupon);


router.get('/dash-board', handleDashBoardView);

router.get('/sales-report', handleSalesReportView);




module.exports = router;

