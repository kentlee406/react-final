import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import axios from "axios";
import "bootstrap";
import { LoadingContext } from "../context/loadingContext";
import { useNotification } from "../hooks/useNotification";
import { formatPrice } from "../utils/formatPrice";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
function Cart() {
  const [cart, setCart] = useState([]);
  const [finalTotal, setFinalTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [qtyDrafts, setQtyDrafts] = useState({});
  const [updatingItemId, setUpdatingItemId] = useState("");
  const [checkoutStep, setCheckoutStep] = useState(1);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      showLoading();
      setIsLoading(true);
      const payload = {
        data: {
          user: {
            name: data.name,
            email: data.email,
            tel: data.telephone,
            address: data.address,
          },
          message: data.memo || "",
        },
      };
      await axios.post(`${API_BASE}/api/${API_PATH}/order`, payload);
      showNotification("訂單送出成功", "success", 6000);
      reset();
      getCartData();
      setCheckoutStep(3);
    } catch {
      showNotification("送出訂單失敗，請稍後再試", "error", 8000);
      hideLoading();
    } finally {
      setIsLoading(false);
    }
  };
  const getCartData = async () => {
    try {
      showLoading();
      const response = await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
      const carts = response.data.data.carts;
      setCart(carts);
      setQtyDrafts(
        carts.reduce((drafts, item) => {
          drafts[item.id] = item.qty;
          return drafts;
        }, {}),
      );
      setFinalTotal(response.data.data.final_total);
    } catch {
      showNotification("取得購物車資料失敗，請稍後再試", "error", 8000);
    } finally {
      hideLoading();
    }
  };
  useEffect(() => {
    getCartData();
  }, []);

  const handleUpdateCartQty = async (item) => {
    const nextQty = Number(qtyDrafts[item.id]);

    if (!Number.isInteger(nextQty) || nextQty < 1) {
      showNotification("數量至少要 1 件", "error", 6000);
      setQtyDrafts((prev) => ({ ...prev, [item.id]: item.qty }));
      return;
    }

    if (nextQty === item.qty) {
      return;
    }

    try {
      setUpdatingItemId(item.id);
      setIsLoading(true);
      await axios.put(`${API_BASE}/api/${API_PATH}/cart/${item.id}`, {
        data: {
          product_id: item.product.id,
          qty: nextQty,
        },
      });
      showNotification("數量更新成功", "success", 5000);
      await getCartData();
    } catch {
      showNotification("更新數量失敗，請稍後再試", "error", 8000);
    } finally {
      setUpdatingItemId("");
      setIsLoading(false);
    }
  };

  const handleBackToCart = () => {
    setCheckoutStep(1);
  };

  const handleGoToCheckoutForm = () => {
    setCheckoutStep(2);
  };

  return (
    <>
      <div className="d-flex gap-2 mb-3">
        <span
          className={`badge ${checkoutStep === 1 ? "bg-success" : "bg-secondary"}`}
        >
          1. 確認購物車
        </span>
        <span
          className={`badge ${checkoutStep === 2 ? "bg-success" : "bg-secondary"}`}
        >
          2. 填寫資料
        </span>
        <span
          className={`badge ${checkoutStep === 3 ? "bg-success" : "bg-secondary"}`}
        >
          3. 完成購買
        </span>
      </div>

      {checkoutStep === 1 && (
        <>
          <table className="table cart-responsive-table">
            <thead>
              <tr>
                <th colSpan="2">產品</th>
                <th>單價</th>
                <th>數量</th>
                <th>價格</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {cart.length > 0 ? (
                cart.map((item) => (
                  <tr key={item.id}>
                    <td data-label="產品主圖">
                      <img
                        src={item.product.imageUrl || null}
                        alt={item.product.title}
                        width="100"
                      />
                    </td>
                    <td data-label="產品名稱">{item.product.title}</td>
                    <td data-label="單價">{formatPrice(item.product.price)}</td>
                    <td data-label="數量">
                      <div className="d-flex align-items-center gap-2">
                        <input
                          type="number"
                          min="1"
                          className="form-control form-control-sm"
                          style={{ maxWidth: "84px" }}
                          value={qtyDrafts[item.id] ?? item.qty}
                          disabled={isLoading}
                          onChange={(e) =>
                            setQtyDrafts((prev) => ({
                              ...prev,
                              [item.id]: e.target.value,
                            }))
                          }
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          disabled={isLoading || updatingItemId === item.id}
                          onClick={() => handleUpdateCartQty(item)}
                        >
                          {updatingItemId === item.id ? "更新中..." : "更新"}
                        </button>
                        <span className="ms-2">{item.product.unit}</span>
                      </div>
                    </td>
                    <td data-label="價格">{formatPrice(item.final_total)}</td>
                    <td data-label="操作">
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        disabled={isLoading}
                        onClick={async () => {
                          if (!confirm("確定要刪除此項目嗎？")) return;
                          try {
                            setIsLoading(true);
                            await axios.delete(
                              `${API_BASE}/api/${API_PATH}/cart/${item.id}`,
                            );
                            showNotification(
                              "已刪除購物車品項",
                              "success",
                              5000,
                            );
                            getCartData();
                          } catch {
                            showNotification(
                              "刪除失敗，請稍後再試",
                              "error",
                              8000,
                            );
                          } finally {
                            setIsLoading(false);
                          }
                        }}
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6">購物車已清空</td>
                </tr>
              )}
              <tr className="cart-total-row">
                <td colSpan="4">
                  <b>總金額</b>
                </td>
                <td>
                  <b>{formatPrice(finalTotal)}</b>
                </td>
                <td></td>
              </tr>
            </tbody>
          </table>

          <div className="mb-3">
            <button
              type="button"
              className="btn btn-outline-danger"
              disabled={cart.length === 0 || isLoading}
              onClick={async () => {
                if (!confirm("確定要清空購物車嗎？")) return;
                try {
                  setIsLoading(true);
                  await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);
                  showNotification("購物車已清空", "success", 5000);
                  getCartData();
                } catch {
                  showNotification("清空購物車失敗，請稍後再試", "error", 8000);
                } finally {
                  setIsLoading(false);
                }
              }}
            >
              清空購物車
            </button>
            <button
              type="button"
              className="btn btn-success ms-2"
              disabled={cart.length === 0 || isLoading}
              onClick={handleGoToCheckoutForm}
            >
              下一步：填寫資料
            </button>
          </div>
        </>
      )}

      {checkoutStep === 2 && (
        <div className="mt-4">
          <h3>結帳資訊</h3>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-2">
              <label htmlFor="checkout-name" className="form-label">
                姓名
              </label>
              <input
                id="checkout-name"
                type="text"
                className="form-control"
                {...register("name", { required: "姓名為必填" })}
              />
              {errors.name && (
                <div className="text-danger">{errors.name.message}</div>
              )}
            </div>
            <div className="mb-2">
              <label htmlFor="checkout-email" className="form-label">
                電子郵件
              </label>
              <input
                id="checkout-email"
                type="email"
                className="form-control"
                {...register("email", {
                  required: "Email 為必填",
                  pattern: {
                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                    message: "請輸入正確的 Email",
                  },
                })}
              />
              {errors.email && (
                <div className="text-danger">{errors.email.message}</div>
              )}
            </div>
            <div className="mb-2">
              <label htmlFor="checkout-address" className="form-label">
                地址
              </label>
              <input
                id="checkout-address"
                type="text"
                className="form-control"
                {...register("address", { required: "地址為必填" })}
              />
              {errors.address && (
                <div className="text-danger">{errors.address.message}</div>
              )}
            </div>
            <div className="mb-2">
              <label htmlFor="checkout-telephone" className="form-label">
                電話
              </label>
              <input
                id="checkout-telephone"
                type="tel"
                className="form-control"
                {...register("telephone", {
                  required: "電話為必填",
                  pattern: {
                    value: /^[0-9]{10}$/,
                    message: "請輸入 10 位數字，如 0912345678",
                  },
                })}
              />
              {errors.telephone && (
                <div className="text-danger">{errors.telephone.message}</div>
              )}
            </div>
            <div className="mb-2">
              <label htmlFor="checkout-memo" className="form-label">
                備註
              </label>
              <textarea
                id="checkout-memo"
                className="form-control"
                {...register("memo")}
              />
            </div>
            <button
              className="btn btn-success"
              type="submit"
              disabled={cart.length === 0 || isLoading}
            >
              送出訂單
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary ms-2"
              onClick={handleBackToCart}
              disabled={isLoading}
            >
              上一步：返回購物車
            </button>
          </form>
        </div>
      )}

      {checkoutStep === 3 && (
        <div className="mt-4 border rounded p-4 bg-light">
          <h3 className="fw-bold">訂單已完成</h3>
          <p className="mb-3">感謝你的購買，我們將儘速處理出貨。</p>
          <Link to="/products" className="btn btn-success me-2">
            繼續購物
          </Link>
          <button
            type="button"
            className="btn btn-outline-secondary"
            onClick={handleBackToCart}
          >
            返回購物車頁
          </button>
        </div>
      )}
    </>
  );
}
export default Cart;
