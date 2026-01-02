import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Container } from './StartDayScreen.styled';
import { View, Text, TouchableOpacity } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import WorkDayService from '../services/WorkDayService';
import { setCurrentDay, setCurrentDayMeta, getCurrentDay } from '../storage/DayState';

interface StartDayScreenProps {
  navigation: any;
}

const StartDayScreen: React.FC<StartDayScreenProps> = ({ navigation }) => {
  const [startKm, setStartKm] = useState<string>('');
  const [startTime, setStartTime] = useState<string>(new Date().toISOString());
  const [uber, setUber] = useState<boolean>(false);
  const [nineNine, setNineNine] = useState<boolean>(false);
  const [inDrive, setInDrive] = useState<boolean>(false);

  const handleStartDay = async () => {
    if (!startKm) {
      Alert.alert('Validação', 'Informe o KM inicial');
      return;
    }
    try {
      const existing = await getCurrentDay();
      if (existing) {
        Alert.alert('Regra', 'Você já iniciou um dia. Finalize antes de iniciar outro.');
        return;
      }
      const response = await WorkDayService.startWorkDay(Number(startKm));
      await setCurrentDay({ id: response.id, startKm: response.startKm, startTime: response.startTime });
      const platforms: ('Uber' | '99' | 'InDrive')[] = [];
      if (uber) platforms.push('Uber');
      if (nineNine) platforms.push('99');
      if (inDrive) platforms.push('InDrive');
      await setCurrentDayMeta({ id: response.id, platforms });
      navigation.navigate('Dashboard', { workDay: response });
    } catch (error) {
      console.log(error)
      Alert.alert('Erro', 'Falha ao iniciar o dia');
    }
  };

  return (
    <Container>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>Hora de início</Text>
        <InputField
          placeholder="ISO datetime"
          value={startTime}
          onChangeText={setStartTime}
        />
      </View>
      <InputField
        placeholder="Informe o KM inicial"
        keyboardType="numeric"
        value={startKm}
        onChangeText={setStartKm}
      />
      <View style={{ marginTop: 16, marginBottom: 16 }}>
        <Text style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>Plataformas</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={() => setUber((v) => !v)} style={{ padding: 10, borderWidth: 1, borderColor: uber ? '#4caf50' : '#ccc', borderRadius: 8, marginRight: 8 }}>
            <Text style={{ color: uber ? '#4caf50' : '#333' }}>Uber {uber ? '✓' : ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setNineNine((v) => !v)} style={{ padding: 10, borderWidth: 1, borderColor: nineNine ? '#4caf50' : '#ccc', borderRadius: 8, marginRight: 8 }}>
            <Text style={{ color: nineNine ? '#4caf50' : '#333' }}>99 {nineNine ? '✓' : ''}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setInDrive((v) => !v)} style={{ padding: 10, borderWidth: 1, borderColor: inDrive ? '#4caf50' : '#ccc', borderRadius: 8 }}>
            <Text style={{ color: inDrive ? '#4caf50' : '#333' }}>InDrive {inDrive ? '✓' : ''}</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Button title="Iniciar dia" onPress={handleStartDay} />
    </Container>
  );
};

export default StartDayScreen;
