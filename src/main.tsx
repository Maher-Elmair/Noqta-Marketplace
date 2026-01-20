import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "@/style/globals.css";
import "@/i18n"; // Initialize i18n
import App from "@/App.tsx";
import { GlobalLoader } from "@/components/common/global-loader";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback={<GlobalLoader />}>
      <App />
    </Suspense>
  </StrictMode>
);
