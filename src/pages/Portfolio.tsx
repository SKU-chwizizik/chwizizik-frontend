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

export default function Portfolio() {
  const educationOptions = useMemo<Education[]>(
    () => ["", "초등학교 졸업", "중학교 졸업", "고등학교 졸업",
        "대학(2,3년) 졸업", "대학(4년) 졸업", "대학원(석사) 졸업", "대학원(박사) 졸업"],
    []
  );

  const [education, setEducation] = useState<Education>("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [field, setField] = useState("");
  const [cert, setCert] = useState("");

  const [resumeFile, setResumeFile] = useState<File | null>(null); // 자기소개서
  const [portfolioFile, setPortfolioFile] = useState<File | null>(null); // 포트폴리오

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // TODO: 서버 전송(FormData) 로직 연결
    // const fd = new FormData();
    // fd.append("education", education);
    // fd.append("school", school);
    // fd.append("major", major);
    // fd.append("field", field);
    // fd.append("cert", cert);
    // if (resumeFile) fd.append("resume", resumeFile);
    // if (portfolioFile) fd.append("portfolio", portfolioFile);

    console.log({
      education,
      school,
      major,
      field,
      cert,
      resumeFile: resumeFile?.name,
      portfolioFile: portfolioFile?.name,
    });
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
              <select
                className={`${styles.select} ${styles.field}`}
                value={education}
                onChange={(e) => setEducation(e.target.value as Education)}
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
            </div>
          </div>

          {/* 2. 학교명 */}
          <div className={styles.row}>
            <label className={styles.label}>학교명</label>
            <div className={styles.cell}>
              <input
                className={`${styles.input} ${styles.field}`}
                placeholder="학교명"
                value={school}
                onChange={(e) => setSchool(e.target.value)}
              />
            </div>
          </div>

          {/* 3. 전공 */}
          <div className={styles.row}>
            <label className={styles.label}>전공</label>
            <div className={styles.cell}>
              <input
                className={`${styles.input} ${styles.field}`}
                placeholder="전공"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
              />
            </div>
          </div>

          {/* 4. 취업 희망 분야 */}
          <div className={styles.row}>
            <label className={styles.label}>취업 희망 분야</label>
            <div className={styles.cell}>
              <input
                className={`${styles.input} ${styles.field}`}
                placeholder="예) 백엔드 개발, 데이터 분석 등"
                value={field}
                onChange={(e) => setField(e.target.value)}
              />
            </div>
          </div>

          {/* 5. 자격증 */}
          <div className={styles.row}>
            <label className={styles.label}>자격증</label>
            <div className={styles.cell}>
              <input
                className={`${styles.input} ${styles.field}`}
                placeholder="예) 정보처리기사, SQLD 등"
                value={cert}
                onChange={(e) => setCert(e.target.value)}
              />
            </div>
          </div>

          {/* 6. 자기소개서(파일) */}
          <div className={styles.row}>
            <label className={styles.label}>자기소개서</label>
            <div className={styles.cell}>
              <div className={styles.fileGroup}>
                <label className={styles.fileBtn}>
                  파일 선택
                  <input
                    className={styles.fileInput}
                    type="file"
                    accept=".pdf,.hwp,.hwpx,.doc,.docx,.txt"
                    onChange={(e) => setResumeFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <span className={styles.fileName}>
                  {resumeFile ? resumeFile.name : "선택된 파일 없음"}
                </span>
              </div>
            </div>
          </div>

          {/* 7. 포트폴리오(파일) */}
          <div className={styles.row}>
            <label className={styles.label}>포트폴리오</label>
            <div className={styles.cell}>
              <div className={styles.fileGroup}>
                <label className={styles.fileBtn}>
                  파일 선택
                  <input
                    className={styles.fileInput}
                    type="file"
                    accept=".pdf,.zip,.ppt,.pptx,.doc,.docx"
                    onChange={(e) => setPortfolioFile(e.target.files?.[0] ?? null)}
                  />
                </label>
                <span className={styles.fileName}>
                  {portfolioFile ? portfolioFile.name : "선택된 파일 없음"}
                </span>
              </div>
            </div>
          </div>

          <button className={styles.submit} type="submit">
            등록 완료
          </button>
        </form>
      </div>
    </main>
  );
}
