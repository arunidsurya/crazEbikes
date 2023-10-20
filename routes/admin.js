const express = require('express');
const {handleCategoryView,handleCategoryAdd,handleCategoryEdit,
    handleCategoryDelete,handleUserAdd,handleUserView,handleCustomerEdit,
    handleCustomerDelete,handleProductAdd,handleProductsView,handleProductUpdate,
    handleProdcutDelete,handleAdminLogin,handleAdminSignup,handleAdminLogout,
    handleCustomerBlock,handleCustomerUnblock,handleImageDelete,handleProductSearch,
    handleProductsSort,handleCategorySearch,handleUserSearch} = require('../controllers/admin')

const router = express.Router();

router.post("/",handleAdminLogin);
router.post("/signup",handleAdminSignup);
router.get("/logout",handleAdminLogout);


router.get("/categories",handleCategoryView,);
router.post("/category-search",handleCategorySearch);
router.post("/addCategories",handleCategoryAdd);
router.post("/editCategories/:id",handleCategoryEdit);
router.get("/deleteCategories/:id",handleCategoryDelete);


router.get("/user",handleUserView);
router.post("/customer-search",handleUserSearch);
router.post("/addUser",handleUserAdd);
router.post("/editCustomers/:id",handleCustomerEdit);
router.get("/deleteCustomers/:id",handleCustomerDelete);
router.get("/blockCustomers/:id",handleCustomerBlock);
router.get("/unBlockCustomers/:id",handleCustomerUnblock);

router.get("/products",handleProductsView);
router.get("/products-sort",handleProductsSort);
router.post("/products-search",handleProductSearch);
router.post("/addProduct",handleProductAdd);
router.post("/editProducts/:id",handleProductUpdate);
router.get("/deleteProducts/:id",handleProdcutDelete);
router.get("/deleteImages",handleImageDelete);

module.exports=router;

