import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 2rem;
  text-align: center;
`;

const LanguageSelector = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LanguageButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => (props.active ? "#4CAF50" : "#ddd")};
  color: ${(props) => (props.active ? "white" : "#333")};
  cursor: pointer;
  margin: 0 0.5rem;

  &:hover {
    background-color: ${(props) => (props.active ? "#45a049" : "#ccc")};
  }
`;

const DifficultySelector = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const DifficultyButton = styled(LanguageButton)``;

const StartMessage = styled.div`
  text-align: center;
  margin-bottom: 2rem;
  color: #666;
`;

const StartButton = styled(LanguageButton)`
  display: block;
  margin: 1rem auto;
  padding: 0.8rem 2rem;
  font-size: 1.1rem;
  background-color: ${(props) =>
    props.disabled ? "#ccc" : props.active ? "#4CAF50" : "#ddd"};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.7 : 1)};
  transition: all 0.3s ease;

  &:hover {
    background-color: ${(props) =>
      props.disabled ? "#ccc" : props.active ? "#45a049" : "#ccc"};
  }
`;

const GameContainer = styled.div`
  margin-bottom: 2rem;
`;

const TextDisplay = styled.div`
  font-size: 1.2rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 5px;
  min-height: 100px;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 5px;
  margin-bottom: 1rem;

  &:focus {
    outline: none;
    border-color: #4caf50;
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
`;

const StatItem = styled.div`
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.3rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const ResultModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ResultContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  min-width: 300px;
  text-align: center;
`;

const ResultTitle = styled.h2`
  color: #333;
  margin-bottom: 1.5rem;
`;

const ResultStats = styled.div`
  margin-bottom: 1.5rem;
`;

const ResultStatItem = styled.div`
  margin: 0.5rem 0;
  color: #666;
`;

const ResultStatLabel = styled.div`
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
`;

const ResultStatValue = styled.div`
  font-size: 1.2rem;
  font-weight: bold;
`;

const ResultButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1rem;
`;

const ResultButton = styled(LanguageButton)`
  min-width: 120px;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4caf50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const LoadingText = styled.div`
  font-size: 1.2rem;
  color: #333;
  text-align: center;
`;

const NoticeText = styled.div`
  text-align: center;
  color: #666;
  font-size: 0.9rem;
  margin-top: 1rem;
`;

const Timer = styled.div`
  text-align: center;
  font-size: 1.2rem;
  color: #333;
  margin-bottom: 1rem;
  font-weight: bold;
`;

const ErrorPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ErrorContent = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 400px;
  width: 90%;
`;

const ErrorTitle = styled.h3`
  color: #ff4444;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.p`
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.5;
`;

const ErrorButton = styled.button`
  background: #4caf50;
  color: white;
  border: none;
  padding: 0.8rem 2rem;
  border-radius: 5px;
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background: #45a049;
  }
