"use client";

import { useState } from "react";
import Link from "next/link";
import MarketHeader from "@/components/MarketHeader";

type Currency = "INR" | "USDT";
type PaymentMethod = "upi" | "bank" | "card" | "paypal";

export default function DepositPage() {
  const [currency, setCurrency] = useState<Currency>("INR");
  const [method, setMethod] = useState<PaymentMethod>("upi");
  const [amount, setAmount] = useState("");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [bankAccount, setBankAccount] = useState("");
  const [ifscCode, setIfscCode] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setLoading(false);
    setSuccess(true);

    setTimeout(() => {
      setSuccess(false);
      setAmount("");
    }, 3000);
  };

  const minAmount = currency === "INR" ? 100 : 10;
  const maxAmount = currency === "INR" ? 100000 : 10000;

  return (
    <div className="min-h-screen bg-background">
      <MarketHeader />
      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/wallet" className="text-color-muted hover:text-foreground">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">Deposit Funds</h1>
            <p className="mt-1 text-sm text-color-muted">
              Add money to your wallet using various payment methods
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
          {/* Main Form */}
          <div className="rounded-3xl border border-color-border bg-color-surface p-8 shadow-lg">
            {success && (
              <div className="mb-6 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-emerald-200">
                ✓ Deposit request submitted successfully! Processing...
              </div>
            )}

            <form onSubmit={handleDeposit} className="space-y-6">
              {/* Currency Selection */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-color-muted">
                  Select Currency
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setCurrency("INR")}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      currency === "INR"
                        ? "border-accent bg-accent/10"
                        : "border-color-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-500/20 text-blue-400">
                        ₹
                      </div>
                      <div>
                        <p className="font-semibold">Indian Rupee</p>
                        <p className="text-xs text-color-muted">INR</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setCurrency("USDT")}
                    className={`rounded-lg border p-4 text-left transition-all ${
                      currency === "USDT"
                        ? "border-accent bg-accent/10"
                        : "border-color-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500/20 text-green-400">
                        $
                      </div>
                      <div>
                        <p className="font-semibold">Tether</p>
                        <p className="text-xs text-color-muted">USDT</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Amount Input */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-color-muted">
                  Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`Min: ${currency === "INR" ? "₹" : "$"}${minAmount}`}
                    min={minAmount}
                    max={maxAmount}
                    step={currency === "INR" ? "1" : "0.01"}
                    required
                    className="w-full rounded-lg border border-color-border bg-background px-4 py-3 pr-16 text-lg font-semibold focus:border-accent focus:outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-color-muted">
                    {currency}
                  </span>
                </div>
                <p className="mt-2 text-xs text-color-muted">
                  Limit: {currency === "INR" ? "₹" : "$"}
                  {minAmount.toLocaleString()} - {currency === "INR" ? "₹" : "$"}
                  {maxAmount.toLocaleString()}
                </p>
              </div>

              {/* Payment Method Selection */}
              <div>
                <label className="mb-3 block text-sm font-semibold text-color-muted">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setMethod("upi")}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      method === "upi"
                        ? "border-accent bg-accent/10"
                        : "border-color-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">📱</div>
                      <div>
                        <p className="text-sm font-semibold">UPI</p>
                        <p className="text-xs text-color-muted">Instant</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("bank")}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      method === "bank"
                        ? "border-accent bg-accent/10"
                        : "border-color-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🏦</div>
                      <div>
                        <p className="text-sm font-semibold">Bank Transfer</p>
                        <p className="text-xs text-color-muted">1-2 days</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("card")}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      method === "card"
                        ? "border-accent bg-accent/10"
                        : "border-color-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">💳</div>
                      <div>
                        <p className="text-sm font-semibold">Debit/Credit Card</p>
                        <p className="text-xs text-color-muted">Instant</p>
                      </div>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMethod("paypal")}
                    className={`rounded-lg border p-3 text-left transition-all ${
                      method === "paypal"
                        ? "border-accent bg-accent/10"
                        : "border-color-border hover:border-accent/50"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-2xl">🅿️</div>
                      <div>
                        <p className="text-sm font-semibold">PayPal</p>
                        <p className="text-xs text-color-muted">Instant</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Payment Details */}
              {method === "upi" && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-color-muted">
                    UPI ID
                  </label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@upi"
                    required
                    className="w-full rounded-lg border border-color-border bg-background px-4 py-3 focus:border-accent focus:outline-none"
                  />
                </div>
              )}

              {method === "bank" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-color-muted">
                      Bank Account Number
                    </label>
                    <input
                      type="text"
                      value={bankAccount}
                      onChange={(e) => setBankAccount(e.target.value)}
                      placeholder="1234567890"
                      required
                      className="w-full rounded-lg border border-color-border bg-background px-4 py-3 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-color-muted">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value)}
                      placeholder="SBIN0001234"
                      required
                      className="w-full rounded-lg border border-color-border bg-background px-4 py-3 focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {method === "card" && (
                <div className="space-y-4">
                  <div>
                    <label className="mb-3 block text-sm font-semibold text-color-muted">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      required
                      className="w-full rounded-lg border border-color-border bg-background px-4 py-3 focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-3 block text-sm font-semibold text-color-muted">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        maxLength={5}
                        required
                        className="w-full rounded-lg border border-color-border bg-background px-4 py-3 focus:border-accent focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="mb-3 block text-sm font-semibold text-color-muted">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        maxLength={3}
                        required
                        className="w-full rounded-lg border border-color-border bg-background px-4 py-3 focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {method === "paypal" && (
                <div>
                  <label className="mb-3 block text-sm font-semibold text-color-muted">
                    PayPal Email
                  </label>
                  <input
                    type="email"
                    value={paypalEmail}
                    onChange={(e) => setPaypalEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    className="w-full rounded-lg border border-color-border bg-background px-4 py-3 focus:border-accent focus:outline-none"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !amount}
                className="w-full rounded-lg bg-accent py-4 font-semibold text-black hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {loading ? "Processing..." : `Deposit ${currency === "INR" ? "₹" : "$"}${amount || "0"}`}
              </button>
            </form>
          </div>

          {/* Info Sidebar */}
          <div className="space-y-6">
            {/* Transaction Summary */}
            <div className="rounded-3xl border border-color-border bg-color-surface p-6 shadow-lg">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-color-muted">
                Transaction Summary
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-color-muted">Amount</span>
                  <span className="font-semibold">
                    {currency === "INR" ? "₹" : "$"}
                    {amount || "0"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-color-muted">Processing Fee</span>
                  <span className="font-semibold text-emerald-400">FREE</span>
                </div>
                <div className="border-t border-color-border pt-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">You&apos;ll receive</span>
                    <span className="text-lg font-bold text-accent">
                      {currency === "INR" ? "₹" : "$"}
                      {amount || "0"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Info */}
            <div className="rounded-3xl border border-color-border bg-color-surface p-6 shadow-lg">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-color-muted">
                Payment Information
              </h3>
              <div className="space-y-3 text-sm text-color-muted">
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <p>Instant deposits for UPI, Card & PayPal</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <p>Bank transfers processed within 1-2 business days</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <p>All transactions are secured & encrypted</p>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald-400">✓</span>
                  <p>Zero processing fees on all deposits</p>
                </div>
              </div>
            </div>

            {/* Recent Deposits */}
            <div className="rounded-3xl border border-color-border bg-color-surface p-6 shadow-lg">
              <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-color-muted">
                Recent Deposits
              </h3>
              <div className="space-y-3">
                {[
                  { amount: "5000", currency: "INR", method: "UPI", time: "2 hours ago" },
                  { amount: "100", currency: "USDT", method: "Card", time: "1 day ago" },
                ].map((deposit, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between rounded-lg border border-color-border p-3"
                  >
                    <div>
                      <p className="font-semibold">
                        {deposit.currency === "INR" ? "₹" : "$"}
                        {deposit.amount}
                      </p>
                      <p className="text-xs text-color-muted">{deposit.method}</p>
                    </div>
                    <span className="text-xs text-color-muted">{deposit.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
