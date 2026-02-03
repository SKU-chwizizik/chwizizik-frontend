import { useNavigate } from 'react-router-dom';
import { BsArrowDownCircle } from "react-icons/bs";

function Home() {
    const navigate = useNavigate();
  return (
    <>
      <div className="HomeContainer">
        <div className="HomeText">
          <h1>맞춤형 AI 면접관</h1>
          <h1>알맞게 대비하세요</h1>
          <h3>당신의 합격을 지원합니다.</h3>
        </div>

        <div className="HomePeople">
          <img src="/img/HomePeople.png" alt="HomePeople" />
        </div>

        <button className="scrollButton" onClick={() => {
          document.getElementById("secondSection").scrollIntoView({ behavior: "smooth" });
        }}>
          <BsArrowDownCircle size="35" />
        </button>

        <div className="bottom-banner">
          <img src="/img/banner.png" alt="banner" />
        </div>

      </div>

      <div id="secondSection">
        <img src="/img/HomeBackground.png" alt="Background" className="SecondBgImg" />

        <div className="SecondContent">
          <div className="MainTextGroup">
            <p>정확한 분석과 섬세한 피드백</p>
            <h2>한 단계 더 성장하는 면접</h2>
          </div>

        <button className="startInterviewBtn" onClick={() => navigate('/ai')}>
            AI 면접 시작
        </button>


          <div className="SubTextGroup">
            <p>데이터 기반 분석으로 지원자의 강점을 발견하고 성장 방향을 제시합니다.</p>
            <p>사용자가 스스로 성장하며 합격할 때까지 도전할 수 있습니다.</p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;