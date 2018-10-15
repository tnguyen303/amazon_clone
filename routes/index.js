const express = require('express');
const router = express.Router();
const Inventory = require('./../models/inventory');

// Chan: test middleware works????
router.use((req, res, next) => {
  console.log('Time', Date.now());
  next();
});

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('home', { title: 'This is Amazon clone site, welcome!!!' , reviewer: req.cookies.reviewer});
});

// get inentory and display all
router.get('/inventory', (req, res, next) => {
  Inventory.find({}).then(inventory => {
    res.render('index', { inventory: inventory, reviewer: req.cookies.reviewer });
  });
});

router.get('/login', function (req, res, next) {
  res.render('login',{reviewer: req.cookies.reviewer});
});

/* Log out page, redirect to login page, clear cookie */
router.get('/logout', (req, res, next) => {
  res.clearCookie('auth');
  // res.clearCookie('seller');
  res.clearCookie('reviewer');
  res.redirect('login');
});

// /**************(Chan)************* GET login page rendering */
// router.get('/login', (req, res, next) => {
//   res.render('login');
// });

// /**************(Maryam)*********** GET register page rendering */
// router.get('/register', (req, res , next) => {
//   res.render('register');
// });

/////////////////to get all inventory in normal js:Ming///////////////
router.get('/database', (req, res) => {
  Inventory.find({}).then(inventory => {
    res.json(inventory);
  });
});

////////////////////////////////////////////////////////////////////
///////////////purchase page:  Ming////////////////////
router.get('/purchase/:id', function (req, res) {
  console.log('GET function');
  console.log(req.params.id);
  Inventory.findOne({ _id: req.params.id })
    .then(product => {
      res.render('purchase', { product: product, reviewer: req.cookies.reviewer });
    })
    .catch(function (err) {
      res.json(err);
    });
});
//////////////////////////////////////////////////////

//////////////cart page: Ming/////////////////////////
// router.put('/initialCart',function(req,res){
//   Inventory.update({},{itemInCart:false}).then(
//   res.json(Inventory)
//   );
// });

router.get('/shoppingCart', function (req, res) {
  console.log('GET function: shoppingCart');
  Inventory.find({}).then(inventory => {
    res.render('cart', { inventory: inventory, reviewer: req.cookies.reviewer });
  });
});

router.put('/cartUpdate/:id', function (req, res) {
  console.log('PUT function');
  console.log(req.params.id);
  Inventory.findOne({ _id: req.params.id })
    .then(function () {
      Inventory.updateOne({ _id: req.params.id }, req.body)
        .then(function (data) {
          res.json(data);
        })
        .catch(function (err) {
          res.json(err);
        });
    })
    .catch(function (err) {
      res.json(err);
    });
});

//////////////////////////////////////////////////////

// update inventory count
router.put('/inventory/:id', (req, res, next) => {
  Inventory.findOne({
    _id: req.params.id
  }).then(inventory => {
    inventory.itemCount = req.body.itemCount;
    inventory.save().then(inventory => {
      res.json(inventory);
    });
  });
});
// post inventory
router.post('/inventory', (req, res) => {
  const newInventory = {
    itemName: req.body.itemName,
    itemDepartment: req.body.itemDepartment,
    itemPrice: req.body.itemPrice,
    itemDescription: req.body.itemDescription,
    itemSeller: req.body.itemSeller,
    itemCount: req.body.itemCount,
    itemImgPath: req.body.itemImgPath,
    itemInCart: req.body.itemInCart,
    itemSold: req.body.itemSold
  };
  new Inventory(newInventory)
    .save()
    .then(inventory => res.redirect('/inventory'));
});

router.delete('/inventory/:id', (req, res) => {
  Inventory.remove({ _id: req.params.id }).then(() => {
    res.redirect('/inventory');
  });
});

//-----search by itemName-----Tri-------//
router.post('/inventory/search', function (req, res, next) {
  const searchQuery = req.body.searchQuery;
  // const searchQuery = 'Simpsons';
  Inventory.find({ itemName: searchQuery }, function (err, inventory) {
    if (err) {
      return res.status(200).send(err);
    } else {
      // res.json(inventory);
      res.render('index', { inventory: inventory, reviewer: req.cookies.reviewer });
    }
  });
});

/* [pending] */
//-----pagination feature----Tri-----//
router.get('/inventory/:page', function (req, res, next) {
  const perPage = 10;
  const page = req.params.page || 1;

  Inventory.find({})
    .skip(perPage * page - perPage)
    .limit(perPage)
    .exec(function (err, products) {
      Inventory.count().exec(function (err, count) {
        if (err) {
          return err;
        } else {
          const pages = Math.ceil(count / perPage);
          if (pages > 0) {
            res.render('index', {
              reviewer: req.cookies.reviewer,
              inventory: products,
              current: page,
              pages: Math.ceil(count / perPage)
            });
          } else {
            res.render('index', {
              reviewer: req.cookies.reviewer,
              inventory: products,
              current: page
            });
          }
        }
      });
    });
});

// -----search by department----//
router.post('/inventory/search/department/', function (req, res) {
  const deptSelect = req.body.departmentSelect;
  const searchQuery = req.body.searchQuery;
  if (deptSelect === 'All') {
    if (searchQuery.length > 0) {
      Inventory
        .find({ itemTag: searchQuery })
        .then(function (data) {
          res.render('index', { inventory: data , reviewer: req.cookies.reviewer});
        })
    }
    else {
      Inventory
        .find({})
        .then(function (data) {
          res.render('index', { inventory: data, reviewer: req.cookies.reviewer });
        });
    }
  }
  else {
    if (searchQuery.length > 0) {
      Inventory
        .find({ itemDepartment: deptSelect, itemTag: searchQuery })
        .then(function (data) {
          res.render('index', { inventory: data, reviewer: req.cookies.reviewer });
        })
    }
    else {
      Inventory
        .find({ itemDepartment: deptSelect })
        .then(function (data) {
          res.render('index', { inventory: data , reviewer: req.cookies.reviewer});
        });
    }

    Inventory.find({ itemDepartment: deptSelect, itemTag: searchQuery }).then(function (data) {
      res.render('index', { inventory: data, reviewer: req.cookies.reviewer });

    });
  }
});

/**
 * user review part --chan , need to find user id.
 */
router.get('/review/:id', (req, res) => {
  Inventory.findOne({
    _id: req.params.id
  }).then(inventory => {
    console.log(inventory);
    res.render('review/user_review', { inventory: inventory, reviewer: req.cookies.reviewer }); //, reviewer: req.cookies.reviewer
  });
});

router.put('/review/update/:id', (req, res) => {
  console.log('user review update');
  console.log(req.body);
  console.log(req.user);
  const review = {
    reviewer: req.cookies.reviewer, //req.user.email,
    rate: req.body.userRate,
    content: req.body.userReview,
    date: Date.now()
  };
  Inventory.findOneAndUpdate(
    { _id: req.params.id },
    { $push: { itemReview: review } },
    { new: true },
    (err, doc) => {
      if (err) {
        console.log(err);
      } else {
        console.log(doc);
        res.redirect('/inventory');
      }
    }
  );
});

module.exports = router;
