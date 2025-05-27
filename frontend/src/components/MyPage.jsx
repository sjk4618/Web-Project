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
  max-width: 1000px;
  margin: 2rem auto;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
`;

const MyPageTitle = styled.h2`
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  padding: 2rem;
  background: rgba(248, 249, 250, 0.9);
  border-radius: 15px;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  }
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #7f8c8d;
  margin-bottom: 0.8rem;
  font-weight: 500;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: #2c3e50;
  background: linear-gradient(45deg, #2c3e50, #3498db);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ScoreList = styled.div`
  margin-top: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
`;

const ScoreHeader = styled.div`
  padding: 1.2rem;
  border-bottom: 2px solid rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
  font-weight: 600;
  background: rgba(52, 152, 219, 0.1);
  color: #2c3e50;
`;

const ScoreItem = styled.div`
  padding: 1.2rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
  gap: 1rem;
  align-items: center;
  transition: all 0.3s ease;

  &:hover {
    background: rgba(52, 152, 219, 0.05);
  }

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
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: 10px;
  background: ${(props) =>
    props.active
      ? "linear-gradient(45deg, #3498db, #2980b9)"
      : "rgba(255, 255, 255, 0.9)"};
  color: ${(props) => (props.active ? "white" : "#2c3e50")};
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const DifficultySelector = styled(LanguageSelector)`
  margin-bottom: 1rem;
`;

const ChartContainer = styled.div`
  margin-top: 2rem;
  padding: 2rem;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  height: 400px;
`;

const ErrorMessage = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-radius: 10px;
  text-align: center;
  font-weight: 500;
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
  const [_error, setError] = useState(null);

  useEffect(() => {
    try {
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
    } catch (err) {
      console.error("사용자 통계 로딩 중 오류 발생:", err);
      setError("사용자 통계를 불러오는 중 오류가 발생했습니다.");
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
      .map((score, index) => `${index + 1}. ${formatDate(score.date)}`),
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
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
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
