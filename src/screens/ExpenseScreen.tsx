import React, { useState } from 'react';
import { Alert } from 'react-native';
import { Container } from './ExpenseScreen.styled';
import { View, Text, TouchableOpacity } from 'react-native';
import InputField from '../components/InputField';
import Button from '../components/Button';
import WorkDayService from '../services/WorkDayService';

interface ExpenseScreenProps {
  navigation: any;
  route: { params: { workDayId: number } };
}

const ExpenseScreen: React.FC<ExpenseScreenProps> = ({ route, navigation }) => {
  const { workDayId } = route.params;
  const [type, setType] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [dateStr, setDateStr] = useState<string>(new Date().toISOString().slice(0, 10));

  const handleAddExpense = async () => {
    if (!type || !amount) {
      Alert.alert('Validação', 'Informe o tipo e o valor da despesa');
      return;
    }
    if (Number(amount) <= 0) {
      Alert.alert('Validação', 'O valor da despesa deve ser maior que zero');
      return;
    }
    try {
      await WorkDayService.addExpense(workDayId, type, Number(amount));
      Alert.alert('Sucesso', 'Despesa adicionada');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Erro', 'Falha ao adicionar despesa');
    }
  };

  return (
    <Container>
      <View style={{ marginBottom: 12 }}>
        <Text style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>Botões rápidos</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {['Combustível', 'Manutenção', 'Lavagem', 'Alimentação', 'Pedágio', 'Outro'].map((label) => (
            <TouchableOpacity
              key={label}
              onPress={() => setType(label)}
              style={{
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: type === label ? '#4caf50' : '#ccc',
                borderRadius: 16,
                marginRight: 8,
                marginBottom: 8
              }}
            >
              <Text style={{ color: type === label ? '#4caf50' : '#333' }}>{label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <InputField
        placeholder="Tipo da despesa"
        value={type}
        onChangeText={setType}
      />
      <InputField
        placeholder="Valor da despesa"
        keyboardType="numeric"
        value={amount}
        onChangeText={setAmount}
      />
      <InputField
        placeholder="Data (YYYY-MM-DD)"
        value={dateStr}
        onChangeText={setDateStr}
      />
      <InputField
        placeholder="Observação (opcional)"
        value={note}
        onChangeText={setNote}
      />
      <Button title="Adicionar despesa" onPress={handleAddExpense} />
    </Container>
  );
};

export default ExpenseScreen;
