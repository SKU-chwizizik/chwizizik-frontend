import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getKakaoUserInfo } from "../api/auth"; // 분리한 함수 임포트

const KakaoAuth = () => {
    const navigate = useNavigate();

    // 1. URL의 인가코드 가져오기
    const code = new URL(window.location.href).searchParams.get("code");

    // 2. 요청 중복 방지용 자물쇠
    const isSent = useRef(false);

    useEffect(() => {
        const kakaoLogin = async () => {
            if (!code || isSent.current) return;

            isSent.current = true;

            try {
                console.log("인가코드 발견! API 함수를 호출합니다:", code);

                // 3. 분리한 API 함수 호출 (axios.get 대신 사용)
                const data = await getKakaoUserInfo(code); 

                console.log("로그인 성공! 받은 데이터:", data);

                // 4. 받아온 유저 정보를 브라우저에 저장
                if (data.nickname) {
                    localStorage.setItem("nickname", data.nickname);
                } else if (data.properties && data.properties.nickname) {
                    localStorage.setItem("nickname", data.properties.nickname);
                } else {
                    localStorage.setItem("nickname", "사용자");
                }

                if (data.accessToken) {
                    localStorage.setItem("accessToken", data.accessToken);
                }

                // 5. 페이지 이동
                navigate("/welcome", { state: { userInfo: data.user } });

            } catch (error) {
                console.error("로그인 에러:", error);
                alert("로그인 중 오류가 발생했습니다. 다시 시도해주세요.");
                navigate("/login");
            }
        };

        kakaoLogin();
    }, [code, navigate]);

    return <div>로그인 처리 중...</div>;
};

export default KakaoAuth;