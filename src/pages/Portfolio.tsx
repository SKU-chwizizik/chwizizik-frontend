import { useMemo, useState } from "react";
import styles from "./Portfolio.module.css";

type Education =
  | ""
  | "초등학교 졸업"
  | "중학교 졸업"
  | "고등학교 졸업"
  | "대학(2,3년) 졸업"
  | "대학(4년) 졸업"
  | "대학원(석사) 졸업"
  | "대학원(박사) 졸업";

type Errors = Partial<Record<
  | "education"
  | "school"
  | "major"
  | "field"
  | "cert"
  | "resumeFile"
  | "portfolioFile",
  string
>>;

export default function Portfolio() {
  const educationOptions = useMemo<Education[]>(
    () => [
      "",
      "초등학교 졸업",
      "중학교 졸업",
      "고등학교 졸업",
      "대학(2,3년) 졸업",
      "대학(4년) 졸업",
      "대학원(석사) 졸업",
      "대학원(박사) 졸업",
    ],
    []
  );

  const [education, setEducation] = useState<Education>("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [field, setField] = useState("");
  const [cert, setCert] = useState("");

  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null);

  // ✅ 실시간 메시지/검증 표시용
  const [errors, setErrors] = useState<Errors>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  // ✅ 공백 제거한 값
  const schoolV = school.trim();
  const majorV = major.trim();
  const fieldV = field.trim();
  const certV = cert.trim();

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


  // ✅ 검증 함수
  const validate = (): Errors => {
    const next: Errors = {};

    if (!education) next.education = "최종학력을 선택해주세요.";
    if (!schoolV) next.school = "학교명을 입력해주세요.";
    if (!majorV) next.major = "전공을 입력해주세요.";
    if (!fieldV) next.field = "취업 희망 분야를 입력해주세요.";
    if (!certV) next.cert = "자격증을 입력해주세요.";

    if (!resumeFile) next.resumeFile = "자기소개서 파일을 선택해주세요.";
    if (!portfolioFile) next.portfolioFile = "포트폴리오 파일을 선택해주세요.";

    return next;
  };

  // ✅ 실시간으로 errors 갱신 (submittedOnce 이후에만 화면에 빨간 경고 뜨게 하고 싶으면 조건 걸면 됨)
  const recomputeErrors = () => {
    const next = validate();
    setErrors(next);
    return next;
  };

  const isValid = Object.keys(validate()).length === 0;

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedOnce(true);

    const next = validate();
    setErrors(next);

    // ❌ 하나라도 누락이면 "페이지 넘어가면 안됨"
    if (Object.keys(next).length > 0) {
      alert("필수 항목을 모두 입력해주세요.");
      return;
    }

    // ✅ 여기부터가 “모든 정보 기입 시” 통과
    // TODO: 서버 전송(FormData) 로직 연결
    // const fd = new FormData();
    // fd.append("education", education);
    // fd.append("school", schoolV);
    // fd.append("major", majorV);
    // fd.append("field", fieldV);
    // fd.append("cert", certV);
    // if (resumeFile) fd.append("resume", resumeFile);
    // if (portfolioFile) fd.append("portfolio", portfolioFile);

    console.log({
      education,
      school: schoolV,
      major: majorV,
      field: fieldV,
      cert: certV,
      resumeFile: resumeFile?.name,
      portfolioFile: portfolioFile?.name,
    });

    alert("포트폴리오 등록이 완료되었습니다!");
    // ✅ 나중에 원하면 여기서 이동
    // navigate("/welcome");
  };

  // ✅ 입력 바뀔 때마다(또는 file 바뀔 때마다) 실시간 안내문구 갱신
  // - “실시간으로 사용자에게 보이게” 조건 충족
  const handleChangeAndValidate = <T,>(setter: (v: T) => void) => {
    return (v: T) => {
      setter(v);
      if (submittedOnce) recomputeErrors();
    };
  };

  return (
    <main className={styles.page}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>포트폴리오 등록</h1>

        <form className={styles.card} onSubmit={onSubmit}>
          {/* 1. 최종학력 */}
          <div className={styles.row}>
            <label className={styles.label}>최종학력</label>
            <div className={styles.cell}>
              <div className={styles.stack}>
                <select
                  className={`${styles.select} ${styles.field} ${
                    submittedOnce && errors.education ? styles.invalid : ""
                  }`}
                  value={education}
                  onChange={(e) => handleChangeAndValidate(setEducation)(e.target.value as Education)}
                >
                  <option value="">선택</option>
                  {educationOptions
                    .filter((v) => v !== "")
                    .map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                </select>

                {submittedOnce && errors.education && (
                  <p className={styles.errorText}>{errors.education}</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. 학교명 */}
          <div className={styles.row}>
            <label className={styles.label}>학교명</label>
            <div className={styles.cell}>
              <div className={styles.stack}>
                <input
                  className={`${styles.input} ${styles.field} ${
                    submittedOnce && errors.school ? styles.invalid : ""
                  }`}
                  placeholder="학교명"
                  value={school}
                  onChange={(e) => handleChangeAndValidate(setSchool)(e.target.value)}
                />
                {submittedOnce && errors.school && <p className={styles.errorText}>{errors.school}</p>}
              </div>
            </div>
          </div>

          {/* 3. 전공 */}
          <div className={styles.row}>
            <label className={styles.label}>전공</label>
            <div className={styles.cell}>
              <div className={styles.stack}>
                <input
                  className={`${styles.input} ${styles.field} ${
                    submittedOnce && errors.major ? styles.invalid : ""
                  }`}
                  placeholder="전공"
                  value={major}
                  onChange={(e) => handleChangeAndValidate(setMajor)(e.target.value)}
                />
                {submittedOnce && errors.major && <p className={styles.errorText}>{errors.major}</p>}
              </div>
            </div>
          </div>

          {/* 4. 취업 희망 분야 */}
          <div className={styles.row}>
            <label className={styles.label}>취업 희망 분야</label>
            <div className={styles.cell}>
              <div className={styles.stack}>
                <input
                  className={`${styles.input} ${styles.field} ${
                    submittedOnce && errors.field ? styles.invalid : ""
                  }`}
                  placeholder="예) 백엔드 개발, 데이터 분석 등"
                  value={field}
                  onChange={(e) => handleChangeAndValidate(setField)(e.target.value)}
                />
                {submittedOnce && errors.field && <p className={styles.errorText}>{errors.field}</p>}
              </div>
            </div>
          </div>

          {/* 5. 자격증 */}
          <div className={styles.row}>
            <label className={styles.label}>자격증</label>
            <div className={styles.cell}>
              <div className={styles.stack}>
                <input
                  className={`${styles.input} ${styles.field} ${
                    submittedOnce && errors.cert ? styles.invalid : ""
                  }`}
                  placeholder="예) 정보처리기사, SQLD 등"
                  value={cert}
                  onChange={(e) => handleChangeAndValidate(setCert)(e.target.value)}
                />
                {submittedOnce && errors.cert && <p className={styles.errorText}>{errors.cert}</p>}
              </div>
            </div>
          </div>

          {/* 6. 자기소개서(파일) */}
          <div className={styles.row}>
            <label className={styles.label}>자기소개서</label>
            <div className={styles.cell}>
              <div className={styles.stack}>
                <div className={`${styles.fileGroup} ${submittedOnce && errors.resumeFile ? styles.invalidBox : ""}`}>
                  <label className={styles.fileBtn}>
                    파일 선택
                    <input
                      className={styles.fileInput}
                      type="file"
                      accept=".pdf,.hwp,.hwpx,.doc,.docx,.txt"
                      onChange={(e) => {
                        handleChangeAndValidate(setResumeFile)(e.target.files?.[0] ?? null);
                      }}
                    />
                  </label>
                  <span className={styles.fileName}>
                    {resumeFile ? resumeFile.name : "선택된 파일 없음"}
                  </span>
                </div>
                {submittedOnce && errors.resumeFile && (
                  <p className={styles.errorText}>{errors.resumeFile}</p>
                )}
              </div>
            </div>
          </div>

          {/* 7. 포트폴리오(파일) */}
          <div className={styles.row}>
            <label className={styles.label}>포트폴리오</label>
            <div className={styles.cell}>
              <div className={styles.stack}>
                <div className={`${styles.fileGroup} ${submittedOnce && errors.portfolioFile ? styles.invalidBox : ""}`}>
                  <label className={styles.fileBtn}>
                    파일 선택
                    <input
                      className={styles.fileInput}
                      type="file"
                      accept=".pdf,.zip,.ppt,.pptx,.doc,.docx"
                      onChange={(e) => {
                        handleChangeAndValidate(setPortfolioFile)(e.target.files?.[0] ?? null);
                      }}
                    />
                  </label>
                  <span className={styles.fileName}>
                    {portfolioFile ? portfolioFile.name : "선택된 파일 없음"}
                  </span>
                </div>
                {submittedOnce && errors.portfolioFile && (
                  <p className={styles.errorText}>{errors.portfolioFile}</p>
                )}
              </div>
            </div>
          </div>

          {/* ✅ 버튼: 전부 채워졌을 때만 활성화 느낌 */}
          <button
            className={`${styles.submit} ${!isValid ? styles.submitDisabled : ""}`}
            type="submit"
          >
            등록 완료
          </button>

          {/* ✅ 아래에 실시간 안내문구(선택) */}
          <p className={styles.hint}>
            {isValid ? "모든 항목이 입력되었습니다. 등록을 완료할 수 있어요." : "필수 항목을 모두 입력해주세요."}
          </p>
        </form>
      </div>
    </main>
  );
}
