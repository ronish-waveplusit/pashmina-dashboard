
import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";

import AppProvider from "./utils/provider/app-provider";
import NotFound from "./pages/NotFound";
import Unauthorized from "./pages/Unauthorized";
const Index = lazy(() => import("./pages/Index"));
const CategoryForm = lazy(() => import("./pages/category/Index"));
const LoginPage = lazy(() => import("./pages/login/Page")); 
const Attributes = lazy(() => import("./pages/attributes/Index")); 
const ProductForm = lazy(() => import("./pages/product/_components/ProductForm"));
const ProductIndex = lazy(() => import("./pages/product/Index"));
const ProductVariation=lazy(()=>import("./pages/inventory/Index"));
const LotView=lazy(()=>import("./pages/inventory/_components/ViewLotModal"))
const ProductView=lazy(()=>import("./pages/product/ViewProduct"))
const ChalaniIndex=lazy(()=>import("./pages/chalani/Index"));
const ChalaniForm=lazy(()=>import("./pages/chalani/_components/ChalaniForm"))
const ChalaniDetail=lazy(()=>import("./pages/chalani/_components/ChalaniDetail"))
const FAQIndex=lazy(()=>import("./pages/faq/Index"))
const Dashboard=lazy(()=>import("./pages/dashboard/Dashboard"))
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
         <Route path="/" element={<Index />} />
        <Route path="/login" element={<LoginPage />} />
         <Route path="/unauthorized" element={<Unauthorized />} />
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
            path="/dashboard"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <Dashboard />
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

            <Route
            path="/chalani"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <ChalaniIndex />
              </AuthGuard>
            }
          />
           <Route
            path="/add-chalani"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <ChalaniForm />
              </AuthGuard>
            }
          />
           <Route
            path="/chalani/:id"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <ChalaniDetail />
              </AuthGuard>
            }
          />
            <Route
            path="/faqs"
            element={
              <AuthGuard
                requiredPermissions={[]}
              >
                <FAQIndex />
              </AuthGuard>
            }
          />
          <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
   </AppProvider>
  )
}

export default App
