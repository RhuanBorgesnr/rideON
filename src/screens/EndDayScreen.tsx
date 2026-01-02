import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Container } from './EndDayScreen.styled';
import InputField from '../components/InputField';
import Button from '../components/Button';
import WorkDayService from '../services/WorkDayService';
import { clearCurrentDay, setLastEndedDayId, getCurrentDay } from '../storage/DayState';

interface EndDayScreenProps {
  navigation: any;
  route: { params: { workDayId: number } };
}

const EndDayScreen: React.FC<EndDayScreenProps> = ({ navigation, route }) => {
  const { workDayId } = route.params;
  const [endKm, setEndKm] = useState<string>('');
  const [uberEarning, setUberEarning] = useState<string>('');
  const [ninetyNineEarning, setNinetyNineEarning] = useState<string>('');
  const [inDriveEarning, setInDriveEarning] = useState<string>('');

  const handleEndDay = async () => {
    const current = await getCurrentDay();
    if (!current) {
      Alert.alert('Regra', 'Nenhum dia em andamento para encerrar.');
      return;
    }
    if (!endKm) {
      Alert.alert('Validação', 'Informe o KM final');
      return;
    }
    if (Number(endKm) <= Number(current.startKm)) {
      Alert.alert('Validação', 'KM final deve ser maior que o inicial');
      return;
    }
    const sum =
      (Number(uberEarning) || 0) +
      (Number(ninetyNineEarning) || 0) +
      (Number(inDriveEarning) || 0);
    if (sum < 0) {
      Alert.alert('Validação', 'Ganhos totais não podem ser negativos');
      return;
    }
    try {
      const response = await WorkDayService.endWorkDay(workDayId, Number(endKm), sum);
      await clearCurrentDay();
      await setLastEndedDayId(response.id);
      navigation.navigate('Dashboard', { lastEndedId: response.id });
    } catch (error) {
      Alert.alert('Erro', 'Falha ao finalizar o dia');
    }
  };

  return (
    <Container>
      <InputField
        placeholder="Informe o KM final"
        keyboardType="numeric"
        value={endKm}
        onChangeText={setEndKm}
      />
      <InputField
        placeholder="Uber (R$)"
        keyboardType="numeric"
        value={uberEarning}
        onChangeText={setUberEarning}
      />
      <InputField
        placeholder="99 (R$)"
        keyboardType="numeric"
        value={ninetyNineEarning}
        onChangeText={setNinetyNineEarning}
      />
      <InputField
        placeholder="InDrive (R$)"
        keyboardType="numeric"
        value={inDriveEarning}
        onChangeText={setInDriveEarning}
      />
      <Button title="Finalizar dia" onPress={handleEndDay} />
    </Container>
  );
};

export default EndDayScreen;
