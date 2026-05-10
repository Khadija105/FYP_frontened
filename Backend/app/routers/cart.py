from datetime import datetime, timezone
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException

from .. import store
from ..deps import current_user, current_user_optional
from ..schemas import (
    CartCheckoutRequest,
    CouponRequest,
    CouponResponse,
    Order,
)

router = APIRouter(prefix="/api", tags=["cart"])

COUPONS = {"WELCOME10": 0.10, "SAVE20": 0.20, "ART15": 0.15}


@router.post("/cart/validate-coupon", response_model=CouponResponse)
def validate_coupon(payload: CouponRequest):
    code = (payload.code or "").strip().upper()
    if code not in COUPONS:
        raise HTTPException(status_code=400, detail="Invalid coupon code")
    return {"discount": COUPONS[code]}


def _item_unit_price(item: dict) -> float:
    if "price" in item:
        return float(item["price"])
    artwork = item.get("artwork") or {}
    if "price" in artwork:
        return float(artwork["price"])
    art_id = item.get("artworkId") or artwork.get("id")
    if art_id:
        art = next(
            (a for a in store.db()["artworks"] if a["id"] == art_id),
            None,
        )
        if art:
            return float(art["price"])
    return 0.0


@router.post("/cart/checkout", response_model=Order)
def checkout(
    payload: CartCheckoutRequest,
    user: Optional[dict] = Depends(current_user_optional),
):
    if not payload.items:
        raise HTTPException(status_code=400, detail="Cart is empty")
    subtotal = sum(_item_unit_price(i) * int(i.get("quantity") or 1) for i in payload.items)
    discount_rate = COUPONS.get((payload.couponCode or "").strip().upper(), 0.0)
    discount = subtotal * discount_rate
    tax = max(0.0, subtotal - discount) * 0.10
    total = subtotal - discount + tax

    order = {
        "id": store.next_id("order", "ORD_"),
        "userId": user["id"] if user else "guest",
        "items": payload.items,
        "subtotal": round(subtotal, 2),
        "discount": round(discount, 2),
        "tax": round(tax, 2),
        "total": round(total, 2),
        "status": "paid",
        "couponCode": payload.couponCode,
        "createdAt": datetime.now(timezone.utc).isoformat(),
    }
    store.db().setdefault("orders", []).append(order)
    store.save()
    return order


@router.get("/orders", response_model=List[Order])
def my_orders(user: dict = Depends(current_user)):
    return [o for o in store.db().get("orders", []) if o["userId"] == user["id"]]


@router.get("/orders/{order_id}", response_model=Order)
def get_order(order_id: str, user: dict = Depends(current_user)):
    order = next((o for o in store.db().get("orders", []) if o["id"] == order_id), None)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    if order["userId"] != user["id"] and user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Not your order")
    return order
