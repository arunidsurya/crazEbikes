const express = require('express');
const {handleHomePageView, handleCategoryView,handleAddCategoryPageView, handleCategoryAdd, 
    handleEditCategoryPageView,handleCategoryEdit,
    handleCategoryDelete,handleAddUserPageView, handleUserAdd, handleUserView, handleEditCustomerPageView,handleCustomerEdit,
    handleCustomerDelete, handleProductAdd, handleProductsView,handleProductUpdatePageView, handleProductUpdate,
    handleProdcutDelete, handleCustomerBlock, handleCustomerUnblock, handleImageDelete,handleCategorySearch, handleUserSearch,handleAddProductPageView,handleOrdersView,handleOrdersSearch,
    handleOrderDetailedView,handleChangeOrderStatus,handleChangePaymentStatus,handleAddCoupon,handleAddCouponView,
    handleCouponsView,handleEditCouponPageView,handleEditCoupon,handleDeleteCoupon,handleDashBoardView,
    handleSalesReportView} = require('../controllers/admin');
    
const productValidator =require('../middleware/productValidator');

const router = express.Router();

router.get("/",handleHomePageView);


router.get("/categories", handleCategoryView,);
router.post("/category-search", handleCategorySearch);
router.get("/add-category-page",handleAddCategoryPageView);
router.post("/addCategories", handleCategoryAdd);
router.get("/edit-categoriy-page/:id",handleEditCategoryPageView);
router.post("/editCategories/:id", handleCategoryEdit);
router.get("/deleteCategories/:id", handleCategoryDelete);


router.get("/user", handleUserView);
router.post("/customer-search", handleUserSearch);
router.get("/add-customer-page",handleAddUserPageView);
router.post("/addUser", handleUserAdd);
router.get("/edit-customer-page/:id",handleEditCustomerPageView);
router.post("/editCustomers/:id", handleCustomerEdit);
router.get("/deleteCustomers/:id", handleCustomerDelete);
router.get("/blockCustomers/:id", handleCustomerBlock);
router.get("/unBlockCustomers/:id", handleCustomerUnblock);
router.get("/products", handleProductsView);
router.get("/addProduct-view",handleAddProductPageView);
router.post("/addProduct",productValidator, handleProductAdd);
router.get("/edit-product-page/:id",handleProductUpdatePageView)
router.post("/editProducts/:id", handleProductUpdate);
router.get("/deleteProducts/:id", handleProdcutDelete);
router.get("/deleteImages", handleImageDelete);

router.get("/orders-view", handleOrdersView);
router.post("/orders-search", handleOrdersSearch);
router.get('/orders-detailed-view',handleOrderDetailedView);
router.post('/change-order-status',handleChangeOrderStatus);
router.post('/change-payment-status',handleChangePaymentStatus);


router.get("/coupons-view", handleCouponsView);
router.get("/addCoupon-view", handleAddCouponView);
router.post('/add-coupons',handleAddCoupon);
router.get('/view-edit-coupon-page/:id',handleEditCouponPageView);
router.post('/editCoupon/:id',handleEditCoupon);
router.get('/deleteCoupon/:id',handleDeleteCoupon);


router.get('/dash-board',handleDashBoardView);

router.get('/sales-report',handleSalesReportView);




module.exports = router;

