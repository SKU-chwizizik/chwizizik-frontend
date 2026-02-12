import { useMemo, useState } from "react";
import styles from "./Aiselect.module.css";

type InterviewerType = "basic" | "job";
type Language = "ko" | "en";

interface InterviewerOption {
  id: InterviewerType;
  titleKo: string;
  titleEn: string;
  badgeKo: string;
  badgeEn: string;
  bulletsKo: string[];
  bulletsEn: string[];
  imgSrc: string;
}

export default function InterviewerSelect() {
  const [selected, setSelected] = useState<InterviewerType | null>(null);
  const [lang, setLang] = useState<Language>("ko");

  const options: InterviewerOption[] = useMemo(
    () => [
      {
        id: "basic",
        titleKo: "부장 임원 23년차",
        titleEn: "Senior Executive (23 yrs)",
        badgeKo: "기본 면접",
        badgeEn: "General Interview",
        bulletsKo: [
          "조직 목표와 전략에 맞는 인재 선발",
          "조직 적합성, 장기적 성장 가능성, 리더십 잠재력 평가",
        ],
        bulletsEn: [
          "Selects talent aligned with organization goals and strategy",
          "Evaluates culture fit, long-term growth potential, leadership",
        ],
        // 프로젝트 이미지 경로로 바꿔줘 (public 폴더 기준)
        imgSrc: "/img/man.png",
      },
      {
        id: "job",
        titleKo: "개발팀 팀장 17년차",
        titleEn: "Dev Team Lead (17 yrs)",
        badgeKo: "직무 면접",
        badgeEn: "Role Interview",
        bulletsKo: [
          "직무 관련 전문성, 실무 수행 능력 평가",
          "팀 내 협업, 문제 해결 능력, 프로젝트 경험 중심",
        ],
        bulletsEn: [
          "Assesses role expertise and practical execution",
          "Focus on collaboration, problem-solving, project experience",
        ],
        imgSrc: "/img/woman.png",
      },
    ],
    []
  );

  const t = (ko: string, en: string) => (lang === "ko" ? ko : en);

  const onStart = () => {
    if (!selected) return;

    // TODO: 여기서 라우팅/상태 저장하면 됨
    // 예: navigate(`/interview?type=${selected}&lang=${lang}`);
    alert(`Start interview: type=${selected}, lang=${lang}`);
  };

  return (
    <div className={styles.page}>
      {/* 상단 네비(프로젝트 헤더 컴포넌트 있으면 교체) */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.logoBox} aria-hidden="true">
            {"</>"}
          </div>
          <span className={styles.brandText}>취지직</span>
        </div>

        <nav className={styles.nav}>
          <a className={styles.navItem} href="#">
            HOME
          </a>
          <a className={`${styles.navItem} ${styles.navActive}`} href="#">
            AI 면접관
          </a>
          <a className={styles.navItem} href="#">
            마이페이지
          </a>
        </nav>

        <button className={styles.logout} type="button">
          로그아웃
        </button>
      </header>

      <main className={styles.main}>
        <h1 className={styles.title}>
          {t("함께 진행할 면접관을 선택하세요", "Choose an interviewer")}
        </h1>

        <section className={styles.cardGrid}>
          {options.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                className={`${styles.card} ${isSelected ? styles.cardSelected : ""}`}
                onClick={() => setSelected(opt.id)}
              >
                <div className={styles.badge}>
                  {lang === "ko" ? opt.badgeKo : opt.badgeEn}
                </div>

                <div className={styles.photoWrap}>
                  <img
                    src={opt.imgSrc}
                    alt={lang === "ko" ? opt.titleKo : opt.titleEn}
                    className={styles.photo}
                    onError={(e) => {
                      // 이미지 없을 때 깨짐 방지용(임시)
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>
                    {lang === "ko" ? opt.titleKo : opt.titleEn}
                  </div>
                  <ul className={styles.bullets}>
                    {(lang === "ko" ? opt.bulletsKo : opt.bulletsEn).map((b, idx) => (
                      <li key={idx}>{b}</li>
                    ))}
                  </ul>
                </div>
              </button>
            );
          })}
        </section>

        <section className={styles.controls}>
          <div className={styles.langBox}>
            <span className={styles.langLabel}>{t("언어", "Language")}</span>

            <label className={styles.radio}>
              <input
                type="radio"
                name="lang"
                checked={lang === "ko"}
                onChange={() => setLang("ko")}
              />
              <span>한국어</span>
            </label>

            <label className={styles.radio}>
              <input
                type="radio"
                name="lang"
                checked={lang === "en"}
                onChange={() => setLang("en")}
              />
              <span>English</span>
            </label>
          </div>

          <button
            className={styles.submit}
            type="button"
            disabled={!selected}        //선택 전 비활성화
            onClick={onStart}
          >
            {t("면접 시작", "Start Interview")}
          </button>
        </section>
      </main>
    </div>
  );
}
