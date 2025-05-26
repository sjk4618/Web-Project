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

const Ranking = () => {
  const [rankings, setRankings] = useState({
    ko: {
      easy: [],
      hard: [],
    },
    en: {
      easy: [],
      hard: [],
    },
  });
  const [selectedLanguage, setSelectedLanguage] = useState("ko");
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");

  useEffect(() => {
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    const allScores = {
      ko: {
        easy: [],
        hard: [],
      },
      en: {
        easy: [],
        hard: [],
      },
    };

    users.forEach((user) => {
      if (user.scores && user.scores.length > 0) {
        user.scores.forEach((score) => {
          const scoreData = {
            username: user.username,
            date: score.date,
            accuracy: score.accuracy,
            typingSpeed: score.typingSpeed,
            elapsedTime: score.elapsedTime,
            difficulty: score.difficulty,
          };

          if (score.language === "ko") {
            allScores.ko[score.difficulty].push(scoreData);
          } else {
            allScores.en[score.difficulty].push(scoreData);
          }
        });
      }
    });

    // 각 언어별, 난이도별로 타수 기준 내림차순 정렬
    setRankings({
      ko: {
        easy: allScores.ko.easy.sort((a, b) => b.typingSpeed - a.typingSpeed),
        hard: allScores.ko.hard.sort((a, b) => b.typingSpeed - a.typingSpeed),
      },
      en: {
        easy: allScores.en.easy.sort((a, b) => b.typingSpeed - a.typingSpeed),
        hard: allScores.en.hard.sort((a, b) => b.typingSpeed - a.typingSpeed),
      },
    });
  }, []);

  const formatElapsedTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}분 ${remainingSeconds}초`;
  };

  return (
    <Container>
      <Title>랭킹</Title>

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

      <LanguageSelector>
        <LanguageButton
          active={selectedDifficulty === "easy"}
          onClick={() => setSelectedDifficulty("easy")}
        >
          쉬움
        </LanguageButton>
        <LanguageButton
          active={selectedDifficulty === "hard"}
          onClick={() => setSelectedDifficulty("hard")}
        >
          어려움
        </LanguageButton>
      </LanguageSelector>

      <RankingList>
        <RankingHeader>
          <div>순위</div>
          <div>사용자</div>
          <div>정확도</div>
          <div>타수</div>
          <div>걸린 시간</div>
        </RankingHeader>
        {rankings[selectedLanguage][selectedDifficulty].map((score, index) => (
          <RankingItem
            key={index}
            className={
              index === 0
                ? "top-1"
                : index === 1
                ? "top-2"
                : index === 2
                ? "top-3"
                : ""
            }
          >
            <RankNumber>{index + 1}</RankNumber>
            <Username>{score.username}</Username>
            <Accuracy>{score.accuracy ?? 0}%</Accuracy>
            <TypingSpeed>
              {score.typingSpeed ? `${score.typingSpeed}타/분` : "-"}
            </TypingSpeed>
            <Time>{formatElapsedTime(score.elapsedTime)}</Time>
          </RankingItem>
        ))}
      </RankingList>
    </Container>
  );
};

export default Ranking;
