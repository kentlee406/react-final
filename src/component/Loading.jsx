import { useContext } from "react";
import { LoadingContext } from "../context/LoadingContext";
import { MutatingDots } from "react-loader-spinner";
import "../scss/loading.scss";

function Loading({ forceShow = false }) {
  const { isLoading } = useContext(LoadingContext);

  // forceShow 給 Suspense fallback 使用，不依賴 context 狀態
  if (!isLoading && !forceShow) return null;

  return (
    <div className="loading-overlay">
      <div className="loading-container">
        <MutatingDots
          height="100"
          width="100"
          color="#0d6efd"
          secondaryColor="#0d6efd"
          radius="12.5"
          ariaLabel="mutating-dots-loading"
          wrapperStyle={{}}
          wrapperClass=""
          visible={true}
        />
        <p className="loading-text">載入中...</p>
      </div>
    </div>
  );
}

export default Loading;
