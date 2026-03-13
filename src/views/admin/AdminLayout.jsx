import { useEffect, useState, useContext, useRef } from "react";
import { Outlet, useNavigate } from "react-router";
import axios from "axios";
import { LoadingContext } from "../../context/loadingContext";
import { useNotification } from "../../hooks/useNotification";
import { getAuthToken, clearAuthToken } from "../../utils/authToken";
import ScrollToTop from "../../component/ScrollToTop";

const API_BASE = import.meta.env.VITE_API_BASE;

function AdminLayout() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();
  const hasCheckedAuth = useRef(false);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    if (hasCheckedAuth.current) {
      return;
    }

    hasCheckedAuth.current = true;

    const validateAdmin = async () => {
      const token = getAuthToken();

      if (!token) {
        showNotification("登入狀態已失效，請重新登入", "error", 8000);
        navigate("/login", { replace: true });
        return;
      }

      try {
        showLoading();
        axios.defaults.headers.common.Authorization = token;
        await axios.post(`${API_BASE}/api/user/check`);
        setIsAuthReady(true);
      } catch {
        clearAuthToken();
        axios.defaults.headers.common.Authorization = "";
        showNotification("登入狀態已失效，請重新登入", "error", 8000);
        navigate("/login", { replace: true });
      } finally {
        hideLoading();
      }
    };

    validateAdmin();
  }, [navigate, showLoading, hideLoading, showNotification]);

  if (!isAuthReady) {
    return null;
  }

  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

export default AdminLayout;
