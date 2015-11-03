var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

//UPDATE
router.put('/items/:id', function(req, res, next) {

	var id = {_id: req.params.id};
	var update = {
		name: req.body.name,
		type: req.body.type,
		quantity: req.body.quantity
	};
	var options = {new: true};

	Item.findOneAndUpdate(id, update, options, function(err, data) {

		if (err) {
			res.json(err);
		}

		else if (data.length===0) {
			res.json({message: 'An item with that id does not exist in this database.'})
		}

		else {
			res.json(data);
		}

	});

});

//DELETE
router.delete('/items/:id', function(req, res, next) {

	var id = {_id: req.params.id};

	Item.findOneAndRemove(id, function(err, data) {

		if (err) {
			res.json(err);
		}

		else if (data.length===0) {
			res.json({message: 'An item with that id does not exist in this database.'});
		}

		else {
			res.json({message: 'Success. Item deleted.'});
		}

	});

});

module.exports = router;
