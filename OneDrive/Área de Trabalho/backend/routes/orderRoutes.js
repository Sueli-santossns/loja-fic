const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Cart = require('../models/cart');
const { protect } = require('../middleware/authMiddleware');

// Criar pedido (finalizar)
router.post('/', protect, async (req, res) => {
  const userId = req.user._id;
  const cart = await Cart.findOne({ userId }).populate('products.productId');
  if (!cart || cart.products.length === 0) {
    return res.status(400).json({ message: 'Carrinho vazio' });
  }

  const total = cart.products.reduce((sum, p) => sum + p.quantity * p.productId.price, 0);

  const order = new Order({
    userId,
    products: cart.products.map(p => ({
      productId: p.productId._id,
      quantity: p.quantity
    })),
    total
  });

  await order.save();
  await Cart.findOneAndDelete({ userId });

  res.status(201).json(order);
});

// Ver pedidos do usuário
router.get('/', protect, async (req, res) => {
  const orders = await Order.find({ userId: req.user._id }).populate('products.productId');
  res.json(orders);
});

module.exports = router;
