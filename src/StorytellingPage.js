import React, { useState } from "react";
import fallbackBg from "./img/fallback-background.png";
import fallbackDev from "./img/fallback-development.png";
import fallbackEvt from "./img/fallback-event.png";
import fallbackCon from "./img/fallback-conclusion.png";

import charA_img from "./img/character-a.png";
import charB_img from "./img/character-b.png";
import charC_img from "./img/character-c.png";
import charD_img from "./img/character-d.png";

function StorytellingPage({
  selectedKeyword,
  onMaterialAdded,
  onBack,
  generateContent, // 부모(App.js)로부터 받아야 하는 텍스트 생성 함수
  generateImage, // 부모(App.js)로부터 받아야 하는 이미지 생성 함수
}) {
  const [step, setStep] = useState("selectCharacter");

  // --- 정적 데이터 ---
  const koreanTitles = {
    background: "기 (배경)",
    development: "승 (전개)",
    event: "전 (사건)",
    conclusion: "결 (결말)",
  };
  const [characters, setCharacters] = useState([
    {
      name: "이성계",
      description: "고려 말기 명장이자, 조선의 초대왕",
      image: charA_img,
    },
    { name: "우왕", description: "고려 제 32대왕", image: charB_img },
    { name: "최영", description: "고려 말의 장수", image: charC_img },
    {
      name: "정도전",
      description: "고려말과 조선초기 유학자",
      image: charD_img,
    },
  ]);
  const [selectedCharacter, setSelectedCharacter] = useState(null);

  // --- LLM 생성 데이터 ---
  const [script, setScript] = useState({
    background: "",
    development: "",
    event: "",
    conclusion: "",
  });
  const [dialogue, setDialogue] = useState({
    background: "",
    development: "",
    event: "",
    conclusion: "",
  });
  const [imageUrls, setImageUrls] = useState({
    background: "",
    development: "",
    event: "",
    conclusion: "",
  });

  // --- UI 상태 ---
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogueLoading, setIsDialogueLoading] = useState(false);
  const [isSending, setIsSending] = useState(false); // 서버 전송 로딩
  const [serverResponseLink, setServerResponseLink] = useState(""); // 서버로부터 받은 링크
  //const [error, setError] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  // 1. 인물 선택 시, 스크립트 생성
  const handleSelectCharacter = async (character) => {
    setSelectedCharacter(character);
    setIsLoading(true);
    //setError(null);
    setDialogue({ background: "", development: "", event: "", conclusion: "" });

    try {
      const scriptPrompt = `'${selectedKeyword}'`;
      const fullScriptText = await generateContent({
        purpose: "minjok",
        question: scriptPrompt,
        prompt_name: "story_script_generation",
      });
      if (!fullScriptText) throw new Error("스크립트를 생성하지 못했습니다.");
      //fullScriptText = fullScriptText.replaceAll("###", "").trim();

      const parsedScript = {
        background: fullScriptText.match(/### 기:([\s\S]*?)(### 승:|$)/)?.[1],
        development: fullScriptText.match(/### 승:([\s\S]*?)(### 전:|$)/)?.[1],
        event: fullScriptText.match(/### 전:([\s\S]*?)(### 결:|$)/)?.[1],
        conclusion: fullScriptText.match(/### 결:([\s\S]*)/)?.[1],
      };
      setScript(parsedScript);
      setStep("editScript");
    } catch (error) {
      console.error("스크립트 생성 중 오류:", error);
      //setError("스크립트 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 버튼 클릭 시, 대사 생성
  const handleGenerateDialogue = async () => {
    setIsDialogueLoading(true);
    //setError(null);
    try {
      const dialoguePrompt = `--- 현재 스토리 ---\n기: ${script.background}\n승: ${script.development}\n전: ${script.event}\n결: ${script.conclusion}`;
      const fullDialogueText = await generateContent({
        purpose: "textbook",
        question: dialoguePrompt,
        prompt_name: "dialogue",
      });
      if (!fullDialogueText) throw new Error("대사를 생성하지 못했습니다.");

      const parsedDialogue = {
        background:
          fullDialogueText.match(/<기>([\s\S]*?)<승>/)?.[1]?.trim() || "",
        development:
          fullDialogueText.match(/<승>([\s\S]*?)<전>/)?.[1]?.trim() || "",
        event: fullDialogueText.match(/<전>([\s\S]*?)<결>/)?.[1]?.trim() || "",
        conclusion: fullDialogueText.match(/<결>([\s\S]*)/)?.[1]?.trim() || "",
      };
      setDialogue(parsedDialogue);
    } catch (error) {
      console.error("대사 생성 중 오류:", error);
      //setError("대사 생성에 실패했습니다.");
    } finally {
      setIsDialogueLoading(false);
    }
  };
  const fallbackImages = {
    background: fallbackBg,
    development: fallbackDev,
    event: fallbackEvt,
    conclusion: fallbackCon,
  };

  // 3. 삽화 생성
  const handleGenerateImage = async (section) => {
    //setError(null);
    try {
      const koreanDescription = script[section];
      if (!koreanDescription)
        throw new Error("삽화를 만들 스크립트 내용이 없습니다.");
      const imageUrl = await generateImage(koreanDescription);
      if (!imageUrl) throw new Error("이미지를 생성하지 못했습니다.");
      setImageUrls((prev) => ({ ...prev, [section]: imageUrl }));
    } catch (error) {
      // 1. 개발자를 위해 콘솔에 실제 에러를 기록합니다.
      console.error(`${section} 삽화 생성 중 오류:`, error);

      // 2. 사용자에게 에러 상황을 알립니다.
      // setError(
      //   `${section} 삽화 생성에 실패하여 5초 후 대체 이미지를 불러옵니다.`
      // );

      // 3. 5초 동안 대기합니다.
      await new Promise((resolve) => setTimeout(resolve, 5000));

      // 4. public 폴더에 있는 로컬 이미지 경로를 설정합니다.
      const fallbackImageUrl = fallbackImages[section]; // public 폴더의 이미지 파일 이름과 일치해야 합니다.

      // 5. 이미지 URL 상태를 로컬 대체 이미지로 업데이트합니다.
      setImageUrls((prev) => ({ ...prev, [section]: fallbackImageUrl }));

      // 6. 대체 이미지를 로드했음을 알리는 메시지로 변경 (선택 사항)
      //setError(`${section} 삽화 대신 대체 이미지를 표시합니다.`);
    }
  };

  const handleGenerateAllImages = () => {
    ["background", "development", "event", "conclusion"].forEach((section) => {
      handleGenerateImage(section);
    });
    setStep("review");
  };

  // 4. 생성된 데이터를 서버로 전송하고 링크를 받는 함수
  const sendDataToServer = async () => {
    setIsSending(true);
    //setError(null);
    setServerResponseLink("");

    try {
      // 4-1. 데이터를 서버가 원하는 JSON 구조로 변환
      const sections = ["background", "development", "event", "conclusion"];
      const scenes = sections.map((section) => {
        const rawDialogue = dialogue[section];
        let parsedDialogues = [];

        if (rawDialogue && rawDialogue.trim() !== "") {
          parsedDialogues = rawDialogue
            .split("\n")
            .map((line) => {
              const parts = line.split(":");
              if (parts.length < 2) return null;

              const character = parts[0].replace(/\[|\]|\(|\)/g, "").trim();
              let dialogueLine = parts.slice(1).join(":").trim();
              if (dialogueLine.startsWith('"') && dialogueLine.endsWith('"')) {
                dialogueLine = dialogueLine.slice(1, -1);
              }

              if (!character || !dialogueLine) return null;
              return { character, line: dialogueLine };
            })
            .filter(Boolean);
        }

        return {
          image: imageUrls[section] || "",
          dialogues: parsedDialogues,
        };
      });

      // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
      // 여기에 viewerUrl을 추가합니다.
      // 서버에서 요구하는 실제 뷰어 페이지의 URL을 입력해야 합니다.
      const viewerUrl = `http://localhost:3000/t-prep-test/story-viewer.html`; // ◀◀◀ 이 부분을 실제 URL로 수정하세요.

      const dataToSend = {
        scenes: scenes,
        viewerUrl: viewerUrl, // ◀◀◀ 서버가 요구하는 viewerUrl 필드 추가
      };
      // ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★

      console.log(
        "서버로 전송할 최종 JSON:",
        JSON.stringify(dataToSend, null, 2)
      );

      // 4-2. 서버로 데이터 전송
      const apiUrl = "http://localhost:5000/generate-link"; // 사용하시던 주소로 수정

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        // 서버가 보낸 에러 메시지를 JSON으로 파싱해서 보여줍니다.
        const errorData = await response.json();
        throw new Error(
          `데이터 전송 실패: ${response.status} - ${JSON.stringify(errorData)}`
        );
      }

      const responseData = await response.json();
      if (responseData && responseData.shareLink) {
        // ◀◀◀ 이 부분을 수정 ('link' -> 'shareLink')
        setServerResponseLink(responseData.shareLink); // ◀◀◀ 이 부분을 수정 ('link' -> 'shareLink')
        setStep("showLink");
      } else {
        throw new Error("서버 응답에 'shareLink'가 없습니다."); // 에러 메시지도 명확하게 변경
      }
    } catch (error) {
      console.error("데이터 전송 중 오류:", error);
      //setError(error.message); // 에러 메시지를 상태에 저장하여 화면에 표시
    } finally {
      setIsSending(false);
    }
  };
  // 핸들러 함수들
  const handleScriptChange = (field, value) =>
    setScript((prev) => ({ ...prev, [field]: value }));
  const handleDialogueChange = (field, value) =>
    setDialogue((prev) => ({ ...prev, [field]: value }));

  const handleSaveStory = () => {
    const storyContent = JSON.stringify({
      character: selectedCharacter,
      script,
      dialogue,
      imageUrls,
    });
    onMaterialAdded(selectedKeyword, storyContent);
    onBack();
  };
  const handleCopyLink = () => {
    navigator.clipboard.writeText(serverResponseLink).then(() => {
      setIsCopied(true);
      // 2초 후에 "복사 완료!" 메시지를 원래대로 되돌립니다.
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    });
  };

  return (
    <div style={{ padding: "1rem", maxWidth: "64rem", margin: "0 auto" }}>
      <h1
        style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "1rem" }}
      >
        스토리텔링 생성: {selectedKeyword}
      </h1>

      {isLoading && (
        <div style={{ textAlign: "center", color: "#6b7280" }}>
          스토리 생성 중...
        </div>
      )}
      {/* {error && (
        <div style={{ color: "red", marginBottom: "1rem" }}>오류: {error}</div>
      )} */}

      {step === "selectCharacter" && (
        <div>
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            주인공을 선택해주세요
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {characters.map((character) => (
              // ★★★★★ 1. 부모 div(카드)에 overflow: 'hidden'과 borderRadius 적용 ★★★★★
              <div
                key={character.id}
                onClick={() => handleSelectCharacter(character)}
                style={{
                  cursor: "pointer",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.75rem", // 카드 자체의 모서리를 둥글게
                  overflow: "hidden", // 카드를 벗어나는 자식 요소를 숨김
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  transition: "transform 0.2s, box-shadow 0.2s",
                  backgroundColor: "#fff",
                }}
              >
                {/* ★★★★★ 2. img 태그에서는 borderRadius 제거하고, display: 'block' 추가 ★★★★★ */}

                <div style={{ padding: "1rem", textAlign: "center" }}>
                  <p
                    style={{
                      fontWeight: "bold",
                      fontSize: "1.125rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {character.name}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#6b7280" }}>
                    {character.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {step === "editScript" && (
        <div>
          <h2>스크립트 및 대사 수정</h2>
          <button
            onClick={handleGenerateDialogue}
            disabled={isDialogueLoading}
            style={{
              marginBottom: "1rem",
              padding: "0.5rem 1rem",
              border: "none",
              backgroundColor: "#22c55e",
              color: "white",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            {isDialogueLoading ? "대사 생성 중..." : "AI로 대사 생성하기"}
          </button>

          {["background", "development", "event", "conclusion"].map((field) => (
            <div
              key={field}
              style={{
                marginBottom: "1.5rem",
                border: "1px solid #eee",
                padding: "1rem",
                borderRadius: "0.5rem",
              }}
            >
              <h3>{koreanTitles[field]}</h3>
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                }}
              >
                스크립트
              </label>
              <textarea
                value={script[field]}
                onChange={(e) => handleScriptChange(field, e.target.value)}
                rows="10"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                }}
              />
              <label
                style={{
                  display: "block",
                  fontWeight: "500",
                  marginBottom: "0.25rem",
                  marginTop: "1rem",
                }}
              >
                대사
              </label>
              <textarea
                value={dialogue[field]}
                onChange={(e) => handleDialogueChange(field, e.target.value)}
                rows="10"
                style={{
                  width: "100%",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  border: "1px solid #d1d5db",
                }}
                placeholder={
                  !dialogue[field]
                    ? "AI로 대사를 생성하거나 직접 입력하세요."
                    : ""
                }
              />
            </div>
          ))}
          <button
            onClick={() => setStep("generateImage")}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            삽화 생성으로 이동
          </button>
        </div>
      )}

      {step === "generateImage" && (
        <div>
          <h2>삽화 생성</h2>
          {["background", "development", "event", "conclusion"].map(
            (section) => (
              <div key={section} style={{ marginBottom: "1.5rem" }}>
                <h3>{koreanTitles[{ section }]} 삽화</h3>
                <button
                  onClick={() => handleGenerateImage(section)}
                  style={{
                    padding: "0.5rem 1rem",
                    border: "none",
                    backgroundColor: "#22c55e",
                    color: "white",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    marginBottom: "0.5rem",
                  }}
                >
                  이 삽화 생성
                </button>
                {imageUrls[section] && (
                  <img
                    src={imageUrls[section]}
                    alt={`${section} Illustration`}
                    style={{
                      marginTop: "0.5rem",
                      maxWidth: "100%",
                      borderRadius: "0.5rem",
                    }}
                  />
                )}
              </div>
            )
          )}
          <button
            onClick={handleGenerateAllImages}
            style={{
              padding: "0.5rem 1rem",
              border: "none",
              backgroundColor: "#3b82f6",
              color: "white",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            모든 삽화 생성 및 확인
          </button>
        </div>
      )}

      {step === "review" && (
        <div>
          <h2>최종 스토리텔링 확인 및 전송</h2>
          {/* 최종 결과 표시 UI를 여기에 구현할 수 있습니다. */}
          <p>모든 스크립트, 대사, 삽화가 준비되었습니다.</p>
          <button
            onClick={sendDataToServer}
            disabled={isSending}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "#10B981",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
            }}
          >
            {isSending ? "서버로 전송 중..." : "서버로 전송하고 링크 받기"}
          </button>
        </div>
      )}

      {step === "showLink" && (
        <div>
          <h2>전송 완료!</h2>
          <p>공유 가능한 링크가 생성되었습니다.</p>
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              alignItems: "center",
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "0.5rem",
              backgroundColor: "#f9f9f9",
            }}
          >
            <input
              type="text"
              value={serverResponseLink}
              readOnly
              style={{
                flexGrow: 1,
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "0.25rem",
              }}
            />
            <button
              onClick={handleCopyLink}
              style={{
                padding: "0.5rem 1rem",
                border: "none",
                backgroundColor: isCopied ? "#10B981" : "#3b82f6",
                color: "white",
                borderRadius: "0.25rem",
                cursor: "pointer",
                minWidth: "80px",
              }}
            >
              {isCopied ? "복사 완료!" : "링크 복사"}
            </button>
          </div>
          <a>
            <button
              style={{
                padding: "0.5rem 1rem",
                border: "1px solid #ccc",
                backgroundColor: "#fff",
                cursor: "pointer",
                borderRadius: "0.25rem",
              }}
            >
              새 탭에서 열기
            </button>
          </a>
        </div>
      )}

      <button style={{ marginTop: "2rem", display: "block" }} onClick={onBack}>
        자료 생성 페이지로 돌아가기
      </button>
    </div>
  );
}

export default StorytellingPage;
