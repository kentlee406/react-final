import { useEffect } from "react";
import { useNavigate } from "react-router";
function NotFound() {
  const navigate = useNavigate();
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/");
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return <p>此頁面不存在，三秒後返回首頁</p>;
}
export default NotFound;
