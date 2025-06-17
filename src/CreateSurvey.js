import React, { useState } from "react";
import axios from "axios";

function CreateSurvey({ onBack }) {
  const [survey, setSurvey] = useState({
    title: "수업 피드백 설문지",
    questions: [],
  });
  const [result, setResult] = useState(null);

  // 질문 추가
  const addQuestion = () => {
    setSurvey((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          text: "",
          type: "SHORT_ANSWER",
          options: [],
        },
      ],
    }));
  };

  // 질문/옵션 변경
  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...survey.questions];
    newQuestions[index][field] = value;
    setSurvey((prev) => ({ ...prev, questions: newQuestions }));
  };

  const addOption = (qIndex) => {
    const newQuestions = [...survey.questions];
    newQuestions[qIndex].options.push("");
    setSurvey((prev) => ({ ...prev, questions: newQuestions }));
  };

  // 설문 제출
  const handleSubmit = async () => {
    try {
      const response = await axios.post(
        "http://localhost:6000/generate-form",
        survey
      );
      setResult(response.data);
    } catch (error) {
      alert("설문 생성 실패: " + error.message);
    }
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h1>새 설문지 생성</h1>

      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={addQuestion}
          style={{
            padding: "10px 15px",
            backgroundColor: "#4CAF50",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          질문 추가
        </button>
      </div>

      {survey.questions.map((q, qIndex) => (
        <div
          key={qIndex}
          style={{
            marginBottom: "20px",
            padding: "15px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        >
          <input
            type="text"
            value={q.text}
            onChange={(e) =>
              handleQuestionChange(qIndex, "text", e.target.value)
            }
            placeholder="질문 내용"
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              fontSize: "16px",
            }}
          />

          <select
            value={q.type}
            onChange={(e) =>
              handleQuestionChange(qIndex, "type", e.target.value)
            }
            style={{
              padding: "8px",
              marginRight: "10px",
              borderRadius: "4px",
            }}
          >
            <option value="SHORT_ANSWER">단답형</option>
            <option value="MULTIPLE_CHOICE">객관식</option>
          </select>

          {q.type === "MULTIPLE_CHOICE" && (
            <div>
              {q.options.map((option, oIndex) => (
                <input
                  key={oIndex}
                  type="text"
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...q.options];
                    newOptions[oIndex] = e.target.value;
                    handleQuestionChange(qIndex, "options", newOptions);
                  }}
                  placeholder={`옵션 ${oIndex + 1}`}
                  style={{
                    width: "200px",
                    padding: "6px",
                    margin: "5px",
                    border: "1px solid #ccc",
                  }}
                />
              ))}
              <button
                onClick={() => addOption(qIndex)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#2196F3",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                옵션 추가
              </button>
            </div>
          )}
        </div>
      ))}

      {result ? (
        <div style={{ marginTop: "30px" }}>
          <h2>생성된 설문지</h2>
          <a
            href={result.formUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "18px", color: "#2196F3" }}
          >
            {result.formUrl}
          </a>
          <h3>QR 코드</h3>
          <img
            src={result.qrCode}
            alt="설문지 QR 코드"
            style={{ width: "200px", height: "200px" }}
          />
        </div>
      ) : (
        <button
          onClick={handleSubmit}
          style={{
            padding: "15px 30px",
            backgroundColor: "#FF9800",
            color: "white",
            border: "none",
            borderRadius: "4px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          설문지 생성하기
        </button>
      )}

      <button
        onClick={onBack}
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#9E9E9E",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
        }}
      >
        뒤로 가기
      </button>
    </div>
  );
}

export default CreateSurvey;
