var customers = require('./../controllers/customers.js');
var products = require('./../controllers/products.js');
var orders = require('./../controllers/orders.js');

module.exports = function(app){
	app.get('/customers', function(req, res){
		customers.show(req, res);
	});

	app.post('/addCustomer', function(req, res){
		customers.add(req, res);
	});

	app.get('/recent_customers', function(req, res){
		customers.recent_show(req, res)
		
	});
	app.get('/orders', function(req, res){
		orders.show(req, res);
	});

	app.get('/recent_orders', function(req, res){
		orders.recent_show(req, res)
	});

	app.post('/addOrder', function(req, res){
		orders.add(req, res);
	});

	app.get('/products', function(req, res){
		products.show(req, res);
	});

	app.get('/recent_products', function(req, res){
		products.recent_show(req, res);
	});

	app.post('/addProduct', function(req, res){
		products.add(req, res);
	});

}