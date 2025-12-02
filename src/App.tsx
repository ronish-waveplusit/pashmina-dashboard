
import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";

import AppProvider from "./utils/provider/app-provider";
const CategoryForm = lazy(() => import("./pages/category/Index"));
const LoginPage = lazy(() => import("./pages/login/Page")); 
const Attributes = lazy(() => import("./pages/attributes/Index")); 
const ProductForm = lazy(() => import("./pages/product/_components/ProductForm"));
function App() {

const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
  </div>
);

  return (
   <AppProvider>
   <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
         <Route
            path="/category"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <CategoryForm />
              </AuthGuard>
            }
          />
          <Route
            path="/attributes"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <Attributes />
              </AuthGuard>
            }
          />
            <Route
            path="/product-form"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <ProductForm />
              </AuthGuard>
            }
          />
      </Routes>
    </Suspense>
   </AppProvider>
  )
}

export default App
