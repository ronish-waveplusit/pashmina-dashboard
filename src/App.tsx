
import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";

import AppProvider from "./utils/provider/app-provider";
const CategoryForm = lazy(() => import("./pages/category/Index"));
const LoginPage = lazy(() => import("./pages/login/Page")); 
const Attributes = lazy(() => import("./pages/attributes/Index")); 
const ProductForm = lazy(() => import("./pages/product/_components/ProductForm"));
const ProductIndex = lazy(() => import("./pages/product/Index"));
const ProductVariation=lazy(()=>import("./pages/inventory/Index"));
const LotView=lazy(()=>import("./pages/inventory/_components/ViewLotModal"))
const ProductView=lazy(()=>import("./pages/product/ViewProduct"))
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
            <Route
            path="/product-form/:id"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <ProductForm />
              </AuthGuard>
            }
          />
             <Route
            path="/products"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <ProductIndex />
              </AuthGuard>
            }
          />
            <Route
            path="/products/:id"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <ProductView />
              </AuthGuard>
            }
          />
            <Route
            path="/inventory"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <ProductVariation />
              </AuthGuard>
            }
          />
           <Route
            path="/lot-view/:id"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <LotView />
              </AuthGuard>
            }
          />
      </Routes>
    </Suspense>
   </AppProvider>
  )
}

export default App
