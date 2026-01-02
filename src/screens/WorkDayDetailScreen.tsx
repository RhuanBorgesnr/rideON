import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import {
  Container,
  Content,
  Title,
  SectionTitle,
  Row,
  Label,
  Value,
  HeaderHighlight,
  HeaderValue,
  SectionCard,
  Divider
} from './WorkDayDetailScreen.styled';
import WorkDayService from '../services/WorkDayService';
import InputField from '../components/InputField';
import Button from '../components/Button';

interface WorkDayItem {
  id: number;
  date: string;
  netProfit: number;
}

interface Props {
  route: { params: { workDay: WorkDayItem } };
  navigation: any;
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

const WorkDayDetailScreen: React.FC<Props> = ({ route }) => {
  const { workDay } = route.params;
  const [detail, setDetail] = useState<WorkDayDetail | null>(null);
  const [expenseType, setExpenseType] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [rideEarning, setRideEarning] = useState('');
  const [rideDistance, setRideDistance] = useState('');
  const [rideDuration, setRideDuration] = useState('');

  useEffect(() => {
    (async () => {
      const d = await WorkDayService.getWorkDayDetail(workDay.id);
      setDetail(d);
    })();
  }, [workDay.id]);

  const refreshDetail = async () => {
    const d = await WorkDayService.getWorkDayDetail(workDay.id);
    setDetail(d);
  };

  const onAddExpense = async () => {
    if (!expenseType || !expenseAmount) {
      Alert.alert('Preencha o tipo e o valor da despesa');
      return;
    }
    try {
      await WorkDayService.addExpense(workDay.id, expenseType, Number(expenseAmount));
      setExpenseType('');
      setExpenseAmount('');
      await refreshDetail();
    } catch {
      Alert.alert('Erro ao adicionar despesa');
    }
  };

  const onAddRide = async () => {
    if (!rideEarning || !rideDistance || !rideDuration) {
      Alert.alert('Preencha ganho, distância e duração');
      return;
    }
    try {
      await WorkDayService.addRide({
        workDayId: workDay.id,
        earning: Number(rideEarning),
        distanceKm: Number(rideDistance),
        durationMinutes: Number(rideDuration),
      });
      setRideEarning('');
      setRideDistance('');
      setRideDuration('');
      await refreshDetail();
    } catch {
      Alert.alert('Erro ao adicionar corrida');
    }
  };

  return (
    <Container>
      <Content>
        <Title>Dia de Trabalho #{workDay.id}</Title>

        {detail && (
          <>
            <HeaderHighlight negative={(detail.netProfit ?? 0) < 0}>
              <HeaderValue>
                R$ {(detail.netProfit ?? 0).toFixed(2)}
              </HeaderValue>
            </HeaderHighlight>

            <SectionCard>
              <SectionTitle>Resumo</SectionTitle>
              <Row><Label>Km Inicial</Label><Value>{detail.startKm}</Value></Row>
              <Row><Label>Km Final</Label><Value>{detail.endKm ?? '-'}</Value></Row>
              <Row><Label>Km Percorridos</Label><Value>{detail.kmTravelled ?? '-'}</Value></Row>
              <Row>
                <Label>Ganhos Totais</Label>
                <Value>R$ {(detail.totalEarning ?? 0).toFixed(2)}</Value>
              </Row>
              <Row>
                <Label>Despesas Totais</Label>
                <Value>R$ {Number(detail.totalExpenses).toFixed(2)}</Value>
              </Row>
              <Row>
                <Label>Lucro Líquido</Label>
                <Value>R$ {(detail.netProfit ?? 0).toFixed(2)}</Value>
              </Row>
            </SectionCard>

            <SectionCard>
              <SectionTitle>Despesas</SectionTitle>
              {detail.expenses.map((e) => (
                <Row key={`exp-${e.id}`}>
                  <Label>{e.type}</Label>
                  <Value>R$ {Number(e.amount).toFixed(2)}</Value>
                </Row>
              ))}
              <Divider />
              <InputField
                placeholder="Tipo da despesa"
                value={expenseType}
                onChangeText={setExpenseType}
              />
              <InputField
                placeholder="Valor da despesa"
                value={expenseAmount}
                onChangeText={setExpenseAmount}
                keyboardType="decimal-pad"
              />
              <Button title="Adicionar despesa" onPress={onAddExpense} />
            </SectionCard>

            <SectionCard>
              <SectionTitle>Corridas</SectionTitle>
              {detail.rides.map((r) => (
                <Row key={`ride-${r.id}`}>
                  <Label>{r.distanceKm} km / {r.durationMinutes} min</Label>
                  <Value>R$ {Number(r.earning).toFixed(2)}</Value>
                </Row>
              ))}
              <Divider />
              <InputField
                placeholder="Ganho da corrida"
                value={rideEarning}
                onChangeText={setRideEarning}
                keyboardType="decimal-pad"
              />
              <InputField
                placeholder="Distância (km)"
                value={rideDistance}
                onChangeText={setRideDistance}
                keyboardType="decimal-pad"
              />
              <InputField
                placeholder="Duração (minutos)"
                value={rideDuration}
                onChangeText={setRideDuration}
                keyboardType="numeric"
              />
              <Button title="Adicionar corrida" onPress={onAddRide} />
            </SectionCard>
          </>
        )}
      </Content>
    </Container>
  );
};

export default WorkDayDetailScreen;
