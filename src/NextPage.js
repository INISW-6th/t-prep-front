import React, { useState, useEffect, useRef } from "react";

// 1반과 2반에 대한 데이터를 별도로 정의
const unitData = {
  2: {
    previousTopic: "고려와 원의 교류",
    staticUnit: {
      startProgress: "조선의 건국",
      endProgress: "국가 체제의 정비",
    },
    subTopics: [
      {
        name: "조선의 건국",
        keywords: ["이성계", "위화도회군", "과전법", "신흥사대부"],
        description: "",
      },
      {
        name: "국가 체제의 정비",
        keywords: ["6조직계제", "집현전", "의정부서사제", "경국대전"],
        description: "",
      },
    ],
  },
  1: {
    previousTopic: "무신 정권기 하층민의 봉기",
    staticUnit: {
      startProgress: "고려와 거란의 충돌",
      endProgress: "여진의 성장과 고려의 대응",
    },
    subTopics: [
      {
        name: "고려와 거란의 충돌",
        keywords: ["고려", "거란", "서희", "강동6주", "귀주대첩"],
        description: "",
      },
      {
        name: "여진의 성장과 고려의 대응",
        keywords: ["여진", "윤관", "별무반", "금나라"],
        description: "",
      },
    ],
  },
};

function NextPage({
  classInfo, // 이전 페이지에서 받을 반 정보 ('1' 또는 '2')
  onGenerate,
  addedMaterials,
  onGoToCreateSurvey,
  generateContent,
}) {
  // classInfo에 따라 적절한 데이터셋을 선택
  const selectedUnitData = unitData[classInfo] || unitData["1"]; // 기본값으로 '1'반 데이터 사용

  const [previousSummary, setPreviousSummary] = useState("");
  const [todayGoal, setTodayGoal] = useState("");
  const [todaySummary, setTodaySummary] = useState("");
  const [subTopicsData, setSubTopicsData] = useState(
    selectedUnitData.subTopics
  );
  const [localAddedMaterials, setLocalAddedMaterials] = useState([]);

  const didFetchRef = useRef(false);

  useEffect(() => {
    // classInfo가 변경될 때마다 subTopicsData를 해당 반의 데이터로 초기화
    setSubTopicsData(selectedUnitData.subTopics);
  }, [classInfo, selectedUnitData.subTopics]);

  useEffect(() => {
    if (didFetchRef.current) return;
    didFetchRef.current = true;

    const generateSummaries = async () => {
      // 1. 이전 차시 요약 생성
      try {
        const prevResult = await generateContent({
          purpose: "textbook",
          question: `'${selectedUnitData.previousTopic}'`,
          prompt_name: "summary",
        });
        if (prevResult) setPreviousSummary(prevResult);
      } catch (err) {
        console.error("이전 요약 생성 실패:", err);
      }

      // 2. 오늘 수업 전체 요약 생성
      try {
        const todayResult = await generateContent({
          purpose: "textbook",
          question: `'${selectedUnitData.staticUnit.startProgress}'부터 '${selectedUnitData.staticUnit.endProgress}'까지의 내용 요약`,
          prompt_name: "cls",
        });
        if (todayResult) setTodaySummary(todayResult);
      } catch (err) {
        console.error("오늘 요약 생성 실패:", err);
      }
    };

    // 오늘의 수업 목표 설정
    setTodayGoal(
      `'${selectedUnitData.staticUnit.startProgress}' 단원의 내용을 이해하고 설명할 수 있다.`
    );
    generateSummaries();
    setLocalAddedMaterials(addedMaterials);
    // 의존성 배열에 selectedUnitData 관련 항목들을 추가하여 classInfo 변경 시 API 재호출
  }, [generateContent, addedMaterials, selectedUnitData]);

  const handleTopicClick = async (clickedTopicName) => {
    const targetTopic = subTopicsData.find(
      (topic) => topic.name === clickedTopicName
    );
    if (
      targetTopic &&
      targetTopic.description &&
      targetTopic.description !== "로딩 중..."
    )
      return;

    setSubTopicsData((currentTopics) =>
      currentTopics.map((topic) =>
        topic.name === clickedTopicName
          ? { ...topic, description: "로딩 중..." }
          : topic
      )
    );

    try {
      const result = await generateContent({
        purpose: "textbook",
        question: `'${clickedTopicName}'`,
        prompt_name: "summary",
      });

      if (result) {
        setSubTopicsData((currentTopics) =>
          currentTopics.map((topic) =>
            topic.name === clickedTopicName
              ? { ...topic, description: result }
              : topic
          )
        );
      }
    } catch (err) {
      console.error("소주제 설명 실패:", err);
      setSubTopicsData((currentTopics) =>
        currentTopics.map((topic) =>
          topic.name === clickedTopicName
            ? { ...topic, description: "오류가 발생했습니다." }
            : topic
        )
      );
    }
  };

  const handleGenerateMaterial = (keyword) => {
    onGenerate(keyword);
  };

  return (
    <div>
      <h2>이전 수업 요약</h2>
      <p style={{ whiteSpace: "pre-wrap" }}>
        {previousSummary || "로딩 중..."}
      </p>

      <h2>오늘의 수업 목표</h2>
      <p style={{ whiteSpace: "pre-wrap" }}>{todayGoal || "로딩 중..."}</p>

      <h2>오늘의 전체 수업 내용 요약</h2>
      <p style={{ whiteSpace: "pre-wrap" }}>{todaySummary || "로딩 중..."}</p>

      <h2>단원별 소주제</h2>
      {subTopicsData.map((topic) => (
        <div
          key={topic.name}
          onClick={() => handleTopicClick(topic.name)}
          style={{
            marginBottom: "20px",
            border: "1px solid #ccc",
            padding: "15px",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          <h3>{topic.name}</h3>
          {topic.description && (
            <p
              style={{
                fontSize: "0.9em",
                color: "#555",
                whiteSpace: "pre-wrap",
              }}
            >
              {topic.description}
            </p>
          )}
          <div>
            {topic.keywords.map((keyword) => (
              <button
                key={keyword}
                onClick={(e) => {
                  e.stopPropagation();
                  handleGenerateMaterial(keyword);
                }}
                style={{
                  margin: "5px",
                  padding: "8px 12px",
                  border: "1px solid #81c784",
                  borderRadius: "5px",
                  backgroundColor: "white",
                  color: "#333",
                  cursor: "pointer",
                }}
              >
                {keyword} (자료 생성)
              </button>
            ))}
          </div>
        </div>
      ))}

      <div style={{ margin: "30px 0 10px 0" }}>
        <button
          onClick={onGoToCreateSurvey}
          style={{
            padding: "12px 24px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          질문 만들기
        </button>
      </div>

      <h2>추가한 수업 자료 목록</h2>
      {localAddedMaterials.map((item, index) => (
        <div
          key={index}
          style={{
            marginBottom: "10px",
            borderBottom: "1px dotted #ccc",
            paddingBottom: "10px",
          }}
        >
          <strong>{item.keyword}</strong> -{" "}
          {item.material?.content || item.material || "생성 중"}
        </div>
      ))}

      <div style={{ marginTop: "20px" }}>
        <button>모든 수업 자료 다운받기</button>
        <button>PPT로 만들기</button>
        <button>PDF로 만들기</button>
      </div>
    </div>
  );
}

export default NextPage;
