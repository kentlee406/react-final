import { useState, useEffect, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import "bootstrap";
import { LoadingContext } from "../context/LoadingContext";
import { useNotification } from "../hooks/useNotification";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
function Product() {
  const [product, setProduct] = useState({});
  const { id } = useParams();
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();
  const getProductData = async () => {
    try {
      showLoading();
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/product/${id}`,
      );
      setProduct(response.data.product);
    } catch {
      showNotification("取得產品資訊失敗，請稍後再試", "error", 8000);
    } finally {
      hideLoading();
    }
  };

  const addCart = async () => {
    try {
      const cartData = { data: { product_id: id, qty: 1 } };
      await axios.post(`${API_BASE}/api/${API_PATH}/cart`, cartData);
      showNotification("產品已新增至購物車", "success", 6000);
    } catch {
      showNotification("新增購物車失敗，請稍後再試", "error", 8000);
    }
  };

  useEffect(() => {
    getProductData();
  }, []);

  return (
    <div>
      <img
        src={product.imageUrl}
        className="card-img-top"
        alt={product.title}
        style={{ height: "50vh", width: "auto" }}
      />
      <h2>
        {product.title}
        <span className="badge bg-primary ms-2">{product.category}</span>
      </h2>
      <p>產品內容：{product.content}</p>
      <p>產品描述：{product.description}</p>
      <p>單位：{product.unit}</p>
      <p>
        <del>{product.origin_price}</del>&nbsp;元 / {product.price} 元
      </p>
      <div className="row g-2">
        {" "}
        {/* g-2 是設定圖片間距 (gutter) */}
        {product.imagesUrl?.map((url, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-3">
            <img
              src={url}
              alt="小圖"
              className="img-fluid w-100" // 確保圖片填滿容器且不變形
              style={{ objectFit: "cover", aspectRatio: "1/1" }}
            />
          </div>
        ))}
      </div>
      <input
        type="button"
        className="btn btn-primary"
        value="加入購物車"
        onClick={addCart}
      />
    </div>
  );
}
export default Product;
