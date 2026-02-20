import { useState, useEffect, useRef, useContext } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import { LoadingContext } from "../context/LoadingContext";
import { useNotification } from "../hooks/useNotification";
import { formatApiErrorMessage } from "../utils/formatApiErrorMessage";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function ProductModal({ mode, tempProduct, getProductData }) {
  const { showLoading, hideLoading } = useContext(LoadingContext);
  // 統一走 Redux 通知（取代 alert），與刪除流程一致
  const { showNotification } = useNotification();
  const [modalData, setModalData] = useState({
    ...tempProduct,
    imagesUrl: tempProduct.imagesUrl || ["", "", "", ""],
  });

  const [imageInput, setImageInput] = useState(""); // 暫存輸入框的網址
  const [isUploadingMainImage, setIsUploadingMainImage] = useState(false);
  const modalElement = useRef(null);
  const modalInstance = useRef(null);

  useEffect(() => {
    // 當外部傳入資料改變，確保 imagesUrl 格式正確（補足 4 個空位以便 UI 呈現）
    const images = tempProduct.imagesUrl ? [...tempProduct.imagesUrl] : [];
    while (images.length < 4) images.push("");

    setModalData({
      ...tempProduct,
      imagesUrl: images,
    });
  }, [tempProduct]);

  // 2. 初始化 Modal (僅一次)
  useEffect(() => {
    if (modalElement.current) {
      modalInstance.current = new Modal(modalElement.current, {
        backdrop: "static", // 點擊背景不關閉
      });
    }
    // 清除函數，避免重複初始化導致的錯誤
    return () => {
      if (modalInstance.current) {
        modalInstance.current.dispose();
      }
    };
  }, []);

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setModalData((prev) => ({
      ...prev,
      [id]:
        type === "checkbox"
          ? checked
            ? 1
            : 0
          : type === "number"
            ? Number(value)
            : value,
    }));
  };

  const handleMainImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file-to-upload", file);

    try {
      setIsUploadingMainImage(true);
      showLoading();
      const response = await axios.post(
        `${API_BASE}/api/${API_PATH}/admin/upload`,
        formData,
      );

      const imageUrl = response.data?.imageUrl;
      if (!imageUrl) {
        throw new Error("上傳成功但未取得圖片網址");
      }

      setModalData((prev) => ({ ...prev, imageUrl }));
      // 主圖上傳成功提示
      showNotification("主圖上傳成功", "success", 6000);
    } catch (error) {
      // 主圖上傳失敗提示
      showNotification(
        "主圖上傳失敗：" +
          (error.response?.data?.message || error.message || "未知錯誤"),
        "error",
        8000,
      );
    } finally {
      setIsUploadingMainImage(false);
      hideLoading();
      e.target.value = "";
    }
  };

  // 新增圖片網址邏輯
  const handleAddImage = () => {
    if (!imageInput.trim()) return;

    const newImages = [...modalData.imagesUrl];
    const emptyIndex = newImages.findIndex((url) => url === "");

    if (emptyIndex !== -1) {
      newImages[emptyIndex] = imageInput;
      setModalData((prev) => ({ ...prev, imagesUrl: newImages }));
      setImageInput(""); // 清空輸入框
    } else {
      alert("最多只能上傳 4 張圖片");
    }
  };

  // 移除圖片邏輯
  const handleRemoveImage = (index) => {
    const newImages = [...modalData.imagesUrl];
    newImages[index] = "";
    setModalData((prev) => ({ ...prev, imagesUrl: newImages }));
  };

  const handleSave = async () => {
    try {
      showLoading();
      const apiPath =
        mode === "create"
          ? `${API_BASE}/api/${API_PATH}/admin/product`
          : `${API_BASE}/api/${API_PATH}/admin/product/${modalData.id}`;

      const method = mode === "create" ? "post" : "put";

      await axios[method](apiPath, { data: modalData });
      // 新增/編輯成功都顯示通知
      showNotification(
        mode === "create" ? "新增成功" : "更新成功",
        "success",
        6000,
      );

      await getProductData(); // 重新抓取資料

      // 3. 正確隱藏 Modal
      modalInstance.current.hide();
    } catch (error) {
      const message = formatApiErrorMessage(
        error.response?.data?.message || "未知錯誤",
      );
      // 新增/編輯失敗通知
      showNotification("操作失敗：" + message, "error", 8000);
    } finally {
      hideLoading();
    }
  };

  return (
    <div
      className="modal fade "
      ref={modalElement} // 5. 綁定 DOM Ref
      id="ProductModal" // 確保 ID 與 App 的 data-bs-target 對應
      tabIndex="-1"
      aria-labelledby="exampleModalLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">新增產品</h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
            ></button>
          </div>
          <div className="modal-body">
            <div className="container">
              <div className="row">
                <div className="col-lg-7">
                  <form>
                    <div className="mb-3">
                      <label htmlFor="title" className="form-label fw-bold">
                        商品名稱
                      </label>
                      <input
                        type="text"
                        className="form-control"
                        id="title"
                        placeholder="請輸入商品名稱"
                        value={modalData.title || ""}
                        onChange={handleInputChange}
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <label
                          htmlFor="origin_price"
                          className="form-label fw-bold"
                        >
                          原價
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="origin_price"
                          min="0"
                          value={modalData.origin_price ?? 0}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-6">
                        <label htmlFor="price" className="form-label fw-bold">
                          售價
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          id="price"
                          min="0"
                          value={modalData.price ?? 0}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-6">
                        <label
                          htmlFor="category"
                          className="form-label fw-bold"
                        >
                          分類
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="category"
                          value={modalData.category || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                      <div className="col-6">
                        <label htmlFor="unit" className="form-label fw-bold">
                          單位
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="unit"
                          value={modalData.unit || ""}
                          onChange={handleInputChange}
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label htmlFor="content" className="form-label fw-bold">
                        商品內容
                      </label>
                      <textarea
                        className="form-control"
                        id="content"
                        rows="4"
                        value={modalData.content || ""}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    <div className="mb-3">
                      <label
                        htmlFor="description"
                        className="form-label fw-bold"
                      >
                        商品描述
                      </label>
                      <textarea
                        className="form-control"
                        id="description"
                        rows="4"
                        value={modalData.description || ""}
                        onChange={handleInputChange}
                      ></textarea>
                    </div>

                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        role="switch"
                        id="is_enabled"
                        checked={!!modalData.is_enabled}
                        onChange={handleInputChange}
                      />
                      <label
                        className="form-check-label fw-bold"
                        htmlFor="is_enabled"
                      >
                        啟用
                      </label>
                    </div>
                  </form>
                </div>

                {/* 右側圖片上傳與預覽 */}
                <div className="col-lg-5">
                  <label
                    htmlFor="mainImageUpload"
                    className="form-label fw-bold"
                  >
                    商品主圖（檔案上傳）
                  </label>
                  <input
                    type="file"
                    className="form-control mb-2"
                    id="mainImageUpload"
                    accept="image/*"
                    onChange={handleMainImageUpload}
                    disabled={isUploadingMainImage}
                  />
                  {isUploadingMainImage && (
                    <small className="text-muted d-block mb-2">
                      主圖上傳中...
                    </small>
                  )}
                  {modalData.imageUrl ? (
                    <div
                      className="border rounded bg-light d-flex align-items-center justify-content-center mb-3"
                      style={{ height: "160px", overflow: "hidden" }}
                    >
                      <img
                        src={modalData.imageUrl}
                        alt="主圖預覽"
                        className="w-100 h-100 object-fit-cover"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/300x160?text=Invalid+Image";
                        }}
                      />
                    </div>
                  ) : (
                    <small className="text-muted d-block mb-3">
                      尚未上傳主圖
                    </small>
                  )}

                  <label className="form-label fw-bold">
                    其他圖片 (最多 4 張)
                  </label>
                  <div className="input-group mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="輸入圖片連結"
                      value={imageInput}
                      onChange={(e) => setImageInput(e.target.value)}
                    />
                    <button
                      className="btn btn-outline-primary"
                      type="button"
                      onClick={handleAddImage}
                    >
                      新增連結
                    </button>
                  </div>

                  <div className="row g-2">
                    {modalData.imagesUrl.map((url, index) => (
                      <div className="col-6" key={index}>
                        <div
                          className="border rounded bg-light d-flex align-items-center justify-content-center position-relative"
                          style={{ height: "100px", overflow: "hidden" }}
                        >
                          {url ? (
                            <>
                              <img
                                src={url}
                                alt="預覽圖"
                                className="w-100 h-100 object-fit-cover"
                                onError={(e) => {
                                  e.target.src =
                                    "https://via.placeholder.com/150?text=Invalid+URL";
                                }} // 錯誤處理
                              />
                              <button
                                type="button"
                                className="btn btn-danger btn-sm position-absolute top-0 end-0 p-1"
                                style={{ fontSize: "10px", lineHeight: 1 }}
                                onClick={() => handleRemoveImage(index)}
                              >
                                ✕
                              </button>
                            </>
                          ) : (
                            <small className="text-muted">
                              圖片 {index + 1}
                            </small>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              關閉
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              存檔
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
export default ProductModal;
