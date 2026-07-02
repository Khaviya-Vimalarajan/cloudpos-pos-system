import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  cart: [],
  customer: null, // { id, name, phone }
  discountAmount: 0,
  taxRate: 0.1, // default 10% VAT
  heldOrders: [], // list of saved cart sessions
};

const posSlice = createSlice({
  name: 'pos',
  initialState,
  reducers: {
    addToCart: (state, action) => {
      const product = action.payload;
      const existingItem = state.cart.find((item) => item.productId === product._id);

      if (existingItem) {
        existingItem.quantity += 1;
        existingItem.total = (existingItem.price - existingItem.discount + existingItem.tax) * existingItem.quantity;
      } else {
        state.cart.push({
          productId: product._id,
          name: product.name,
          sku: product.sku,
          price: product.price,
          cost: product.cost,
          quantity: 1,
          discount: 0,
          tax: 0,
          total: product.price,
        });
      }
    },
    updateQuantity: (state, action) => {
      const { productId, quantity } = action.payload;
      const item = state.cart.find((item) => item.productId === productId);
      if (item) {
        item.quantity = Math.max(1, quantity);
        item.total = (item.price - item.discount + item.tax) * item.quantity;
      }
    },
    removeFromCart: (state, action) => {
      const productId = action.payload;
      state.cart = state.cart.filter((item) => item.productId !== productId);
    },
    updateItemDiscount: (state, action) => {
      const { productId, discount } = action.payload;
      const item = state.cart.find((item) => item.productId === productId);
      if (item) {
        item.discount = Math.max(0, discount);
        item.total = (item.price - item.discount + item.tax) * item.quantity;
      }
    },
    setCustomer: (state, action) => {
      state.customer = action.payload; // { id, name, phone }
    },
    clearCustomer: (state) => {
      state.customer = null;
    },
    setInvoiceDiscount: (state, action) => {
      state.discountAmount = Math.max(0, action.payload);
    },
    setTaxRate: (state, action) => {
      state.taxRate = Math.max(0, action.payload);
    },
    clearCart: (state) => {
      state.cart = [];
      state.customer = null;
      state.discountAmount = 0;
    },
    holdOrder: (state) => {
      if (state.cart.length === 0) return;
      state.heldOrders.push({
        id: 'HOLD-' + Math.floor(1000 + Math.random() * 9000),
        cart: [...state.cart],
        customer: state.customer,
        discountAmount: state.discountAmount,
        heldAt: new Date().toISOString(),
      });
      // Clear Cart
      state.cart = [];
      state.customer = null;
      state.discountAmount = 0;
    },
    resumeOrder: (state, action) => {
      const orderId = action.payload;
      const orderIndex = state.heldOrders.findIndex((o) => o.id === orderId);
      if (orderIndex !== -1) {
        const order = state.heldOrders[orderIndex];
        state.cart = order.cart;
        state.customer = order.customer;
        state.discountAmount = order.discountAmount;
        // Remove from held orders
        state.heldOrders.splice(orderIndex, 1);
      }
    },
    deleteHeldOrder: (state, action) => {
      const orderId = action.payload;
      state.heldOrders = state.heldOrders.filter((o) => o.id !== orderId);
    }
  },
});

export const {
  addToCart,
  updateQuantity,
  removeFromCart,
  updateItemDiscount,
  setCustomer,
  clearCustomer,
  setInvoiceDiscount,
  setTaxRate,
  clearCart,
  holdOrder,
  resumeOrder,
  deleteHeldOrder,
} = posSlice.actions;

export default posSlice.reducer;
