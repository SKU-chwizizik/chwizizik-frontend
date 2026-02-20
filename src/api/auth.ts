import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const getKakaoUserInfo = async (code: string) => {
    const res = await axios.get(`${BACKEND_URL}/kakao/auth-code?code=${code}`);
    return res.data;
};

export const registerUser = async (signupData: any) => {
    const res = await axios.post(`${BACKEND_URL}/signup`, signupData);
    return res.data;
};