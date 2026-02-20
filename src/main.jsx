import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router";
import { Provider } from "react-redux";
import routes from "./routes/index.jsx";
import { LoadingProvider } from "./context/LoadingContext";
import { store } from "./store/index.js";
import { Notification } from "./component/Notification";
import "./scss/all.scss";
import "bootstrap/dist/css/bootstrap.min.css";

const router = createHashRouter(routes);

createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <LoadingProvider>
      {/* 全域通知層：前台/後台路由都能顯示 Redux 通知 */}
      <Notification />
      <RouterProvider router={router} />
    </LoadingProvider>
  </Provider>,
);
