# Subscriptions (Stripe) Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Implement secure paid subscriptions with Stripe for recurring billing.

## Overview

### User Stories

- Readers can subscribe to paid plans.
- Subscribers can manage billing and cancel/reactivate.
- Admins can manage plans and view subscription status.

### Success Criteria

- ✅ Stripe Checkout + Billing Portal integration
- ✅ Webhook-driven subscription state sync
- ✅ Tier model mapped to user access
- ✅ Failed payment and cancellation handling
- ✅ Security and compliance checks in place

## Scope

### In Scope

- Monthly/annual plans
- Trial support (optional)
- Webhook signature verification

### Out of Scope

- Multi-gateway billing
- Complex enterprise invoicing

## Research Phase

1. Finalize subscription tier model and entitlements.
2. Define Stripe product/price mapping strategy.
3. Define webhook event handling matrix.

## Development Phase

1. Add subscription collections/fields and migrations.
2. Implement checkout session + billing portal endpoints.
3. Implement webhook handler with idempotency.
4. Sync user access tier from webhook state.

## Testing Phase

- Unit: signature verification + event mapping
- Integration: checkout creation and webhook transitions
- E2E: subscribe/cancel/reactivate core paths
- Security: replay/idempotency tests

## Documentation

- `docs/user-guide/subscriptions.md`
- `docs/development/stripe-webhooks.md`

## Completion Checklist

- [ ] checkout + portal complete
- [ ] webhook sync complete
- [ ] entitlement mapping complete
- [ ] tests passing
- [ ] docs updated
