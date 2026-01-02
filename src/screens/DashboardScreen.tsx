import React, { useEffect, useState } from 'react';
import { Container, ProfitHighlight, HistoryContainer, Title, Text, QuickCards, QuickCard, QuickCardTitle, QuickCardValue } from './DashboardScreen.styled';
import WorkDayService from '../services/WorkDayService';
import Button from '../components/Button';
import { CurrentDayState, getCurrentDay, getLastEndedDayId } from '../storage/DayState';
import { useFocusEffect } from '@react-navigation/native';
import HistoryList from '../components/HistoryList';

interface DashboardScreenProps {
  navigation: any;
  route: { params?: { workDay: any } };
}

interface WorkDayDetail {
  id: number;
  startKm: number;
  endKm: number | null;
  startTime: string;
  endTime: string | null;
  totalEarning: number | null;
  totalExpenses: number;
  kmTravelled: number | null;
  hoursWorked: number | null;
  netProfit: number | null;
  expenses: { id: number; type: string; amount: number }[];
  rides: { id: number; earning: number; distanceKm: number; durationMinutes: number }[];
}

const DashboardScreen: React.FC<DashboardScreenProps> = ({ navigation }) => {
  const [currentDay, setCurrentDay] = useState<CurrentDayState | null>(null);
  const [detail, setDetail] = useState<WorkDayDetail | null>(null);
  const [dashboard, setDashboard] = useState<{ todayProfit: number; history: { id: number; date: string; netProfit: number }[] } | null>(null);
  const [lastEndedId, setLastEndedId] = useState<number | null>(null);
  const [lastEndedDetail, setLastEndedDetail] = useState<WorkDayDetail | null>(null);

  const fetchCurrentDay = async () => {
    const day = await getCurrentDay();
    setCurrentDay(day);
    if (day) {
      try {
        const d = await WorkDayService.getWorkDayDetail(day.id);
        setDetail(d);
      } catch (error) {
        setDetail(null);
      }
    } else {
      setDetail(null);
    }
    try {
      const d = await WorkDayService.getDashboard();
      setDashboard(d);
    } catch {
      setDashboard(null);
    }
    try {
      const lid = await getLastEndedDayId();
      setLastEndedId(lid);
    } catch {}
  };

  useEffect(() => {
    fetchCurrentDay();
  }, []);
  useFocusEffect(
    React.useCallback(() => {
      fetchCurrentDay();
    }, [])
  );
  useEffect(() => {
    if (lastEndedId) {
      (async () => {
        try {
          const d = await WorkDayService.getWorkDayDetail(lastEndedId);
          setLastEndedDetail(d);
        } catch {
          setLastEndedDetail(null);
        }
      })();
    } else {
      setLastEndedDetail(null);
    }
  }, [lastEndedId]);
  useEffect(() => {
    if (!currentDay && lastEndedDetail) {
      const t = setTimeout(() => {
        navigation.navigate('StartDay');
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [currentDay, lastEndedDetail, navigation]);

  return (
    <Container>
      {!currentDay && (
        <>
          <Text>Dia não iniciado</Text>
          <Button title="Iniciar dia" onPress={() => navigation.navigate('StartDay')} />
        </>
      )}
      {!currentDay && lastEndedDetail && (
        <>
          <HistoryContainer>
            <Text>Último dia encerrado</Text>
            <Text style={{ color: Number(lastEndedDetail.netProfit ?? 0) < 0 ? '#f44336' : '#4caf50' }}>
              Lucro líquido: R$ {Number(lastEndedDetail.netProfit ?? 0).toFixed(2)}
            </Text>
            <Text>Horas trabalhadas: {Number(lastEndedDetail.hoursWorked ?? 0).toFixed(1)} h</Text>
            <Text>KM rodados: {Number(lastEndedDetail.kmTravelled ?? 0).toFixed(1)}</Text>
            <Button title="Ver cálculos completos" onPress={() => navigation.navigate('WorkDayDetail', { workDay: { id: lastEndedDetail.id, date: new Date(lastEndedDetail.startTime).toISOString().slice(0, 10), netProfit: Number(lastEndedDetail.netProfit ?? 0) } })} />
          </HistoryContainer>
        </>
      )}
      {currentDay && !detail && (
        <>
          <HistoryContainer>
            <Text>Resumo do dia</Text>
            <Text>
              Tempo trabalhado: {(((new Date().getTime() - new Date(currentDay.startTime).getTime()) / (1000 * 60 * 60))).toFixed(1)} h
            </Text>
            <Text>KM rodados: 0.0</Text>
            <Text>Gastos acumulados: R$ 0.00</Text>
          </HistoryContainer>
          <HistoryContainer>
            <Button title="Adicionar gasto" onPress={() => navigation.navigate('Expense', { workDayId: currentDay.id })} />
            <Button title="Encerrar dia" onPress={() => navigation.navigate('EndDay', { workDayId: currentDay.id })} />
            <Button title="Ver relatórios" onPress={() => navigation.navigate('Reports')} />
          </HistoryContainer>
        </>
      )}
      {currentDay && detail && (
        <>
          <ProfitHighlight negative={((detail.rides.reduce((s, r) => s + r.earning, 0) || 0) - (detail.totalExpenses || 0)) < 0}>
            <Title>Lucro parcial</Title>
            <Title>
              R$ {((detail.rides.reduce((s, r) => s + r.earning, 0) || 0) - (detail.totalExpenses || 0)).toFixed(2)}
            </Title>
          </ProfitHighlight>
          <HistoryContainer>
            <Text>Resumo do dia</Text>
            <Text>
              Tempo trabalhado: {(((new Date().getTime() - new Date(currentDay.startTime).getTime()) / (1000 * 60 * 60))).toFixed(1)} h
            </Text>
            <Text>
              KM rodados: {(detail.rides.reduce((s, r) => s + r.distanceKm, 0) || 0).toFixed(1)}
            </Text>
            <Text>
              Gastos acumulados: R$ {(detail.totalExpenses || 0).toFixed(2)}
            </Text>
            <Text>
              Faturamento bruto: R$ {(detail.rides.reduce((s, r) => s + r.earning, 0) || 0).toFixed(2)}
            </Text>
            <QuickCards>
              <QuickCard>
                <QuickCardTitle>Ganho por hora</QuickCardTitle>
                <QuickCardValue>
                  {(() => {
                    const earning = detail.rides.reduce((s, r) => s + r.earning, 0) || 0;
                    const hours = ((new Date().getTime() - new Date(currentDay.startTime).getTime()) / (1000 * 60 * 60));
                    const v = hours > 0 ? earning / hours : 0;
                    return `R$ ${v.toFixed(2)}`;
                  })()}
                </QuickCardValue>
              </QuickCard>
              <QuickCard>
                <QuickCardTitle>Ganho por KM</QuickCardTitle>
                <QuickCardValue>
                  {(() => {
                    const earning = detail.rides.reduce((s, r) => s + r.earning, 0) || 0;
                    const kms = detail.rides.reduce((s, r) => s + r.distanceKm, 0) || 0;
                    const v = kms > 0 ? earning / kms : 0;
                    return `R$ ${v.toFixed(2)}`;
                  })()}
                </QuickCardValue>
              </QuickCard>
            </QuickCards>
          </HistoryContainer>
          <HistoryContainer>
            <Button title="Adicionar gasto" onPress={() => navigation.navigate('Expense', { workDayId: currentDay.id })} />
            <Button title="Encerrar dia" onPress={() => navigation.navigate('EndDay', { workDayId: currentDay.id })} />
            <Button title="Ver relatórios" onPress={() => navigation.navigate('Reports')} />
          </HistoryContainer>
        </>
      )}
      {!currentDay && dashboard && (
        <>
          <HistoryContainer>
            <Text>Histórico resumido</Text>
            <HistoryList
              data={dashboard.history.slice(0, 5).map((h) => ({ id: h.id, date: h.date, netProfit: h.netProfit }))}
              onPressItem={(item) => navigation.navigate('WorkDayDetail', { workDay: item })}
            />
          </HistoryContainer>
        </>
      )}
    </Container>
  );
};

export default DashboardScreen;
