import { useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { LoadingContext } from "../../context/loadingContext";
import { useNotification } from "../../hooks/useNotification";
import { getAuthToken, setAuthToken } from "../../utils/authToken";
const API_BASE = import.meta.env.VITE_API_BASE;
function AdminLogin() {
  const navigate = useNavigate();
  const { showLoading, hideLoading } = useContext(LoadingContext);
  const { showNotification } = useNotification();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const onSubmit = async (data) => {
    try {
      showLoading();
      const response = await axios.post(`${API_BASE}/admin/signin`, data);
      const { token } = response.data;
      setAuthToken(token);
      navigate("/admin/product");
    } catch {
      showNotification("登入失敗，請檢查帳號密碼", "error", 8000);
      hideLoading();
    }
  };

  const checkLogin = async (token) => {
    try {
      showLoading();
      await axios.post(`${API_BASE}/api/user/check`, null, {
        headers: {
          Authorization: token,
        },
      });
      navigate("/admin/product");
    } catch {
      console.error("驗證失敗或 Token 已過期，請重新登入");
      hideLoading();
    }
  };

  useEffect(() => {
    const token = getAuthToken();
    if (token) {
      checkLogin(token);
    }
  }, []);

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-6">
          <h2>後台登入</h2>
          <form
            id="form"
            className="form-signin"
            onSubmit={handleSubmit(onSubmit)}
          >
            <div className="input-group">
              <span className="input-group-text">帳號</span>
              <input
                type="email"
                className="form-control"
                placeholder="請輸入帳號"
                {...register("username", { required: "帳號為必填" })}
                autoComplete="current-username"
              />
              {errors.username && (
                <span className="text-danger">{errors.username.message}</span>
              )}
            </div>
            <div className="input-group">
              <span className="input-group-text">密碼</span>
              <input
                type="password"
                className="form-control"
                placeholder="請輸入密碼"
                {...register("password", { required: "密碼為必填" })}
                autoComplete="current-password"
              />
              {errors.password && (
                <span className="text-danger">{errors.password.message}</span>
              )}
            </div>
            <button type="submit" className="btn btn-primary mb-3">
              登入
            </button>
            <button
              type="button"
              className="btn btn-secondary mb-3 ms-2"
              onClick={() => navigate("/")}
            >
              返回前台首頁
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
export default AdminLogin;
