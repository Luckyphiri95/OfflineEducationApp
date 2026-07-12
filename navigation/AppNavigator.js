import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import DashboardScreen from '../screens/DashboardScreen';
import SubjectScreen from '../screens/SubjectScreen';
import SubjectDetailsScreen from '../screens/SubjectDetailsScreen';
import StudyGuideViewerScreen from '../screens/StudyGuideViewerScreen';
import PaperQuizScreen from '../screens/PaperQuizScreen';
import ActivityQuizScreen from '../screens/ActivityQuizScreen';
import ResultsScreen from '../screens/ResultsScreen';
import ProgressScreen from '../screens/ProgressScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminSubjectsScreen from '../screens/admin/AdminSubjectsScreen';
import AdminActivitiesScreen from '../screens/admin/AdminActivitiesScreen';
import AdminActivityQuestionsScreen from '../screens/admin/AdminActivityQuestionsScreen';
import AdminPapersScreen from '../screens/admin/AdminPapersScreen';
import AdminPaperQuestionsScreen from '../screens/admin/AdminPaperQuestionsScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="Subjects" component={SubjectScreen} />
        <Stack.Screen name="SubjectDetails" component={SubjectDetailsScreen} />
        <Stack.Screen name="StudyGuideViewer" component={StudyGuideViewerScreen} />
        <Stack.Screen name="PaperQuiz" component={PaperQuizScreen} />
        <Stack.Screen name="ActivityQuiz" component={ActivityQuizScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} />
        <Stack.Screen name="AdminSubjects" component={AdminSubjectsScreen} />
        <Stack.Screen name="AdminActivities" component={AdminActivitiesScreen} />
        <Stack.Screen name="AdminActivityQuestions" component={AdminActivityQuestionsScreen} />
        <Stack.Screen name="AdminPapers" component={AdminPapersScreen} />
        <Stack.Screen name="AdminPaperQuestions" component={AdminPaperQuestionsScreen} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
