import React, { useState, useEffect } from "react";
import api from "./api"; // api 모듈은 실제 프로젝트 환경에 맞게 설정해야 합니다.

function StartPage({ onNext }) {
  const [grade, setGrade] = useState("");
  const [prevProgress, setPrevProgress] = useState(""); // '이전 진도' 상태 다시 추가
  const [nextProgress, setNextProgress] = useState(""); // '오늘 진도' 상태 다시 추가
  const [progressList, setProgressList] = useState([]);
  const [startProgress, setStartProgress] = useState("");
  const [endProgress, setEndProgress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (grade) {
      setLoading(true);
      setError(null);

      api
        .get("/api/progress", { params: { className: grade } })
        .then((response) => {
          // --- 원본 코드의 로직을 그대로 복원 ---
          setPrevProgress(response.data.prevProgress || "");
          setNextProgress(response.data.nextProgress || "");
          setProgressList(response.data.progressList || []);
          // ---
        })
        .catch((err) => {
          setError(
            err.response?.data?.error ||
              "진도 데이터를 불러오는데 실패했습니다."
          );
          setPrevProgress("");
          setNextProgress("");
          setProgressList([]);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setPrevProgress("");
      setNextProgress("");
      setProgressList([]);
    }
  }, [grade]);

  const handleNext = () => {
    // 유효성 검사를 grade만 하도록 수정
    if (!grade) {
      alert("반을 입력해주세요.");
      return;
    }
    // onNext에 grade 값만 직접 전달하도록 수정
    onNext(grade);
  };

  return (
    <div>
      <h1>AI 기반 수업 자료 생성 서비스</h1>
      <div>
        <label htmlFor="grade">반: </label>
        <input
          type="text"
          id="grade"
          value={grade}
          onChange={(e) => setGrade(e.target.value)}
        />
      </div>

      {loading && <p>데이터를 불러오는 중...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      {grade && !loading && !error && (
        <div>
          <p>이전 진도: {prevProgress}</p>
          <p>오늘 진도: {nextProgress}</p>
          <div>
            <label htmlFor="startProgress">시작 진도: </label>
            <select
              id="startProgress"
              value={startProgress}
              onChange={(e) => setStartProgress(e.target.value)}
            >
              <option value="">선택</option>
              {progressList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="endProgress">끝 진도: </label>
            <select
              id="endProgress"
              value={endProgress}
              onChange={(e) => setEndProgress(e.target.value)}
            >
              <option value="">선택</option>
              {progressList.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      <button onClick={handleNext} disabled={loading}>
        다음
      </button>
    </div>
  );
}

export default StartPage;
