import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Modal } from "bootstrap";
import ProductModal from "../../component/ProductModal";
import DeleteModal from "../../component/DeleteModal";
import Pagination from "../../component/Pagination";
import { LoadingContext } from "../../context/LoadingContext";
import { useNotification } from "../../hooks/useNotification";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
function AdminProduct() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();
  const [currentPage, setCurrentPage] = useState(1);
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [modalMode, setModalMode] = useState(""); // 追蹤現在是 'create' 還是 'edit'
  const [tempProduct, setTempProduct] = useState({
    id: "",
    imageUrl: "",
    title: "",
    category: "",
    unit: "",
    origin_price: "",
    price: "",
    description: "",
    content: "",
    is_enabled: false,
    imagesUrl: [],
  });
  const openModal = (mode, product) => {
    setModalMode(mode);
    if (mode === "create") {
      setTempProduct({
        title: "",
        category: "",
        unit: "",
        origin_price: 0,
        price: 0,
        description: "",
        content: "",
        is_enabled: 0,
        imageUrl: "",
        imagesUrl: [""],
      });
    } else {
      setTempProduct(product);
    }
    // 手動取得該 Modal 實例並顯示
    const modalElement = document.getElementById("ProductModal");
    const instance = Modal.getOrCreateInstance(modalElement);
    instance.show();
  };
  const getProductData = async (page = currentPage) => {
    try {
      showLoading();
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/admin/products?page=${page}`,
      );
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      setCurrentPage(response.data.pagination.current_page);
    } catch {
      showNotification("取得後台產品資料失敗，請稍後再試", "error", 8000);
    } finally {
      hideLoading();
    }
  };

  const getTokenFromCookie = () => {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];
  };

  const initializeAdminData = async () => {
    const token = getTokenFromCookie();

    if (!token) {
      showNotification("登入狀態已失效，請重新登入", "error", 8000);
      navigate("/login");
      return;
    }

    try {
      showLoading();
      axios.defaults.headers.common.Authorization = token;
      await axios.post(`${API_BASE}/api/user/check`);
      await getProductData(1);
    } catch {
      axios.defaults.headers.common.Authorization = "";
      showNotification("登入狀態已失效，請重新登入", "error", 8000);
      navigate("/login");
    } finally {
      hideLoading();
    }
  };

  const handleLogout = async () => {
    try {
      showLoading();
      await axios.post(`${API_BASE}/logout`);

      // 登出成功後再清除 Cookie 與 axios 預設 header
      document.cookie =
        "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      axios.defaults.headers.common.Authorization = "";

      navigate("/login");
    } catch {
      showNotification("登出失敗，請稍後再試", "error", 8000);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    initializeAdminData();
  }, []);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-8">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="fw-bold">產品列表</h2>
            <div>
              <button
                className="btn btn-success me-2"
                onClick={() => openModal("create")}
              >
                新增產品
              </button>
              <button className="btn btn-danger" onClick={handleLogout}>
                登出
              </button>
            </div>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th>分類</th>
                <th>產品名稱</th>
                <th>原價</th>
                <th>售價</th>
                <th>是否啟用</th>
                <th>編輯</th>
                <th>刪除</th>
              </tr>
            </thead>
            <tbody>
              {products && products.length > 0 ? (
                products.map((item) => (
                  <tr key={item.id}>
                    <td>{item.category}</td>
                    <td>{item.title}</td>
                    <td>{item.origin_price}</td>
                    <td>{item.price}</td>
                    <td>{item.is_enabled ? "啟用" : "未啟用"}</td>
                    <td>
                      <button
                        className="btn btn-primary"
                        onClick={() => openModal("edit", item)}
                      >
                        編輯
                      </button>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-danger"
                        id={"delete" + item.id}
                        onClick={() => setTempProduct(item)}
                        data-bs-target="#deleteModal"
                        data-bs-toggle="modal"
                      >
                        刪除
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7">尚無產品資料</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Pagination
        products={products}
        pagination={pagination}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        onPageChange={getProductData}
      />
      <ProductModal
        mode={modalMode}
        tempProduct={tempProduct}
        getProductData={getProductData}
      />
      <DeleteModal getProductData={getProductData} tempProduct={tempProduct} />
    </div>
  );
}
export default AdminProduct;
