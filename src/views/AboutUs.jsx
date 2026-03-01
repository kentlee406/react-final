import "bootstrap";
import { Link } from "react-router-dom";

function AboutUs() {
  return (
    <main className="container py-5">
      <section className="text-center mb-5">
        <h1 className="fw-bold mb-3">關於我們</h1>
        <p className="lead text-secondary mb-0">
          我們專注於提供值得信賴的 3C 商品與清楚透明的購物體驗，
          讓你更快速找到真正適合自己的產品。
        </p>
      </section>

      <section className="mb-5">
        <div className="row g-4">
          <div className="col-12 col-md-6">
            <div className="h-100 border rounded-3 p-4 bg-light">
              <h2 className="h4 fw-semibold mb-3">我們的故事</h2>
              <p className="mb-0 text-secondary">
                從日常選購 3C
                商品的煩惱出發，我們打造了一個以「好懂、好比、好買」為核心的平台，
                協助使用者在繁雜規格中快速做出正確選擇。
              </p>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="h-100 border rounded-3 p-4">
              <h2 className="h4 fw-semibold mb-3">我們重視的價值</h2>
              <ul className="mb-0 ps-3 text-secondary">
                <li className="mb-2">品質把關：提供穩定可靠的商品來源。</li>
                <li className="mb-2">資訊透明：規格、價格與活動清楚揭露。</li>
                <li>售後安心：完善客服與保固協助流程。</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-5">
        <h2 className="h4 fw-semibold mb-3">為什麼選擇我們</h2>
        <div className="row g-3">
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              價格透明，促銷資訊一目了然
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              多元品類，從入門到進階都找得到
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="border rounded-3 p-3 h-100">
              快速出貨與售後支援，購買更安心
            </div>
          </div>
        </div>
      </section>

      <section className="text-center">
        <h2 className="h5 mb-3">準備好探索更多商品了嗎？</h2>
        <Link to="/products" className="btn btn-success px-4">
          立即前往選購
        </Link>
      </section>
    </main>
  );
}

export default AboutUs;
