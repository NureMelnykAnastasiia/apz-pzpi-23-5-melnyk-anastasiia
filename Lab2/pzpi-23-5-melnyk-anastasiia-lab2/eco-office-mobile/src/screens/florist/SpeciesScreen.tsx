import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Alert,
  ScrollView,
} from 'react-native';

import {
  Text,
  Card,
  Button,
  Portal,
  Modal,
  TextInput,
  Title,
  IconButton,
} from 'react-native-paper';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiService, PlantSpecies } from '../../api/services/apiService';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export const SpeciesScreen = () => {
  const queryClient = useQueryClient();

  const [isModalVisible, setModalVisible] = useState(false);
  const [editingSpecies, setEditingSpecies] = useState<PlantSpecies | null>(null);

  const [commonName, setCommonName] = useState('');
  const [scientificName, setScientificName] = useState('');
  const [desc, setDesc] = useState('');

  const [minMoisture, setMinMoisture] = useState('');
  const [maxMoisture, setMaxMoisture] = useState('');

  const [minTemp, setMinTemp] = useState('');
  const [maxTemp, setMaxTemp] = useState('');

  const [minLux, setMinLux] = useState('');
  const [maxLux, setMaxLux] = useState('');

  const [waterFreq, setWaterFreq] = useState('');
  const [fertFreq, setFertFreq] = useState('');

  const { data: species = [], isLoading } = useQuery({
    queryKey: ['species'],
    queryFn: apiService.getSpecies,
  });

  const saveMutation = useMutation({
    mutationFn: (data: Partial<PlantSpecies>) =>
      editingSpecies
        ? apiService.updateSpecies({ id: editingSpecies.id, data })
        : apiService.createSpecies(data),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['species'] });
      closeModal();
      Alert.alert('Успіх', 'Дані збережено!');
    },

    onError: () =>
      Alert.alert('Помилка', 'Не вдалося зберегти дані'),
  });

  const openModal = (item?: PlantSpecies) => {
    if (item) {
      setEditingSpecies(item);

      setCommonName(item.commonName);
      setScientificName(item.scientificName);
      setDesc(item.description || '');

      setMinMoisture(item.minSoilMoisture?.toString() || '');
      setMaxMoisture(item.maxSoilMoisture?.toString() || '');

      setMinTemp(item.minTemperature?.toString() || '');
      setMaxTemp(item.maxTemperature?.toString() || '');

      setMinLux(item.minLightLux?.toString() || '');
      setMaxLux(item.maxLightLux?.toString() || '');

      setWaterFreq(item.wateringFrequencyDays?.toString() || '');
      setFertFreq(item.fertilizingFrequencyDays?.toString() || '');
    } else {
      setEditingSpecies(null);

      setCommonName('');
      setScientificName('');
      setDesc('');

      setMinMoisture('');
      setMaxMoisture('');

      setMinTemp('');
      setMaxTemp('');

      setMinLux('');
      setMaxLux('');

      setWaterFreq('');
      setFertFreq('');
    }

    setModalVisible(true);
  };

  const closeModal = () => setModalVisible(false);

  const handleSave = () => {
    if (!commonName || !scientificName || !minMoisture || !maxMoisture) {
      return Alert.alert('Увага', 'Заповніть обов’язкові поля');
    }

    const payload: Partial<PlantSpecies> = {
      commonName,
      scientificName,
      description: desc,

      minSoilMoisture: Number(minMoisture),
      maxSoilMoisture: Number(maxMoisture),

      ...(minTemp && { minTemperature: Number(minTemp) }),
      ...(maxTemp && { maxTemperature: Number(maxTemp) }),

      ...(minLux && { minLightLux: Number(minLux) }),
      ...(maxLux && { maxLightLux: Number(maxLux) }),

      ...(waterFreq && { wateringFrequencyDays: Number(waterFreq) }),
      ...(fertFreq && { fertilizingFrequencyDays: Number(fertFreq) }),
    };

    saveMutation.mutate(payload);
  };

  return (
    <View style={styles.container}>

      <View style={styles.header}>
        <Text style={styles.title}>Довідник рослин</Text>

        <Button
          mode="contained"
          onPress={() => openModal()}
          buttonColor="#2E7D32"
          icon="plus"
        >
          Новий
        </Button>
      </View>

      <FlatList
        data={species}
        keyExtractor={(item) => item.id}
        refreshing={isLoading}
        onRefresh={() =>
          queryClient.invalidateQueries({ queryKey: ['species'] })
        }
        contentContainerStyle={{
          paddingBottom: 20,
        }}
        renderItem={({ item }) => (
          <Card style={styles.card} onPress={() => openModal(item)}>
            <Card.Content style={styles.cardRow}>

              <View style={{ flex: 1 }}>
                <Text style={styles.commonName}>{item.commonName}</Text>
                <Text style={styles.scientificName}>
                  {item.scientificName}
                </Text>

                <View style={styles.tagsContainer}>

                  <View style={styles.tag}>
                    <MaterialCommunityIcons
                      name="water-percent"
                      size={16}
                      color="#0288D1"
                    />
                    <Text style={styles.tagText}>
                      {item.minSoilMoisture}-{item.maxSoilMoisture}%
                    </Text>
                  </View>

                  {(item.minTemperature || item.maxTemperature) && (
                    <View style={[styles.tag, { backgroundColor: '#FFF3E0' }]}>
                      <MaterialCommunityIcons
                        name="thermometer"
                        size={16}
                        color="#F57C00"
                      />
                      <Text
                        style={[styles.tagText, { color: '#F57C00' }]}
                      >
                        {item.minTemperature}-{item.maxTemperature}°C
                      </Text>
                    </View>
                  )}

                  {item.wateringFrequencyDays && (
                    <View style={[styles.tag, { backgroundColor: '#E8F5E9' }]}>
                      <MaterialCommunityIcons
                        name="watering-can"
                        size={16}
                        color="#388E3C"
                      />
                      <Text
                        style={[styles.tagText, { color: '#388E3C' }]}
                      >
                        {item.wateringFrequencyDays} днів
                      </Text>
                    </View>
                  )}

                </View>
              </View>

              <IconButton
                icon="pencil"
                iconColor="#2196F3"
                onPress={() => openModal(item)}
              />

            </Card.Content>
          </Card>
        )}
      />

      <Portal>
        <Modal
          visible={isModalVisible}
          onDismiss={closeModal}
          contentContainerStyle={styles.modalContent}
        >

          <Title style={styles.modalTitle}>
            {editingSpecies ? 'Редагувати вид' : 'Новий вид'}
          </Title>

          <ScrollView>

            <TextInput
              label="Назва*"
              value={commonName}
              onChangeText={setCommonName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Наукова назва*"
              value={scientificName}
              onChangeText={setScientificName}
              mode="outlined"
              style={styles.input}
            />

            <TextInput
              label="Опис"
              value={desc}
              onChangeText={setDesc}
              mode="outlined"
              multiline
              style={styles.input}
            />

            <Text style={styles.sectionLabel}>
              Норми показників
            </Text>

            <View style={styles.row}>
              <TextInput
                label="Мін. вологість"
                value={minMoisture}
                onChangeText={setMinMoisture}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { flex: 1 }]}
              />

              <TextInput
                label="Макс."
                value={maxMoisture}
                onChangeText={setMaxMoisture}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Темп. мін"
                value={minTemp}
                onChangeText={setMinTemp}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { flex: 1 }]}
              />

              <TextInput
                label="Темп. макс"
                value={maxTemp}
                onChangeText={setMaxTemp}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Світло мін"
                value={minLux}
                onChangeText={setMinLux}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { flex: 1 }]}
              />

              <TextInput
                label="Світло макс"
                value={maxLux}
                onChangeText={setMaxLux}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
              />
            </View>

            <View style={styles.row}>
              <TextInput
                label="Полив (дні)"
                value={waterFreq}
                onChangeText={setWaterFreq}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { flex: 1 }]}
              />

              <TextInput
                label="Добриво"
                value={fertFreq}
                onChangeText={setFertFreq}
                keyboardType="numeric"
                mode="outlined"
                style={[styles.input, { flex: 1, marginLeft: 8 }]}
              />
            </View>

            <Button
              mode="contained"
              onPress={handleSave}
              loading={saveMutation.isPending}
              buttonColor="#4CAF50"
              style={{ marginTop: 10 }}
            >
              Зберегти
            </Button>

          </ScrollView>

        </Modal>
      </Portal>

    </View>
  );
};

const styles = StyleSheet.create({
container: { flex: 1, backgroundColor: '#F5F5F5', padding: 16 },
header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 40, marginBottom: 16 },
title: { fontWeight: 'bold', color: '#2E7D32' },
card: { marginBottom: 12, backgroundColor: '#fff' },
cardRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
commonName: { fontSize: 18, fontWeight: 'bold', color: '#333' },
scientificName: { fontSize: 14, color: '#666', fontStyle: 'italic', marginBottom: 8 },
tagsContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
tag: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E1F5FE', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
tagText: { color: '#0288D1', fontSize: 12, marginLeft: 4, fontWeight: 'bold' },
modalContent: { backgroundColor: 'white', padding: 20, margin: 20, borderRadius: 12, maxHeight: '90%' },
modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
input: { marginBottom: 12, backgroundColor: '#fff' },
row: { flexDirection: 'row', justifyContent: 'space-between' },
sectionLabel: { fontSize: 14, fontWeight: 'bold', color: '#666', marginTop: 8, marginBottom: 8 }
});