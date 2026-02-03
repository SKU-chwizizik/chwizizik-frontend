import { BrowserRouter, Routes, Route, NavLink, Link } from 'react-router-dom';
import Home from './pages/Home';
import AiInterview from './pages/AiInterview';
import MyPage from './pages/MyPage';
import Login from './pages/Login';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav className="header">
        <Link to="/" className="logoLink">
          <img src="/img/Logo.png" alt="Logo" className="logoImg" />
        </Link>

        <div className="navMenu">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/ai">AI 면접관</NavLink>
          <NavLink to="/mypage">마이페이지</NavLink>
          <NavLink to="/login">로그인</NavLink>
        </div>
      </nav>
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai" element={<AiInterview />} />
        <Route path="/mypage" element={<MyPage />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;