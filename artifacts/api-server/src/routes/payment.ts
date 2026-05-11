import { Router } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";

const router = Router();

const RAZORPAY_KEY_ID = process.env["RAZORPAY_KEY_ID"];
const RAZORPAY_KEY_SECRET = process.env["RAZORPAY_KEY_SECRET"];

const PLANS: Record<string, { amount: number; durationDays: number }> = {
  premium: { amount: 4900, durationDays: 30 },
  annual: { amount: 39900, durationDays: 365 },
};

router.post("/payment/create-order", async (req, res) => {
  const { plan, userId } = req.body;

  const planConfig = PLANS[plan];
  if (!planConfig) {
    res.status(400).json({ error: "Invalid plan" });
    return;
  }

  if (!RAZORPAY_KEY_ID || !RAZORPAY_KEY_SECRET) {
    res.json({
      orderId: `order_mock_${Date.now()}`,
      keyId: "rzp_test_mock",
      amount: planConfig.amount,
      currency: "INR",
    });
    return;
  }

  const { default: Razorpay } = await import("razorpay");
  const razorpay = new Razorpay({
    key_id: RAZORPAY_KEY_ID,
    key_secret: RAZORPAY_KEY_SECRET,
  });

  const order = await razorpay.orders.create({
    amount: planConfig.amount,
    currency: "INR",
    receipt: `filmdhundo_${userId}_${Date.now()}`,
  });

  res.json({
    orderId: order.id,
    keyId: RAZORPAY_KEY_ID,
    amount: planConfig.amount,
    currency: "INR",
  });
});

router.post("/payment/verify", async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId, plan } = req.body;

  if (!RAZORPAY_KEY_SECRET) {
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db
      .insert(usersTable)
      .values({ userId: String(userId), isPremium: true, plan: String(plan), premiumExpiresAt: expiresAt })
      .onConflictDoUpdate({
        target: usersTable.userId,
        set: { isPremium: true, plan: String(plan), premiumExpiresAt: expiresAt },
      });

    res.json({
      success: true,
      message: "Premium Shuru Ho Gaya!",
      expiresAt: expiresAt.toISOString(),
    });
    return;
  }

  const body = `${razorpay_order_id}|${razorpay_payment_id}`;
  const expectedSignature = crypto
    .createHmac("sha256", RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    res.status(400).json({ success: false, message: "Payment verification failed" });
    return;
  }

  const planConfig = PLANS[plan] || PLANS["premium"];
  const expiresAt = new Date(Date.now() + planConfig.durationDays * 24 * 60 * 60 * 1000);

  await db
    .insert(usersTable)
    .values({ userId: String(userId), isPremium: true, plan: String(plan), premiumExpiresAt: expiresAt })
    .onConflictDoUpdate({
      target: usersTable.userId,
      set: { isPremium: true, plan: String(plan), premiumExpiresAt: expiresAt },
    });

  res.json({
    success: true,
    message: "Premium Shuru Ho Gaya!",
    expiresAt: expiresAt.toISOString(),
  });
});

export default router;
