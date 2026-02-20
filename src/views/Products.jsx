import axios from "axios";
import "bootstrap";
import { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { LoadingContext } from "../context/LoadingContext";
import { useNotification } from "../hooks/useNotification";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
function Products() {
  const [products, setProducts] = useState([]);
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();

  const getProductData = async () => {
    try {
      showLoading();
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/products/all`,
      );
      setProducts(response.data.products);
    } catch {
      showNotification("取得產品列表失敗，請稍後再試", "error", 8000);
    } finally {
      hideLoading();
    }
  };

  useEffect(() => {
    getProductData();
  }, []);

  return (
    <>
      <h2>產品列表</h2>
      <div className="cards">
        <div className="row g-4">
          {products && products.length > 0
            ? products.map((product) => {
                return (
                  <div className="col-4" key={product.id}>
                    <div className="card">
                      <img
                        src={product.imageUrl}
                        className="card-img-top"
                        alt={product.title}
                      />
                      <div className="card-body">
                        <h5 className="card-title">
                          <Link to={`/product/${product.id}`}>
                            {product.title}
                          </Link>
                          <span className="badge bg-primary ms-2">
                            {product.category}
                          </span>
                        </h5>

                        <div className="d-flex">
                          <p className="card-text text-secondary">
                            <del>{product.origin_price}</del>
                          </p>
                          &nbsp;元 / {product.price} 元
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            : "目前尚無產品資料"}
        </div>
      </div>
    </>
  );
}
export default Products;
