import React, { useState } from 'react';
import styles from './Mypage.module.css';
import InterviewRecords from './InterviewRecords'; 
import axios from 'axios';

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
    name: '',
    userId: '',
    phone: '',
    email: '',
    jobField: ''
  });

  // 3. 학력 정보 상태
  const [isEduEditing, setIsEduEditing] = useState(false);
  const [eduInfo, setEduInfo] = useState({
    level: "",
    school: "",
    major: ""
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

  const handleSave = async() => {
    try {
    // 1. 서버 API 호출 (백엔드 엔드포인트 예시: /api/user/profile)
    const response = await axios.patch('/api/user/profile', {
      name: userInfo.name,
      phone: userInfo.phone,
      email: userInfo.email,
      jobField: userInfo.jobField
    });

    if (response.status === 200) {
      alert('기본 정보가 DB에 저장되었습니다.');
      setIsEditing(false);
    }
  } catch (error) {
    console.error("저장 실패:", error);
    alert('서버 저장 중 오류가 발생했습니다.');
  }
};

  const handleEduSave = async() => {
    try {
      await axios.patch('/api/user/education', eduInfo);
      alert('학력 정보가 DB에 저장되었습니다.');
      setIsEduEditing(false);
  } catch (error) {
    alert('저장 실패');
  }
};

  const handleAddCert = async() => {
    if (certInput.trim() === "") return;
    try {
    // 1. 백엔드 API 호출 (예시 엔드포인트: /api/user/certificates)
    // 현재 로그인된 사용자의 ID와 입력한 자격증 명칭을 보냅니다.
    const response = await axios.post('/api/user/certificates', {
      certName: certInput,
      userId: userInfo.userId // 현재 로그인한 사용자 ID
    });

    if (response.status === 200) {
      // 2. 서버 저장 성공 시 화면(State) 업데이트
      setCertificates(prev => [...prev, certInput]);
      setCertInput("");
      setIsCertEditing(false);
      alert('자격증이 성공적으로 등록되었습니다.');
    }
  } catch (error) {
    console.error("자격증 저장 실패:", error);
    alert('자격증 등록 중 오류가 발생했습니다.');
  }
};

  const handleDeleteCert = async (index: number, certName: string) => {
  if (!window.confirm(`'${certName}' 자격증을 삭제하시겠습니까?`)) return;

  try {
    // 백엔드에 삭제 요청 (명칭이나 ID 기반)
    await axios.delete(`/api/user/certificates`, {
      data: { certName: certName, userId: userInfo.userId }
    });

    // 성공 시 화면에서 제거
    setCertificates(prev => prev.filter((_, i) => i !== index));
  } catch (error) {
    alert('삭제에 실패했습니다.');
  }
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
                    <div className={styles.infoField}><label>이름</label>{isEditing ? (<input name="name" value={userInfo.name} onChange={handleInputChange} placeholder="홍길동" className={styles.editInput} /> ) : ( <span className={userInfo.name ? styles.infoText : styles.placeholder}>{userInfo.name || "홍길동"}</span>)}</div>
                    <div className={styles.infoField}><label>전화번호</label>{isEditing ? (<input name="phone" value={userInfo.phone} onChange={handleInputChange} placeholder="010-1234-5678" className={styles.editInput} /> ) : ( <span className={userInfo.phone ? styles.infoText : styles.placeholder}>{userInfo.phone || "010-1234-5678"}</span>)}</div>
                    <div className={styles.infoField}><label>이메일</label>{isEditing ? (<input name="email" value={userInfo.email} onChange={handleInputChange} placeholder="example@example.com" className={styles.editInput} /> ) : ( <span className={userInfo.email ? styles.infoText : styles.placeholder}>{userInfo.email || "example@example.com"}</span>)}</div>
                    <div className={styles.infoField}><label>희망 분야</label>{isEditing ? (<input name="jobField" value={userInfo.jobField} onChange={handleInputChange} placeholder="프론트엔드 개발자" className={styles.editInput} /> ) : ( <span className={userInfo.jobField ? styles.infoText : styles.placeholder}>{userInfo.jobField || "프론트엔드 개발자"}</span>)}</div>
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
                    <div className={styles.infoField}>
                      <label>학교명</label>
                      <input 
                        name="school" 
                        value={eduInfo.school} 
                        onChange={handleEduChange} 
                        placeholder="한국대학교" 
                        className={styles.editInput} 
                      />
                    </div>
                    <div className={styles.infoField}>
                      <label>전공</label>
                      <input 
                        name="major" 
                        value={eduInfo.major} 
                        onChange={handleEduChange} 
                        placeholder="컴퓨터공학과" 
                        className={styles.editInput} 
                      />
                    </div>
                    <div className={styles.actionBtns}>
                      <button onClick={handleEduSave} className={styles.saveBtn}>저장</button>
                      <button onClick={() => setIsEduEditing(false)} className={styles.cancelBtn}>취소</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>최종학력</span>
                      <span className={eduInfo.level ? styles.value : styles.placeholder}>
                        {eduInfo.level || "대학(4년) 졸업"}
                      </span>
                    </div>
                    <div className={styles.infoRow}>
                      <span className={styles.label}>학교명 / 전공</span>
                      <span className={(eduInfo.school || eduInfo.major) ? styles.value : styles.placeholder}>
                        {eduInfo.school && eduInfo.major 
                          ? `${eduInfo.school} / ${eduInfo.major}` 
                          : "한국대학교 / 컴퓨터공학과"}
                      </span>
                    </div>
                  </>
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