import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Button, Avatar, Card, Divider } from 'react-native-paper';
import { useAuthStore } from '../store/useAuthStore';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const ProfileScreen = () => {
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    Alert.alert(
      "Вихід",
      "Ви впевнені, що хочете вийти з акаунту?",
      [
        { text: "Скасувати", style: "cancel" },
        { text: "Вийти", onPress: logout, style: "destructive" }
      ]
    );
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'ADMIN': return 'Адміністратор';
      case 'OFFICE_MANAGER': return 'Офіс-Менеджер';
      case 'FLORIST': return 'Флорист';
      case 'CLEANER': return 'Прибиральник';
      default: return 'Співробітник';
    }
  };

  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content style={styles.content}>
          <Avatar.Icon size={80} icon="account" style={{ backgroundColor: '#4CAF50' }} />
          <Text style={styles.name}>{user?.fullName || 'Невідомий користувач'}</Text>
          <Text style={styles.role}>{getRoleLabel(user?.role)}</Text>
          
          <Divider style={styles.divider} />
          
          <View style={styles.infoRow}>
            <MaterialCommunityIcons name="email-outline" size={24} color="#666" />
            <Text style={styles.infoText}>{user?.email}</Text>
          </View>
        </Card.Content>
      </Card>

      <Button 
        mode="contained" 
        icon="logout" 
        onPress={handleLogout} 
        style={styles.logoutButton}
        buttonColor="#F44336"
      >
        Вийти з акаунту
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16, justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 24 },
  content: { alignItems: 'center', paddingVertical: 20 },
  name: { fontSize: 24, fontWeight: 'bold', marginTop: 16, color: '#333' },
  role: { fontSize: 16, color: '#4CAF50', fontWeight: '500', marginTop: 4 },
  divider: { width: '100%', marginVertical: 20 },
  infoRow: { flexDirection: 'row', alignItems: 'center', width: '100%', paddingHorizontal: 20 },
  infoText: { fontSize: 16, color: '#666', marginLeft: 12 },
  logoutButton: { paddingVertical: 6, borderRadius: 8 },
});