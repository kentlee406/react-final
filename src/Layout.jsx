import { NavLink, Outlet } from "react-router";
import Loading from "./component/Loading";

function Layout() {
  return (
    <div className="container">
      <Loading />
      <header className="mb-3 d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-2">
        <h1 className="w-100 w-lg-auto mb-0">Tech Choice 3C電子商務</h1>
        <nav className="d-flex flex-column flex-sm-row flex-wrap gap-2 w-100 w-lg-auto">
          <NavLink
            to=""
            end
            className={({ isActive }) =>
              `btn ${isActive ? "btn-success" : "btn-outline-success"} header-nav-btn`
            }
          >
            首頁
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              `btn ${isActive ? "btn-success" : "btn-outline-success"} header-nav-btn`
            }
          >
            產品
          </NavLink>
          <NavLink
            to="/cart"
            className={({ isActive }) =>
              `btn ${isActive ? "btn-success" : "btn-outline-success"} header-nav-btn`
            }
          >
            購物車
          </NavLink>
          <NavLink
            to="/login"
            className={({ isActive }) =>
              `btn ${isActive ? "btn-success" : "btn-outline-success"} header-nav-btn`
            }
          >
            後台登入
          </NavLink>
        </nav>
      </header>
      <Outlet />
      <footer>
        <p>
          僅個人作品練習，無任何商業用途。最近修改日期：2026年2月20日。歡迎提供建議與回饋！
        </p>
      </footer>
    </div>
  );
}
export default Layout;
