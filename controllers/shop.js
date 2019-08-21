const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
  //find method works differently when used with Mongoose, automatically returns array of objects
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    })
};

exports.getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then(product => {
      res.render('shop/product-detail', {
        product: product,
        pageTitle: product.title,
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err)
    })
};

exports.getIndex = (req, res, next) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    })
};

exports.getCart = (req, res, next) => {

  req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      const products = user.cart.items;
      res.render('shop/cart', {
        path: '/cart',
        pageTitle: 'Your Cart',
        products: products
      });
    })
    .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(result => {
      res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user.deleteItemFromCart(prodId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => console.log(err));
};

exports.postOrder = (req, res, next) => {

  req.user.populate('cart.items.productId')
    .execPopulate()
    .then(user => {
      console.log(user.cart.items);
      const products = user.cart.items.map(i => {
        //._doc strips out all other properties that come back with the document and only retrieves fields that belong in the schema
        return {quantity: i.quantity, product: {...i.productId._doc}}
      });
      const order = new Order({
        products: products,
        user: {
          email: req.user.email,
          userId: req.user._id
        }
      });
      return order.save()
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => console.log(err));
}

exports.getOrders = (req, res, next) => {
  Order.find({'user.userId': req.user._id})
    .then(orders => {
      res.render('shop/orders', {
        path: '/orders',
        pageTitle: 'Your Orders',
        orders: orders
      });
    })
    .catch(err => console.log(err));
};

exports.getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;
  const invoiceName = 'invoice-' + orderId + '.pdf';
  const invoicePath = path.join('data', 'invoices', invoiceName);

  Order.findById(orderId)
  .then(order => {
    if (!order) {
      return next(new Error('No order found'));
    }
    if (order.user.userId.toString() !== req.user._id.toString()) {
      return next(new Error('Unauthorized'));
    } else {
      //below is bad practice for many/large files, 
      //because Node has to read the entire file into memory and 
      //then send it, should use a stream/buffer instead
    //   fs.readFile(invoicePath, (err, data) => {
    //     if(err) {
    //       return next(err)
    //     }
    //     res.setHeader('Content-Type', 'application/pdf');
    //     res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName +'"')
    //     res.send(data);
    //   })
    // }

      //using this stream/pipe method immediately forwards chunks of data
      //read through streams to the client, which will then combine into 
      //the complete file
      
      // const file = fs.createReadStream(invoicePath);
      // res.setHeader('Content-Type', 'application/pdf');
      // res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName +'"')
      // file.pipe(res);
      

      const pdfDoc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName +'"')
      //pipes data to filesystem
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      //pipes data(pdf) to client
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.fontSize(18).text('-------------------------------------');
      let totalPrice = 0;
      order.products.forEach(prod => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc.text(prod.product.title + ' - ' +prod.quantity +' x ' +'$' +prod.product.price)
      })
      pdfDoc.text('-------------------------------------');
      pdfDoc.fontSize(20).text('Total Price' +' - $' +totalPrice);
      pdfDoc.end();

    }
  })
  .catch(err => next(err));
  

  
}