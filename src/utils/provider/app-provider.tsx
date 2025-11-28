import { useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import { HashRouter } from "react-router-dom";
import { PersistGate } from "redux-persist/integration/react";
import init from "../../init";
import store, { persistor } from "../../components/store/store";
import ErrorBoundary from "../../components/ErrorBoundary";
import { Toaster } from "../../components/ui/toaster";
import { AuthProvider } from "../../components/context/AuthContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

const AppProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    init();
  }, []);

  return (
    <HashRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
             
                  <Toaster />
                  <ErrorBoundary>
                    <>{children}</>
                  </ErrorBoundary>
               
            </PersistGate>
          </Provider>
        </AuthProvider>
      </QueryClientProvider>
    </HashRouter>
  );
};

export default AppProvider;
