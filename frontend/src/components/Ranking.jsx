import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const LanguageSelector = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const LanguageButton = styled.button`
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => (props.active ? "#4CAF50" : "#ddd")};
  color: ${(props) => (props.active ? "white" : "#333")};
  cursor: pointer;
  font-size: 1rem;

  &:hover {
    background-color: ${(props) => (props.active ? "#45a049" : "#ccc")};
  }
`;

const DifficultySelector = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
`;

const DifficultyButton = styled(LanguageButton)``;

const ScoreExplanation = styled.div`
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 2rem;
  font-size: 0.9rem;
  color: #666;
  line-height: 1.5;
`;

const RankingList = styled.div`
  margin-top: 2rem;
`;

const RankingItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: grid;
  grid-template-columns: 0.5fr 2fr 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  &.top-1 {
    background: linear-gradient(to right, #ffd700, #fff8e1);
  }

  &.top-2 {
    background: linear-gradient(to right, #c0c0c0, #f5f5f5);
  }

  &.top-3 {
    background: linear-gradient(to right, #cd7f32, #ffe4c4);
  }
`;

const RankingHeader = styled(RankingItem)`
  font-weight: bold;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const RankNumber = styled.div`
  font-weight: bold;
  color: #666;
  text-align: center;
`;

const Username = styled.div`
  font-weight: bold;
  color: #333;
`;

const Score = styled.div`
  color: #2196f3;
  font-weight: bold;
`;

const Accuracy = styled.div`
  color: #4caf50;
`;

const TypingSpeed = styled.div`
  color: #ff9800;
`;

const Time = styled.div`
  color: #9c27b0;
`;

const Difficulty = styled.div`
  color: #666;
`;

const Ranking = () => {
  const [rankings, setRankings] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("ko");
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const allScores = users.flatMap((user) =>
      (user.scores || []).map((score) => ({
        ...score,
        username: user.username,
      }))
    );

    // 총점 계산: 타수 + 정확도 - 시간(초)
    const scoresWithTotal = allScores.map((score) => ({
      ...score,
      totalScore: score.typingSpeed + score.accuracy - score.elapsedTime,
    }));

    // 선택된 언어와 난이도에 따라 필터링
    const filteredScores = scoresWithTotal.filter(
      (score) =>
        score.language === selectedLanguage &&
        score.difficulty === selectedDifficulty
    );

    // 총점 기준으로 정렬
    const sortedScores = filteredScores.sort(
      (a, b) => b.totalScore - a.totalScore
    );
    setRankings(sortedScores);
  }, [selectedLanguage, selectedDifficulty]);

  const formatElapsedTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <Container>
      <Title>랭킹</Title>

      <ScoreExplanation>
        <h3>총점 계산 방법</h3>
        <p>총점 = 타수 + 정확도 - 걸린 시간(초)</p>
        <p>예시: 타수 300타/분, 정확도 95%, 걸린 시간 120초인 경우</p>
        <p>총점 = 300 + 95 - 120 = 275점</p>
      </ScoreExplanation>

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

      <RankingList>
        <RankingHeader>
          <div>순위</div>
          <div>사용자</div>
          <div>총점</div>
          <div>타수</div>
          <div>정확도</div>
          <div>걸린 시간</div>
          <div>날짜</div>
        </RankingHeader>
        {rankings.map((score, index) => (
          <RankingItem key={index}>
            <div>{index + 1}</div>
            <div>{score.username}</div>
            <div>{Math.round(score.totalScore)}점</div>
            <div>{score.typingSpeed}타/분</div>
            <div>{score.accuracy}%</div>
            <div>{formatElapsedTime(score.elapsedTime)}</div>
            <div>{formatDate(score.date)}</div>
          </RankingItem>
        ))}
      </RankingList>
    </Container>
  );
};

export default Ranking;
