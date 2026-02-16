# Shop / E-Commerce Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Introduce optional e-commerce capabilities for digital and physical products.

## Overview

### User Stories

- Admins can manage product catalog and pricing.
- Customers can purchase products securely.
- Admins can manage orders and fulfillment states.

### Success Criteria

- ✅ Product catalog CRUD
- ✅ Cart + checkout flow
- ✅ Payment integration (reuse Stripe)
- ✅ Order lifecycle management
- ✅ Basic tax/shipping hooks (as applicable)

## Scope

### In Scope

- MVP product catalog
- Stripe checkout-backed purchases
- Order record + status tracking

### Out of Scope

- Full ERP/inventory warehouse tooling
- Multi-vendor marketplace model

## Research Phase

1. Define product/order schema and SKU strategy.
2. Decide digital vs physical fulfillment flows.
3. Define tax/shipping strategy for MVP boundaries.

## Development Phase

1. Add product and order collections.
2. Build admin product/order management UI.
3. Build storefront/cart/checkout pages.
4. Add webhook-driven order state sync.

## Testing Phase

- Unit: cart and pricing calculations
- Integration: checkout session + order sync
- E2E: browse -> cart -> checkout -> confirmation

## Documentation

- `docs/user-guide/shop.md`
- `docs/development/order-lifecycle.md`

## Completion Checklist

- [ ] catalog + storefront complete
- [ ] checkout integration complete
- [ ] order management complete
- [ ] tests passing
- [ ] docs updated
