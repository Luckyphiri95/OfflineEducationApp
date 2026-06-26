import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TextInput } from 'react-native';
import Card from '../components/Card';
import Button from '../components/Button';
import colors from '../theme/colors';

const subjectData = [
  { id: '1', title: 'Mathematics', description: 'Numbers, algebra, and geometry.' },
  { id: '2', title: 'English', description: 'Reading, writing, and grammar.' },
  { id: '3', title: 'Science', description: 'Biology, chemistry, and physics.' },
  { id: '4', title: 'Computer Studies', description: 'Coding, apps, and digital skills.' },
];

export default function SubjectScreen({ navigation }) {
  const [search, setSearch] = useState('');

  const filteredSubjects = subjectData.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Subjects</Text>
        <Text style={styles.subtitle}>Find the topic you want to study today.</Text>
      </View>
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Search subjects"
          placeholderTextColor={colors.placeholder}
        />
      </View>

      <FlatList
        data={filteredSubjects}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.subjectRow}>
              <View style={styles.subjectInfo}>
                <Text style={styles.subjectTitle}>{item.title}</Text>
                <Text style={styles.subjectDesc}>{item.description}</Text>
              </View>
              <Button title="Open" variant="secondary" onPress={() => navigation.navigate('SubjectDetails', { subject: item })} />
            </View>
          </Card>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    padding: 24,
    paddingBottom: 12,
  },
  title: {
    color: colors.textPrimary,
    fontSize: 28,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 16,
    marginTop: 6,
  },
  searchBox: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  searchInput: {
    height: 54,
    paddingHorizontal: 18,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.textPrimary,
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  subjectRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  subjectInfo: {
    flex: 1,
    marginRight: 18,
  },
  subjectTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  subjectDesc: {
    marginTop: 8,
    color: colors.textSecondary,
    lineHeight: 22,
  },
});