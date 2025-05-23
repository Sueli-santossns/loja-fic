const express = require('express');
const router = express.Router();
const Cart = require('../models/cart');
const { protect } = require('../middleware/authMiddleware');

// Adicionar item ao carrinho
router.post('/', protect, async (req, res) => {
  const { productId, quantity } = req.body;
  const userId = req.user._id;

  let cart = await Cart.findOne({ userId });

  if (!cart) {
    cart = new Cart({ userId, products: [{ productId, quantity }] });
  } else {
    const index = cart.products.findIndex(p => p.productId.toString() === productId);

    if (index >= 0) {
      cart.products[index].quantity += quantity;
    } else {
      cart.products.push({ productId, quantity });
    }
  }

  await cart.save();
  res.json(cart);
});

// Ver o carrinho do usuário logado
router.get('/', protect, async (req, res) => {
  const cart = await Cart.findOne({ userId: req.user._id }).populate('products.productId');
  res.json(cart || { products: [] });
});


// Atualizar a quantidade de um produto no carrinho
router.put('/:productId', protect, async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  if (quantity <= 0) {
    return res.status(400).json({ message: 'Quantidade inválida' });
  }

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Carrinho não encontrado' });

  const index = cart.products.findIndex(p => p.productId.toString() === productId);
  if (index === -1) return res.status(404).json({ message: 'Produto não encontrado no carrinho' });

  cart.products[index].quantity = quantity;
  await cart.save();
  res.json(cart);
});

// Remover um produto do carrinho
router.delete('/:productId', protect, async (req, res) => {
  const { productId } = req.params;

  let cart = await Cart.findOne({ userId: req.user._id });
  if (!cart) return res.status(404).json({ message: 'Carrinho não encontrado' });

  cart.products = cart.products.filter(p => p.productId.toString() !== productId);
  await cart.save();
  res.json(cart);
});

module.exports = router;
