import axios from "axios";
import "bootstrap";
import { useState, useEffect, useContext } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { LoadingContext } from "../context/LoadingContext";
import { useNotification } from "../hooks/useNotification";
import Pagination from "../component/Pagination";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
function Products() {
  const [products, setProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [addingProductId, setAddingProductId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const [searchParams, setSearchParams] = useSearchParams();
  const pageSize = 6;
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();

  const getProductData = async () => {
    try {
      showLoading();
      const response = await axios.get(
        `${API_BASE}/api/${API_PATH}/products/all`,
      );
      setProducts(response.data.products);
      setCurrentPage(1);
    } catch {
      showNotification("取得產品列表失敗，請稍後再試", "error", 8000);
    } finally {
      hideLoading();
    }
  };

  const addCart = async (productId) => {
    try {
      setAddingProductId(productId);
      const cartData = { data: { product_id: productId, qty: 1 } };
      await axios.post(`${API_BASE}/api/${API_PATH}/cart`, cartData);
      showNotification("產品已新增至購物車", "success", 6000);
    } catch {
      showNotification("新增購物車失敗，請稍後再試", "error", 8000);
    } finally {
      setAddingProductId("");
    }
  };

  const categories = [
    "全部",
    ...new Set(products.map((product) => product.category).filter(Boolean)),
  ];
  const categoryFromQuery = searchParams.get("category") || "全部";
  const filteredProducts =
    selectedCategory === "全部"
      ? products
      : products.filter((product) => product.category === selectedCategory);
  const startIndex = (currentPage - 1) * pageSize;
  const currentProducts = filteredProducts.slice(
    startIndex,
    startIndex + pageSize,
  );

  useEffect(() => {
    getProductData();
  }, []);

  useEffect(() => {
    setSelectedCategory(categoryFromQuery);
    setCurrentPage(1);
  }, [categoryFromQuery]);

  return (
    <>
      <h2>產品列表</h2>
      <div className="d-flex flex-wrap gap-2 mb-4">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={`btn ${
              selectedCategory === category
                ? "btn-success"
                : "btn-outline-success"
            }`}
            aria-pressed={selectedCategory === category}
            onClick={() => {
              setSelectedCategory(category);
              setCurrentPage(1);
              if (category === "全部") {
                setSearchParams({});
                return;
              }
              setSearchParams({ category });
            }}
          >
            {category}
          </button>
        ))}
      </div>
      <div className="cards">
        <div className="row g-4">
          {filteredProducts && filteredProducts.length > 0
            ? currentProducts.map((product) => {
                return (
                  <div className="col-12 col-md-6 col-lg-4" key={product.id}>
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
                        <button
                          type="button"
                          className="btn btn-primary w-100"
                          disabled={addingProductId === product.id}
                          onClick={() => addCart(product.id)}
                        >
                          {addingProductId === product.id
                            ? "加入中..."
                            : "加入購物車"}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            : "目前尚無產品資料"}
        </div>
      </div>
      {filteredProducts.length > pageSize && (
        <Pagination
          products={filteredProducts}
          pageSize={pageSize}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
        />
      )}
    </>
  );
}
export default Products;
