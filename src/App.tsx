import { Routes, Route } from "react-router-dom";
import { AppShell } from "@/components/layout/AppShell";
import Home from "@/pages/Home";
import TickerDetail from "@/pages/TickerDetail";
import Portfolio from "@/pages/Portfolio";
import SignalExplorer from "@/pages/SignalExplorer";
import ResearchArchive from "@/pages/ResearchArchive";
import BotHealth from "@/pages/BotHealth";
import Login from "@/pages/Login";

export default function App() {
  return (
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
  );
}
