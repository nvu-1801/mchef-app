import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

type Segment = {
  id: string;
  label: string;
};

type Props = {
  segments: readonly Segment[];
  activeIndex: number;
  onChange: (index: number) => void;
};

export default function SegmentControl({
  segments,
  activeIndex,
  onChange,
}: Props) {
  return (
    <View style={styles.container}>
      {segments.map((seg, idx) => (
        <TouchableOpacity
          key={seg.id}
          style={[styles.segment, idx === activeIndex && styles.segmentActive]}
          onPress={() => onChange(idx)}
          activeOpacity={0.7}
        >
          {idx === activeIndex ? (
            <LinearGradient
              colors={['#16a34a', '#15803d']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.gradient}
            >
              <Text style={styles.textActive}>{seg.label}</Text>
            </LinearGradient>
          ) : (
            <Text style={styles.text}>{seg.label}</Text>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 4,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  segment: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentActive: {
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6b7280',
  },
  textActive: {
    fontSize: 14,
    fontWeight: '700',
    color: '#ffffff',
  },
});
