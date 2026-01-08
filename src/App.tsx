
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Painel from "./pages/Painel";
import PainelLogin from "./pages/PainelLogin";
import Bio from "./pages/Bio";
import BioSimple from "./pages/BioSimple";
import BioFixed from "./pages/BioFixed";
import BioStyled from "./pages/BioStyled";
import BioTest from "./pages/BioTest";
import BioSimpleTest from "./pages/BioSimpleTest";
import Primeirinho from "./pages/Primeirinho";
import PrimeirinhoStatus from "./pages/PrimeirinhoStatus";
import LeadDetails from "./pages/LeadDetails";
import NoEscuro from "./pages/NoEscuro";
import RegistrationForm from "./pages/RegistrationForm";
import RegistrationConfirmation from "./pages/RegistrationConfirmation";
import RegistrationSearch from "./pages/RegistrationSearch";
import StructuredData from "./pages/StructuredData";
import RedirectHandler from "./components/RedirectHandler";
import MetaPixelInit from "./components/MetaPixelInit";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <MetaPixelInit />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/bio" element={<BioStyled />} />
          <Route path="/bio-simple" element={<BioSimple />} />
          <Route path="/bio-full" element={<Bio />} />
          <Route path="/primeirinho" element={<Primeirinho />} />
          <Route path="/primeirinho/2026/:uuid" element={<PrimeirinhoStatus />} />
          <Route path="/no-escuro" element={<NoEscuro />} />
          <Route path="/inscricao" element={<RegistrationForm />} />
          <Route path="/inscricao/confirmacao/:id" element={<RegistrationConfirmation />} />
          <Route path="/status" element={<RegistrationSearch />} />
          <Route path="/structured-data" element={<StructuredData />} />
          <Route path="/painel" element={<Painel />} />
          <Route path="/painel/login" element={<PainelLogin />} />
          <Route path="/painel/lead/:leadUuid" element={<LeadDetails />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<RedirectHandler />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
