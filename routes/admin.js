const express = require('express');
const {handleHomePageView, handleCategoryView,handleAddCategoryPageView, handleCategoryAdd, 
    handleEditCategoryPageView,handleCategoryEdit,
    handleCategoryDelete,handleAddUserPageView, handleUserAdd, handleUserView, handleEditCustomerPageView,handleCustomerEdit,
    handleCustomerDelete, handleProductAdd, handleProductsView,handleProductUpdatePageView, handleProductUpdate,
    handleProdcutDelete, handleCustomerBlock, handleCustomerUnblock, handleImageDelete,
    handleProductSearch, handleProductsSort, handleCategorySearch, handleUserSearch,
    handleAddProductPageView} = require('../controllers/admin');
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
router.get("/products-sort", handleProductsSort);
router.post("/products-search", handleProductSearch);
router.get("/addProduct-view",handleAddProductPageView);
router.post("/addProduct",productValidator, handleProductAdd);
router.get("/edit-product-page/:id",handleProductUpdatePageView)
router.post("/editProducts/:id", handleProductUpdate);
router.get("/deleteProducts/:id", handleProdcutDelete);
router.get("/deleteImages", handleImageDelete);







module.exports = router;

