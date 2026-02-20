import { NavLink, Outlet } from "react-router";
import Loading from "./component/Loading";

function Layout() {
  return (
    <div className="container">
      <Loading />
      <header>
        <h1>Tech Choice 3C電子商務</h1>
        <nav>
          <NavLink to="">首頁</NavLink>|<NavLink to="/products">產品</NavLink>|
          <NavLink to="/cart">購物車</NavLink>|
          <NavLink to="/login">後台登入</NavLink>
        </nav>
      </header>
      <Outlet />
      <footer>
        <p>僅個人作品練習，無任何商業用途。最近修改日期：2026年2月20日。</p>
      </footer>
    </div>
  );
}
export default Layout;
