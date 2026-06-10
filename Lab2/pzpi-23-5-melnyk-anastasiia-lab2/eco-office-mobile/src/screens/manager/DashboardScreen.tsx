import React, { useCallback, useState } from 'react';
import { View, StyleSheet, ScrollView, ActivityIndicator, RefreshControl, Alert } from 'react-native';
import { Text, Card, Title, Paragraph, Button, Divider, List, Portal, Modal, TextInput, SegmentedButtons, Menu } from 'react-native-paper';
import { useAuthStore } from '../../store/useAuthStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../api/services/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const DashboardScreen = () => {
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  // --- Стейт для модалок ---
  const [isPlantModalVisible, setIsPlantModalVisible] = useState(false);
  const [isTaskModalVisible, setIsTaskModalVisible] = useState(false);

  // Стейт форми: Нова Рослина
  const [plantName, setPlantName] = useState('');
  const [plantQr, setPlantQr] = useState('');
  const [plantSpeciesId, setPlantSpeciesId] = useState('');
  const [plantLocationId, setPlantLocationId] = useState('');
  const [speciesMenuVisible, setSpeciesMenuVisible] = useState(false);
  const [locMenuVisible, setLocMenuVisible] = useState(false);

  // Стейт форми: Нове Завдання
  const [taskPlantId, setTaskPlantId] = useState('');
  const [taskRole, setTaskRole] = useState('FLORIST');
  const [taskType, setTaskType] = useState('WATERING');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPlantMenuVisible, setTaskPlantMenuVisible] = useState(false);
  const [taskTypeMenuVisible, setTaskTypeMenuVisible] = useState(false);

  // --- Запити (Queries) ---
  const { data: plants = [], isLoading: isLoadingPlants, refetch: refetchPlants, isRefetching: isRefetchingPlants } = useQuery({
    queryKey: ['plants'], queryFn: apiService.getPlants,
  });
  const { data: tasks = [], isLoading: isLoadingTasks, refetch: refetchTasks, isRefetching: isRefetchingTasks } = useQuery({
    queryKey: ['tasks'], queryFn: apiService.getTasks,
  });
  const { data: locations = [] } = useQuery({
    queryKey: ['locations'], queryFn: apiService.getLocations,
  });
  const { data: species = [] } = useQuery({
    queryKey: ['species'], queryFn: apiService.getSpecies,
  });

  const isLoading = isLoadingPlants || isLoadingTasks;
  const isRefreshing = isRefetchingPlants || isRefetchingTasks;

  const onRefresh = useCallback(() => {
    refetchPlants();
    refetchTasks();
  }, [refetchPlants, refetchTasks]);

  // --- Мутації (Створення) ---
  const createPlantMutation = useMutation({
    mutationFn: apiService.createPlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      setIsPlantModalVisible(false);
      setPlantName(''); setPlantQr(''); setPlantSpeciesId(''); setPlantLocationId('');
      Alert.alert('Успіх', 'Рослину успішно додано!');
    },
    onError: (error) => Alert.alert('Помилка', 'Не вдалося створити рослину'),
  });

  const createTaskMutation = useMutation({
    mutationFn: apiService.createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setIsTaskModalVisible(false);
      setTaskPlantId(''); setTaskDesc('');
      Alert.alert('Успіх', 'Завдання створено і відправлено команді!');
    },
    onError: (error) => Alert.alert('Помилка', 'Не вдалося створити завдання'),
  });

  const handleCreatePlant = () => {
    if (!plantName || !plantQr || !plantSpeciesId) return Alert.alert('Увага', 'Заповніть обов\'язкові поля');
    createPlantMutation.mutate({
      name: plantName, qrCodeId: plantQr, speciesId: plantSpeciesId, locationId: plantLocationId || null
    });
  };

  const handleCreateTask = () => {
    if (!taskPlantId || !taskType) return Alert.alert('Увага', 'Оберіть рослину та тип завдання');
    createTaskMutation.mutate({
      plantId: taskPlantId, requiredRole: taskRole, type: taskType, description: taskDesc, priority: 1
    });
  };

  // --- Статистика ---
  const totalPlants = plants.length;
  const problemPlants = plants.filter(p => p.healthStatus !== 'HEALTHY');
  const needsAttentionCount = problemPlants.length;
  const activeTasksCount = tasks.filter(t => t.status === 'PENDING' || t.status === 'IN_PROGRESS').length;

  const getStatusIcon = (status: string) => {
    if (status === 'CRITICAL') return { name: 'alert-octagon', color: '#F44336' };
    if (status === 'NEEDS_ATTENTION') return { name: 'alert', color: '#FFC107' };
    return { name: 'leaf', color: '#4CAF50' };
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Завантаження дашборду...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView 
        style={styles.container}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} colors={['#4CAF50']} />}
      >
        <View style={styles.header}>
          <Title style={styles.greeting}>Привіт, {user?.fullName || 'Менеджере'}!</Title>
          <Text style={styles.subtitle}>Ось статус вашого еко-офісу на сьогодні</Text>
        </View>

        {/* Швидкі дії */}
        <View style={styles.quickActionsContainer}>
          <Button mode="contained" icon="flower" onPress={() => setIsPlantModalVisible(true)} style={styles.quickActionButton} buttonColor="#2E7D32">
            Додати рослину
          </Button>
          <Button mode="contained" icon="clipboard-plus-outline" onPress={() => setIsTaskModalVisible(true)} style={styles.quickActionButton} buttonColor="#2196F3">
            Нове завдання
          </Button>
        </View>

        {/* Блок зі статистикою */}
        <View style={styles.statsRow}>
          <Card style={[styles.statCard, { borderBottomColor: '#4CAF50', borderBottomWidth: 4 }]}>
            <Card.Content style={styles.statCardContent}>
              <MaterialCommunityIcons name="flower" size={24} color="#4CAF50" />
              <Title style={styles.statNumber}>{totalPlants}</Title>
              <Paragraph style={styles.statLabel}>Всього рослин</Paragraph>
            </Card.Content>
          </Card>
          
          <Card style={[styles.statCard, { borderBottomColor: needsAttentionCount > 0 ? '#F44336' : '#4CAF50', borderBottomWidth: 4 }]}>
            <Card.Content style={styles.statCardContent}>
              <MaterialCommunityIcons name="heart-pulse" size={24} color={needsAttentionCount > 0 ? '#F44336' : '#4CAF50'} />
              <Title style={[styles.statNumber, { color: needsAttentionCount > 0 ? '#F44336' : '#333' }]}>
                {needsAttentionCount}
              </Title>
              <Paragraph style={styles.statLabel}>Потребують уваги</Paragraph>
            </Card.Content>
          </Card>
        </View>

        <Card style={[styles.statCard, { marginBottom: 24, borderBottomColor: '#2196F3', borderBottomWidth: 4 }]}>
          <Card.Content style={[styles.statCardContent, { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }]}>
            <View>
              <Title style={styles.statNumber}>{activeTasksCount}</Title>
              <Paragraph style={styles.statLabel}>Активних завдань для команди</Paragraph>
            </View>
            <MaterialCommunityIcons name="clipboard-text-outline" size={32} color="#2196F3" />
          </Card.Content>
        </Card>

        {/* Список проблемних рослин */}
        <Title style={styles.sectionTitle}>Критичні рослини</Title>
        {problemPlants.length === 0 ? (
          <Card style={styles.emptyCard}>
            <Card.Content style={styles.emptyCardContent}>
               <MaterialCommunityIcons name="check-circle-outline" size={40} color="#4CAF50" />
               <Text style={styles.emptyText}>Усі рослини в чудовому стані!</Text>
            </Card.Content>
          </Card>
        ) : (
          <Card style={styles.listCard}>
            {problemPlants.map((plant, index) => {
              const icon = getStatusIcon(plant.healthStatus);
              return (
                <React.Fragment key={plant.id}>
                  <List.Item
                    title={plant.name || 'Невідома рослина'}
                    description={plant.healthStatus === 'CRITICAL' ? 'Критичний стан' : 'Потребує уваги'}
                    left={props => <List.Icon {...props} icon={icon.name} color={icon.color} />}
                  />
                  {index < problemPlants.length - 1 && <Divider />}
                </React.Fragment>
              );
            })}
          </Card>
        )}

        <Button mode="outlined" onPress={logout} style={styles.logoutButton} textColor="#F44336" icon="logout">
          Вийти з акаунта
        </Button>
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* --- МОДАЛЬНІ ВІКНА ДЛЯ ФОРМ --- */}
      <Portal>
        {/* Форма: Додати Рослину */}
        <Modal visible={isPlantModalVisible} onDismiss={() => setIsPlantModalVisible(false)} contentContainerStyle={styles.modalContent}>
          <Title style={styles.modalTitle}>Нова рослина</Title>
          <ScrollView>
            <TextInput label="Назва (напр. Офісний фікус)" value={plantName} onChangeText={setPlantName} mode="outlined" style={styles.input} />
            <TextInput label="ID QR-коду (напр. QR-123)" value={plantQr} onChangeText={setPlantQr} mode="outlined" style={styles.input} />
            
            <Menu
              visible={speciesMenuVisible} onDismiss={() => setSpeciesMenuVisible(false)}
              anchor={<Button mode="outlined" onPress={() => setSpeciesMenuVisible(true)} style={styles.input}>
                {species.find(s => s.id === plantSpeciesId)?.commonName || 'Оберіть вид рослини'}
              </Button>}
            >
              {species.map(s => <Menu.Item key={s.id} onPress={() => { setPlantSpeciesId(s.id); setSpeciesMenuVisible(false); }} title={s.commonName} />)}
            </Menu>

            <Menu
              visible={locMenuVisible} onDismiss={() => setLocMenuVisible(false)}
              anchor={<Button mode="outlined" onPress={() => setLocMenuVisible(true)} style={styles.input}>
                {locations.find(l => l.id === plantLocationId)?.name || 'Оберіть локацію (необов.)'}
              </Button>}
            >
              <Menu.Item onPress={() => { setPlantLocationId(''); setLocMenuVisible(false); }} title="Без локації" />
              {locations.map(l => <Menu.Item key={l.id} onPress={() => { setPlantLocationId(l.id); setLocMenuVisible(false); }} title={l.name} />)}
            </Menu>

            <Button mode="contained" onPress={handleCreatePlant} loading={createPlantMutation.isPending} style={styles.submitBtn} buttonColor="#4CAF50">
              Зберегти рослину
            </Button>
          </ScrollView>
        </Modal>

        {/* Форма: Створити Завдання */}
        <Modal visible={isTaskModalVisible} onDismiss={() => setIsTaskModalVisible(false)} contentContainerStyle={styles.modalContent}>
          <Title style={styles.modalTitle}>Нове завдання</Title>
          <ScrollView>
            <Menu
              visible={taskPlantMenuVisible} onDismiss={() => setTaskPlantMenuVisible(false)}
              anchor={<Button mode="outlined" onPress={() => setTaskPlantMenuVisible(true)} style={styles.input}>
                {plants.find(p => p.id === taskPlantId)?.name || 'Оберіть рослину'}
              </Button>}
            >
              {plants.map(p => <Menu.Item key={p.id} onPress={() => { setTaskPlantId(p.id); setTaskPlantMenuVisible(false); }} title={p.name || 'Без назви'} />)}
            </Menu>

            <Text style={styles.label}>Хто має виконати?</Text>
            <SegmentedButtons
              value={taskRole} onValueChange={setTaskRole}
              buttons={[{ value: 'FLORIST', label: 'Флорист' }, { value: 'CLEANER', label: 'Прибиральник' }]}
              style={styles.input}
            />

            <Menu
              visible={taskTypeMenuVisible} onDismiss={() => setTaskTypeMenuVisible(false)}
              anchor={<Button mode="outlined" onPress={() => setTaskTypeMenuVisible(true)} style={styles.input}>
                {taskType === 'WATERING' ? 'Полив' : taskType === 'FERTILIZING' ? 'Добриво' : taskType === 'CLEANING' ? 'Очищення' : taskType}
              </Button>}
            >
              <Menu.Item onPress={() => { setTaskType('WATERING'); setTaskTypeMenuVisible(false); }} title="Полив" />
              <Menu.Item onPress={() => { setTaskType('FERTILIZING'); setTaskTypeMenuVisible(false); }} title="Добриво" />
              <Menu.Item onPress={() => { setTaskType('CLEANING'); setTaskTypeMenuVisible(false); }} title="Очищення листків" />
              <Menu.Item onPress={() => { setTaskType('PEST_CONTROL'); setTaskTypeMenuVisible(false); }} title="Лікування" />
            </Menu>

            <TextInput label="Додаткова інструкція (необов.)" value={taskDesc} onChangeText={setTaskDesc} mode="outlined" multiline numberOfLines={3} style={styles.input} />

            <Button mode="contained" onPress={handleCreateTask} loading={createTaskMutation.isPending} style={styles.submitBtn} buttonColor="#2196F3">
              Призначити завдання
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F5F5' },
  header: { marginBottom: 16, marginTop: 40 },
  greeting: { fontSize: 28, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  
  // Кнопки швидких дій
  quickActionsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  quickActionButton: { flex: 1, marginHorizontal: 4, borderRadius: 8 },
  
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  statCard: { flex: 1, marginHorizontal: 4, backgroundColor: '#fff' },
  statCardContent: { alignItems: 'center', paddingVertical: 16 },
  statNumber: { fontSize: 32, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 12, color: '#666', textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12, marginLeft: 4 },
  listCard: { backgroundColor: '#fff', marginBottom: 24 },
  emptyCard: { backgroundColor: '#E8F5E9', marginBottom: 24, borderWidth: 1, borderColor: '#C8E6C9' },
  emptyCardContent: { alignItems: 'center', paddingVertical: 24 },
  emptyText: { marginTop: 8, color: '#2E7D32', fontWeight: 'bold', fontSize: 16 },
  logoutButton: { marginTop: 16, borderColor: '#F44336' },
  
  // Стилі модальних вікон
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12, maxHeight: '80%' },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { marginBottom: 16, backgroundColor: '#fff' },
  label: { fontSize: 14, color: '#666', marginBottom: 8, marginLeft: 4 },
  submitBtn: { marginTop: 8, paddingVertical: 6 }
});