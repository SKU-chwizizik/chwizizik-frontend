import React, { useState, useEffect } from 'react';
import styles from './Mypage.module.css';
import InterviewRecords from './InterviewRecords'; 
import InterviewRecordsBasic from './InterviewRecordsBasic'; 
import axios from 'axios';

// 타입 정의
type EducationLevel = "" | "초등학교 졸업" | "중학교 졸업" | "고등학교 졸업" | "대학(2,3년) 졸업" | "대학(4년) 졸업" | "대학원(석사) 졸업" | "대학원(박사) 졸업";

interface AttachedFile {
  id: number;
  fileName: string; // 백엔드 필드명에 맞춰 fileName으로 변경 제안
  fileUrl?: string;
}

type MenuType = 'info' | 'records' | 'job-records' | 'general-records';

const Mypage = () => {
  const [activeMenu, setActiveMenu] = useState<MenuType>('info');

  // 1. 상태 관리
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    userId: '',
    name: '',
    phone: '',
    email: '',
    jobField: ''
  });

  const [isEduEditing, setIsEduEditing] = useState(false);
  const [eduInfo, setEduInfo] = useState({
    level: "" as EducationLevel,
    school: "",
    major: ""
  });

  const [isCertEditing, setIsCertEditing] = useState(false);
  const [certInput, setCertInput] = useState("");
  const [certificates, setCertificates] = useState<string[]>([]);
  const [files, setFiles] = useState<AttachedFile[]>([]);

  // 2. 초기 데이터 로드 (DB에서 정보 가져오기)
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        const response = await axios.get('/api/user/profile');
        if (response.data) {
          const d = response.data;
          // 기본 정보 세팅
          setUserInfo({
            userId: d.userId,
            name: d.name || '',
            phone: d.phoneNumber || '',
            email: d.email || '',
            jobField: d.jobField || ''
          });
          // 학력 세팅
          if (d.education) setEduInfo(d.education);
          // 자격증 세팅 (백엔드에서 List<String>으로 온다고 가정)
          if (d.certificates) setCertificates(d.certificates);
          // 파일 세팅
          if (d.files) setFiles(d.files);
          // 프로필 이미지 세팅
          if (d.profileImageUrl) setProfileImage(d.profileImageUrl);
        }
      } catch (error) {
        console.error("데이터 로드 실패", error);
      }
    };
    fetchAllData();
  }, []);

  // --- 핸들러 영역 ---

  // 사진 변경 및 서버 전송
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      try {
        const res = await axios.post('/api/user/profile-image', formData);
        setProfileImage(res.data.imageUrl); // 서버에서 준 URL로 교체
        alert('프로필 사진이 변경되었습니다.');
      } catch (error) {
        alert('이미지 업로드 실패');
      }
    }
  };

  // 기본 정보 저장
  const handleSave = async () => {
    try {
      const payload = {
        userId: userInfo.userId,
        name: userInfo.name,
        phoneNumber: userInfo.phone,
        email: userInfo.email,
        jobField: userInfo.jobField
      };
      await axios.patch('/api/user/profile', payload);
      alert('정보가 수정되었습니다.');
      setIsEditing(false);
    } catch (error) {
      alert('수정 실패');
    }
  };

  // 학력 정보 저장
  const handleEduSave = async () => {
    try {
      await axios.patch('/api/user/education', {
        userId: userInfo.userId,
        ...eduInfo
      });
      alert('학력 정보가 저장되었습니다.');
      setIsEduEditing(false);
    } catch (error) {
      alert('학력 저장 실패');
    }
  };

  // 자격증 추가
  const handleAddCert = async () => {
    if (!certInput.trim()) return;
    try {
      const newCerts = [...certificates, certInput];
      await axios.post('/api/user/certificates', { userId: userInfo.userId, certName: certInput });
      setCertificates(newCerts);
      setCertInput("");
      setIsCertEditing(false);
    } catch (error) {
      alert('자격증 등록 실패');
    }
  };

  // 자격증 삭제
  const handleDeleteCert = async (index: number, certName: string) => {
    if (!window.confirm(`'${certName}'을 삭제하시겠습니까?`)) return;
    try {
      await axios.delete(`/api/user/certificates`, { data: { userId: userInfo.userId, certName } });
      setCertificates(prev => prev.filter((_, i) => i !== index));
    } catch (error) {
      alert('자격증 삭제 실패');
    }
  };

  // PDF 파일 업로드
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (selectedFile.type !== 'application/pdf') {
      alert('PDF 파일만 가능합니다.');
      return;
    }
    const formData = new FormData();
    formData.append('file', selectedFile);
    try {
      const res = await axios.post('/api/user/files', formData, { withCredentials: true });
      setFiles(prev => [...prev, res.data]);
      alert('파일이 업로드되었습니다.');
    } catch (error) {
      alert('파일 업로드 실패');
    }
    e.target.value = '';
  };

  // 이력서 파일 삭제
  const handleDeleteFile = async (resumeId: number) => {
    if (!window.confirm('삭제할까요?')) return;
    try {
      await axios.delete(`/api/user/resumes/${resumeId}`, { withCredentials: true });
      setFiles(prev => prev.filter(f => f.id !== resumeId));
    } catch (error) {
      alert('파일 삭제 실패');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <aside className={styles.sidebar}>
          <h2 className={styles.menuTitle}>마이페이지</h2>
          <ul className={styles.menuList}>
            <li className={`${styles.menuItem} ${activeMenu === 'info' ? styles.active : ''}`} onClick={() => setActiveMenu('info')}>내 정보</li>
            <li className={`${styles.menuItem} ${(activeMenu === 'job-records' || activeMenu === 'general-records') ? styles.active : ''}`} onClick={() => setActiveMenu('job-records')}>모의 면접 기록 보관</li>
            <div className={styles.subMenuContainer}>
              <div className={`${styles.subMenuItem} ${activeMenu === 'job-records' ? styles.active : ''}`} onClick={() => setActiveMenu('job-records')}>직무 면접</div>
              <div className={`${styles.subMenuItem} ${activeMenu === 'general-records' ? styles.active : ''}`} onClick={() => setActiveMenu('general-records')}>일반 면접</div>
            </div>
          </ul>
        </aside>

        <main className={styles.content}>
          {activeMenu === 'info' && (
            <>
              <h1 className={styles.mainTitle}>내 정보</h1>
              
              {/* 기본 정보 섹션 */}
              <section className={styles.card}>
                <div className={styles.profileSection}>
                  <div className={styles.imageUpload}>
                    <div className={styles.imagePreview}>
                      {profileImage ? <img src={profileImage} alt="프로필" className={styles.previewImg} /> : <span>사진 등록</span>}
                    </div>
                    <div className={styles.btnGroup}>
                      <input type="file" id="profile-upload" accept=".jpg, .jpeg, .png" hidden onChange={handleImageChange} />
                      <label htmlFor="profile-upload" className={styles.uploadBtn}>사진 변경</label>
                    </div>
                  </div>

                  <div className={styles.basicInfo}>
                    <div className={styles.infoField}>
                      <label>이름</label>
                      {isEditing ? <input name="name" value={userInfo.name} onChange={(e)=>setUserInfo({...userInfo, name: e.target.value})} className={styles.editInput} /> 
                      : <span className={userInfo.name ? styles.infoText : styles.placeholder}>{userInfo.name || "홍길동"}</span>}
                    </div>
                    <div className={styles.infoField}>
                      <label>전화번호</label>
                      {isEditing ? <input name="phone" value={userInfo.phone} onChange={(e)=>setUserInfo({...userInfo, phone: e.target.value})} className={styles.editInput} /> 
                      : <span className={userInfo.phone ? styles.infoText : styles.placeholder}>{userInfo.phone || "010-1234-5678"}</span>}
                    </div>
                    <div className={styles.infoField}>
                      <label>이메일</label>
                      {isEditing ? <input name="email" value={userInfo.email} onChange={(e)=>setUserInfo({...userInfo, email: e.target.value})} className={styles.editInput} /> 
                      : <span className={userInfo.email ? styles.infoText : styles.placeholder}>{userInfo.email || "example@example.com"}</span>}
                    </div>
                    <div className={styles.infoField}>
                      <label>희망 분야</label>
                      {isEditing ? <input name="jobField" value={userInfo.jobField} onChange={(e)=>setUserInfo({...userInfo, jobField: e.target.value})} className={styles.editInput} /> 
                      : <span className={userInfo.jobField ? styles.infoText : styles.placeholder}>{userInfo.jobField || "프론트엔드 개발자"}</span>}
                    </div>
                    <div className={styles.actionBtns}>
                      {isEditing ? (
                        <><button onClick={handleSave} className={styles.saveBtn}>정보 저장하기</button><button onClick={() => setIsEditing(false)} className={styles.cancelBtn}>취소</button></>
                      ) : (
                        <button onClick={() => setIsEditing(true)} className={styles.saveBtn}>정보 수정하기</button>
                      )}
                    </div>
                  </div>
                </div>
              </section>

              {/* 학력 섹션 */}
              <section className={styles.card}>
                <div className={styles.cardHeader}><h3>학력 / 전공</h3>{!isEduEditing && <button className={styles.editBtn} onClick={() => setIsEduEditing(true)}>수정</button>}</div>
                {isEduEditing ? (
                  <div className={styles.editForm}>
                    <div className={styles.infoField}><label>최종학력</label><select value={eduInfo.level} onChange={(e)=>setEduInfo({...eduInfo, level: e.target.value as EducationLevel})} className={styles.editSelect}><option value="">학력 선택</option>
                      {["초등학교 졸업", "중학교 졸업", "고등학교 졸업", "대학(2,3년) 졸업", "대학(4년) 졸업", "대학원(석사) 졸업", "대학원(박사) 졸업"].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select></div>
                    <div className={styles.infoField}><label>학교명</label><input value={eduInfo.school} onChange={(e)=>setEduInfo({...eduInfo, school: e.target.value})} className={styles.editInput} /></div>
                    <div className={styles.infoField}><label>전공</label><input value={eduInfo.major} onChange={(e)=>setEduInfo({...eduInfo, major: e.target.value})} className={styles.editInput} /></div>
                    <div className={styles.actionBtns}><button onClick={handleEduSave} className={styles.saveBtn}>저장</button><button onClick={() => setIsEduEditing(false)} className={styles.cancelBtn}>취소</button></div>
                  </div>
                ) : (
                  <><div className={styles.infoRow}><span className={styles.label}>최종학력</span><span className={eduInfo.level ? styles.value : styles.placeholder}>{eduInfo.level || "학력을 입력해주세요."}</span></div>
                    <div className={styles.infoRow}><span className={styles.label}>학교명 / 전공</span><span className={eduInfo.school ? styles.value : styles.placeholder}>{eduInfo.school ? `${eduInfo.school} / ${eduInfo.major}` : "학교 정보를 입력해주세요."}</span></div></>
                )}
              </section>

              {/* 자격증 섹션 */}
              <section className={styles.card}>
                <div className={styles.cardHeader}><h3>자격증</h3><button className={styles.editBtn} onClick={() => setIsCertEditing(!isCertEditing)}>{isCertEditing ? "닫기" : "추가"}</button></div>
                {isCertEditing && <div className={styles.certInputBox}><input value={certInput} onChange={(e) => setCertInput(e.target.value)} className={styles.editInput} placeholder="자격증 입력 후 엔터" onKeyPress={(e) => e.key === 'Enter' && handleAddCert()} /><button onClick={handleAddCert} className={styles.saveBtn} style={{marginLeft: '10px'}}>등록</button></div>}
                <div className={styles.tagGroup} style={{marginTop: '15px'}}>{certificates.map((cert, i) => <span key={i} className={styles.tag}>{cert}<span className={styles.tagDelete} onClick={() => handleDeleteCert(i, cert)}>✕</span></span>)}</div>
              </section>

              {/* PDF 파일 섹션 */}
              <section className={styles.card}>
                <div className={styles.cardHeader}><h3>자기소개서 및 포트폴리오</h3><input type="file" id="file-up" accept=".pdf" hidden onChange={handleFileChange} /><label htmlFor="file-up" className={styles.editBtn}>추가</label></div>
                <div className={styles.fileList}>{files.map(f => <div key={f.id} className={styles.fileItem}><span className={styles.fileName}>📄 {f.fileName}</span><span className={styles.fileDeleteIcon} onClick={() => handleDeleteFile(f.id)}>✕</span></div>)}</div>
              </section>
            </>
          )}

          {activeMenu === 'job-records' && <InterviewRecords />}
          {activeMenu === 'general-records' && <InterviewRecordsBasic />}
        </main>
      </div>
    </div>
  );
};

export default Mypage;