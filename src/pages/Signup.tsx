import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import styles from "./Signup.module.css";

type Gender = "M" | "F" | "";

export default function Signup() {
  const navigate = useNavigate();

  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 80 }, (_, i) => String(now - i));
  }, []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1)), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1)), []);

  const [gender, setGender] = useState<Gender>("");

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO: 회원가입 API 연결
    navigate("/welcome");
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>회원가입</h1>

        <form className={styles.card} onSubmit={onSubmit}>
          {/* 아이디 + 중복확인 */}
          <div className={styles.row}>
            <label className={styles.label}>아이디</label>
            <div className={styles.cell}>
              <div className={styles.idGroup}>
                <input className={`${styles.input} ${styles.field}`} placeholder="아이디" />
                <button type="button" className={styles.dupBtn}>
                  아이디 중복 확인
                </button>
              </div>
            </div>
          </div>

          {/* 비밀번호 */}
          <div className={styles.row}>
            <label className={styles.label}>비밀번호</label>
            <div className={styles.cell}>
              <input className={`${styles.input} ${styles.field}`} placeholder="비밀번호" type="password" />
            </div>
          </div>

          {/* 비밀번호 확인 */}
          <div className={styles.row}>
            <label className={styles.label}>비밀번호 확인</label>
            <div className={styles.cell}>
              <input className={`${styles.input} ${styles.field}`} placeholder="비밀번호 확인" type="password" />
            </div>
          </div>

          {/* 이름 */}
          <div className={styles.row}>
            <label className={styles.label}>이름</label>
            <div className={styles.cell}>
              <input className={`${styles.input} ${styles.field}`} placeholder="이름" />
            </div>
          </div>

          {/* 생년월일 */}
          <div className={styles.row}>
            <label className={styles.label}>생년월일</label>
            <div className={styles.cell}>
              <div className={styles.birthGroup}>
                <select className={styles.select}>
                  <option value="">년</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
                <select className={styles.select}>
                  <option value="">월</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <select className={styles.select}>
                  <option value="">일</option>
                  {days.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 성별 */}
          <div className={styles.row}>
            <label className={styles.label}>성별</label>
            <div className={styles.cell}>
              <div className={styles.genderGroup}>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === "M"}
                    onChange={() => setGender("M")}
                  />
                  남성
                </label>
                <label className={styles.radio}>
                  <input
                    type="radio"
                    name="gender"
                    checked={gender === "F"}
                    onChange={() => setGender("F")}
                  />
                  여성
                </label>
              </div>
            </div>
          </div>

          {/* 휴대폰 번호 */}
          <div className={styles.row}>
            <label className={styles.label}>휴대폰 번호</label>
            <div className={styles.cell}>
              <div className={styles.phoneGroup}>
                <select className={styles.selectSmall}>
                  <option>010</option>
                  <option>011</option>
                  <option>016</option>
                  <option>017</option>
                  <option>018</option>
                  <option>019</option>
                </select>
                <input className={styles.input} placeholder="1234" inputMode="numeric" />
                <input className={styles.input} placeholder="5678" inputMode="numeric" />
              </div>
            </div>
          </div>

          {/* 이메일 */}
          <div className={styles.row}>
            <label className={styles.label}>이메일</label>
            <div className={styles.cell}>
              <div className={styles.emailGroup}>
                <input className={styles.input} placeholder="이메일" />
                <span className={styles.at}>@</span>
                <input className={styles.input} placeholder="도메인" />
                <select className={styles.selectDomain}>
                  <option value="">선택</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="naver.com">naver.com</option>
                  <option value="daum.net">daum.net</option>
                  <option value="kakao.com">kakao.com</option>
                </select>
              </div>
            </div>
          </div>

          <button className={styles.submit} type="submit">
            회원가입 완료
          </button>
        </form>
      </div>
    </main>
  );
}
