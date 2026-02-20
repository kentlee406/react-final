import { useState, useEffect, useContext } from "react";
import { useForm } from "react-hook-form";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap";
import { LoadingContext } from "../context/LoadingContext";
import { useNotification } from "../hooks/useNotification";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
function Cart() {
  const [cart, setCart] = useState([]);
  const [finalTotal, setFinalTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
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
      setCart(response.data.data.carts);
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

  return (
    <>
      <table className="table">
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
                <td>
                  <img
                    src={item.product.imageUrl || null}
                    alt={item.product.title}
                    width="100"
                  />
                </td>
                <td>{item.product.title}</td>
                <td>{item.product.price}</td>
                <td>
                  <div className="d-flex align-items-center">
                    <button
                      className="btn btn-secondary btn-sm me-2"
                      disabled={isLoading}
                      onClick={async () => {
                        const newQty = item.qty - 1;
                        if (newQty < 1) return;
                        try {
                          setIsLoading(true);
                          await axios.put(
                            `${API_BASE}/api/${API_PATH}/cart/${item.id}`,
                            {
                              data: {
                                product_id: item.product.id,
                                qty: newQty,
                              },
                            },
                          );
                          getCartData();
                        } catch {
                          showNotification(
                            "更新數量失敗，請稍後再試",
                            "error",
                            8000,
                          );
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      -
                    </button>
                    <span>{item.qty}</span>
                    <button
                      className="btn btn-secondary btn-sm ms-2"
                      disabled={isLoading}
                      onClick={async () => {
                        const newQty = item.qty + 1;
                        try {
                          setIsLoading(true);
                          await axios.put(
                            `${API_BASE}/api/${API_PATH}/cart/${item.id}`,
                            {
                              data: {
                                product_id: item.product.id,
                                qty: newQty,
                              },
                            },
                          );
                          getCartData();
                        } catch {
                          showNotification(
                            "更新數量失敗，請稍後再試",
                            "error",
                            8000,
                          );
                        } finally {
                          setIsLoading(false);
                        }
                      }}
                    >
                      +
                    </button>
                    <span className="ms-2">{item.product.unit}</span>
                  </div>
                </td>
                <td>{item.final_total}</td>
                <td>
                  <button
                    className="btn btn-danger btn-sm"
                    disabled={isLoading}
                    onClick={async () => {
                      if (!confirm("確定要刪除此項目嗎？")) return;
                      try {
                        setIsLoading(true);
                        await axios.delete(
                          `${API_BASE}/api/${API_PATH}/cart/${item.id}`,
                        );
                        getCartData();
                      } catch {
                        showNotification("刪除失敗，請稍後再試", "error", 8000);
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
          <tr>
            <td colSpan="4">
              <b>總金額</b>
            </td>
            <td>
              <b>{finalTotal}</b>
            </td>
            <td></td>
          </tr>
        </tbody>
      </table>

      <div className="mb-3">
        <button
          className="btn btn-outline-danger"
          disabled={cart.length === 0 || isLoading}
          onClick={async () => {
            if (!confirm("確定要清空購物車嗎？")) return;
            try {
              setIsLoading(true);
              await axios.delete(`${API_BASE}/api/${API_PATH}/carts`);
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
      </div>

      <div className="mt-4">
        <h3>結帳資訊</h3>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="mb-2">
            <label className="form-label">姓名</label>
            <input
              className="form-control"
              {...register("name", { required: "姓名為必填" })}
            />
            {errors.name && (
              <div className="text-danger">{errors.name.message}</div>
            )}
          </div>
          <div className="mb-2">
            <label className="form-label">電子郵件</label>
            <input
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
            <label className="form-label">地址</label>
            <input
              className="form-control"
              {...register("address", { required: "地址為必填" })}
            />
            {errors.address && (
              <div className="text-danger">{errors.address.message}</div>
            )}
          </div>
          <div className="mb-2">
            <label className="form-label">電話</label>
            <input
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
            <label className="form-label">備註</label>
            <textarea className="form-control" {...register("memo")} />
          </div>
          <button
            className="btn btn-success"
            type="submit"
            disabled={cart.length === 0 || isLoading}
          >
            送出訂單
          </button>
        </form>
      </div>
    </>
  );
}
export default Cart;
