import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Modal, Alert } from 'react-native';
import { Text, Card, Chip, SegmentedButtons, Button, Divider } from 'react-native-paper';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiService } from '../../api/services/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/useAuthStore';
import { CameraView, useCameraPermissions } from 'expo-camera';

export const TeamTasksScreen = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState('all');

  const [permission, requestPermission] = useCameraPermissions();
  const [scannerVisible, setScannerVisible] = useState(false);
  const [scanningTaskId, setScanningTaskId] = useState<string | null>(null);
  const [isProcessingQr, setIsProcessingQr] = useState(false);

  const { data: tasks = [], isLoading: isLoadingTasks, isRefetching, refetch } = useQuery({
    queryKey: ['tasks'],
    queryFn: apiService.getTasks,
    refetchInterval: 15000, 
  });

  const { data: plants = [], isLoading: isLoadingPlants } = useQuery({
    queryKey: ['plants'],
    queryFn: apiService.getPlants,
  });

  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: apiService.getLocations,
  });

  const isLoading = isLoadingTasks || isLoadingPlants || isLoadingLocations;

  const getStatusDetails = (status: string) => {
    switch (status) {
      case 'PENDING': return { label: 'Очікує', color: '#FF9800', icon: 'clock-outline' };
      case 'IN_PROGRESS': return { label: 'В процесі', color: '#2196F3', icon: 'progress-clock' };
      case 'COMPLETED': return { label: 'Виконано', color: '#4CAF50', icon: 'check-circle' };
      default: return { label: status, color: '#9E9E9E', icon: 'help-circle' };
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'CLEANER': return 'broom';
      case 'FLORIST': return 'flower';
      case 'OFFICE_MANAGER': return 'clipboard-account';
      default: return 'account';
    }
  };

  const filteredTasks = tasks.filter(task => {
    if (filter === 'my') return task.requiredRole === user?.role;
    return true; 
  });

  const handleBarcodeScanned = async ({ data }: { data: string }) => {
    if (isProcessingQr || !scanningTaskId) return;
    setIsProcessingQr(true);

    try {
      const task = tasks.find(t => t.id === scanningTaskId);
      const plant = plants.find(p => p.id === task?.plantId);

      if (!plant || plant.qrCodeId !== data) {
        Alert.alert("Помилка", "Цей QR-код не належить потрібній рослині!");
        setScannerVisible(false);
        setScanningTaskId(null);
        return;
      }

      await apiService.updateTaskStatus(scanningTaskId, 'COMPLETED');
      await apiService.createCareLog({
        taskId: scanningTaskId,
        verifiedByScan: true,
      });

      await queryClient.invalidateQueries({ queryKey: ['tasks'] });
      
      setScannerVisible(false);
      setScanningTaskId(null);
      Alert.alert("Успіх!", `Завдання виконано.\nРослина: ${plant.name} ✅`);

    } catch (error) {
      console.error(error);
      Alert.alert("Помилка", "Не вдалося зберегти виконання завдання на сервері.");
      setScannerVisible(false);
      setScanningTaskId(null);
    } finally {
      setIsProcessingQr(false);
    }
  };

  const openScanner = async (taskId: string) => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert("Помилка", "Потрібен дозвіл на використання камери для сканування QR-коду.");
        return;
      }
    }
    setScanningTaskId(taskId);
    setScannerVisible(true);
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Завантаження даних...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Завдання команди</Text>

      <View style={styles.filterContainer}>
        <SegmentedButtons
          value={filter}
          onValueChange={setFilter}
          buttons={[
            { value: 'all', label: 'Всі завдання' },
            { value: 'my', label: 'Мої завдання' },
          ]}
          theme={{ colors: { secondaryContainer: '#E8F5E9', onSecondaryContainer: '#2E7D32' } }}
        />
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={<Text style={styles.emptyText}>Немає активних завдань</Text>}
        refreshing={isRefetching}
        onRefresh={refetch}
        renderItem={({ item }) => {
          const status = getStatusDetails(item.status);

          const plant = plants.find(p => p.id === item.plantId);
          const location = locations.find(l => l.id === plant?.locationId);

          return (
            <Card style={styles.card}>
              <Card.Content>
                <View style={styles.headerRow}>
                  <Chip icon={getRoleIcon(item.requiredRole)} style={styles.roleChip}>
                    {item.requiredRole === 'CLEANER' ? 'Прибиральник' : 
                     item.requiredRole === 'FLORIST' ? 'Флорист' : 'Менеджер'}
                  </Chip>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name={status.icon as any} size={16} color={status.color} />
                    <Text style={{ color: status.color, marginLeft: 4, fontWeight: 'bold' }}>
                      {status.label}
                    </Text>
                  </View>
                </View>
                
                <Text style={styles.taskType}>{item.type}</Text>
                {item.description && <Text style={styles.description}>{item.description}</Text>}
                
                <Divider style={styles.divider} />

                {/* Блок з інформацією про рослину та локацію */}
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="flower-tulip" size={20} color="#4CAF50" />
                  <Text style={styles.infoText}>{plant?.name || 'Невідома рослина'}</Text>
                </View>
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons name="map-marker-outline" size={20} color="#F44336" />
                  <Text style={styles.infoText}>
                    {location ? `${location.name} (Поверх ${location.floorNumber})` : 'Локація не вказана'}
                  </Text>
                </View>
                
                {filter === 'my' && item.status !== 'COMPLETED' && (
                  <Button
                    mode="contained"
                    icon="qrcode-scan"
                    onPress={() => openScanner(item.id)}
                    style={styles.scanButton}
                    buttonColor="#4CAF50"
                  >
                    Виконати (Сканувати QR)
                  </Button>
                )}
              </Card.Content>
            </Card>
          );
        }}
      />

      <Modal visible={scannerVisible} animationType="slide" transparent={false}>
        <View style={styles.cameraContainer}>
          <CameraView
            style={StyleSheet.absoluteFill}
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={handleBarcodeScanned}
          />
          <View style={styles.cameraOverlay}>
            <View style={styles.scanFrame} />
            <Text style={styles.scanText}>Наведіть камеру на QR-код рослини</Text>
            {isProcessingQr && <ActivityIndicator size="large" color="#4CAF50" style={{ marginTop: 20 }} />}
            <Button 
              mode="contained" 
              onPress={() => {
                setScannerVisible(false);
                setScanningTaskId(null);
                setIsProcessingQr(false);
              }}
              style={styles.closeCameraButton}
              buttonColor="#F44336"
              disabled={isProcessingQr}
            >
              Скасувати
            </Button>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, fontWeight: 'bold', color: '#2E7D32' },
  filterContainer: { paddingHorizontal: 16, paddingBottom: 16 },
  list: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { marginBottom: 12, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  roleChip: { backgroundColor: '#E8F5E9' },
  taskType: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  description: { fontSize: 14, color: '#666', marginTop: 4 },
  divider: { marginVertical: 12 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  infoText: { marginLeft: 8, fontSize: 15, color: '#333' },
  emptyText: { textAlign: 'center', marginTop: 20, color: 'gray' },
  scanButton: { marginTop: 12 },
  cameraContainer: { flex: 1, backgroundColor: 'black' },
  cameraOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.6)' },
  scanFrame: { width: 250, height: 250, borderColor: '#4CAF50', borderWidth: 4, borderRadius: 16, backgroundColor: 'transparent' },
  scanText: { color: 'white', fontSize: 16, marginTop: 20, fontWeight: 'bold', textAlign: 'center' },
  closeCameraButton: { marginTop: 40, width: 200 }
});