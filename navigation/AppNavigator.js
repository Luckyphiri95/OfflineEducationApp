import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import colors from '../theme/colors';
import { getSession } from '../utils/session';

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
import CommunityBoardScreen from '../screens/CommunityBoardScreen';
import ArticleDetailScreen from '../screens/ArticleDetailScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminSubjectsScreen from '../screens/admin/AdminSubjectsScreen';
import AdminActivitiesScreen from '../screens/admin/AdminActivitiesScreen';
import AdminActivityQuestionsScreen from '../screens/admin/AdminActivityQuestionsScreen';
import AdminPapersScreen from '../screens/admin/AdminPapersScreen';
import AdminPaperQuestionsScreen from '../screens/admin/AdminPaperQuestionsScreen';
import AdminCommunityBoardScreen from '../screens/admin/AdminCommunityBoardScreen';
import AdminProgressScreen from '../screens/admin/AdminProgressScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  // Resume a saved session on launch (e.g. after a refresh/restart) instead
  // of always starting at Login — session is written to AsyncStorage on
  // login (see utils/session.js) and only ever cleared on explicit logout.
  const [checkingSession, setCheckingSession] = useState(true);
  const [initialRoute, setInitialRoute] = useState('Login');
  const [initialUser, setInitialUser] = useState(null);

  useEffect(() => {
    getSession().then((user) => {
      if (user) {
        setInitialUser(user);
        setInitialRoute(user.is_admin ? 'AdminDashboard' : 'Dashboard');
      }
      setCheckingSession(false);
    });
  }, []);

  if (checkingSession) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen
          name="Dashboard"
          component={DashboardScreen}
          initialParams={initialRoute === 'Dashboard' ? { user: initialUser } : undefined}
        />
        <Stack.Screen name="Subjects" component={SubjectScreen} />
        <Stack.Screen name="SubjectDetails" component={SubjectDetailsScreen} />
        <Stack.Screen name="StudyGuideViewer" component={StudyGuideViewerScreen} />
        <Stack.Screen name="PaperQuiz" component={PaperQuizScreen} />
        <Stack.Screen name="ActivityQuiz" component={ActivityQuizScreen} />
        <Stack.Screen name="Results" component={ResultsScreen} />
        <Stack.Screen name="Progress" component={ProgressScreen} />
        <Stack.Screen name="CommunityBoard" component={CommunityBoardScreen} />
        <Stack.Screen name="ArticleDetail" component={ArticleDetailScreen} />
        <Stack.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          initialParams={initialRoute === 'AdminDashboard' ? { user: initialUser } : undefined}
        />
        <Stack.Screen name="AdminSubjects" component={AdminSubjectsScreen} />
        <Stack.Screen name="AdminActivities" component={AdminActivitiesScreen} />
        <Stack.Screen name="AdminActivityQuestions" component={AdminActivityQuestionsScreen} />
        <Stack.Screen name="AdminPapers" component={AdminPapersScreen} />
        <Stack.Screen name="AdminPaperQuestions" component={AdminPaperQuestionsScreen} />
        <Stack.Screen name="AdminCommunityBoard" component={AdminCommunityBoardScreen} />
        <Stack.Screen name="AdminProgress" component={AdminProgressScreen} />
        <Stack.Screen name="AdminUsers" component={AdminUsersScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
