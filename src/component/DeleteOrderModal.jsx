import { useContext, useState } from "react";
import axios from "axios";
import { LoadingContext } from "../context/loadingContext";
import { useNotification } from "../hooks/useNotification";
import { formatApiErrorMessage } from "../utils/formatApiErrorMessage";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function DeleteOrderModal({ tempOrder, getOrdersData, onDeleted }) {
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDelete = async () => {
    if (!tempOrder?.id) {
      showNotification("查無可刪除的訂單", "error", 6000);
      return;
    }

    try {
      setIsDeleting(true);
      showLoading();
      await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/order/${tempOrder.id}`,
      );
      showNotification("刪除成功", "success", 6000);
      await getOrdersData(false);
      onDeleted?.();
    } catch (error) {
      const message = formatApiErrorMessage(
        error.response?.data?.message || "發生錯誤",
      );
      showNotification(`刪除失敗：${message}`, "error", 8000);
    } finally {
      hideLoading();
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="modal fade"
      id="deleteOrderModal"
      tabIndex="-1"
      aria-labelledby="deleteOrderModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content border-0">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title" id="deleteOrderModalLabel">
              <span>刪除訂單</span>
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            是否刪除客戶在
            <strong className="text-danger">
              {` ${formatDateTime(tempOrder?.create_at)} `}
            </strong>
            所建立的訂單資料？(刪除後將無法恢復)
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
              onClick={handleDelete}
              disabled={isDeleting}
              data-bs-dismiss="modal"
            >
              {isDeleting ? "刪除中..." : "確認刪除"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteOrderModal;
