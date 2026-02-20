import { useEffect } from "react";
import { useNavigate } from "react-router";
function NotFound() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/products");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <p>此頁面不存在，三秒後返回產品列表畫面</p>;
}
export default NotFound;
