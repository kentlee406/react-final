import { useEffect, useState, useContext, useCallback, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { LoadingContext } from "../../context/loadingContext";
import { useNotification } from "../../hooks/useNotification";
import { clearAuthToken, getAuthToken } from "../../utils/authToken";
import DeleteOrderModal from "../../component/DeleteOrderModal";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function AdminOrder() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();
  const [ordersResponse, setOrdersResponse] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [tempOrder, setTempOrder] = useState(null);
  const [isDeletingAll, setIsDeletingAll] = useState(false);
  const [updatingOrderId, setUpdatingOrderId] = useState("");
  const hasInitialized = useRef(false);

  const orders = ordersResponse?.orders || [];

  const formatDateTime = (unixTimestamp) => {
    if (!unixTimestamp) return "-";

    const date = new Date(unixTimestamp * 1000);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  const formatPrice = (value = 0) => {
    return Number(value).toLocaleString("zh-TW");
  };

  const getOrdersData = useCallback(
    async (shouldHandleLoading = true) => {
      try {
        if (shouldHandleLoading) {
          showLoading();
        }

        const response = await axios.get(
          `${API_BASE}/api/${API_PATH}/admin/orders`,
        );
        setOrdersResponse(response.data);
        return response.data;
      } catch {
        showNotification("取得訂單資料失敗，請稍後再試", "error", 8000);
        return null;
      } finally {
        if (shouldHandleLoading) {
          hideLoading();
        }
      }
    },
    [showLoading, hideLoading, showNotification],
  );

  const handleTogglePaid = async (orderId, nextIsPaid) => {
    try {
      setUpdatingOrderId(orderId);
      showLoading();
      await axios.put(`${API_BASE}/api/${API_PATH}/admin/order/${orderId}`, {
        data: {
          is_paid: nextIsPaid,
        },
      });

      const refreshedData = await getOrdersData(false);
      if (selectedOrder?.id === orderId && refreshedData?.orders) {
        const refreshedOrder = refreshedData.orders.find(
          (order) => order.id === orderId,
        );
        setSelectedOrder(refreshedOrder || null);
      }

      showNotification("訂單付款狀態已更新", "success", 5000);
    } catch {
      showNotification("更新付款狀態失敗，請稍後再試", "error", 8000);
    } finally {
      hideLoading();
      setUpdatingOrderId("");
    }
  };

  const handleDeleteAllOrders = async () => {
    const hasOrders = ordersResponse?.orders?.length > 0;

    if (!hasOrders) {
      showNotification("目前沒有訂單可刪除", "error", 5000);
      return;
    }

    try {
      setIsDeletingAll(true);
      showLoading();
      await axios.delete(`${API_BASE}/api/${API_PATH}/admin/orders/all`);
      showNotification("已刪除全部訂單", "success", 5000);
      await getOrdersData(false);
      setSelectedOrder(null);
    } catch {
      showNotification("刪除全部訂單失敗，請稍後再試", "error", 8000);
    } finally {
      hideLoading();
      setIsDeletingAll(false);
    }
  };

  const handleLogout = async () => {
    try {
      showLoading();
      await axios.post(`${API_BASE}/logout`);

      clearAuthToken();
      axios.defaults.headers.common.Authorization = "";

      navigate("/login");
    } catch {
      showNotification("登出失敗，請稍後再試", "error", 8000);
    } finally {
      hideLoading();
    }
  };

  const initializeAdminData = useCallback(async () => {
    const token = getAuthToken();

    if (!token) {
      showNotification("登入狀態已失效，請重新登入", "error", 8000);
      navigate("/login");
      return;
    }

    try {
      showLoading();
      axios.defaults.headers.common.Authorization = token;
      await axios.post(`${API_BASE}/api/user/check`);
      await getOrdersData(false);
    } catch {
      axios.defaults.headers.common.Authorization = "";
      showNotification("登入狀態已失效，請重新登入", "error", 8000);
      navigate("/login");
    } finally {
      hideLoading();
    }
  }, [navigate, showLoading, hideLoading, getOrdersData]);

  useEffect(() => {
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;
    initializeAdminData();
  }, [initializeAdminData]);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-10">
          <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2 mb-3">
            <h2 className="fw-bold w-100 w-lg-auto mb-0">訂單管理</h2>
            <div className="d-flex flex-column flex-sm-row flex-wrap gap-2 w-100 w-lg-auto">
              <button
                type="button"
                className="btn btn-danger header-nav-btn"
                data-bs-toggle="modal"
                data-bs-target="#deleteAllOrdersModal"
                disabled={isDeletingAll}
              >
                {isDeletingAll ? "刪除中..." : "刪除全部訂單"}
              </button>
              <button
                className="btn btn-secondary header-nav-btn"
                onClick={() => navigate("/admin/product")}
              >
                返回產品列表
              </button>
              <button
                className="btn btn-danger header-nav-btn"
                onClick={handleLogout}
              >
                登出
              </button>
            </div>
          </div>

          <table className="table align-middle admin-responsive-table">
            <thead>
              <tr>
                <th>訂單建立日期</th>
                <th>訂購人姓名</th>
                <th>訂購總額</th>
                <th>是否已付款</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order) => (
                  <tr key={order.id}>
                    <td data-label="訂單建立日期">
                      {formatDateTime(order.create_at)}
                    </td>
                    <td data-label="訂購人姓名">{order.user?.name || "-"}</td>
                    <td data-label="訂購總額">${formatPrice(order.total)}</td>
                    <td data-label="是否已付款">
                      <div className="form-check form-switch m-0">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          role="switch"
                          id={`isPaid-${order.id}`}
                          checked={!!order.is_paid}
                          disabled={updatingOrderId === order.id}
                          onChange={(e) =>
                            handleTogglePaid(order.id, e.target.checked)
                          }
                        />
                        <label
                          className="form-check-label"
                          htmlFor={`isPaid-${order.id}`}
                        >
                          {order.is_paid ? "已付款" : "未付款"}
                        </label>
                      </div>
                    </td>
                    <td data-label="操作">
                      <button
                        type="button"
                        className="btn btn-primary me-2"
                        data-bs-toggle="modal"
                        data-bs-target="#orderDetailModal"
                        onClick={() => setSelectedOrder(order)}
                      >
                        查看訂單細目
                      </button>
                      <button
                        type="button"
                        className="btn btn-danger"
                        data-bs-toggle="modal"
                        data-bs-target="#deleteOrderModal"
                        onClick={() => setTempOrder(order)}
                      >
                        刪除訂單
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5">目前尚無訂單資料</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div
        className="modal fade"
        id="orderDetailModal"
        tabIndex="-1"
        aria-labelledby="orderDetailModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className="modal-header">
              <h5 className="modal-title fw-bold" id="orderDetailModalLabel">
                訂單細目
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {selectedOrder ? (
                <div className="container-fluid">
                  <div className="row g-3">
                    <div className="col-12 col-lg-6">
                      <div className="border rounded p-3 h-100">
                        <h6 className="fw-bold">訂購人資料</h6>
                        <p className="mb-1">
                          姓名：{selectedOrder.user?.name || "-"}
                        </p>
                        <p className="mb-1">
                          電子郵件：{selectedOrder.user?.email || "-"}
                        </p>
                        <p className="mb-1">
                          地址：{selectedOrder.user?.address || "-"}
                        </p>
                        <p className="mb-0">
                          電話：{selectedOrder.user?.tel || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="col-12 col-lg-6">
                      <div className="border rounded p-3 h-100">
                        <h6 className="fw-bold">訂單資料</h6>
                        <p className="mb-1">
                          訂單編號：{selectedOrder.id || "-"}
                        </p>
                        <p className="mb-1">
                          建立時間：{formatDateTime(selectedOrder.create_at)}
                        </p>
                        <div className="mb-2 d-flex align-items-center">
                          <span className="me-2">是否付款：</span>
                          <div className="form-check form-switch m-0">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              role="switch"
                              id="detail-is-paid"
                              checked={!!selectedOrder.is_paid}
                              disabled={updatingOrderId === selectedOrder.id}
                              onChange={(e) =>
                                handleTogglePaid(
                                  selectedOrder.id,
                                  e.target.checked,
                                )
                              }
                            />
                            <label
                              className="form-check-label"
                              htmlFor="detail-is-paid"
                            >
                              {selectedOrder.is_paid ? "已付款" : "未付款"}
                            </label>
                          </div>
                        </div>
                        <p className="mb-1 fw-bold">
                          訂單總金額：${formatPrice(selectedOrder.total)}
                        </p>
                        <p className="mb-0">
                          備註：{selectedOrder.message || "-"}
                        </p>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="border rounded p-3">
                        <h6 className="fw-bold">訂單細目</h6>
                        <table className="table align-middle mb-0">
                          <thead>
                            <tr>
                              <th>產品主圖</th>
                              <th>產品名稱</th>
                              <th>產品類別</th>
                              <th>訂購數量</th>
                              <th>單價</th>
                              <th>金額</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.values(selectedOrder.products || {})
                              .length > 0 ? (
                              Object.values(selectedOrder.products || {}).map(
                                (item) => {
                                  const amount =
                                    item.final_total ||
                                    item.total ||
                                    Number(item.qty || 0) *
                                      Number(item.product?.price || 0);

                                  return (
                                    <tr key={item.id || item.product_id}>
                                      <td>
                                        {item.product?.imageUrl ? (
                                          <img
                                            src={item.product.imageUrl}
                                            alt={
                                              item.product?.title || "產品主圖"
                                            }
                                            style={{
                                              width: "64px",
                                              height: "64px",
                                              objectFit: "cover",
                                            }}
                                            className="rounded border"
                                          />
                                        ) : (
                                          "-"
                                        )}
                                      </td>
                                      <td>{item.product?.title || "-"}</td>
                                      <td>{item.product?.category || "-"}</td>
                                      <td>{item.qty || 0}</td>
                                      <td>
                                        ${formatPrice(item.product?.price || 0)}
                                      </td>
                                      <td>${formatPrice(amount)}</td>
                                    </tr>
                                  );
                                },
                              )
                            ) : (
                              <tr>
                                <td colSpan="6">此訂單無商品資料</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mb-0">尚未選擇訂單</p>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-secondary"
                data-bs-dismiss="modal"
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="deleteAllOrdersModal"
        tabIndex="-1"
        aria-labelledby="deleteAllOrdersModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog">
          <div className="modal-content border-0">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title" id="deleteAllOrdersModalLabel">
                <span>刪除全部訂單</span>
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              是否刪除
              <strong className="text-danger"> 全部訂單 </strong>
              (刪除後將無法恢復)。
            </div>
            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-outline-secondary"
                data-bs-dismiss="modal"
              >
                取消
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteAllOrders}
                disabled={isDeletingAll}
                data-bs-dismiss="modal"
              >
                {isDeletingAll ? "刪除中..." : "確認刪除"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <DeleteOrderModal
        tempOrder={tempOrder}
        getOrdersData={getOrdersData}
        onDeleted={() => {
          if (selectedOrder?.id === tempOrder?.id) {
            setSelectedOrder(null);
          }
        }}
      />
    </div>
  );
}

export default AdminOrder;
