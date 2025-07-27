import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface ApiUsageDisplayProps {
  apiUsage: {
    requestsToday: number;
    lastRequestTime: number;
    dailyResetTime: number;
  };
  onClearCache?: () => void;
  style?: any;
}

export function ApiUsageDisplay({ apiUsage, onClearCache, style }: ApiUsageDisplayProps) {
  const maxRequests = 800; // Conservative daily limit
  const usagePercentage = Math.round((apiUsage.requestsToday / maxRequests) * 100);
  const remaining = maxRequests - apiUsage.requestsToday;
  
  // Calculate time until reset
  const hoursUntilReset = Math.ceil((apiUsage.dailyResetTime - Date.now()) / (1000 * 60 * 60));
  
  // Color based on usage
  const getUsageColor = () => {
    if (usagePercentage < 50) return '#4CAF50'; // Green
    if (usagePercentage < 80) return '#FF9800'; // Orange  
    return '#F44336'; // Red
  };

  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>📊 API Usage Today</Text>
      
      <View style={styles.usageBar}>
        <View 
          style={[
            styles.usageProgress, 
            { 
              width: `${Math.min(usagePercentage, 100)}%`,
              backgroundColor: getUsageColor()
            }
          ]} 
        />
      </View>
      
      <View style={styles.stats}>
        <Text style={styles.statText}>
          {apiUsage.requestsToday} / {maxRequests} requests ({usagePercentage}%)
        </Text>
        <Text style={styles.statText}>
          {remaining} requests remaining
        </Text>
        <Text style={styles.resetText}>
          Resets in {hoursUntilReset}h
        </Text>
      </View>
      
      {onClearCache && (
        <TouchableOpacity style={styles.clearButton} onPress={onClearCache}>
          <Text style={styles.clearButtonText}>🧹 Clear Cache</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
    padding: 12,
    margin: 8,
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  usageBar: {
    height: 6,
    backgroundColor: '#555',
    borderRadius: 3,
    marginBottom: 8,
    overflow: 'hidden',
  },
  usageProgress: {
    height: '100%',
    borderRadius: 3,
  },
  stats: {
    gap: 2,
  },
  statText: {
    color: '#fff',
    fontSize: 12,
  },
  resetText: {
    color: '#999',
    fontSize: 11,
    fontStyle: 'italic',
  },
  clearButton: {
    backgroundColor: '#444',
    padding: 8,
    borderRadius: 4,
    marginTop: 8,
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 12,
  },
});
