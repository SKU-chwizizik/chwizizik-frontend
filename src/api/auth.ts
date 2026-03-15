import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const getKakaoUserInfo = async (code: string) => {
    const res = await axios.get(`/kakao/auth-code?code=${code}`);
    return res.data;
};

export const registerUser = async (signupData: any) => {
    const res = await axios.post(`/api/signup`, signupData,{
        // 세션이 유지되도록 설정
        withCredentials: true
    });
    return res.data;
};

export const loginUser = async (loginData: any) => {
    // 세션이 유지
    const res = await axios.post(`/api/login`, loginData, {
        withCredentials: true 
    });
    return res.data;
};