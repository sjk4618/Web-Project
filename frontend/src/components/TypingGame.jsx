import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Container = styled.div`
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const Title = styled.h1`
  font-size: 2.5rem;
  margin-bottom: 2rem;
  text-align: center;
  font-weight: 700;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const LanguageSelector = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const LanguageButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  background: ${(props) =>
    props.active
      ? "linear-gradient(45deg, #3498db, #2980b9)"
      : "rgba(255, 255, 255, 0.9)"};
  color: ${(props) => (props.active ? "white" : "#2c3e50")};
  cursor: pointer;
  margin: 0 0.5rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
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
  color: #7f8c8d;
  font-size: 1.1rem;
  font-weight: 500;
`;

const StartButton = styled(LanguageButton)`
  display: block;
  margin: 1.5rem auto;
  padding: 1rem 2.5rem;
  font-size: 1.2rem;
  background: ${(props) =>
    props.disabled
      ? "rgba(189, 195, 199, 0.9)"
      : props.active
      ? "linear-gradient(45deg, #3498db, #2980b9)"
      : "rgba(255, 255, 255, 0.9)"};
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  opacity: ${(props) => (props.disabled ? 0.7 : 1)};
  transition: all 0.3s ease;

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-2px)")};
    box-shadow: ${(props) =>
      props.disabled
        ? "0 2px 4px rgba(0, 0, 0, 0.1)"
        : "0 4px 12px rgba(0, 0, 0, 0.15)"};
  }
`;

const GameContainer = styled.div`
  margin-bottom: 2rem;
`;

const TextDisplay = styled.div`
  font-size: 1.3rem;
  line-height: 1.8;
  margin-bottom: 1.5rem;
  padding: 1.5rem;
  background: rgba(248, 249, 250, 0.9);
  border-radius: 15px;
  min-height: 120px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  color: #2c3e50;
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  font-size: 1.2rem;
  border: 2px solid rgba(52, 152, 219, 0.2);
  border-radius: 10px;
  margin-bottom: 1.5rem;
  background: rgba(255, 255, 255, 0.9);
  transition: all 0.3s ease;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
  }
`;

const StatsContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-bottom: 2rem;
  background: rgba(248, 249, 250, 0.9);
  padding: 1.5rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const StatItem = styled.div`
  text-align: center;
  padding: 0 1rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ResultModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ResultContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 2.5rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  min-width: 400px;
  text-align: center;
  backdrop-filter: blur(10px);
`;

const ResultTitle = styled.h2`
  color: #2c3e50;
  margin-bottom: 2rem;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ResultStats = styled.div`
  margin-bottom: 2rem;
  background: rgba(248, 249, 250, 0.9);
  padding: 1.5rem;
  border-radius: 15px;
`;

const ResultStatItem = styled.div`
  margin: 1rem 0;
  color: #2c3e50;
`;

const ResultStatLabel = styled.div`
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #7f8c8d;
  font-weight: 500;
`;

const ResultStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: 700;
  color: #2c3e50;
`;

const ResultButtons = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
`;

const ResultButton = styled(LanguageButton)`
  min-width: 150px;
  padding: 1rem 2rem;
  font-size: 1.1rem;
`;

const LoadingOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(5px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(52, 152, 219, 0.2);
  border-top: 4px solid #3498db;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  margin-bottom: 1.5rem;

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
  font-size: 1.3rem;
  color: #2c3e50;
  text-align: center;
  font-weight: 500;
`;

const NoticeText = styled.div`
  text-align: center;
  color: #7f8c8d;
  font-size: 1rem;
  margin-top: 1.5rem;
  font-weight: 500;
`;

const Timer = styled.div`
  text-align: center;
  font-size: 1.4rem;
  color: #2c3e50;
  margin-bottom: 1.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ErrorPopup = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ErrorContent = styled.div`
  background: rgba(255, 255, 255, 0.95);
  padding: 2rem;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  text-align: center;
  max-width: 400px;
  width: 90%;
  backdrop-filter: blur(10px);
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
  const [currentIndex, setCurrentIndex] = useState(0);
  const [remainingSentences, setRemainingSentences] = useState([]);
  const [currentSentence, setCurrentSentence] = useState("");
  const [userInput, setUserInput] = useState("");
  const [scores, setScores] = useState([]);
  const [bestScore, setBestScore] = useState(0);
  const [gameStats, setGameStats] = useState({
    typingSpeed: 0,
    accuracy: 0,
    completedSentences: 1,
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
  const enterPressedRef = useRef(false);

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

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && isGameActive) {
      // 한글 입력기 중복 방지
      if (enterPressedRef.current) return;
      enterPressedRef.current = true;
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex >= remainingSentences.length) {
        endGame();
      } else {
        setCurrentIndex(nextIndex);
        setCurrentSentence(remainingSentences[nextIndex]);
        setUserInput("");
      }
    }
  };

  const handleKeyUp = (e) => {
    if (e.key === "Enter") {
      enterPressedRef.current = false;
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

      // 문장을 10개로 제한하고 깊은 복사 수행
      const limitedSentences = JSON.parse(
        JSON.stringify(initialSentences.slice(0, 10))
      );
      setRemainingSentences(limitedSentences);
      setCurrentIndex(0);
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
        completedSentences: 1,
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
      completedSentences: 1,
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
              onKeyUp={handleKeyUp}
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
              <StatValue>{currentIndex + 1}/10</StatValue>
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
