// src/App.js
import React, { useState, useCallback } from "react";
import StartPage from "./StartPage";
import NextPage from "./NextPage";
import GenerateMaterialPage from "./GenerateMaterialPage";
import StorytellingPage from "./StorytellingPage";
import CreateSurvey from "./CreateSurvey";

function App() {
  const [currentPage, setCurrentPage] = useState("start");
  const [unitInfo, setUnitInfo] = useState(null);
  const [selectedKeywordForGeneration, setSelectedKeywordForGeneration] =
    useState(null);
  const [addedMaterials, setAddedMaterials] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");

  // LLM 콘텐츠 생성 함수
  const generateContent = async ({ purpose, question, prompt_name }) => {
    setIsLoading(true);

    const isIntegrated = Array.isArray(purpose);
    const endpoint = isIntegrated
      ? "https://man-touching-malamute.ngrok-free.app/ask-integrated"
      : "https://man-touching-malamute.ngrok-free.app/ask";

    let requestBody = {
      question: question,
    };

    if (isIntegrated) {
      requestBody.purposes = purpose;
    } else {
      requestBody.purpose = purpose;
    }

    if (prompt_name) {
      requestBody.prompt_name = prompt_name;
    }

    console.log(`Request to ${endpoint}:`, requestBody);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`네트워크 응답이 올바르지 않습니다.`);
      }

      const data = await response.json();

      // ★★★ 디버깅 로그 1번, 2번 ★★★
      console.log("1. 백엔드로부터 받은 전체 데이터(data):", data);
      console.log("2. 프론트엔드로 전달할 답변(data.answer):", data.answer);

      return data.answer;
    } catch (error) {
      console.error("콘텐츠 생성 중 오류 발생:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };
  const generateImage = useCallback(async (prompt) => {
    setIsLoading(true);
    // 이 부분은 실제 DALL-E 3를 호출하는 백엔드 엔드포인트입니다.
    const endpoint =
      "https://man-touching-malamute.ngrok-free.app/generate-image";
    console.log(`Request to ${endpoint}:`, { prompt });

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: prompt }),
      });
      if (!response.ok) {
        throw new Error("이미지 생성 API 응답이 올바르지 않습니다.");
      }
      const data = await response.json();
      // 백엔드가 이미지 URL을 'imageUrl' 키로 반환한다고 가정
      return data.imageUrl;
    } catch (error) {
      console.error("이미지 생성 중 오류:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const callChatAPI = useCallback(async ({ question, character }) => {
    setIsLoading(true);
    // index.js가 5000번 포트에서 실행되므로 주소 변경
    const endpoint = "http://localhost:5000/chat";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question, character }), // 서버가 요구하는 { question, character } 형태로 전송
      });
      if (!response.ok) {
        throw new Error("네트워크 응답 오류");
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "AI 응답 생성 실패");
      }
      return data.answer; // 서버가 'answer' 키로 응답
    } catch (error) {
      console.error("API 호출 오류:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);
  const generateShareLink = useCallback(async (storyData) => {
    // isLoading을 true로 설정해 로딩 화면을 보여줄 수 있습니다.
    // setIsLoading(true);
    const endpoint = "http://localhost:5000/generate-link";

    // 뷰어 페이지의 URL (실제 뷰어 페이지 주소로 변경 필요)
    const viewerUrl = "http://localhost:3000/viewer.html";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenes: storyData, // 스토리 데이터를 scenes 키에 담아 전송
          viewerUrl: viewerUrl,
        }),
      });
      if (!response.ok) throw new Error("링크 생성 응답 오류");
      const data = await response.json();

      if (!data.success) throw new Error(data.error || "링크 생성 실패");

      return data.shareLink; // 서버가 'shareLink' 키로 응답
    } catch (error) {
      console.error("링크 생성 API 호출 오류:", error);
      alert("공유 링크 생성에 실패했습니다."); // 사용자에게 실패 알림
      return null;
    } finally {
      // setIsLoading(false);
    }
  }, []);

  const handleNextPage = (data) => {
    setUnitInfo(data);
    setCurrentPage("next");
  };

  const handleGoToGenerate = (keyword) => {
    setSelectedKeywordForGeneration(keyword);
    setCurrentPage("generate");
  };

  const handleMaterialAdded = (keyword, material) => {
    setAddedMaterials([...addedMaterials, { keyword, material }]);
    alert(`'${keyword}'에 대한 수업 자료가 추가되었습니다.`);
  };

  const handleContinueGenerating = () => {
    setCurrentPage("next");
    setSelectedKeywordForGeneration(null);
  };

  const handleGoToStorytelling = () => {
    setCurrentPage("storytelling");
  };

  const handleBackToGenerate = () => {
    setCurrentPage("generate");
  };

  const handleGoToCreateSurvey = () => {
    setCurrentPage("createSurvey");
  };

  // //로딩 중일 때 표시할 화면
  // if (isLoading) {
  //   return (
  //     <div
  //       style={{
  //         display: "flex",
  //         justifyContent: "center",
  //         alignItems: "center",
  //         height: "100vh",
  //         fontSize: "20px",
  //       }}
  //     >
  //       콘텐츠를 생성하는 중입니다...
  //     </div>
  //   );
  // }
  const handleStart = (gradeValue) => {
    setSelectedGrade(gradeValue);
    setCurrentPage("next");
  };

  // 페이지 렌더링
  if (currentPage === "start") {
    return <StartPage onNext={handleStart} />;
  } else if (currentPage === "next") {
    return (
      <NextPage
        classInfo={selectedGrade}
        onGenerate={handleGoToGenerate}
        addedMaterials={addedMaterials}
        onGoToCreateSurvey={handleGoToCreateSurvey}
        generateContent={generateContent}
      />
    );
  } else if (currentPage === "generate" && selectedKeywordForGeneration) {
    const recommended = ["추가설명", "퀴즈", "삽화"];
    const others = ["기타자료1", "기타자료2", "기타자료3", "기타자료4"];
    return (
      <GenerateMaterialPage
        selectedKeyword={selectedKeywordForGeneration}
        //recommendedMaterials={recommended}
        //otherMaterialButtons={others}
        onMaterialAdded={handleMaterialAdded}
        onContinue={handleContinueGenerating}
        onGoToStorytelling={handleGoToStorytelling}
        generateContent={generateContent}
      />
    );
  } else if (currentPage === "storytelling") {
    return (
      <StorytellingPage
        selectedKeyword={selectedKeywordForGeneration}
        addedMaterials={addedMaterials}
        onMaterialAdded={handleMaterialAdded}
        onBack={handleBackToGenerate}
        generateContent={generateContent}
        generateImage={generateImage}
      />
    );
  } else if (currentPage === "createSurvey") {
    return (
      <CreateSurvey
        onBack={() => setCurrentPage("next")}
        generateContent={generateContent}
        unitInfo={unitInfo}
        callChatAPI={callChatAPI}
      />
    );
  }

  return <div>알 수 없는 페이지입니다.</div>;
}

export default App;
