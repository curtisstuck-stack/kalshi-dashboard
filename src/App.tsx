import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingSkeleton } from "@/components/common/QueryStates";

// Route-level code splitting — keeps Recharts off the Home/landing path.
const Home = lazy(() => import("@/pages/Home"));
const TickerDetail = lazy(() => import("@/pages/TickerDetail"));
const Portfolio = lazy(() => import("@/pages/Portfolio"));
const SignalExplorer = lazy(() => import("@/pages/SignalExplorer"));
const ResearchArchive = lazy(() => import("@/pages/ResearchArchive"));
const BotHealth = lazy(() => import("@/pages/BotHealth"));
const Login = lazy(() => import("@/pages/Login"));

export default function App() {
  return (
    <Suspense fallback={<div className="p-6"><LoadingSkeleton rows={6} /></div>}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Home />} />
          <Route path="/ticker/:ticker" element={<TickerDetail />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/signals" element={<SignalExplorer />} />
          <Route path="/archive" element={<ResearchArchive />} />
          <Route path="/archive/:date" element={<ResearchArchive />} />
          <Route path="/health" element={<BotHealth />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
