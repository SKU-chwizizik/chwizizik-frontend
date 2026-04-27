import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { FaceLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import styles from "./InterviewExec.module.css";

export default function InterviewExec() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const lang        = searchParams.get("lang")        ?? "ko";
  const interviewId = searchParams.get("interviewId") ?? "";
  const greeting    = searchParams.get("greeting")
    ? decodeURIComponent(searchParams.get("greeting")!)
    : (lang === "ko" ? "안녕하세요, 면접을 시작하겠습니다." : "Hello, let's begin the interview.");
  const poolIds: number[] = (() => {
    try {
      const raw = searchParams.get("poolIds");
      return raw ? JSON.parse(decodeURIComponent(raw)) : [];
    } catch {
      return [];
    }
  })();

  const baseImg = "/img/InterviewerExec.png";
  const openImg = "/img/InterviewerExec_open.png";

  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef  = useRef<HTMLAudioElement | null>(null);
  const faceLandmarkerRef   = useRef<FaceLandmarker | null>(null);
  const nonverbalSamples    = useRef<{ smile: number; eyeOpen: number }[]>([]);
  const samplingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cameraError, setCameraError]             = useState("");
  const [isSpeaking, setIsSpeaking]               = useState(false);
  const [showQuestion, setShowQuestion]           = useState(false);
  const [mouthOpen, setMouthOpen]                 = useState(false);

  // 면접 state machine
  const [phase, setPhase]                         = useState<"greeting" | "question" | "finished">("greeting");
  const [mainQuestionOrder, setMainQuestionOrder] = useState(0);
  const [isFollowUp, setIsFollowUp]               = useState(false);
  const [questionText, setQuestionText]           = useState(greeting);
  const [questionId, setQuestionId]               = useState<number | null>(null);
  const [recordedBlob, setRecordedBlob]           = useState<Blob | null>(null);
  const [isLoading, setIsLoading]                 = useState(false);
  const [showQuitModal, setShowQuitModal]         = useState(false);
  const [isRecording, setIsRecording]             = useState(false);
  const [isTranscribing, setIsTranscribing]       = useState(false);
  const [answerError, setAnswerError]             = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef   = useRef<BlobPart[]>([]);
  const voiceSamples     = useRef<{ speechDuration: number; totalDuration: number; spm: number }[]>([]);

  // 입 애니메이션
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    if (isSpeaking) {
      intervalId = setInterval(() => setMouthOpen((prev) => !prev), 150);
    } else {
      setMouthOpen(false);
    }
    return () => clearInterval(intervalId);
  }, [isSpeaking]);

  // 카메라 + FaceLandmarker 초기화
  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch {
        setCameraError(lang === "ko" ? "카메라에 접근할 수 없습니다." : "Cannot access camera.");
      }
      try {
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm"
        );
        faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
          },
          outputFaceBlendshapes: true,
          runningMode: "IMAGE",
        });
      } catch {
        // MediaPipe 로드 실패 시 표정 분석 없이 진행
      }
    };
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      audioRef.current?.pause();
      faceLandmarkerRef.current?.close();
      if (samplingIntervalRef.current) clearInterval(samplingIntervalRef.current);
    };
  }, [lang]);

  // TTS (onDone: TTS 종료 후 콜백)
  const speakQuestion = async (text: string, onDone?: () => void) => {
    audioRef.current?.pause();
    try {
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, voice: lang === "ko" ? "ko-KR-SunHiNeural" : "en-US-JennyNeural" }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        onDone?.();
      };
      audio.onerror = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        onDone?.();
      };
      setIsSpeaking(true);
      await audio.play().catch(() => {
        setIsSpeaking(false);
        URL.revokeObjectURL(url);
        onDone?.();
      });
    } catch {
      onDone?.();
    }
  };

  // 다음 질문 요청
  const fetchNextQuestion = async (
    order: number,
    lastQId: number | null,
    lastAnswer: string,
  ) => {
    setIsLoading(true);
    try {
      const res = await axios.post(
        "/api/rag/next-question",
        {
          interviewId: Number(interviewId),
          lastQuestionId: lastQId,
          lastAnswer,
          mainQuestionOrder: order,
          selectedPoolItemIds: poolIds,
        },
        { withCredentials: true },
      );

      const { question: rawQuestion, questionId: nextQId, isFollowUp: followUp, isFinished, questionOrder } = res.data;
      const question = rawQuestion.replace(/[~*]/g, "").trim();

      if (isFinished) {
        setPhase("finished");
        setQuestionText(question);
        speakQuestion(question);

        // 표정 집계 → 백엔드 저장
        const samples = nonverbalSamples.current;
        if (samples.length > 0) {
          const smileRate      = Math.round((samples.filter((s) => s.smile > 0.3).length / samples.length) * 100);
          const alertnessScore = Math.round((samples.reduce((a, s) => a + s.eyeOpen, 0) / samples.length) * 100);
          const expressionScore = Math.round(smileRate * 0.4 + alertnessScore * 0.6);
          fetch("/api/rag/nonverbal", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              interviewId: Number(interviewId),
              data: { smileRate, alertnessScore, expressionScore, sampleCount: samples.length },
            }),
          }).catch(() => {});
        }

        // 음성 집계 → 백엔드 저장
        const vSamples = voiceSamples.current;
        if (vSamples.length > 0) {
          const totalSpeechSeconds = Math.round(vSamples.reduce((a, s) => a + s.speechDuration, 0) * 10) / 10;
          const totalDurationSeconds = vSamples.reduce((a, s) => a + s.totalDuration, 0);
          const avgSpm = Math.round(vSamples.reduce((a, s) => a + s.spm, 0) / vSamples.length);
          const avgSilenceRatio = totalDurationSeconds > 0
            ? Math.round((1 - totalSpeechSeconds / totalDurationSeconds) * 100) / 100
            : 0;
          fetch("/api/rag/voice-analysis", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({
              interviewId: Number(interviewId),
              data: { avgSpm, totalSpeechSeconds, avgSilenceRatio, questionCount: vSamples.length },
            }),
          }).catch(() => {});
        }
      } else {
        setQuestionText(question);
        setQuestionId(nextQId ?? null);
        setIsFollowUp(!!followUp);
        if (!followUp) setMainQuestionOrder(questionOrder ?? order);
        setPhase("question");
        speakQuestion(question, () => startRecording());
      }
    } catch (err) {
      console.error("질문 요청 실패:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // 표정 샘플링 함수
  const sampleExpression = () => {
    const video = videoRef.current;
    const fl = faceLandmarkerRef.current;
    if (!video || !fl || video.readyState < 2) return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")!.drawImage(video, 0, 0);

    const result = fl.detect(canvas);
    const blends = result.faceBlendshapes?.[0]?.categories;
    if (!blends) return;

    const get = (name: string) => blends.find((c) => c.categoryName === name)?.score ?? 0;
    const smile   = (get("mouthSmileLeft") + get("mouthSmileRight")) / 2;
    const eyeOpen = 1 - (get("eyeBlinkLeft") + get("eyeBlinkRight")) / 2;
    nonverbalSamples.current.push({ smile, eyeOpen });
  };

  // 답변 중에만 2초 간격 샘플링
  useEffect(() => {
    if (phase === "question" && !isSpeaking) {
      samplingIntervalRef.current = setInterval(sampleExpression, 2000);
    } else {
      if (samplingIntervalRef.current) {
        clearInterval(samplingIntervalRef.current);
        samplingIntervalRef.current = null;
      }
    }
    return () => {
      if (samplingIntervalRef.current) clearInterval(samplingIntervalRef.current);
    };
  }, [phase, isSpeaking]); // eslint-disable-line react-hooks/exhaustive-deps

  // 마운트 시 greeting TTS → 완료 후 첫 질문 요청
  useEffect(() => {
    const timer = setTimeout(() => {
      speakQuestion(greeting, () => fetchNextQuestion(1, null, ""));
    }, 500);
    return () => {
      clearTimeout(timer);
      audioRef.current?.pause();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // STT: 브라우저가 지원하는 mimeType 감지
  const getSupportedMimeType = () => {
    const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/ogg;codecs=opus", "audio/mp4"];
    return candidates.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
  };

  // STT: 녹음 시작
  const startRecording = async () => {
    setRecordedBlob(null);
    setAnswerError(false);
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mimeType = getSupportedMimeType();
    const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
    audioChunksRef.current = [];

    recorder.ondataavailable = (e) => { if (e.data.size > 0) audioChunksRef.current.push(e.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      const blobType = mimeType || "audio/webm";
      const blob = new Blob(audioChunksRef.current, { type: blobType });
      setRecordedBlob(blob);
    };

    recorder.start(250);
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  };

  // STT: 녹음 중지
  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);
  };

  // 답변 제출 (STT → next-question)
  const handleSubmit = async () => {
    if (!recordedBlob || isLoading || isSpeaking) return;
    const blob = recordedBlob;
    setRecordedBlob(null);
    setIsTranscribing(true);
    let transcribedAnswer = "";
    try {
      const formData = new FormData();
      formData.append("audio", blob, "answer.webm");
      formData.append("language", lang);
      const res = await fetch("/api/stt", { method: "POST", body: formData, credentials: "include" });
      const data = await res.json();
      transcribedAnswer = data.text ?? "";
      if (data.voice_data) voiceSamples.current.push(data.voice_data);
    } catch { /* STT 실패 시 빈 텍스트로 처리 */ }
    finally { setIsTranscribing(false); }
    if (!transcribedAnswer.trim()) {
      setAnswerError(true);
      return;
    }
    await fetchNextQuestion(mainQuestionOrder + 1, questionId, transcribedAnswer);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2 className={styles.title}>{lang === "ko" ? "임원 면접" : "Executive Interview"}</h2>
        {phase === "question" && !isFollowUp && mainQuestionOrder > 0 && (
          <span className={styles.progress}>{mainQuestionOrder} / 5</span>
        )}
        <button
          type="button"
          className={styles.quitButton}
          onClick={() => setShowQuitModal(true)}
        >
          {lang === "ko" ? "면접 포기" : "Quit Interview"}
        </button>
      </header>

      {showQuitModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalText}>
              {lang === "ko" ? "면접을 포기하시겠습니까?" : "Are you sure you want to quit?"}
            </p>
            <div className={styles.modalButtons}>
              <button
                type="button"
                className={styles.modalCancel}
                onClick={async () => {
                  try {
                    await axios.delete(`/api/rag/interview/${interviewId}`, { withCredentials: true });
                  } catch { /* 삭제 실패해도 홈으로 이동 */ }
                  navigate("/");
                }}
              >
                {lang === "ko" ? "네" : "Yes"}
              </button>
              <button
                type="button"
                className={styles.modalConfirm}
                onClick={() => setShowQuitModal(false)}
              >
                {lang === "ko" ? "아니요" : "No"}
              </button>
            </div>
            <p className={styles.modalWarning}>
              {lang === "ko"
                ? "⚠ 포기 시 현재 면접 데이터가 삭제됩니다!"
                : "⚠ Quitting will permanently delete your interview data."}
            </p>
          </div>
        </div>
      )}

      <main className={styles.main}>
        <section className={styles.interviewStage}>
          <div className={styles.interviewerSpace}>
            <img
              src={mouthOpen ? openImg : baseImg}
              alt="Executive Interviewer"
              className={`${styles.interviewerImage} ${!isSpeaking ? styles.interviewerClickable : ""}`}
              onClick={() => { if (!isSpeaking && phase === "question") { if (isRecording) stopRecording(); speakQuestion(questionText, () => startRecording()); } }}
            />
          </div>

          <div className={`${styles.userCamera} ${isRecording ? styles.userCameraRecording : ""}`}>
            {cameraError ? (
              <p className={styles.cameraText}>{cameraError}</p>
            ) : (
              <video ref={videoRef} autoPlay playsInline muted className={styles.userVideo} />
            )}
          </div>

          <div className={styles.questionWrapper}>
            <button
              type="button"
              className={`${styles.questionToggleBtn} ${showQuestion ? styles.questionToggleBtnOn : ""}`}
              onClick={() => setShowQuestion((prev) => !prev)}
            >
              {lang === "ko" ? "질문 보기" : "Show Question"}
            </button>
            <div className={`${styles.questionBar} ${!showQuestion ? styles.questionBarHidden : ""}`}>
              <p className={styles.questionText}>{questionText}</p>
            </div>
          </div>
        </section>

        {phase === "finished" ? (
          <section className={styles.finishSection}>
            <p className={styles.finishText}>
              {lang === "ko" ? "면접이 종료되었습니다. 수고하셨습니다!" : "Interview finished. Great job!"}
            </p>
            <button
              type="button"
              className={styles.submitButton}
              onClick={() => navigate(`/result?interviewId=${interviewId}`)}
            >
              {lang === "ko" ? "결과 보기" : "View Results"}
            </button>
          </section>
        ) : (
          <section className={styles.answerSection}>
            {isSpeaking ? (
              <p className={styles.transcribingText}>
                {lang === "ko" ? "면접관이 말하는 중입니다…" : "Interviewer is speaking…"}
              </p>
            ) : isRecording ? (
              <button
                type="button"
                className={styles.micButtonRecording}
                onClick={stopRecording}
              >
                {lang === "ko" ? "⏹ 녹음 중지" : "⏹ Stop Recording"}
              </button>
            ) : recordedBlob && !isTranscribing && !isLoading ? (
              <>
                <button type="button" className={styles.retryButton} onClick={startRecording} disabled={isSpeaking}>
                  {lang === "ko" ? "↩ 다시 녹음" : "↩ Re-record"}
                </button>
                <button type="button" className={styles.submitButton} onClick={handleSubmit} disabled={isSpeaking}>
                  {lang === "ko" ? "답변 제출" : "Submit Answer"}
                </button>
              </>
            ) : answerError ? (
              <>
                <p className={styles.answerErrorText}>
                  {lang === "ko" ? "아무 답변도 하지 않았습니다. 다시 녹음해 주세요." : "No answer detected. Please re-record."}
                </p>
                <button type="button" className={styles.retryButton} onClick={startRecording}>
                  {lang === "ko" ? "↩ 다시 녹음" : "↩ Re-record"}
                </button>
              </>
            ) : isTranscribing || isLoading ? (
              <p className={styles.transcribingText}>
                {isTranscribing
                  ? (lang === "ko" ? "음성 변환 중…" : "Transcribing…")
                  : (lang === "ko" ? "답변 처리 중…" : "Processing…")}
              </p>
            ) : (
              <p className={styles.transcribingText}>
                {isSpeaking || phase === "greeting"
                  ? (lang === "ko" ? "면접관이 말하는 중입니다…" : "Interviewer is speaking…")
                  : (lang === "ko" ? "잠시 후 녹음이 시작됩니다…" : "Recording will start shortly…")}
              </p>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