`;

const TypingGame = () => {
  const [selectedLanguage, setSelectedLanguage] = useState(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [isGameActive, setIsGameActive] = useState(false);
  const [_isLoading, setIsLoading] = useState(false);
  const [currentSentence, setCurrentSentence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [_remainingSentences, setRemainingSentences] = useState([]);
  const [scores, setScores] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    typingSpeed: 0,
    accuracy: 0,
    completedSentences: 0,
    correctWords: 0,
    elapsedTime: 0,
    averageAccuracy: 0,
  });
  const [showResult, setShowResult] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const startTimeRef = useRef(null);
  const keystrokeTimesRef = useRef([]);
  const lastKeystrokeTimeRef = useRef(null);
  const [error, setError] = useState(null);

  const formatElapsedTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const decomposeHangul = (char) => {
    const code = char.charCodeAt(0);
    if (code < 0xac00 || code > 0xd7a3) return [char]; // 한글이 아닌 경우

    const syllable = code - 0xac00;
    const final = syllable % 28;
    const medial = ((syllable - final) / 28) % 21;
    const initial = Math.floor((syllable - final) / 28 / 21);

    const result = [];
    if (initial > 0) result.push(String.fromCharCode(0x1100 + initial - 1)); // 초성
    if (medial > 0) result.push(String.fromCharCode(0x1161 + medial - 1)); // 중성
    if (final > 0) result.push(String.fromCharCode(0x11a7 + final)); // 종성

    return result;
  };

  // 한글 타수 계산 함수 수정
  const calculateHangulKeystrokes = (text) => {
    return text.split("").reduce((count, char) => {
      const decomposed = decomposeHangul(char);
      return count + decomposed.length;
    }, 0);
  };

  const calculateHangulAccuracy = (input, target) => {
    if (!input || !target) return 0;

    // NFD 정규화를 사용하여 자모 분해
    const decomposedInput = input.normalize("NFD");
    const decomposedTarget = target.normalize("NFD");

    let correctCount = 0;
    const minLength = Math.min(decomposedInput.length, decomposedTarget.length);

    // 자모 단위로 비교
    for (let i = 0; i < minLength; i++) {
      if (decomposedInput[i] === decomposedTarget[i]) {
        correctCount++;
      }
    }

    // 정확도 계산 (소수점 둘째 자리까지)
    const accuracy = (correctCount / decomposedTarget.length) * 100;
    return Math.round(accuracy * 100) / 100;
  };

  const calculateEnglishAccuracy = (input, target) => {
    if (!input || !target) return 0;

    let correctCount = 0;
    const minLength = Math.min(input.length, target.length);

    // 문자 단위로 비교
    for (let i = 0; i < minLength; i++) {
      if (input[i] === target[i]) {
        correctCount++;
      }
    }

    // 정확도 계산 (소수점 둘째 자리까지)
    const accuracy = (correctCount / target.length) * 100;
    return Math.round(accuracy * 100) / 100;
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    let timer;
    if (isGameActive) {
      timer = setInterval(() => {
        const currentTime = Date.now();
        const elapsedTime = (currentTime - startTimeRef.current) / 1000;

        // 현재 문장에서 정확한 입력만 필터링
        const correctInput = userInput
          .split("")
          .filter((char, index) => char === currentSentence[index])
          .join("");

        // 현재 문장의 타수 계산 (한컴타자 방식)
        const correctKeystrokes = calculateHangulKeystrokes(correctInput);

        // 최근 10초 동안의 타수 계산
        const recentKeystrokes = keystrokeTimesRef.current.filter(
          (time) => currentTime - time <= 10000
        ).length;

        let typingSpeed;
        if (lastKeystrokeTimeRef.current) {
          const timeSinceLastKeystroke =
            (currentTime - lastKeystrokeTimeRef.current) / 1000;
          if (timeSinceLastKeystroke > 1) {
            const decayFactor = Math.min(timeSinceLastKeystroke / 10, 1);
            const decayedKeystrokes = Math.floor(
              recentKeystrokes * (1 - decayFactor)
            );
            typingSpeed = Math.round((decayedKeystrokes / 10) * 60);
          } else {
            typingSpeed = Math.round((recentKeystrokes / 10) * 60);
          }
        } else {
          typingSpeed = Math.round((recentKeystrokes / 10) * 60);
        }

        setGameStats((prev) => ({
          ...prev,
          correctKeystrokes,
          typingSpeed,
          elapsedTime,
        }));
      }, 100);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isGameActive, currentSentence, userInput]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setUserInput(value);
    lastKeystrokeTimeRef.current = Date.now();

    if (value.length > userInput.length) {
      // 새로운 키 입력이 있을 때마다 타수 증가
      const newChar = value[value.length - 1];
      const keystrokes = calculateHangulKeystrokes(newChar);
      for (let i = 0; i < keystrokes; i++) {
        keystrokeTimesRef.current.push(Date.now());
      }
    }
  };

  const handleKeyDown = async (e) => {
    try {
      if (e.key === "Enter" && isGameActive) {
        e.preventDefault();

        // 현재 진행도 확인
        const currentProgress = gameStats.completedSentences;

        // 진행도가 10을 초과하면 게임 종료
        if (currentProgress >= 10) {
          endGame();
          return;
        }

        // 다음 문장으로 이동
        const newSentences = [..._remainingSentences];
        newSentences.shift();
        setRemainingSentences(newSentences);

        // 게임 통계 업데이트
        setGameStats((prev) => {
          const words =
            typeof currentSentence === "object"
              ? currentSentence.content.split(" ").length
              : currentSentence.split(" ").length;

          const content =
            typeof currentSentence === "object"
              ? currentSentence.content
              : currentSentence;
          const currentAccuracy =
            selectedLanguage === "ko"
              ? calculateHangulAccuracy(userInput, content)
              : calculateEnglishAccuracy(userInput, content);

          const newTotalAccuracy = prev.totalAccuracy + currentAccuracy;
          const newAverageAccuracy = newTotalAccuracy / (currentProgress + 1);

          return {
            ...prev,
            correctWords:
              prev.correctWords + (currentAccuracy === 100 ? words : 0),
            completedSentences: currentProgress + 1,
            totalInputs: prev.totalInputs + 1,
            totalAccuracy: newTotalAccuracy,
            averageAccuracy: Math.round(newAverageAccuracy * 100) / 100,
          };
        });

        // 마지막 문장이 아닌 경우에만 다음 문장 설정
        if (newSentences.length > 0) {
          setCurrentSentence(newSentences[0]);
          setUserInput("");
        } else {
          endGame();
        }
      }
    } catch (err) {
      console.error("키 입력 처리 중 오류 발생:", err);
      setError("게임 진행 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  const startGame = async () => {
    if (!selectedLanguage) return;

    setIsLoading(true);
    setError(null);
    try {
      let initialSentences;
      if (selectedLanguage === "ko") {
        initialSentences = await fetchAndTranslate30Quotes(selectedDifficulty);
      } else {
        let minLength = 0,
          maxLength = 1000;
        if (selectedDifficulty === "easy") {
          maxLength = 80;
        } else if (selectedDifficulty === "hard") {
          minLength = 90;
        }
        const res = await axios.get(
          `/api/quotes?minLength=${minLength}&maxLength=${maxLength}`
        );
        // API 응답 형식에 맞게 데이터 매핑
        initialSentences = res.data.map((quote) => ({
          content: quote.content,
          author: quote.author,
        }));
      }

      // 문장을 10개로 제한
      const limitedSentences = initialSentences.slice(0, 10);
      setRemainingSentences(limitedSentences);
      setCurrentSentence(limitedSentences[0]);
      setUserInput("");
      setIsGameActive(true);
      startTimeRef.current = Date.now();
      lastKeystrokeTimeRef.current = Date.now();
      keystrokeTimesRef.current = [];
      setGameStats({
        correctWords: 0,
        totalTime: 0,
        averageAccuracy: 100,
        typingSpeed: 0,
        totalKeystrokes: 0,
        correctKeystrokes: 0,
        elapsedTime: 0,
        completedSentences: 0,
        totalAccuracy: 0,
        totalInputs: 0,
        totalCorrectChars: 0,
        totalChars: 0,
        totalDecomposedInput: "",
        totalDecomposedTarget: "",
        totalCorrectJamo: 0,
        totalJamo: 0,
      });
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (err) {
      console.error("게임 시작 중 오류 발생:", err);
      setError(
        "서버와의 통신 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndTranslate30Quotes = async (difficulty) => {
    try {
      let minLength = 0,
        maxLength = 1000;
      if (difficulty === "easy") {
        maxLength = 80;
      } else if (difficulty === "hard") {
        minLength = 90;
      }
      const res = await axios.get(
        `/api/quotes?minLength=${minLength}&maxLength=${maxLength}`
      );
      // API 응답 형식에 맞게 데이터 매핑
      const quotes = res.data;
      const translated = await Promise.all(
        quotes.map(async (quote) => {
          try {
            const response = await axios.post("/api/translate", {
              text: quote.content,
              source: "en",
              target: "ko",
            });
            return {
              content: response.data.translatedText,
              author: quote.author,
            };
          } catch (err) {
            console.error("번역 중 오류:", err);
            throw new Error("번역 중 오류가 발생했습니다.");
          }
        })
      );
      return translated;
    } catch (err) {
      console.error("Quote API 에러 발생:", err);
      throw new Error("명언을 가져오는 중 오류가 발생했습니다.");
    }
  };

  const endGame = () => {
    setIsGameActive(false);
    const finalStats = {
      accuracy: Math.round(gameStats.averageAccuracy),
      correctWords: gameStats.correctWords,
      difficulty: selectedDifficulty,
      language: selectedLanguage,
      date: new Date().toLocaleDateString(),
      typingSpeed: gameStats.typingSpeed,
      elapsedTime: gameStats.elapsedTime,
    };

    const newScores = [...scores, finalStats].slice(-10);
    setScores(newScores);
    localStorage.setItem("typingScores", JSON.stringify(newScores));

    if (finalStats.accuracy > bestScore) {
      setBestScore(finalStats.accuracy);
      localStorage.setItem("bestScore", finalStats.accuracy);
    }

    try {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const userIndex = users.findIndex(
          (u) => u.username === currentUser.username
        );

        if (userIndex !== -1) {
          if (!users[userIndex].scores) {
            users[userIndex].scores = [];
          }

          users[userIndex].scores.push(finalStats);
          localStorage.setItem("users", JSON.stringify(users));
        }
      }
    } catch (err) {
      console.error("점수 저장 중 오류:", err);
    }

    // 결과 팝업 표시
    setShowResult(true);
  };

  const renderText = () => {
    const content =
      typeof currentSentence === "object"
        ? currentSentence.content
        : currentSentence;
    const author =
      typeof currentSentence === "object" ? currentSentence.author : null;

    return (
      <>
        {content.split("").map((char, index) => {
          let color = "#666";
          if (index < userInput.length) {
            color = userInput[index] === char ? "#4CAF50" : "#ff4444";
          }
          return (
            <span key={index} style={{ color }}>
              {char}
            </span>
          );
        })}
        {author && (
          <div style={{ color: "#666", marginTop: "0.5rem", fontSize: "1rem" }}>
            - {author}
          </div>
        )}
        <div style={{ color: "#666", marginTop: "0.5rem", fontSize: "0.9rem" }}>
          ※ 작가 이름은 입력하지 않으셔도 됩니다.
        </div>
      </>
    );
  };

  // 게임 상태 초기화 함수 (상단 탭에서 진입 시 호출)
  const resetGame = () => {
    setSelectedLanguage(null);
    setSelectedDifficulty("");
    setCurrentSentence("");
    setUserInput("");
    setIsGameActive(false);
    setIsLoading(false);
    setScores([]);
    setBestScore(0);
    setShowResult(false);
    setGameStats({
      correctWords: 0,
      totalTime: 0,
      averageAccuracy: 100,
      typingSpeed: 0,
      totalKeystrokes: 0,
      correctKeystrokes: 0,
      elapsedTime: 0,
      completedSentences: 0,
      totalAccuracy: 0,
      totalInputs: 0,
      totalCorrectChars: 0,
      totalChars: 0,
      totalDecomposedInput: "",
      totalDecomposedTarget: "",
      totalCorrectJamo: 0,
      totalJamo: 0,
    });
    setRemainingSentences([]);
  };

  const restartGame = () => {
    resetGame();
    setSelectedLanguage(null);
    setSelectedDifficulty("");
  };

  return (
    <Container>
      <Title>랜덤 명언 타자 게임</Title>
      {error && (
        <ErrorPopup>
          <ErrorContent>
            <ErrorTitle>오류 발생</ErrorTitle>
            <ErrorMessage>{error}</ErrorMessage>
            <ErrorButton onClick={() => setError(null)}>확인</ErrorButton>
          </ErrorContent>
        </ErrorPopup>
      )}
      {_isLoading && (
        <LoadingOverlay>
          <LoadingSpinner />
          <LoadingText>
            {selectedLanguage === "ko"
              ? "명언을 받아오고 번역하는 중입니다."
              : "명언을 받아오는 중입니다."}
            <br />
            잠시만 기다려주세요.
          </LoadingText>
        </LoadingOverlay>
      )}

      {!isGameActive && (
        <>
          <LanguageSelector>
            <LanguageButton
              active={selectedLanguage === "ko"}
              onClick={() => setSelectedLanguage("ko")}
            >
              한글 타자
            </LanguageButton>
            <LanguageButton
              active={selectedLanguage === "en"}
              onClick={() => setSelectedLanguage("en")}
            >
              영어 타자
            </LanguageButton>
          </LanguageSelector>

          <DifficultySelector>
            <DifficultyButton
              active={selectedDifficulty === "easy"}
              onClick={() => setSelectedDifficulty("easy")}
            >
              쉬움
            </DifficultyButton>
            <DifficultyButton
              active={selectedDifficulty === "hard"}
              onClick={() => setSelectedDifficulty("hard")}
            >
              어려움
            </DifficultyButton>
          </DifficultySelector>

          {selectedLanguage && selectedDifficulty && (
            <StartButton onClick={startGame} active={true}>
              게임 시작
            </StartButton>
          )}
        </>
      )}

      {isGameActive && (
        <>
          <Timer>경과 시간: {formatElapsedTime(gameStats.elapsedTime)}</Timer>
          <GameContainer>
            <TextDisplay>{renderText()}</TextDisplay>
            <Input
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="여기에 입력하세요..."
              disabled={!isGameActive}
            />
            <NoticeText>
              ※ 정확도는 게임 결과에서 확인할 수 있습니다.
            </NoticeText>
          </GameContainer>

          <StatsContainer>
            <StatItem>
              <StatLabel>타수</StatLabel>
              <StatValue>{gameStats.typingSpeed}타/분</StatValue>
            </StatItem>
            <StatItem>
              <StatLabel>진행도</StatLabel>
              <StatValue>{gameStats.completedSentences}/10</StatValue>
            </StatItem>
          </StatsContainer>
        </>
      )}

      {showResult && (
        <ResultModal>
          <ResultContent>
            <ResultTitle>게임 결과</ResultTitle>
            <ResultStats>
              <ResultStatItem>
                <ResultStatLabel>평균 타수</ResultStatLabel>
                <ResultStatValue>{gameStats.typingSpeed}타/분</ResultStatValue>
              </ResultStatItem>
              <ResultStatItem>
                <ResultStatLabel>정확도</ResultStatLabel>
                <ResultStatValue>
                  {Math.round(gameStats.averageAccuracy)}%
                </ResultStatValue>
              </ResultStatItem>
              <ResultStatItem>
                <ResultStatLabel>걸린 시간</ResultStatLabel>
                <ResultStatValue>
                  {formatElapsedTime(gameStats.elapsedTime)}
                </ResultStatValue>
              </ResultStatItem>
            </ResultStats>
            <ResultButtons>
              <ResultButton onClick={restartGame}>다시 하기</ResultButton>
              <ResultButton onClick={() => navigate("/mypage")}>
                마이페이지
              </ResultButton>
            </ResultButtons>
          </ResultContent>
        </ResultModal>
      )}
    </Container>
  );
};

export default TypingGame;
