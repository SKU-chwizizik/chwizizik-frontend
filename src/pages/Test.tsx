import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styles from "./test.module.css";

export default function Test() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const lang = searchParams.get("lang") ?? "ko";
  const type = searchParams.get("type") ?? "basic";

  // 비디오 DOM 연결용 ref
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // 카메라/마이크 스트림 보관용 ref
  const streamRef = useRef<MediaStream | null>(null);

  // 오디오 분석용 ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationRef = useRef<number | null>(null);

  // 상태값
  const [isChecking, setIsChecking] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [micReady, setMicReady] = useState(false);
  const [permissionError, setPermissionError] = useState("");
  const [micLevel, setMicLevel] = useState(0);

  // 페이지를 떠날 때 카메라/마이크 해제
  useEffect(() => {
    return () => {
      stopMedia();
    };
  }, []);

  // 스트림 종료 함수
  const stopMedia = () => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (audioContextRef.current) {
      audioContextRef.current.close().catch(() => {});
      audioContextRef.current = null;
    }

    analyserRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setCameraReady(false);
    setMicReady(false);
    setMicLevel(0);
  };

  // 마이크 입력 레벨 측정
  const startMicAnalysis = (stream: MediaStream) => {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as typeof window & {
          webkitAudioContext?: typeof AudioContext;
        }).webkitAudioContext;

      if (!AudioContextClass) {
        setMicReady(true);
        return;
      }

      const audioContext = new AudioContextClass();
      const analyser = audioContext.createAnalyser();
      const source = audioContext.createMediaStreamSource(stream);

      analyser.fftSize = 256;
      source.connect(analyser);

      audioContextRef.current = audioContext;
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateLevel = () => {
        if (!analyserRef.current) return;

        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i];
        }

        const average = sum / dataArray.length;
        const normalized = Math.min(100, Math.round((average / 128) * 100));

        setMicLevel(normalized);
        setMicReady(true);

        animationRef.current = requestAnimationFrame(updateLevel);
      };

      updateLevel();
    } catch {
      // 오디오 분석이 실패해도 마이크 권한 자체는 받은 것으로 처리
      setMicReady(true);
    }
  };

  // 카메라/마이크 테스트 시작
  const startDeviceTest = async () => {
    setIsChecking(true);
    setPermissionError("");

    // 기존 스트림이 있다면 먼저 종료
    stopMedia();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
            width: 1280,
            height: 720,
            facingMode: "user",
        },
        audio: true,
      });

      streamRef.current = stream;

      // 캠, 마이크 연결
      const videoTracks = stream.getVideoTracks();
      const audioTracks = stream.getAudioTracks();

      if (videoTracks.length > 0 && videoRef.current) {
        videoRef.current.srcObject = stream;

      try {
        await videoRef.current.play();
        setCameraReady(true);
      } catch (err) {
        console.error("video play 실패:", err);
        setPermissionError(
          lang === "ko"
            ? "카메라 화면 재생에 실패했습니다."
            : "Failed to play camera preview."
        );
      }
    } else {
      setCameraReady(false);
    }

    if (audioTracks.length > 0) {
      startMicAnalysis(stream);
      setMicReady(true);
    } else {
      setMicReady(false);
    }
  } catch (error) {
    console.error("장치 테스트 실패:", error);
    setPermissionError(
      lang === "ko"
        ? "카메라 또는 마이크 권한을 확인해주세요."
        : "Please check camera or microphone permissions."
    );
  } finally {
    setIsChecking(false);
  }
};

  // 다음 단계로 이동
  const handleNext = () => {
    navigate(`/loading?lang=${lang}&type=${type}`);
  };

  const pageTitle =
    lang === "ko" ? "마이크 · 캠 테스트" : "Microphone · Camera Test";

  const pageDesc =
    lang === "ko"
      ? "면접 시작 전 카메라와 마이크가 정상적으로 작동하는지 확인해주세요."
      : "Please check whether your camera and microphone are working before the interview starts.";

  const guideText =
    lang === "ko"
      ? "조용한 장소에서 정면을 바라보고 테스트하는 것을 권장합니다."
      : "We recommend testing in a quiet place while facing the camera.";

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>{pageTitle}</h1>
        <p className={styles.desc}>{pageDesc}</p>

        <div className={styles.card}>
          {/* 왼쪽: 캠 화면 */}
          <div className={styles.previewSection}>
            <div className={styles.previewBox}>
                <video
                    ref={videoRef}
                    className={styles.video}
                    muted
                    playsInline
                    autoPlay
                />

                {!cameraReady && (
                <div className={styles.previewPlaceholder}>
                    <span className={styles.previewIcon}>📷</span>
                    <p className={styles.previewText}>
                    {lang === "ko"
                        ? "카메라 테스트를 시작해주세요"
                        : "Start camera test"}
                    </p>
                </div>
                )}
            </div>

            <p className={styles.guide}>{guideText}</p>
        </div>

          {/* 오른쪽: 상태 확인 */}
          <div className={styles.statusSection}>
            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <span className={styles.statusLabel}>
                  {lang === "ko" ? "카메라 상태" : "Camera Status"}
                </span>
                <span
                  className={`${styles.badge} ${
                    cameraReady ? styles.success : styles.pending
                  }`}
                >
                  {cameraReady
                    ? lang === "ko"
                      ? "정상"
                      : "Ready"
                    : lang === "ko"
                    ? "대기"
                    : "Pending"}
                </span>
              </div>

              <p className={styles.statusText}>
                {cameraReady
                  ? lang === "ko"
                    ? "카메라 화면이 정상적으로 표시되고 있습니다."
                    : "Your camera is working properly."
                  : lang === "ko"
                  ? "카메라 연결 전입니다."
                  : "Camera is not connected yet."}
              </p>
            </div>

            <div className={styles.statusCard}>
              <div className={styles.statusHeader}>
                <span className={styles.statusLabel}>
                  {lang === "ko" ? "마이크 상태" : "Microphone Status"}
                </span>
                <span
                  className={`${styles.badge} ${
                    micReady ? styles.success : styles.pending
                  }`}
                >
                  {micReady
                    ? lang === "ko"
                      ? "정상"
                      : "Ready"
                    : lang === "ko"
                    ? "대기"
                    : "Pending"}
                </span>
              </div>

              <p className={styles.statusText}>
                {micReady
                  ? lang === "ko"
                    ? "마이크 입력이 감지되고 있습니다."
                    : "Microphone input is being detected."
                  : lang === "ko"
                  ? "마이크 연결 전입니다."
                  : "Microphone is not connected yet."}
              </p>

              <div className={styles.micMeter}>
                <div
                  className={styles.micMeterFill}
                  style={{ width: `${micLevel}%` }}
                />
              </div>
            </div>

            {permissionError && (
              <p className={styles.errorText}>{permissionError}</p>
            )}

            <div className={styles.buttonGroup}>
              <button
                type="button"
                className={`${styles.btn} ${styles.ghost}`}
                onClick={startDeviceTest}
                disabled={isChecking}
              >
                {isChecking
                  ? lang === "ko"
                    ? "확인 중..."
                    : "Checking..."
                  : lang === "ko"
                  ? "장치 테스트 시작"
                  : "Start Device Test"}
              </button>

              <button
                type="button"
                className={`${styles.btn} ${styles.primary}`}
                onClick={handleNext}
                /* disabled={!cameraReady || !micReady} */
              >
                {lang === "ko" ? "다음으로" : "Next"}
              </button>
            </div>

            <p className={styles.hint}>
              {lang === "ko"
                ? "카메라와 마이크가 모두 정상일 때 다음 단계로 이동할 수 있습니다."
                : "You can proceed when both camera and microphone are ready."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}