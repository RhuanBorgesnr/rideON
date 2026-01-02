import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text } from 'react-native';
import Button from '../components/Button';
import WorkDayService from '../services/WorkDayService';

type AggregatedMetrics = {
  label: string;
  totalEarning: number;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalCosts: number;
  netProfit: number;
  profitPerHour: number | null;
  profitPerKm: number | null;
};

const ReportsScreen: React.FC = () => {
  const [filter, setFilter] = useState<'Hoje' | 'Semana' | 'Mês' | 'Personalizado'>('Hoje');
  const [todayProfit, setTodayProfit] = useState<number>(0);
  const [daily, setDaily] = useState<AggregatedMetrics[]>([]);
  const [weekly, setWeekly] = useState<AggregatedMetrics[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const dash = await WorkDayService.getDashboard();
        setTodayProfit(Number(dash?.todayProfit ?? 0));
      } catch {}
      try {
        const d = await WorkDayService.getRideDaily();
        setDaily(Array.isArray(d) ? d : []);
      } catch {}
      try {
        const w = await WorkDayService.getRideWeekly();
        setWeekly(Array.isArray(w) ? w : []);
      } catch {}
    })();
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff', padding: 16 }}>
      <View style={{ marginBottom: 16 }}>
        <Text style={{ fontSize: 18, color: '#333', marginBottom: 8 }}>Filtros</Text>
        <View style={{ flexDirection: 'row' }}>
          <View style={{ marginRight: 8 }}>
            <Button title="Hoje" onPress={() => setFilter('Hoje')} />
          </View>
          <View style={{ marginRight: 8 }}>
            <Button title="Semana" onPress={() => setFilter('Semana')} />
          </View>
          <View style={{ marginRight: 8 }}>
            <Button title="Mês" onPress={() => setFilter('Mês')} />
          </View>
          <View>
            <Button title="Personalizado" onPress={() => setFilter('Personalizado')} />
          </View>
        </View>
      </View>
      {filter === 'Hoje' && (
        <View>
          <Text style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>Lucro de hoje</Text>
          <Text style={{ fontSize: 22, color: todayProfit < 0 ? '#f44336' : '#4caf50', fontWeight: '700' }}>R$ {todayProfit.toFixed(2)}</Text>
        </View>
      )}
      {filter === 'Semana' && (
        <View>
          <Text style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>Semana</Text>
          {weekly.map((w) => (
            <View key={w.label} style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: '#555' }}>{w.label}</Text>
              <Text style={{ fontSize: 14, color: w.netProfit < 0 ? '#f44336' : '#4caf50' }}>Lucro líquido: R$ {w.netProfit.toFixed(2)}</Text>
              <Text style={{ fontSize: 14, color: '#333' }}>Ganho/hora: {w.profitPerHour !== null ? `R$ ${w.profitPerHour.toFixed(2)}` : '-'}</Text>
              <Text style={{ fontSize: 14, color: '#333' }}>Ganho/km: {w.profitPerKm !== null ? `R$ ${w.profitPerKm.toFixed(2)}` : '-'}</Text>
            </View>
          ))}
        </View>
      )}
      {filter === 'Mês' && (
        <View>
          <Text style={{ fontSize: 16, color: '#333', marginBottom: 8 }}>Mês (use semanal/dia como visão)</Text>
          {daily.slice(0, 30).map((d) => (
            <View key={d.label} style={{ borderWidth: 1, borderColor: '#eee', borderRadius: 8, padding: 12, marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: '#555' }}>{d.label}</Text>
              <Text style={{ fontSize: 14, color: d.netProfit < 0 ? '#f44336' : '#4caf50' }}>Lucro líquido: R$ {d.netProfit.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      )}
      {filter === 'Personalizado' && (
        <View>
          <Text style={{ fontSize: 16, color: '#333' }}>Seleção personalizada em breve</Text>
        </View>
      )}
    </ScrollView>
  );
};

export default ReportsScreen;
