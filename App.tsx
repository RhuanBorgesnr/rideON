import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { enableScreens } from 'react-native-screens';
import DashboardScreen from './src/screens/DashboardScreen';
import WorkDayDetailScreen from './src/screens/WorkDayDetailScreen';
import StartDayScreen from './src/screens/StartDayScreen';
import ExpenseScreen from './src/screens/ExpenseScreen';
import EndDayScreen from './src/screens/EndDayScreen';
import ReportsScreen from './src/screens/ReportsScreen';

enableScreens(true);

type RootStackParamList = {
  Dashboard: undefined;
  WorkDayDetail: { workDay: { id: number; date: string; netProfit: number } };
  StartDay: undefined;
  Expense: { workDayId: number };
  EndDay: { workDayId: number };
  Reports: undefined;
};
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator id="root" initialRouteName="Dashboard">
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="WorkDayDetail" component={WorkDayDetailScreen} />
        <Stack.Screen name="StartDay" component={StartDayScreen} />
        <Stack.Screen name="Expense" component={ExpenseScreen} />
        <Stack.Screen name="EndDay" component={EndDayScreen} />
        <Stack.Screen name="Reports" component={ReportsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
