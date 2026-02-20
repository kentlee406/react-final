import { lazy, Suspense } from "react";
import Loading from "../component/Loading";

// 路由層級延遲載入：降低銀幕載入體積
const Layout = lazy(() => import("../Layout"));
const Cart = lazy(() => import("../views/Cart"));
const Home = lazy(() => import("../views/Home"));
const Product = lazy(() => import("../views/Product"));
const Products = lazy(() => import("../views/Products"));
const NotFound = lazy(() => import("../views/NotFound"));
const AdminLogin = lazy(() => import("../views/admin/AdminLogin"));
const AdminProduct = lazy(() => import("../views/admin/AdminProduct"));

// 統一包裝 Suspense，切頁載入時沿用既有 Loading UI
const withSuspense = (Component) => (
  <Suspense fallback={<Loading forceShow />}>
    <Component />
  </Suspense>
);

const routes = [
  {
    path: "/",
    element: withSuspense(Layout),
    children: [
      { index: true, element: withSuspense(Home) },
      { path: "products", element: withSuspense(Products) },
      { path: "product/:id", element: withSuspense(Product) },
      { path: "cart", element: withSuspense(Cart) },
    ],
  },
  { path: "login", element: withSuspense(AdminLogin) },
  { path: "admin/product", element: withSuspense(AdminProduct) },
  { path: "*", element: withSuspense(NotFound) },
];
export default routes;
