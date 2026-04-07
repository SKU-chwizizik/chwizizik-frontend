import { Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import KakaoAuth from "./pages/KakaoAuth";
import Welcome from "./pages/Welcome";
import Portfolio from "./pages/Portfolio";
import Mypage from "./pages/Mypage";
import AiSelect from "./pages/Aiselect";
import Test from "./pages/Test";
import Loading from "./pages/Loading"; 
import InterviewExec from "./pages/InterviewExec";
import InterviewTech from "./pages/InterviewTech";
import Result from "./pages/Result";

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
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/ai-select" element={<AiSelect />} />
        <Route path="/test" element={<Test />} />
        <Route path="/loading" element={<Loading />} /> 
        <Route path="/interview/executive" element={<InterviewExec />} />
        <Route path="/interview/technical" element={<InterviewTech />} />
        <Route path="/result" element={<Result />} />
      </Routes>
    </>
  );
}