import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Signup.module.css";

type Gender = "M" | "F" | "";

const existingUsers = ["admin", "test1234", "user01"]; // 더미 DB


// 특수문자 1개 이상 (원하는 특수문자 범위 늘려도 됨)
const SPECIAL_REGEX = /[!@#$%^&*()_\-+=[\]{};':"\\|,.<>/?`~]/;

function validatePassword(pw: string) {
  if (pw.length < 8 || pw.length > 16) return "비밀번호는 8~16자여야 합니다.";
  if (!SPECIAL_REGEX.test(pw)) return "특수문자를 1개 이상 포함해야 합니다.";
  return ""; // 통과
}

export default function Signup() {
  const navigate = useNavigate();

  // 생년월일 셀렉트
  const years = useMemo(() => {
    const now = new Date().getFullYear();
    return Array.from({ length: 80 }, (_, i) => String(now - i));
  }, []);
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => String(i + 1)), []);
  const days = useMemo(() => Array.from({ length: 31 }, (_, i) => String(i + 1)), []);

  // ====== form state ======
  const [userId, setUserId] = useState("");
  const [isIdChecked, setIsIdChecked] = useState(false); // 아이디 중복확인 통과 여부
  const [idCheckMsg, setIdCheckMsg] = useState("");

  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [name, setName] = useState("");

  const [birthY, setBirthY] = useState("");
  const [birthM, setBirthM] = useState("");
  const [birthD, setBirthD] = useState("");

  const [gender, setGender] = useState<Gender>("");

  const [phone1, setPhone1] = useState("010");
  const [phone2, setPhone2] = useState("");
  const [phone3, setPhone3] = useState("");

  const [emailId, setEmailId] = useState("");
  const [emailDomain, setEmailDomain] = useState("");

  const isValid =
  userId.trim() !== "" &&
  isIdChecked &&                // 아이디 중복확인 통과
  pw !== "" &&
  validatePassword(pw) === "" && // 비밀번호 규칙 통과
  pw === pw2 &&                  // 비밀번호 일치
  name.trim() !== "" &&
  birthY !== "" &&
  birthM !== "" &&
  birthD !== "" &&
  gender !== "" &&
  phone2.trim() !== "" &&
  phone3.trim() !== "" &&
  emailId.trim() !== "" &&
  emailDomain.trim() !== "";

  // ====== derived validations (실시간) ======
  const pwRuleMsg = validatePassword(pw);
  const pwMatchMsg =
    pw2.length === 0
      ? ""
      : pw === pw2
      ? "비밀번호가 일치합니다."
      : "비밀번호가 일치하지 않습니다.";

  // ====== handlers ======
  const handleCheckId = () => {
    const trimmed = userId.trim();
    if (!trimmed) {
      alert("아이디를 입력해주세요.");
      setIsIdChecked(false);
      setIdCheckMsg("");
      return;
    }

    if (existingUsers.includes(trimmed)) {
      alert("이미 사용 중인 아이디입니다.");
      setIsIdChecked(false);
      setIdCheckMsg("이미 사용 중인 아이디입니다.");
    } else {
      alert("사용 가능한 아이디입니다!");
      setIsIdChecked(true);
      setIdCheckMsg("사용 가능한 아이디입니다.");
    }
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 4) 누락 체크 + 검증 체크 (하나라도 실패하면 이동 금지)
    if (!userId.trim()) return alert("아이디를 입력해주세요.");
    if (!isIdChecked) return alert("아이디 중복 확인을 해주세요.");

    if (!pw) return alert("비밀번호를 입력해주세요.");
    const pwMsg = validatePassword(pw);
    if (pwMsg) return alert(pwMsg);

    if (!pw2) return alert("비밀번호 확인을 입력해주세요.");
    if (pw !== pw2) return alert("비밀번호가 일치하지 않습니다.");

    if (!name.trim()) return alert("이름을 입력해주세요.");

    if (!birthY || !birthM || !birthD) return alert("생년월일을 선택해주세요.");

    if (!gender) return alert("성별을 선택해주세요.");

    if (!phone2.trim() || !phone3.trim()) return alert("휴대폰 번호를 입력해주세요.");
    // 간단 숫자 체크 (원하면 더 엄격하게)
    if (!/^\d+$/.test(phone2) || !/^\d+$/.test(phone3)) return alert("휴대폰 번호는 숫자만 입력해주세요.");

    if (!emailId.trim() || !emailDomain.trim()) return alert("이메일을 입력해주세요.");

    // ✅ 여기까지 통과 => 가입 성공 처리(더미)
    // TODO: 회원가입 API 연결

    navigate("/welcome"); // 너 라우팅에 맞게 변경 가능
  };

  // select 도메인 선택 시 input 채워주기(편의)
  const onChangeDomainSelect = (v: string) => {
    if (!v) return;
    setEmailDomain(v);
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
                <input
                  className={`${styles.input} ${styles.field}`}
                  placeholder="아이디"
                  value={userId}
                  onChange={(e) => {
                    setUserId(e.target.value);
                    setIsIdChecked(false); // 아이디 수정 시 다시 확인 필요
                    setIdCheckMsg("");
                  }}
                />
                <button type="button" className={styles.dupBtn} onClick={handleCheckId}>
                  아이디 중복 확인
                </button>
              </div>
            </div>
          </div>

          {/* 아이디 체크 메시지(레이아웃 안 깨지게 row 하나 더) */}
          {idCheckMsg && (
            <div className={styles.row}>
              <div />
              <div className={styles.cell}>
                <span style={{ fontSize: 12, color: isIdChecked ? "green" : "crimson" }}>
                  {idCheckMsg}
                </span>
              </div>
            </div>
          )}

          {/* 비밀번호 */}
          <div className={styles.row}>
            <label className={styles.label}>비밀번호</label>
            <div className={styles.cell}>
              <input
                className={`${styles.input} ${styles.field}`}
                placeholder="비밀번호"
                type="password"
                value={pw}
                onChange={(e) => setPw(e.target.value)}
              />
            </div>
          </div>

          {/* 비밀번호 규칙 메시지 */}
          {pw.length > 0 && (
            <div className={styles.row}>
              <div />
              <div className={styles.cell}>
                <span style={{ fontSize: 12, color: pwRuleMsg ? "crimson" : "green" }}>
                  {pwRuleMsg ? pwRuleMsg : "사용 가능한 비밀번호입니다."}
                </span>
              </div>
            </div>
          )}

          {/* 비밀번호 확인 */}
          <div className={styles.row}>
            <label className={styles.label}>비밀번호 확인</label>
            <div className={styles.cell}>
              <input
                className={`${styles.input} ${styles.field}`}
                placeholder="비밀번호 확인"
                type="password"
                value={pw2}
                onChange={(e) => setPw2(e.target.value)}
              />
            </div>
          </div>

          {/* 비밀번호 일치 실시간 */}
          {pw2.length > 0 && (
            <div className={styles.row}>
              <div />
              <div className={styles.cell}>
                <span style={{ fontSize: 12, color: pw === pw2 ? "green" : "crimson" }}>
                  {pwMatchMsg}
                </span>
              </div>
            </div>
          )}

          {/* 이름 */}
          <div className={styles.row}>
            <label className={styles.label}>이름</label>
            <div className={styles.cell}>
              <input
                className={`${styles.input} ${styles.field}`}
                placeholder="이름"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          </div>

          {/* 생년월일 */}
          <div className={styles.row}>
            <label className={styles.label}>생년월일</label>
            <div className={styles.cell}>
              <div className={styles.birthGroup}>
                <select className={styles.select} value={birthY} onChange={(e) => setBirthY(e.target.value)}>
                  <option value="">년</option>
                  {years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>

                <select className={styles.select} value={birthM} onChange={(e) => setBirthM(e.target.value)}>
                  <option value="">월</option>
                  {months.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>

                <select className={styles.select} value={birthD} onChange={(e) => setBirthD(e.target.value)}>
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
                  <input type="radio" name="gender" checked={gender === "M"} onChange={() => setGender("M")} />
                  남성
                </label>
                <label className={styles.radio}>
                  <input type="radio" name="gender" checked={gender === "F"} onChange={() => setGender("F")} />
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
                <select className={styles.selectSmall} value={phone1} onChange={(e) => setPhone1(e.target.value)}>
                  <option>010</option>
                  <option>011</option>
                  <option>016</option>
                  <option>017</option>
                  <option>018</option>
                  <option>019</option>
                </select>

                <input
                  className={styles.input}
                  placeholder="1234"
                  inputMode="numeric"
                  value={phone2}
                  onChange={(e) => setPhone2(e.target.value)}
                />
                <input
                  className={styles.input}
                  placeholder="5678"
                  inputMode="numeric"
                  value={phone3}
                  onChange={(e) => setPhone3(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* 이메일 */}
          <div className={styles.row}>
            <label className={styles.label}>이메일</label>
            <div className={styles.cell}>
              <div className={styles.emailGroup}>
                <input
                  className={styles.input}
                  placeholder="이메일"
                  value={emailId}
                  onChange={(e) => setEmailId(e.target.value)}
                />
                <span className={styles.at}>@</span>
                <input
                  className={styles.input}
                  placeholder="도메인"
                  value={emailDomain}
                  onChange={(e) => setEmailDomain(e.target.value)}
                />
                <select className={styles.selectDomain} value="" onChange={(e) => onChangeDomainSelect(e.target.value)}>
                  <option value="">선택</option>
                  <option value="gmail.com">gmail.com</option>
                  <option value="naver.com">naver.com</option>
                  <option value="daum.net">daum.net</option>
                  <option value="kakao.com">kakao.com</option>
                </select>
              </div>
            </div>
          </div>

          <button
            className={`${styles.submit} ${!isValid ? styles.submitDisabled : ""}`}
            type="submit"
            disabled={!isValid}
          >
            회원가입 완료
          </button>

        </form>
      </div>
    </main>
  );
}

