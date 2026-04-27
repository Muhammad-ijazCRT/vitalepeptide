"use client";

import "./checkout.css";

import Image from "next/image";
import Link from "next/link";
import { FormEvent, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useCart } from "../../components/cart-provider";
import { useAuth } from "../../contexts/auth-provider";
import { useToast } from "../../contexts/toast-provider";
import {
  checkout,
  completeInvoicePayment,
  fetchInvoicePreview,
  previewCheckoutCoupon,
  type InvoicePreviewResult,
} from "../../lib/api";

type AppliedCoupon = { code: string; discount: number; subtotal: number; total: number };

function InvoiceCheckoutPanel({ token }: { token: string }) {
  const toast = useToast();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [preview, setPreview] = useState<InvoicePreviewResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const cancelledToast = useRef(false);

  useEffect(() => {
    if (cancelledToast.current) return;
    if (searchParams.get("cancelled") === "1") {
      cancelledToast.current = true;
      toast.info("You returned from the payment page without completing payment.");
    }
  }, [searchParams, toast]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const res = await fetchInvoicePreview(token);
      if (cancelled) return;
      setPreview(res);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  async function onContinue() {
    setSubmitting(true);
    const res = await completeInvoicePayment(token);
    setSubmitting(false);
    if (!res.success) {
      toast.error(res.message);
      return;
    }
    if (res.emailSent === false) {
      toast.info(
        "Pay-now email was not sent (SMTP not configured in the store). You can still complete payment on the next page."
      );
      await new Promise((r) => setTimeout(r, 450));
    }
    window.location.assign(res.paymentUrl);
  }

  return (
    <main className="checkout-page py-4 py-lg-5">
      <div className="container checkout-page__container" style={{ maxWidth: 560 }}>
        <h1 className="h5 fw-semibold mb-2">Payment</h1>
        {loading ? (
          <p className="text-secondary small">Loading payment link…</p>
        ) : !preview || !preview.ok ? (
          <div className="checkout-empty">
            <p className="mb-2">{!preview ? "Could not load this link." : preview.message}</p>
            <Link href="/shop" className="text-decoration-none">
              Back to store
            </Link>
          </div>
        ) : (
          <div className="checkout-summary" style={{ marginTop: 0 }}>
            <p className="checkout-summary__label mb-2">{preview.displayLabel}</p>
            {preview.customerName ? (
              <p className="small text-secondary mb-3">
                Hello, {preview.customerName}
              </p>
            ) : null}
            <div className="checkout-summary__total mb-3">
              <span>Amount due</span>
              <span>
                {preview.currency.toUpperCase()} ${preview.amount.toFixed(2)}
              </span>
            </div>
            <p className="small text-secondary mb-3">
              When you continue, you will open our cryptocurrency checkout (NOWPayments) to complete this payment.
            </p>
            <button type="button" className="checkout-submit w-100" disabled={submitting} onClick={onContinue}>
              {submitting ? "Starting…" : "Continue"}
            </button>
            <p className="small text-secondary text-center mt-3 mb-0">
              <Link href="/shop" className="text-decoration-none">
                Cancel and return to store
              </Link>
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function CheckoutPageInner() {
  const searchParams = useSearchParams();
  const invoiceToken = searchParams.get("invoice")?.trim() ?? "";
  const { items, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const { token } = useAuth();
  const toast = useToast();
  const cancelledToastShown = useRef(false);
  /** Avoid swapping to "empty cart" UI before `window.location` runs (clearCart would unmount the form). */
  const redirectingToPayment = useRef(false);
  const [coupon, setCoupon] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null);
  const [couponApplying, setCouponApplying] = useState(false);

  const itemsFingerprint = useMemo(
    () => JSON.stringify(items.map((i) => ({ id: i.product.id, q: i.quantity }))),
    [items]
  );

  useEffect(() => {
    setAppliedCoupon(null);
  }, [itemsFingerprint]);

  useEffect(() => {
    if (cancelledToastShown.current) return;
    if (searchParams.get("cancelled") === "1") {
      cancelledToastShown.current = true;
      toast.info("You returned from the payment page without completing payment.");
    }
  }, [searchParams, toast]);

  const itemCount = useMemo(() => items.reduce((s, i) => s + i.quantity, 0), [items]);
  const cartSubtotal = total;
  const couponDiscount = appliedCoupon?.discount ?? 0;
  const grandTotal = appliedCoupon ? appliedCoupon.total : cartSubtotal;

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (items.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    const form = new FormData(event.currentTarget);
    const payload = {
      fullName: String(form.get("fullName") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      addressLine1: String(form.get("addressLine1") ?? ""),
      city: String(form.get("city") ?? ""),
      country: String(form.get("country") ?? ""),
      postalCode: String(form.get("postalCode") ?? ""),
      items: items.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
      })),
      ...(appliedCoupon ? { couponCode: appliedCoupon.code } : {}),
    };

    const response = await checkout(payload, token);
    if (response?.success) {
      const paymentUrl = typeof response.paymentUrl === "string" ? response.paymentUrl.trim() : "";
      if (paymentUrl.length > 0) {
        redirectingToPayment.current = true;
        clearCart();
        window.location.assign(paymentUrl);
        return;
      }
      const err =
        typeof response.paymentError === "string" && response.paymentError.trim().length > 0
          ? response.paymentError.trim()
          : "Payment link could not be created. Your cart was not cleared.";
      toast.error(err);
      return;
    }
    const msg =
      typeof response?.message === "string"
        ? response.message
        : typeof response === "object" && response !== null && "issues" in response
          ? "Please check the form and try again."
          : "Checkout failed.";
    toast.error(msg);
  }

  async function applyCoupon() {
    const c = coupon.trim().toUpperCase();
    if (!c) {
      toast.error("Enter a coupon code.");
      return;
    }
    if (items.length === 0) return;
    setCouponApplying(true);
    const res = await previewCheckoutCoupon({
      code: c,
      items: items.map((item) => ({ productId: item.product.id, quantity: item.quantity })),
    });
    setCouponApplying(false);
    if (!res.success) {
      toast.error(res.message);
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon({
      code: res.couponCode ?? c,
      discount: res.discount,
      subtotal: res.subtotal,
      total: res.total,
    });
    toast.success(`Coupon applied (−$${res.discount.toFixed(2)})`);
  }

  if (invoiceToken.length >= 16) {
    return <InvoiceCheckoutPanel token={invoiceToken} />;
  }

  if (items.length === 0 && redirectingToPayment.current) {
    return (
      <main className="checkout-page py-5">
        <div className="container checkout-page__container text-center py-5">
          <p className="h6 mb-2">Redirecting to payment</p>
          <p className="text-secondary small mb-0">Opening NOWPayments in this window…</p>
        </div>
      </main>
    );
  }

  if (items.length === 0 && !redirectingToPayment.current) {
    return (
      <main className="checkout-page py-5">
        <div className="container checkout-page__container">
          <div className="checkout-empty">
            <h1 className="h5 mb-2">Your cart is empty</h1>
            <p className="text-secondary small mb-3">Add products from the store to check out.</p>
            <Link href="/shop" className="text-decoration-none">
              Continue shopping
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="checkout-page py-4 py-lg-5">
      <div className="container checkout-page__container">
        <h1 className="visually-hidden">Checkout</h1>
        <form onSubmit={onSubmit}>
          <div className="row g-4 g-xl-5">
            <div className="col-lg-7">
              <div className="checkout-order-head">
                <p className="checkout-order-head__title mb-0">
                  Your order · {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
                <Link href="/shop" className="checkout-order-head__link">
                  Continue shopping
                </Link>
              </div>

              {items.map((item) => (
                <div key={item.product.id} className="checkout-line">
                  <div className="checkout-line__media d-flex align-items-center justify-content-center">
                    <Image src={item.product.imageUrl} alt="" width={72} height={72} className="object-fit-contain p-1" />
                  </div>
                  <div className="checkout-line__body">
                    <p className="checkout-line__name">{item.product.name}</p>
                    <p className="checkout-line__unit">${item.product.price.toFixed(2)} each</p>
                    <div className="checkout-line__row">
                      <div className="checkout-line__qty">
                        <button type="button" aria-label="Decrease quantity" disabled={item.quantity <= 1} onClick={() => updateQuantity(item.product.id, item.quantity - 1)}>
                          −
                        </button>
                        <span>{item.quantity}</span>
                        <button type="button" aria-label="Increase quantity" disabled={item.quantity >= 99} onClick={() => updateQuantity(item.product.id, item.quantity + 1)}>
                          +
                        </button>
                      </div>
                      <button type="button" className="checkout-line__remove" onClick={() => removeFromCart(item.product.id)}>
                        Remove
                      </button>
                      <span className="checkout-line__price">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              ))}

              <p className="checkout-section-title">Shipping &amp; contact</p>

              <div className="checkout-field">
                <label htmlFor="co-email">Email</label>
                <input id="co-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="checkout-field">
                <label htmlFor="co-name">Full name</label>
                <input id="co-name" name="fullName" autoComplete="name" required />
              </div>
              <div className="checkout-field">
                <label htmlFor="co-phone">Phone</label>
                <input id="co-phone" name="phone" type="tel" autoComplete="tel" required />
              </div>
              <div className="checkout-field">
                <label htmlFor="co-address">Street address</label>
                <input id="co-address" name="addressLine1" autoComplete="street-address" required />
              </div>
              <div className="checkout-field">
                <label htmlFor="co-country">Country</label>
                <input id="co-country" name="country" autoComplete="country-name" required />
              </div>
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="checkout-field mb-0">
                    <label htmlFor="co-city">City</label>
                    <input id="co-city" name="city" autoComplete="address-level2" required />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="checkout-field mb-0">
                    <label htmlFor="co-postal">Postal code</label>
                    <input id="co-postal" name="postalCode" autoComplete="postal-code" required />
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-5">
              <div className="checkout-summary">
                <p className="checkout-summary__label">Order summary</p>
                <div className="checkout-summary__row">
                  <span>Subtotal</span>
                  <span>${cartSubtotal.toFixed(2)}</span>
                </div>
                {couponDiscount > 0 ? (
                  <div className="checkout-summary__row text-success">
                    <span>Coupon ({appliedCoupon?.code})</span>
                    <span>−${couponDiscount.toFixed(2)}</span>
                  </div>
                ) : null}
                <div className="checkout-summary__row checkout-summary__row--muted">
                  <span>Shipping</span>
                  <span>Calculated at fulfillment</span>
                </div>
                <div className="checkout-summary__total">
                  <span>Total</span>
                  <span>${grandTotal.toFixed(2)}</span>
                </div>

                <div className="checkout-coupon">
                  <input type="text" placeholder="Enter code" value={coupon} onChange={(e) => setCoupon(e.target.value)} aria-label="Coupon code" />
                  <button type="button" onClick={applyCoupon} disabled={couponApplying}>
                    {couponApplying ? "…" : "Apply"}
                  </button>
                </div>

                <p className="checkout-summary__label" style={{ marginTop: "0.5rem" }}>
                  Payment
                </p>

                <div className="checkout-pay-method">
                  <div className="checkout-pay-method__title">NowPayments</div>
                  <p className="checkout-pay-method__desc mb-0">
                    Pay with cryptocurrency through NowPayments. After you place your order, you will continue in the crypto payment flow.
                  </p>
                </div>

                <p className="checkout-due">${grandTotal.toFixed(2)} due</p>
                <button type="submit" className="checkout-submit">
                  Continue to payment
                </button>
                <p className="small text-secondary text-center mt-3 mb-0">
                  Secure checkout. Your order is recorded as pending until payment is confirmed.
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<main className="checkout-page py-5" />}>
      <CheckoutPageInner />
    </Suspense>
  );
}
