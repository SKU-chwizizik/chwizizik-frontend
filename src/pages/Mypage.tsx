import React, { useState } from 'react';
import styles from './Mypage.module.css';
// 별도로 만든 컴포넌트 임포트
import InterviewRecords from './InterviewRecords'; 

// 0. 학력 타입 정의
type Education =
  | ""
  | "초등학교 졸업"
  | "중학교 졸업"
  | "고등학교 졸업"
  | "대학(2,3년) 졸업"
  | "대학(4년) 졸업"
  | "대학원(석사) 졸업"
  | "대학원(박사) 졸업";

// 파일 정보를 담을 인터페이스
interface AttachedFile {
  id: number;
  name: string;
}

const Mypage = () => {
  // --- 상태 관리 영역 ---
  
  // 1. 메뉴 전환 상태 ('info': 내 정보, 'records': 기록 보관)
  const [activeMenu, setActiveMenu] = useState<'info' | 'records'>('info');

  // 2. 기본 정보 상태
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    name: '홍길동',
    phone: '010-1234-5678',
    email: 'hong@example.com',
    jobField: '프론트엔드 개발자'
  });

  // 3. 학력 정보 상태
  const [isEduEditing, setIsEduEditing] = useState(false);
  const [eduInfo, setEduInfo] = useState({
    level: "대학(4년) 졸업" as Education,
    school: "한국대학교",
    major: "컴퓨터공학과"
  });

  const eduOptions: Education[] = [
    "초등학교 졸업", "중학교 졸업", "고등학교 졸업", 
    "대학(2,3년) 졸업", "대학(4년) 졸업", 
    "대학원(석사) 졸업", "대학원(박사) 졸업"
  ];

  // 4. 자격증 정보 상태
  const [isCertEditing, setIsCertEditing] = useState(false);
  const [certInput, setCertInput] = useState("");
  const [certificates, setCertificates] = useState(["정보처리기사 1급", "리눅스 마스터 1급"]);

  // 5. 파일 정보 상태
  const [files, setFiles] = useState<AttachedFile[]>([
    { id: Date.now(), name: "홍길동_자기소개서.pdf" }
  ]);

  // --- 핸들러 영역 ---

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setProfileImage(reader.result as string); };
      reader.readAsDataURL(file);
    }
  };

  const handleImageDelete = () => {
    if (window.confirm("프로필 사진을 삭제하시겠습니까?")) setProfileImage(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleEduChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEduInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    alert('기본 정보가 저장되었습니다.');
    setIsEditing(false);
  };

  const handleEduSave = () => {
    alert('학력 정보가 저장되었습니다.');
    setIsEduEditing(false);
  };

  const handleAddCert = () => {
    if (certInput.trim() === "") return;
    setCertificates(prev => [...prev, certInput]);
    setCertInput("");
    setIsCertEditing(false);
  };

  const handleDeleteCert = (index: number) => {
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf') {
        alert('PDF 파일만 업로드 가능합니다.');
        return;
      }
      setFiles(prev => [...prev, { id: Date.now(), name: selectedFile.name }]);
      e.target.value = "";
    }
  };

  const handleDeleteFile = (id: number) => {
    if (window.confirm("파일을 삭제하시겠습니까?")) {
      setFiles(prev => prev.filter(f => f.id !== id));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        
        {/* 사이드바 메뉴 */}
        <aside className={styles.sidebar}>
          <h2 className={styles.menuTitle}>마이페이지</h2>
          <ul className={styles.menuList}>
            <li 
              className={`${styles.menuItem} ${activeMenu === 'info' ? styles.active : ''}`}
              onClick={() => setActiveMenu('info')}
            >
              내 정보
            </li>
            <li 
              className={`${styles.menuItem} ${activeMenu === 'records' ? styles.active : ''}`}
              onClick={() => setActiveMenu('records')}
            >
              모의 면접 기록 보관
            </li>
          </ul>
        </aside>

        {/* 본문 콘텐츠 */}
        <main className={styles.content}>
          {activeMenu === 'info' ? (
            /* [내 정보 화면] */
            <>
              <h1 className={styles.mainTitle}>내 정보</h1>
              
              {/* 섹션 1: 기본 정보 */}
              <section className={styles.card}>
                <div className={styles.profileSection}>
                  <div className={styles.imageUpload}>
                    <div className={styles.imagePreview}>
                      {profileImage ? <img src={profileImage} alt="프로필" className={styles.previewImg} /> : <span>사진 등록</span>}
                    </div>
                    <div className={styles.btnGroup}>
                      <input type="file" id="profile-upload" accept=".jpg, .jpeg, .png" hidden onChange={handleImageChange} />
                      <label htmlFor="profile-upload" className={styles.uploadBtn}>사진 변경</label>
                      {profileImage && <button onClick={handleImageDelete} className={styles.deleteBtn}>삭제</button>}
                    </div>
                  </div>

                  <div className={styles.basicInfo}>
                    <div className={styles.infoField}><label>이름</label>{isEditing ? <input name="name" value={userInfo.name} onChange={handleInputChange} className={styles.editInput} /> : <span className={styles.infoText}>{userInfo.name}</span>}</div>
                    <div className={styles.infoField}><label>전화번호</label>{isEditing ? <input name="phone" value={userInfo.phone} onChange={handleInputChange} className={styles.editInput} /> : <span className={styles.infoText}>{userInfo.phone}</span>}</div>
                    <div className={styles.infoField}><label>이메일</label>{isEditing ? <input name="email" value={userInfo.email} onChange={handleInputChange} className={styles.editInput} /> : <span className={styles.infoText}>{userInfo.email}</span>}</div>
                    <div className={styles.infoField}><label>희망 분야</label>{isEditing ? <input name="jobField" value={userInfo.jobField} onChange={handleInputChange} className={styles.editInput} /> : <span className={styles.infoText}>{userInfo.jobField}</span>}</div>
                    <div className={styles.actionBtns}>
                      {isEditing ? <><button onClick={handleSave} className={styles.saveBtn}>저장하기</button><button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>취소</button></> : <button onClick={() => setIsEditing(true)} className={styles.saveBtn}>정보 수정하기</button>}
                    </div>
                  </div>
                </div>
              </section>

              {/* 섹션 2: 학력 / 전공 */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>학력 / 전공</h3>
                  {!isEduEditing && <button className={styles.editBtn} onClick={() => setIsEduEditing(true)}>수정</button>}
                </div>
                {isEduEditing ? (
                  <div className={styles.editForm}>
                    <div className={styles.infoField}>
                      <label>최종학력</label>
                      <select name="level" value={eduInfo.level} onChange={handleEduChange} className={styles.editSelect}>
                        <option value="" disabled>학력을 선택해주세요</option>
                        {eduOptions.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className={styles.infoField}><label>학교명</label><input name="school" value={eduInfo.school} onChange={handleEduChange} className={styles.editInput} /></div>
                    <div className={styles.infoField}><label>전공</label><input name="major" value={eduInfo.major} onChange={handleEduChange} className={styles.editInput} /></div>
                    <div className={styles.actionBtns}><button onClick={handleEduSave} className={styles.saveBtn}>저장</button><button onClick={() => setIsEduEditing(false)} className={styles.cancelBtn}>취소</button></div>
                  </div>
                ) : (
                  <><div className={styles.infoRow}><span className={styles.label}>최종학력</span><span className={styles.value}>{eduInfo.level}</span></div><div className={styles.infoRow}><span className={styles.label}>학교명 / 전공</span><span className={styles.value}>{eduInfo.school} / {eduInfo.major}</span></div></>
                )}
              </section>

              {/* 섹션 3: 자격증 */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>자격증</h3>
                  {!isCertEditing && <button className={styles.editBtn} onClick={() => setIsCertEditing(true)}>추가</button>}
                </div>
                <div className={styles.tagGroup}>
                  {certificates.map((cert, index) => (
                    <span key={index} className={styles.tag}>{cert} <span className={styles.tagDelete} onClick={() => handleDeleteCert(index)}>✕</span></span>
                  ))}
                </div>
                {isCertEditing && (
                  <div className={styles.certInputBox} style={{marginTop: '15px', display: 'flex', gap: '10px'}}>
                    <input type="text" value={certInput} onChange={(e) => setCertInput(e.target.value)} placeholder="자격증 명칭 입력" className={styles.editInput} onKeyPress={(e) => e.key === 'Enter' && handleAddCert()} />
                    <button onClick={handleAddCert} className={styles.saveBtn}>등록</button>
                    <button onClick={() => setIsCertEditing(false)} className={styles.cancelBtn}>취소</button>
                  </div>
                )}
              </section>

              {/* 섹션 4: 파일 관리 */}
              <section className={styles.card}>
                <div className={styles.cardHeader}>
                  <h3>자기소개서 및 포트폴리오</h3>
                  <input type="file" id="file-upload" accept=".pdf" hidden onChange={handleFileChange} />
                  <label htmlFor="file-upload" className={styles.editBtn}>추가</label>
                </div>
                <div className={styles.fileList}>
                  {files.length > 0 ? (
                    files.map((file) => (
                      <div key={file.id} className={styles.fileItem}>
                        <span className={styles.fileName}>📄 {file.name}</span>
                        <span className={styles.fileDeleteIcon} onClick={() => handleDeleteFile(file.id)}>✕</span>
                      </div>
                    ))
                  ) : (
                    <p className={styles.emptyText}>등록된 파일이 없습니다.</p>
                  )}
                </div>
              </section>
            </>
          ) : (
            /* [기록 보관함 화면] */
            <InterviewRecords />
          )}
        </main>
      </div>
    </div>
  );
};

export default Mypage;