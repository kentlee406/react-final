import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { LoadingContext } from "../context/LoadingContext";
import { useNotification } from "../hooks/useNotification";
import { formatApiErrorMessage } from "../utils/formatApiErrorMessage";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function DeleteModal({ getProductData, tempProduct }) {
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();
  const handleDelete = async () => {
    try {
      showLoading();
      // 確保 API_BASE 和 API_PATH 已定義或從 props 傳入
      await axios.delete(
        `${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`,
      );

      showNotification("刪除成功", "success", 6000);

      // 1. 刷新父組件的產品列表
      await getProductData();
    } catch (error) {
      const message = formatApiErrorMessage(
        error.response?.data?.message || "發生錯誤",
      );
      showNotification(`刪除失敗：${message}`, "error", 8000);
    } finally {
      hideLoading();
    }
  };

  return (
    <div
      className="modal fade"
      id="deleteModal"
      tabIndex="-1"
      aria-labelledby="deleteModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog">
        <div className="modal-content border-0">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title" id="deleteModalLabel">
              <span>刪除產品</span>
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
            <strong className="text-danger"> {tempProduct.title} </strong>
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
              onClick={handleDelete}
              data-bs-dismiss="modal"
            >
              確認刪除
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DeleteModal;
