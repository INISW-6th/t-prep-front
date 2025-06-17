// src/GenerateMaterialPage.js
import React, { useState } from "react";

function GenerateMaterialPage({
  selectedKeyword,
  onMaterialAdded,
  onContinue,
  onGoToStorytelling,
  generateContent,
}) {
  const recommended = ["추가설명", "퀴즈", "삽화"];
  const others = ["기타자료1", "기타자료2", "기타자료3", "기타자료4"];

  const [isGenerating, setIsGenerating] = useState(false);

  // ★ 1. 생성된 자료와 그 종류를 저장할 새로운 state 추가
  const [generatedResult, setGeneratedResult] = useState({
    type: "",
    content: "",
  });

  const handleGenerateAndAdd = async (materialType) => {
    setIsGenerating(true);
    setGeneratedResult({ type: materialType, content: "생성 중..." }); // 로딩 상태 표시

    const prompt = `'${selectedKeyword}`;
    const generatedContent = await generateContent({
      purpose: "minjok",
      question: prompt,
      prompt_name: "chuga",
    });

    setIsGenerating(false);

    if (generatedContent) {
      // ★ 2. LLM의 응답을 state에 저장하여 화면에 렌더링
      setGeneratedResult({ type: materialType, content: generatedContent });

      // '수업 자료로 추가' 버튼을 누르기 전까지는 목록에 추가하지 않음
      // onMaterialAdded(selectedKeyword, `[${materialType}] ${generatedContent}`);
    } else {
      setGeneratedResult({
        type: materialType,
        content: "자료 생성에 실패했습니다. 다시 시도해주세요.",
      });
    }
  };

  // ★ 3. 생성된 자료를 최종적으로 수업 목록에 추가하는 함수
  const confirmAndAddMaterial = () => {
    if (!generatedResult.content || generatedResult.content.includes("실패")) {
      alert("추가할 자료가 없습니다.");
      return;
    }
    onMaterialAdded(
      selectedKeyword,
      `[${generatedResult.type}] ${generatedResult.content}`
    );
    alert(`'${generatedResult.type}' 자료가 목록에 성공적으로 추가되었습니다.`);
    setGeneratedResult({ type: "", content: "" }); // 상태 초기화
  };

  return (
    <div>
      <h2>수업 자료 생성: {selectedKeyword}</h2>
      {isGenerating && (
        <div style={{ color: "blue" }}>자료를 생성하는 중입니다...</div>
      )}

      <h3>스토리텔링 만들러 가기</h3>
      <button
        onClick={onGoToStorytelling}
        style={{
          margin: "5px",
          padding: "8px 12px",
          backgroundColor: "#ff9800",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Go
      </button>

      <h3>주요 수업 자료</h3>
      <div
        style={{
          display: "flex",
          gap: "10px",
          overflowX: "auto",
          paddingBottom: "10px",
        }}
      >
        {recommended.map((material) => (
          <div
            key={material}
            style={{
              border: "1px solid #ccc",
              borderRadius: "5px",
              padding: "10px",
              minWidth: "200px",
            }}
          >
            {material}
            <button
              style={{
                marginTop: "10px",
                padding: "8px 12px",
                backgroundColor: "#4caf50",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              onClick={() => {
                if (material === "추가설명" || material === "퀴즈") {
                  handleGenerateAndAdd(material);
                } else {
                  const simpleMaterial = `[${material}] 자료가 생성 대기중입니다.`;
                  onMaterialAdded(selectedKeyword, simpleMaterial);
                  alert(simpleMaterial);
                }
              }}
              disabled={isGenerating}
            >
              자료 생성
            </button>
          </div>
        ))}
      </div>

      {/* ★ 4. 생성된 자료를 화면에 렌더링하는 UI 추가 */}
      {generatedResult.content && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            backgroundColor: "#f9fafb",
          }}
        >
          <h3
            style={{
              fontSize: "1.2rem",
              fontWeight: "bold",
              marginBottom: "1rem",
            }}
          >
            AI 생성 결과: [{generatedResult.type}]
          </h3>
          <div
            style={{
              padding: "1rem",
              backgroundColor: "white",
              whiteSpace: "pre-wrap",
              borderRadius: "0.5rem",
              border: "1px solid #eee",
            }}
          >
            {generatedResult.content}
          </div>
          <button
            onClick={confirmAndAddMaterial}
            style={{
              marginTop: "1rem",
              padding: "8px 15px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            이 내용을 수업 자료로 추가하기
          </button>
        </div>
      )}

      <h3>기타 수업 자료 생성</h3>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
          gap: "10px",
          marginBottom: "20px",
        }}
      >
        {others.map((buttonLabel, index) => (
          <button
            key={index}
            style={{
              padding: "10px 15px",
              backgroundColor: "#f0f0f0",
              color: "#333",
              border: "1px solid #ccc",
              borderRadius: "5px",
              cursor: "pointer",
            }}
            onClick={() => {
              const generated = `[생성됨] ${selectedKeyword} - ${buttonLabel}`;
              onMaterialAdded(selectedKeyword, generated);
              alert(
                `${buttonLabel} 수업 자료가 생성되어 목록에 추가되었습니다.`
              );
            }}
          >
            {buttonLabel} 생성
          </button>
        ))}
      </div>

      <button
        style={{
          margin: "5px",
          padding: "10px 15px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={onContinue}
      >
        최종 추가하고 계속 수업 자료 만들러 가기
      </button>
    </div>
  );
}

export default GenerateMaterialPage;
