import React, { useState } from 'react';
import styles from './Mypage.module.css';
import InterviewRecords from './InterviewRecords'; 
import InterviewRecordsBasic from './InterviewRecordsBasic'; 
import axios from 'axios';

// 0. 타입 정의
type Education =
  | ""
  | "초등학교 졸업"
  | "중학교 졸업"
  | "고등학교 졸업"
  | "대학(2,3년) 졸업"
  | "대학(4년) 졸업"
  | "대학원(석사) 졸업"
  | "대학원(박사) 졸업";

interface AttachedFile {
  id: number;
  name: string;
}

// 메뉴 타입 정의 (records는 부모 상태를 체크하기 위한 용도로 유지)
type MenuType = 'info' | 'records' | 'job-records' | 'general-records';

const Mypage = () => {
  // 1. 메뉴 전환 상태 (기본값: 내 정보)
  const [activeMenu, setActiveMenu] = useState<MenuType>('info');

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
  const [files, setFiles] = useState<AttachedFile[]>([]);

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
      const response = await axios.patch('/api/user/profile', userInfo);
      if (response.status === 200) {
        alert('기본 정보가 DB에 저장되었습니다.');
        setIsEditing(false);
      }
    } catch (error) {
      alert('저장 중 오류가 발생했습니다.');
    }
  };

  const handleEduSave = async() => {
    try {
      await axios.patch('/api/user/education', eduInfo);
      alert('학력 정보가 저장되었습니다.');
      setIsEduEditing(false);
    } catch (error) {
      alert('저장 실패');
    }
  };

  const handleAddCert = async() => {
    if (certInput.trim() === "") return;
    setCertificates(prev => [...prev, certInput]);
    setCertInput("");
    setIsCertEditing(false);
  };

  const handleDeleteCert = (index: number, certName: string) => {
    if (!window.confirm(`'${certName}'을(를) 삭제하시겠습니까?`)) return;
    setCertificates(prev => prev.filter((_, i) => i !== index));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFiles(prev => [...prev, { id: Date.now(), name: selectedFile.name }]);
    } else {
      alert('PDF 파일만 업로드 가능합니다.');
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

            {/* 부모 메뉴: 클릭 시 자동으로 '직무 면접(job-records)'으로 이동하도록 설정 */}
            <li 
              className={`${styles.menuItem} ${(activeMenu === 'job-records' || activeMenu === 'general-records') ? styles.active : ''}`}
              onClick={() => setActiveMenu('job-records')}
            >
              모의 면접 기록 보관
            </li>
            
            {/* 자식 메뉴 컨테이너 */}
            <div className={styles.subMenuContainer}>
              <div 
                className={`${styles.subMenuItem} ${activeMenu === 'job-records' ? styles.active : ''}`}
                onClick={() => setActiveMenu('job-records')}
              >
                직무 면접
              </div>
              <div 
                className={`${styles.subMenuItem} ${activeMenu === 'general-records' ? styles.active : ''}`}
                onClick={() => setActiveMenu('general-records')}
              >
                일반 면접
              </div>
            </div>
          </ul>
        </aside>

        {/* 본문 콘텐츠 */}
        <main className={styles.content}>
          {/* 1. 내 정보 화면 */}
          {activeMenu === 'info' && (
            <>
              <h1 className={styles.mainTitle}>내 정보</h1>
              
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
                    <div className={styles.infoField}><label>이름</label>{isEditing ? (<input name="name" value={userInfo.name} onChange={handleInputChange} className={styles.editInput} /> ) : ( <span className={userInfo.name ? styles.infoText : styles.placeholder}>{userInfo.name || "홍길동"}</span>)}</div>
                    <div className={styles.infoField}><label>전화번호</label>{isEditing ? (<input name="phone" value={userInfo.phone} onChange={handleInputChange} className={styles.editInput} /> ) : ( <span className={userInfo.phone ? styles.infoText : styles.placeholder}>{userInfo.phone || "010-1234-5678"}</span>)}</div>
                    <div className={styles.infoField}><label>이메일</label>{isEditing ? (<input name="email" value={userInfo.email} onChange={handleInputChange} className={styles.editInput} /> ) : ( <span className={userInfo.email ? styles.infoText : styles.placeholder}>{userInfo.email || "example@example.com"}</span>)}</div>
                    <div className={styles.infoField}><label>희망 분야</label>{isEditing ? (<input name="jobField" value={userInfo.jobField} onChange={handleInputChange} className={styles.editInput} /> ) : ( <span className={userInfo.jobField ? styles.infoText : styles.placeholder}>{userInfo.jobField || "프론트엔드 개발자"}</span>)}</div>
                    <div className={styles.actionBtns}>
                      {isEditing ? <><button onClick={handleSave} className={styles.saveBtn}>저장하기</button><button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>취소</button></> : <button onClick={() => setIsEditing(true)} className={styles.saveBtn}>정보 수정하기</button>}
                    </div>
                  </div>
                </div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}><h3>학력 / 전공</h3>{!isEduEditing && <button className={styles.editBtn} onClick={() => setIsEduEditing(true)}>수정</button>}</div>
                {isEduEditing ? (
                  <div className={styles.editForm}>
                    <div className={styles.infoField}><label>최종학력</label><select name="level" value={eduInfo.level} onChange={handleEduChange} className={styles.editSelect}><option value="" disabled>학력 선택</option>{eduOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}</select></div>
                    <div className={styles.infoField}><label>학교명</label><input name="school" value={eduInfo.school} onChange={handleEduChange} className={styles.editInput} /></div>
                    <div className={styles.infoField}><label>전공</label><input name="major" value={eduInfo.major} onChange={handleEduChange} className={styles.editInput} /></div>
                    <div className={styles.actionBtns}><button onClick={handleEduSave} className={styles.saveBtn}>저장</button><button onClick={() => setIsEduEditing(false)} className={styles.cancelBtn}>취소</button></div>
                  </div>
                ) : (
                  <><div className={styles.infoRow}><span className={styles.label}>최종학력</span><span className={eduInfo.level ? styles.value : styles.placeholder}>{eduInfo.level || "대학(4년) 졸업"}</span></div><div className={styles.infoRow}><span className={styles.label}>학교명 / 전공</span><span className={styles.value}>{eduInfo.school || "한국대학교"} / {eduInfo.major || "컴퓨터공학과"}</span></div></>
                )}
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}><h3>자격증</h3><button className={styles.editBtn} onClick={() => setIsCertEditing(!isCertEditing)}>{isCertEditing ? "닫기" : "추가"}</button></div>
                {isCertEditing && <div className={styles.certInputBox}><input value={certInput} onChange={(e) => setCertInput(e.target.value)} className={styles.editInput} placeholder="자격증 입력" onKeyPress={(e) => e.key === 'Enter' && handleAddCert()} /><button onClick={handleAddCert} className={styles.saveBtn} style={{marginLeft: '10px'}}>등록</button></div>}
                <div className={styles.tagGroup} style={{marginTop: '15px'}}>{certificates.map((cert, i) => <span key={i} className={styles.tag}>{cert}<span className={styles.tagDelete} onClick={() => handleDeleteCert(i, cert)}>✕</span></span>)}</div>
              </section>

              <section className={styles.card}>
                <div className={styles.cardHeader}><h3>자기소개서 및 포트폴리오</h3><input type="file" id="file-up" accept=".pdf" hidden onChange={handleFileChange} /><label htmlFor="file-up" className={styles.editBtn}>추가</label></div>
                <div className={styles.fileList}>{files.map(f => <div key={f.id} className={styles.fileItem}><span className={styles.fileName}>📄 {f.name}</span><span className={styles.fileDeleteIcon} onClick={() => handleDeleteFile(f.id)}>✕</span></div>)}</div>
              </section>
            </>
          )}

          {/* 2. 직무 면접 화면 (기존 파일) */}
          {activeMenu === 'job-records' && (
            <InterviewRecords />
          )}

          {/* 3. 일반 면접 화면 (새로 만든 전용 파일) */}
          {activeMenu === 'general-records' && (
            <InterviewRecordsBasic />
          )}
        </main>
      </div>
    </div>
  );
};

export default Mypage;