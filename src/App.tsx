import { Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import KakaoAuth from "./pages/KakaoAuth";
import Welcome from "./pages/Welcome";
import Portfolio from "./pages/Portfolio";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/kakao/auth-code" element={<KakaoAuth />} />
        <Route path="/welcome" element={<Welcome />} />
        <Route path="/portfolio" element={<Portfolio />} />
      </Routes>
    </>
  );
}
