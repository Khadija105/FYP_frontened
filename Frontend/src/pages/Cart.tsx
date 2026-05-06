import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { MainLayout, PageContainer } from "../layouts/MainLayout";
import { Button, Card, Input } from "../components/ui";
import { useTranslation } from "../hooks";
import { useCartStore } from "../store";
import { cartAPI } from "../services/api";

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { items, removeFromCart, clearCart, getTotal } = useCartStore();
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [couponError, setCouponError] = useState("");

  const subtotal = getTotal();
  const discountAmount = subtotal * discount;
  const tax = Math.max(0, subtotal - discountAmount) * 0.1;
  const total = subtotal - discountAmount + tax;

  const applyCoupon = async () => {
    setCouponError("");
    setIsLoading(true);
    try {
      const discountRate = await cartAPI.validateCoupon(couponCode);
      setDiscount(discountRate);
      setCouponCode("");
    } catch (error) {
      setCouponError("Invalid coupon code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const result = await cartAPI.checkout(items);
      clearCart();
      navigate(`/checkout-success?orderId=${result.orderId}`);
    } catch (error) {
      console.error("Checkout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MainLayout>
      <PageContainer className="pt-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-gray-900 dark:text-white mb-8"
        >
          {t("shoppingCart")}
        </motion.h1>

        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-3xl text-gray-600 dark:text-gray-400 mb-6">
              {t("emptyCart")}
            </p>
            <Button size="lg" onClick={() => navigate("/browse")}>
              {t("continueShopping")}
            </Button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              <div className="space-y-4">
                {items.map((item, idx) => (
                  <motion.div
                    key={item.artwork.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                  >
                    <Card className="p-6">
                      <div className="flex gap-4">
                        {/* Image */}
                        <motion.img
                          src={item.artwork.image}
                          alt={item.artwork.title}
                          className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg object-cover"
                        />

                        {/* Info */}
                        <div className="flex-1">
                          <motion.h3
                            whileHover={{ color: "#6366f1" }}
                            className="font-bold text-lg text-gray-900 dark:text-white cursor-pointer"
                            onClick={() => navigate(`/artwork/${item.artwork.id}`)}
                          >
                            {item.artwork.title}
                          </motion.h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            by {item.artwork.artist.name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {item.artwork.category}
                          </p>
                        </div>

                        {/* Price and Actions */}
                        <div className="text-right">
                          <p className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                            ${(item.artwork.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Qty: {item.quantity}
                          </p>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => removeFromCart(item.artwork.id)}
                            className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 font-semibold"
                          >
                            Remove
                          </motion.button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              {/* Continue Shopping */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-6"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate("/browse")}
                >
                  Continue Shopping
                </Button>
              </motion.div>
            </motion.div>

            {/* Summary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-1"
            >
              <Card className="p-6 sticky top-24">
                <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
                  Order Summary
                </h2>

                {/* Coupon */}
                <div className="mb-6">
                  <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">
                    Promo Code (try: WELCOME10 or SAVE20)
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="Enter code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      error={couponError}
                    />
                    <Button
                      variant="secondary"
                       size="md"
                      onClick={applyCoupon}
                      isLoading={isLoading}
                    >
                      Apply
                    </Button>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Subtotal
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${subtotal.toLocaleString()}
                    </span>
                  </div>

                  {discount > 0 && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-between text-green-600 dark:text-green-400"
                    >
                      <span>Discount ({Math.round(discount * 100)}%)</span>
                      <span>-${discountAmount.toLocaleString()}</span>
                    </motion.div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">
                      Tax (10%)
                    </span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${tax.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total */}
                <div className="mb-6 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                      ${total.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleCheckout}
                  isLoading={isLoading}
                >
                  Proceed to Checkout
                </Button>

                {/* Trust Badges */}
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                    <span className="block">✓ Secure payment</span>
                    <span className="block">✓ Money-back guarantee</span>
                    <span className="block">✓ Free shipping on orders 6K+</span>
                  </p>
                </div>
              </Card>
            </motion.div>
          </div>
        )}
      </PageContainer>
    </MainLayout>
  );
};

export default Cart;
