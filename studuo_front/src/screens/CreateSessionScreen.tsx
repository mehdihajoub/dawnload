import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Switch,
} from 'react-native';
import { theme } from '../theme';
import { Role } from '../data/types';

const roles: Role[] = [
  'rapper', 'beatmaker', 'engineer', 'singer', 'pianist', 
  'violinist', 'director', 'guitarist', 'drummer', 
  'producer', 'dj', 'songwriter'
];

export default function CreateSessionScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<Role[]>([]);
  const [isPaid, setIsPaid] = useState(false);

  const toggleRole = (role: Role) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Create Session</Text>
      </View>
      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Session Title"
          placeholderTextColor="#888"
          value={title}
          onChangeText={setTitle}
        />
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Description"
          placeholderTextColor="#888"
          value={description}
          onChangeText={setDescription}
          multiline
        />
        <Text style={styles.label}>Roles</Text>
        <View style={styles.rolesContainer}>
          {roles.map(role => (
            <TouchableOpacity
              key={role}
              style={[
                styles.roleButton,
                selectedRoles.includes(role) && styles.selectedRole,
              ]}
              onPress={() => toggleRole(role)}
            >
              <Text style={styles.roleText}>{role}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.switchContainer}>
          <Text style={styles.label}>Paid Session</Text>
          <Switch
            value={isPaid}
            onValueChange={setIsPaid}
            trackColor={{ false: '#767577', true: theme.colors.primary }}
            thumbColor={isPaid ? theme.colors.primary : '#f4f3f4'}
          />
        </View>
        <TouchableOpacity style={styles.createButton}>
          <Text style={styles.createButtonText}>Create Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1E1E1E',
  },
  headerTitle: {
    color: theme.colors.text,
    fontSize: theme.typography.sizes.xxxl,
    fontWeight: 'bold',
  },
  form: {
    padding: 16,
  },
  input: {
    backgroundColor: '#1E1E1E',
    color: '#FFF',
    padding: 16,
    borderRadius: 8,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  label: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  rolesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  roleButton: {
    backgroundColor: '#333',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    margin: 4,
  },
  selectedRole: {
    backgroundColor: theme.colors.primary,
  },
  roleText: {
    color: '#FFF',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: theme.colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
}); 