import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Container = styled.div`
  max-width: 800px;
  margin: 2rem auto;
  padding: 2rem;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const MyPageTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  color: #333;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 10px;
  text-align: center;
`;

const StatLabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.5rem;
`;

const StatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #333;
`;

const ScoreList = styled.div`
  margin-top: 2rem;
`;

const ScoreHeader = styled.div`
  padding: 1rem;
  border-bottom: 2px solid #eee;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
  font-weight: bold;
  background: #f8f9fa;
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const ScoreItem = styled.div`
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }
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

const DifficultySelector = styled(LanguageSelector)`
  margin-bottom: 1rem;
`;

const ChartContainer = styled.div`
  margin-top: 2rem;
  height: 300px;
`;

const MyPage = () => {
  const [userStats, setUserStats] = useState({
    koStats: {
      easy: {
        averageAccuracy: 0,
        averageSpeed: 0,
        totalGames: 0,
        scores: [],
      },
      hard: {
        averageAccuracy: 0,
        averageSpeed: 0,
        totalGames: 0,
        scores: [],
      },
    },
    enStats: {
      easy: {
        averageAccuracy: 0,
        averageSpeed: 0,
        totalGames: 0,
        scores: [],
      },
      hard: {
        averageAccuracy: 0,
        averageSpeed: 0,
        totalGames: 0,
        scores: [],
      },
    },
  });

  const [selectedLanguage, setSelectedLanguage] = useState("ko");
  const [selectedDifficulty, setSelectedDifficulty] = useState("easy");

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (currentUser) {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const user = users.find((u) => u.username === currentUser.username);

      if (user && Array.isArray(user.scores)) {
        const scores = user.scores;

        // 한글/영어 타자 기록 분리
        const koScores = scores.filter((score) => score.language === "ko");
        const enScores = scores.filter((score) => score.language === "en");

        // 한글 타자 통계 (난이도별)
        const koEasyScores = koScores.filter(
          (score) => score.difficulty === "easy"
        );
        const koHardScores = koScores.filter(
          (score) => score.difficulty === "hard"
        );

        // 영어 타자 통계 (난이도별)
        const enEasyScores = enScores.filter(
          (score) => score.difficulty === "easy"
        );
        const enHardScores = enScores.filter(
          (score) => score.difficulty === "hard"
        );

        setUserStats({
          koStats: {
            easy: calculateStats(koEasyScores),
            hard: calculateStats(koHardScores),
          },
          enStats: {
            easy: calculateStats(enEasyScores),
            hard: calculateStats(enHardScores),
          },
        });
      }
    }
  }, []);

  const calculateStats = (scores) => {
    if (scores.length === 0) {
      return {
        averageAccuracy: 0,
        averageSpeed: 0,
        totalGames: 0,
        scores: [],
      };
    }

    const averageAccuracy = Math.round(
      scores.reduce((acc, curr) => acc + curr.accuracy, 0) / scores.length
    );
    const averageSpeed = Math.round(
      scores.reduce((acc, curr) => acc + curr.typingSpeed, 0) / scores.length
    );

    return {
      averageAccuracy,
      averageSpeed,
      totalGames: scores.length,
      scores: scores.sort((a, b) => new Date(b.date) - new Date(a.date)),
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  const formatElapsedTime = (seconds) => {
    if (!seconds || isNaN(seconds) || seconds < 0) return "-";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}분 ${remainingSeconds}초`;
  };

  const currentStats =
    userStats[selectedLanguage === "ko" ? "koStats" : "enStats"][
      selectedDifficulty
    ];

  const chartData = {
    labels: currentStats.scores
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((score) => formatDate(score.date)),
    datasets: [
      {
        label: "타수 (타/분)",
        data: currentStats.scores
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((score) => score.typingSpeed),
        borderColor: "#4CAF50",
        tension: 0.1,
      },
      {
        label: "정확도 (%)",
        data: currentStats.scores
          .sort((a, b) => new Date(a.date) - new Date(b.date))
          .map((score) => score.accuracy),
        borderColor: "#2196F3",
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    interaction: {
      mode: "index",
      intersect: false,
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  };

  return (
    <Container>
      <MyPageTitle>마이페이지</MyPageTitle>

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
      </DifficultySelector>

      <StatsGrid>
        <StatCard>
          <StatLabel>평균 정확도</StatLabel>
          <StatValue>{currentStats.averageAccuracy}%</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>평균 타수</StatLabel>
          <StatValue>{currentStats.averageSpeed}타/분</StatValue>
        </StatCard>
        <StatCard>
          <StatLabel>게임 수</StatLabel>
          <StatValue>{currentStats.totalGames}회</StatValue>
        </StatCard>
      </StatsGrid>

      {currentStats.scores.length > 0 && (
        <>
          <ScoreList>
            <ScoreHeader>
              <div>순서</div>
              <div>날짜</div>
              <div>정확도</div>
              <div>타수</div>
              <div>걸린 시간</div>
            </ScoreHeader>
            {currentStats.scores.map((score, index) => (
              <ScoreItem key={index}>
                <div>{index + 1}</div>
                <div>{formatDate(score.date)}</div>
                <div>{score.accuracy}%</div>
                <div>{score.typingSpeed}타/분</div>
                <div>{formatElapsedTime(score.elapsedTime)}</div>
              </ScoreItem>
            ))}
          </ScoreList>

          <ChartContainer>
            <Line data={chartData} options={chartOptions} />
          </ChartContainer>
        </>
      )}
    </Container>
  );
};

export default MyPage;
