
import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import AuthGuard from "./components/AuthGuard";

import AppProvider from "./utils/provider/app-provider";
const CategoryForm = lazy(() => import("./pages/category/Index"));
const LoginPage = lazy(() => import("./pages/login/Page")); 
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
         <Route path="/category" element={<CategoryForm />} />
      </Routes>
    </Suspense>
   </AppProvider>
  )
}

export default App
