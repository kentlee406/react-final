import { useEffect, useContext } from "react";
import { useNavigate } from "react-router";
import { useForm } from "react-hook-form";
import axios from "axios";
import { LoadingContext } from "../../context/LoadingContext";
import { useNotification } from "../../hooks/useNotification";
const API_BASE = import.meta.env.VITE_API_BASE;
const API_PATH = import.meta.env.VITE_API_PATH;
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
      const { token, expired } = response.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)};`;
      axios.defaults.headers.common.Authorization = `${token}`;
      navigate("/admin/product");
    } catch (error) {
      showNotification("登入失敗，請檢查帳號密碼", "error", 8000);
      hideLoading();
    }
  };
  useEffect(() => {
    // 嘗試從 Cookie 取得 Token
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (token) {
      // 如果有 Token，就直接執行驗證流程
      checkLogin(token);
    }
  }, []); // 空陣列表示只在重新整理/首次進入時執行

  async function checkLogin(token) {
    try {
      showLoading();
      // 1. 設定 axios 預設 header
      axios.defaults.headers.common.Authorization = token;

      // 2. 呼叫檢查 API
      await axios.post(`${API_BASE}/api/user/check`);

      // 3. 驗證成功後直接進入後台
      navigate("/admin/product");
    } catch {
      console.error("驗證失敗或 Token 已過期，請重新登入");
      // 驗證失敗可以選擇清空 header，讓使用者留在登入頁
      axios.defaults.headers.common.Authorization = "";
      hideLoading();
    }
  }

  return (
    <div className="container">
      <div className="row justify-content-center">
        <div className="col-6">
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
