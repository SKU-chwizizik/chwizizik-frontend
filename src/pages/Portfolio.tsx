import { useMemo, useState } from "react";
import styles from "./Portfolio.module.css";

/** 최종학력 타입 */
type Education =
  | ""
  | "초등학교 졸업"
  | "중학교 졸업"
  | "고등학교 졸업"
  | "대학(2,3년) 졸업"
  | "대학(4년) 졸업"
  | "대학원(석사) 졸업"
  | "대학원(박사) 졸업";

/** 에러 메시지 타입 */
type Errors = Partial<
  Record<
    | "education"
    | "school"
    | "major"
    | "field"
    | "cert"
    | "documentFile",
    string
  >
>;

export default function Portfolio() {
  /** 학력 옵션 목록 */
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

  /** 입력값 state */
  const [education, setEducation] = useState<Education>("");
  const [school, setSchool] = useState("");
  const [major, setMajor] = useState("");
  const [field, setField] = useState("");
  const [cert, setCert] = useState("");

  /**
   * 자기소개서 + 포트폴리오 통합 파일
   * PDF 1개만 업로드 받음
   */
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  /** 검증/제출 관련 state */
  const [errors, setErrors] = useState<Errors>({});
  const [submittedOnce, setSubmittedOnce] = useState(false);

  /** 앞뒤 공백 제거한 값 */
  const schoolV = school.trim();
  const majorV = major.trim();
  const fieldV = field.trim();
  const certV = cert.trim();

  /**
   * 파일이 PDF인지 검사
   * - 확장자만 믿지 않고
   * - mime type + 파일명 확장자를 함께 확인
   */
  const isPdfFile = (file: File) => {
    const isMimePdf = file.type === "application/pdf";
    const isExtPdf = file.name.toLowerCase().endsWith(".pdf");
    return isMimePdf || isExtPdf;
  };

  /**
   * 전체 검증 함수
   * - 누락된 항목이 있으면 errors 객체에 메시지 추가
   */
  const validate = (): Errors => {
    const next: Errors = {};

    if (!education) next.education = "최종학력을 선택해주세요.";
    if (!schoolV) next.school = "학교명을 입력해주세요.";
    if (!majorV) next.major = "전공을 입력해주세요.";
    if (!fieldV) next.field = "취업 희망 분야를 입력해주세요.";
    if (!certV) next.cert = "자격증을 입력해주세요.";

    /**
     * 통합 PDF 파일 검증
     * 1) 파일이 없는 경우
     * 2) PDF가 아닌 경우
     */
    if (!documentFile) {
      next.documentFile = "자기소개서 및 포트폴리오 PDF 파일을 선택해주세요.";
    } else if (!isPdfFile(documentFile)) {
      next.documentFile = "PDF 파일만 업로드할 수 있습니다.";
    }

    return next;
  };

  /**
   * 현재 입력 상태 기준으로 errors 재계산
   * submittedOnce 이후 실시간 검증에 사용
   */
  const recomputeErrors = () => {
    const next = validate();
    setErrors(next);
    return next;
  };

  /** 전체 폼 유효 여부 */
  const isValid = Object.keys(validate()).length === 0;

  /**
   * 제출 핸들러
   * - 필수값 누락 시 제출 막음
   * - 모두 입력되면 서버 전송 위치로 이어짐
   */
  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmittedOnce(true);

    const next = validate();
    setErrors(next);

    // 하나라도 누락/오류 있으면 제출 중단
    if (Object.keys(next).length > 0) {
      alert("필수 항목을 모두 올바르게 입력해주세요.");
      return;
    }

    /**
     * TODO: 서버 전송 시 FormData 예시
     *
     * const fd = new FormData();
     * fd.append("education", education);
     * fd.append("school", schoolV);
     * fd.append("major", majorV);
     * fd.append("field", fieldV);
     * fd.append("cert", certV);
     * if (documentFile) fd.append("document", documentFile);
     */

    console.log({
      education,
      school: schoolV,
      major: majorV,
      field: fieldV,
      cert: certV,
      documentFile: documentFile?.name,
    });

    alert("포트폴리오 등록이 완료되었습니다!");
  };

  /**
   * 일반 input/select 변경 + submittedOnce 이후 실시간 검증
   */
  const handleChangeAndValidate = <T,>(setter: (v: T) => void) => {
    return (v: T) => {
      setter(v);
      if (submittedOnce) recomputeErrors();
    };
  };

  /**
   * 파일 선택 핸들러
   * - 파일 없음 처리
   * - PDF 아닌 파일 즉시 차단
   * - PDF면 정상 반영
   */
  const handleDocumentChange = (file: File | null) => {
    // 파일 선택 취소한 경우
    if (!file) {
      setDocumentFile(null);

      if (submittedOnce) {
        setErrors((prev) => ({
          ...prev,
          documentFile: "자기소개서 및 포트폴리오 PDF 파일을 선택해주세요.",
        }));
      }
      return;
    }

    // PDF가 아니면 업로드 막기
    if (!isPdfFile(file)) {
      setDocumentFile(null);
      setErrors((prev) => ({
        ...prev,
        documentFile: "PDF 파일만 업로드할 수 있습니다.",
      }));
      return;
    }

    // 정상 PDF 파일이면 반영
    setDocumentFile(file);

    // 제출 시도 이후라면 에러 재계산
    if (submittedOnce) {
      recomputeErrors();
    }
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
                  onChange={(e) =>
                    handleChangeAndValidate(setEducation)(
                      e.target.value as Education
                    )
                  }
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
                  onChange={(e) =>
                    handleChangeAndValidate(setSchool)(e.target.value)
                  }
                />
                {submittedOnce && errors.school && (
                  <p className={styles.errorText}>{errors.school}</p>
                )}
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
                  onChange={(e) =>
                    handleChangeAndValidate(setMajor)(e.target.value)
                  }
                />
                {submittedOnce && errors.major && (
                  <p className={styles.errorText}>{errors.major}</p>
                )}
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
                  onChange={(e) =>
                    handleChangeAndValidate(setField)(e.target.value)
                  }
                />
                {submittedOnce && errors.field && (
                  <p className={styles.errorText}>{errors.field}</p>
                )}
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
                  onChange={(e) =>
                    handleChangeAndValidate(setCert)(e.target.value)
                  }
                />
                {submittedOnce && errors.cert && (
                  <p className={styles.errorText}>{errors.cert}</p>
                )}
              </div>
            </div>
          </div>

          {/* 6. 자기소개서 + 포트폴리오 통합 PDF 업로드 */}
          <div className={styles.row}>
            <label className={styles.label}>자기소개서 및 <br />포트폴리오</label>
            <div className={styles.cell}>
              <div className={styles.stack}>
                <div
                  className={`${styles.fileGroup} ${
                    submittedOnce && errors.documentFile
                      ? styles.invalidBox
                      : ""
                  }`}
                >
                  <label className={styles.fileBtn}>
                    파일 선택
                    <input
                      className={styles.fileInput}
                      type="file"
                      /**
                       * 브라우저 파일 선택창에서 PDF만 보이도록 제한
                       * 단, 이것만으로는 완전하지 않아서
                       * 아래 handleDocumentChange에서 한 번 더 검사함
                       */
                      accept=".pdf,application/pdf"
                      onChange={(e) => {
                        handleDocumentChange(e.target.files?.[0] ?? null);
                      }}
                    />
                  </label>

                  <span className={styles.fileName}>
                    {documentFile
                      ? documentFile.name
                      : "PDF 파일만 업로드 가능합니다"}
                  </span>
                </div>

                {submittedOnce && errors.documentFile && (
                  <p className={styles.errorText}>{errors.documentFile}</p>
                )}
              </div>
            </div>
          </div>

          {/* 제출 버튼 */}
          <button
            className={`${styles.submit} ${
              !isValid ? styles.submitDisabled : ""
            }`}
            type="submit"
          >
            등록 완료
          </button>

          {/* 하단 안내 문구 */}
          <p className={styles.hint}>
            {isValid
              ? "모든 항목이 입력되었습니다. 등록을 완료할 수 있어요."
              : "필수 항목을 모두 입력해주세요."}
          </p>
        </form>
      </div>
    </main>
  );
}