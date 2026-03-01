import axios from "axios";
import { useContext, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import { LoadingContext } from "../context/loadingContext";
import { useNotification } from "../hooks/useNotification";

const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;

function Home() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [addingProductId, setAddingProductId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("全部");
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();
  const productCardImageStyle = { height: "240px", objectFit: "cover" };

  const getDiscountRate = (product) => {
    const originPrice = Number(product.origin_price || 0);
    const price = Number(product.price || 0);
    if (!originPrice || originPrice <= price) {
      return 0;
    }
    return ((originPrice - price) / originPrice) * 100;
  };

  const categories = useMemo(
    () => [
      "全部",
      ...new Set(products.map((product) => product.category).filter(Boolean)),
    ],
    [products],
  );

  const hotSaleProducts = useMemo(() => {
    if (!orders.length) {
      return [];
    }

    const amountByProduct = new Map();

    orders.forEach((order) => {
      Object.values(order.products || {}).forEach((item) => {
        const productId = item.product_id || item.product?.id;
        if (!productId) {
          return;
        }

        const amount =
          Number(item.final_total || 0) ||
          Number(item.total || 0) ||
          Number(item.qty || 0) * Number(item.product?.price || 0);

        const currentData = amountByProduct.get(productId) || {
          product: item.product,
          amount: 0,
        };

        amountByProduct.set(productId, {
          product: item.product || currentData.product,
          amount: currentData.amount + amount,
        });
      });
    });

    return [...amountByProduct.values()]
      .filter((item) => item.product)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 3)
      .map((item) => item.product);
  }, [orders]);

  const promoProducts = useMemo(() => {
    return [...products]
      .filter(
        (product) =>
          Number(product.origin_price) > 0 &&
          Number(product.origin_price) > Number(product.price),
      )
      .sort((a, b) => {
        const aRate =
          (Number(a.origin_price) - Number(a.price)) / Number(a.origin_price);
        const bRate =
          (Number(b.origin_price) - Number(b.price)) / Number(b.origin_price);
        return bRate - aRate;
      })
      .slice(0, 3);
  }, [products]);

  const getHomeData = async () => {
    try {
      showLoading();

      const productsResponse = await axios.get(
        `${API_BASE}/api/${API_PATH}/products/all`,
      );
      setProducts(productsResponse.data.products || []);

      const ordersResponse = await axios.get(
        `${API_BASE}/api/${API_PATH}/orders`,
      );
      setOrders(ordersResponse.data.orders || []);
    } catch {
      showNotification("首頁資料載入失敗，請稍後再試", "error", 8000);
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

  useEffect(() => {
    getHomeData();
  }, []);

  return (
    <main>
      <section className="mb-5">
        <Swiper
          modules={[Autoplay]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          speed={800}
          spaceBetween={16}
          slidesPerView={1}
          loop={products.length > 1}
          style={{ width: "100%", maxWidth: "100%" }}
        >
          {products.map((product) => (
            <SwiperSlide key={product.id}>
              <Link to={`/product/${product.id}`}>
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="home-swiper-image"
                  style={{
                    display: "block",
                    margin: "0 auto",
                    border: "2px solid var(--bs-success)",
                  }}
                />
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>

      <section className="mb-5">
        <div className="d-flex flex-wrap gap-2">
          {categories.map((category) => {
            const targetPath =
              category === "全部"
                ? "/products"
                : `/products?category=${encodeURIComponent(category)}`;

            return (
              <Link
                key={category}
                to={targetPath}
                className={`btn ${
                  selectedCategory === category
                    ? "btn-success"
                    : "btn-outline-success"
                }`}
                style={{ fontSize: "1.25em" }}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Link>
            );
          })}
        </div>
      </section>

      {hotSaleProducts.length >= 3 && (
        <section className="mb-5">
          <h2 className="fw-bold">熱銷產品</h2>
          <div className="row g-4">
            {hotSaleProducts.map((product) => (
              <div className="col-12 col-md-6 col-lg-4" key={product.id}>
                <div className="card">
                  <img
                    src={product.imageUrl}
                    className="card-img-top"
                    alt={product.title}
                    style={productCardImageStyle}
                  />
                  <div className="card-body">
                    <h5
                      className="card-title fw-bold"
                      style={{ fontSize: "1.5em" }}
                    >
                      <Link to={`/product/${product.id}`}>{product.title}</Link>
                      <span className="badge bg-primary ms-2">
                        {product.category}
                      </span>
                    </h5>
                    <p className="card-text text-secondary small mb-2">
                      規格：{product.unit}
                    </p>

                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>${product.origin_price}</del>
                      </p>
                      /
                      <span
                        className="text-danger fw-bold ms-1"
                        style={{ fontSize: "1.5em" }}
                      >
                        ${product.price}
                      </span>
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
            ))}
          </div>
        </section>
      )}

      {promoProducts.length >= 3 && (
        <section className="mb-5">
          <h2 className="fw-bold">促銷產品</h2>
          <div className="row g-4">
            {promoProducts.map((product) => (
              <div className="col-12 col-md-6 col-lg-4" key={product.id}>
                <div className="card position-relative">
                  <span className="badge rounded-pill bg-danger position-absolute top-0 end-0 m-2">
                    {`${getDiscountRate(product).toFixed(1)}% OFF`}
                  </span>
                  <img
                    src={product.imageUrl}
                    className="card-img-top"
                    alt={product.title}
                    style={productCardImageStyle}
                  />
                  <div className="card-body">
                    <h5
                      className="card-title fw-bold"
                      style={{ fontSize: "1.5em" }}
                    >
                      <Link to={`/product/${product.id}`}>{product.title}</Link>
                      <span className="badge bg-primary ms-2">
                        {product.category}
                      </span>
                    </h5>
                    <p className="card-text text-secondary small mb-2">
                      規格：{product.unit}
                    </p>

                    <div className="d-flex">
                      <p className="card-text text-secondary">
                        <del>${product.origin_price}</del>
                      </p>
                      /
                      <span
                        className="text-danger fw-bold ms-1"
                        style={{ fontSize: "1.5em" }}
                      >
                        ${product.price}
                      </span>
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
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

export default Home;
