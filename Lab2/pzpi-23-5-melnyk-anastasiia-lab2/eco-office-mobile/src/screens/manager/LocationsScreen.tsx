import React, { useState } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { Text, Card, List, Badge } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { apiService } from '../../api/services/apiService';

export const LocationsScreen = () => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: locations = [], isLoading: isLoadingLocations } = useQuery({
    queryKey: ['locations'],
    queryFn: apiService.getLocations,
  });

  const { data: plants = [], isLoading: isLoadingPlants } = useQuery({
    queryKey: ['plants'],
    queryFn: apiService.getPlants,
  });

  const isLoading = isLoadingLocations || isLoadingPlants;

  const locationsWithPlants = locations.map(location => ({
    ...location,
    plants: plants.filter(plant => plant.locationId === location.id),
  }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'HEALTHY': return '#4CAF50';
      case 'NEEDS_ATTENTION': return '#FFC107';
      case 'CRITICAL': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderLocation = ({ item }: { item: typeof locationsWithPlants[0] }) => {
    const isExpanded = expandedId === item.id;
    const criticalPlantsCount = item.plants.filter(p => p.healthStatus !== 'HEALTHY').length;

    return (
      <Card style={styles.card}>
        <List.Accordion
          title={item.name}
          description={`Поверх: ${item.floorNumber} • Рослин: ${item.plants.length}`}
          left={props => <List.Icon {...props} icon="office-building" color="#2E7D32" />}
          right={props => (
            <View style={styles.badgeContainer}>
              {criticalPlantsCount > 0 && (
                <Badge style={styles.badge} size={24}>{criticalPlantsCount}</Badge>
              )}
              <MaterialCommunityIcons 
                name={isExpanded ? "chevron-up" : "chevron-down"} 
                size={24} 
                color="gray" 
              />
            </View>
          )}
          expanded={isExpanded}
          onPress={() => setExpandedId(isExpanded ? null : item.id)}
          style={styles.accordion}
        >
          {item.plants.length === 0 ? (
            <List.Item title="У цій кімнаті немає рослин" titleStyle={{ color: 'gray', fontSize: 14, marginLeft: 16 }} />
          ) : (
            item.plants.map(plant => (
              <List.Item
                key={plant.id}
                title={plant.name || 'Невідома рослина'}
                left={props => (
                  <MaterialCommunityIcons 
                    {...props} 
                    name="flower" 
                    size={24} 
                    color={getStatusColor(plant.healthStatus)} 
                    style={{ marginLeft: 16, marginRight: 8 }}
                  />
                )}
                right={() => (
                  <Text style={{ alignSelf: 'center', color: getStatusColor(plant.healthStatus), fontSize: 12 }}>
                    {plant.healthStatus === 'HEALTHY' ? 'ОК' : 'Увага'}
                  </Text>
                )}
              />
            ))
          )}
        </List.Accordion>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={{ marginTop: 10 }}>Завантаження даних...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>Локації та Кімнати</Text>
      <FlatList
        data={locationsWithPlants}
        keyExtractor={item => item.id}
        renderItem={renderLocation}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.emptyText}>Локацій не знайдено</Text>}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F5F5' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { paddingTop: 50, paddingHorizontal: 16, paddingBottom: 16, fontWeight: 'bold', color: '#2E7D32' },
  listContainer: { paddingHorizontal: 16, paddingBottom: 20 },
  card: { marginBottom: 12, backgroundColor: '#fff', overflow: 'hidden' },
  accordion: { backgroundColor: '#fff' },
  badgeContainer: { flexDirection: 'row', alignItems: 'center' },
  badge: { backgroundColor: '#F44336', marginRight: 8 },
  emptyText: { textAlign: 'center', marginTop: 20, color: 'gray' }
});