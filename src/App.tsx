import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient} data-oid="c49ahw9">
    <TooltipProvider data-oid="mpvix11">
      <Toaster data-oid="ff7.-xd" />
      <Sonner data-oid="ve4vhey" />
      <BrowserRouter data-oid="xqor31n">
        <Routes data-oid="rw9-_fw">
          <Route
            path="/"
            element={<Index data-oid="ga7:u5v" />}
            data-oid="_cc::wq"
          />

          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route
            path="*"
            element={<NotFound data-oid="2lyd-_k" />}
            data-oid="5kx.3yb"
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
