import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Title,
  Button,
  Portal,
  Modal,
  TextInput,
  Menu,
  List,
  Divider,
} from 'react-native-paper';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../api/services/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const MonitoringScreen = () => {
  const queryClient = useQueryClient();

  const [isPlantModalVisible, setIsPlantModalVisible] = useState(false);
  const [plantName, setPlantName] = useState('');
  const [plantQr, setPlantQr] = useState('');
  const [plantSpeciesId, setPlantSpeciesId] = useState('');
  const [plantLocationId, setPlantLocationId] = useState('');
  const [speciesMenuVisible, setSpeciesMenuVisible] = useState(false);
  const [locMenuVisible, setLocMenuVisible] = useState(false);

  const [selectedPlantId, setSelectedPlantId] = useState<string | null>(null);

  const {
    data: plants = [],
    isLoading: isLoadingPlants,
    refetch: refetchPlants,
    isRefetching,
  } = useQuery({
    queryKey: ['plants'],
    queryFn: apiService.getPlants,
  });

  const { data: species = [] } = useQuery({
    queryKey: ['species'],
    queryFn: apiService.getSpecies,
  });

  const { data: locations = [] } = useQuery({
    queryKey: ['locations'],
    queryFn: apiService.getLocations,
  });

  const { data: readings = [], isLoading: isLoadingReadings } = useQuery({
    queryKey: ['readings', selectedPlantId],
    queryFn: () => apiService.getPlantReadings(selectedPlantId!),
    enabled: !!selectedPlantId,
    refetchInterval: 5000,
  });

  const onRefresh = useCallback(() => {
    refetchPlants();
  }, [refetchPlants]);

  const createPlantMutation = useMutation({
    mutationFn: apiService.createPlant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plants'] });
      setIsPlantModalVisible(false);
      setPlantName('');
      setPlantQr('');
      setPlantSpeciesId('');
      setPlantLocationId('');
      Alert.alert('Успіх', 'Рослину успішно додано!');
    },
    onError: () =>
      Alert.alert('Помилка', 'Не вдалося створити рослину'),
  });

  const handleCreatePlant = () => {
    if (!plantName || !plantQr || !plantSpeciesId) {
      return Alert.alert('Увага', "Заповніть обов'язкові поля");
    }

    createPlantMutation.mutate({
      name: plantName,
      qrCodeId: plantQr,
      speciesId: plantSpeciesId,
      locationId: plantLocationId || null,
    });
  };

  const getStatusIcon = (status: string) => {
    if (status === 'CRITICAL')
      return { name: 'alert-octagon', color: '#F44336' };
    if (status === 'NEEDS_ATTENTION')
      return { name: 'alert', color: '#FFC107' };
    return { name: 'leaf', color: '#4CAF50' };
  };

  const getReadingIcon = (type: string) => {
    switch (type) {
      case 'SOIL_MOISTURE':
        return { name: 'water-percent', color: '#2196F3', label: 'Вологість ґрунту', unit: '%' };
      case 'AIR_TEMPERATURE':
        return { name: 'thermometer', color: '#FF9800', label: 'Температура повітря', unit: '°C' };
      case 'AIR_HUMIDITY':
        return { name: 'weather-pouring', color: '#00BCD4', label: 'Вологість повітря', unit: '%' };
      case 'LIGHT_INTENSITY':
        return { name: 'white-balance-sunny', color: '#FFC107', label: 'Освітленість', unit: ' Lux' };
      case 'BATTERY_LEVEL':
        return { name: 'battery-50', color: '#4CAF50', label: 'Заряд батареї', unit: '%' };
      default:
        return { name: 'memory', color: '#9E9E9E', label: 'Невідомий датчик', unit: '' };
    }
  };

  const normalizeReadings = (data: any) => {
    if (!data || (Array.isArray(data) && data.length === 0)) {
      return { items: [], isValid: true };
    }
    
    let result: any[] = [];
    let isValid = true;
    
    if (Array.isArray(data)) {
      data.forEach(item => {
        if (item.type && item.value !== undefined) {
          result.push(item); 
        } else if (item.readings && Array.isArray(item.readings)) {
          result.push(...item.readings); 
        } else {
          isValid = false; 
        }
      });
    } else if (typeof data === 'object') {
      if (data.sensors && Array.isArray(data.sensors)) {
        data.sensors.forEach((s: any) => {
          if (s.readings && Array.isArray(s.readings)) {
            result.push(...s.readings);
          } else {
            isValid = false;
          }
        });
      } else if (data.readings && Array.isArray(data.readings)) {
        result.push(...data.readings);
      } else {
        isValid = false;
      }
    }
    
    return { items: result, isValid };
  };

  const { items: actualReadings, isValid: isFormatValid } = normalizeReadings(readings);

  if (isLoadingPlants) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Завантаження рослин...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={onRefresh} colors={['#4CAF50']} />
        }
      >
        <View style={styles.header}>
          <Title style={styles.title}>Моніторинг еко-офісу</Title>
          <Text style={styles.subtitle}>
            Стежте за показниками IoT та здоров'ям рослин
          </Text>
        </View>

        <Button
          mode="contained"
          icon="plus"
          onPress={() => setIsPlantModalVisible(true)}
          style={styles.addButton}
          buttonColor="#2E7D32"
        >
          Додати нову рослину
        </Button>

        <Title style={styles.sectionTitle}>Всі рослини</Title>

        <Card style={styles.listCard}>
          {plants.length === 0 ? (
            <List.Item
              title="Рослин ще немає"
              description="Натисніть кнопку вище, щоб додати."
            />
          ) : (
            plants.map((plant: any, index: number) => {
              const icon = getStatusIcon(plant.healthStatus);

              return (
                <View key={plant.id}>
                  <List.Item
                    title={plant.name || 'Невідома рослина'}
                    description={
                      plant.healthStatus === 'CRITICAL'
                        ? 'Критичний стан'
                        : plant.healthStatus === 'NEEDS_ATTENTION'
                        ? 'Потребує уваги'
                        : 'Здорова'
                    }
                    left={(props) => (
                      <List.Icon {...props} icon={icon.name} color={icon.color} />
                    )}
                    right={(props) => (
                      <MaterialCommunityIcons
                        {...props}
                        name="router-wireless"
                        size={24}
                        color="#2196F3"
                        style={{ alignSelf: 'center', marginRight: 10 }}
                      />
                    )}
                    onPress={() => setSelectedPlantId(plant.id)}
                  />

                  {index < plants.length - 1 && <Divider />}
                </View>
              );
            })
          )}
        </Card>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Portal>
        <Modal
          visible={isPlantModalVisible}
          onDismiss={() => setIsPlantModalVisible(false)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>Нова рослина</Title>

          <ScrollView>
            <TextInput
              label="Назва"
              value={plantName}
              onChangeText={setPlantName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="QR ID"
              value={plantQr}
              onChangeText={setPlantQr}
              mode="outlined"
              style={styles.input}
            />

            <Menu
              visible={speciesMenuVisible}
              onDismiss={() => setSpeciesMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setSpeciesMenuVisible(true)} style={styles.input}>
                  {species.find((s: any) => s.id === plantSpeciesId)?.commonName || 'Оберіть вид рослини'}
                </Button>
              }
            >
              {species.map((s: any) => (
                <Menu.Item key={s.id} onPress={() => { setPlantSpeciesId(s.id); setSpeciesMenuVisible(false); }} title={s.commonName} />
              ))}
            </Menu>

            <Menu
              visible={locMenuVisible}
              onDismiss={() => setLocMenuVisible(false)}
              anchor={
                <Button mode="outlined" onPress={() => setLocMenuVisible(true)} style={styles.input}>
                  {locations.find((l: any) => l.id === plantLocationId)?.name || 'Оберіть локацію (необов.)'}
                </Button>
              }
            >
              <Menu.Item onPress={() => { setPlantLocationId(''); setLocMenuVisible(false); }} title="Без локації" />
              {locations.map((l: any) => (
                <Menu.Item key={l.id} onPress={() => { setPlantLocationId(l.id); setLocMenuVisible(false); }} title={l.name} />
              ))}
            </Menu>

            <Button mode="contained" onPress={handleCreatePlant} loading={createPlantMutation.isPending} buttonColor="#4CAF50">
              Зберегти
            </Button>

            <Button mode="text" onPress={() => setIsPlantModalVisible(false)} style={{ marginTop: 8 }}>
              Закрити
            </Button>
          </ScrollView>
        </Modal>

        <Modal
          visible={!!selectedPlantId}
          onDismiss={() => setSelectedPlantId(null)}
          contentContainerStyle={styles.modalContent}
        >
          <Title style={styles.modalTitle}>IoT дані</Title>

          {isLoadingReadings ? (
            <ActivityIndicator size="large" color="#2196F3" style={{ marginVertical: 20 }} />
          ) : !isFormatValid ? (
            <View style={styles.debugBox}>
              <Text style={styles.debugTitle}>Формат даних з бекенду не збігається!</Text>
              <Text style={{ fontSize: 12 }}>Бекенд віддав об'єкти без поля "type" або "readings". Ось що прийшло:</Text>
              <ScrollView style={{ maxHeight: 150, marginTop: 8 }}>
                <Text style={{ fontSize: 10, fontFamily: 'monospace' }}>
                  {JSON.stringify(readings, null, 2)}
                </Text>
              </ScrollView>
            </View>
          ) : actualReadings.length === 0 ? (
            <Text style={{ textAlign: 'center', marginVertical: 20, color: 'gray' }}>
              Пристрій поки не надіслав жодних даних.
            </Text>
          ) : (
            <ScrollView style={{ maxHeight: 300 }}>
              {actualReadings.map((r: any, index: number) => {
                const icon = getReadingIcon(r.type);
                return (
                  <View key={r.id || index} style={styles.readingRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <MaterialCommunityIcons name={icon.name as any} size={28} color={icon.color} />
                      <Text style={{ marginLeft: 12, fontSize: 16, fontWeight: '500' }}>{icon.label}</Text>
                    </View>
                    <Text style={{ fontSize: 20, fontWeight: 'bold', color: icon.color }}>
                      {r.value}{icon.unit}
                    </Text>
                  </View>
                );
              })}
            </ScrollView>
          )}

          <Button mode="contained" onPress={() => setSelectedPlantId(null)} style={{ marginTop: 20 }} buttonColor="#2E7D32">
            Закрити панель
          </Button>
        </Modal>
      </Portal>
    </>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { marginBottom: 20, marginTop: 40 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#2E7D32' },
  subtitle: { fontSize: 16, color: '#666', marginTop: 4 },
  addButton: { marginBottom: 24, borderRadius: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 12 },
  listCard: { backgroundColor: '#fff' },
  modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  input: { marginBottom: 16 },
  readingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  debugBox: {
    backgroundColor: '#ffebee',
    padding: 12,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#ef9a9a'
  },
  debugTitle: {
    color: '#c62828',
    fontWeight: 'bold',
    marginBottom: 4
  }
});