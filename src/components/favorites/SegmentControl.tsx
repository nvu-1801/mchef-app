import React from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';

export default function SegmentControl({
  segments,
  activeIndex,
  onChange,
}: {
  segments: { id: string; label: string }[];
  activeIndex: number;
  onChange: (index: number) => void;
}) {
  const indX = React.useRef(new Animated.Value(activeIndex)).current;

  React.useEffect(() => {
    Animated.spring(indX, {
      toValue: activeIndex,
      bounciness: 8,
      useNativeDriver: false,
    }).start();
  }, [activeIndex, indX]);

  return (
    <View style={styles.wrap}>
      <View style={styles.track}>
        <Animated.View
          style={[
            styles.indicator,
            {
              left: indX.interpolate({
                inputRange: [0, 1],
                outputRange: ['2%', '50.5%'],
              }),
            },
          ]}
        />
        {segments.map((s, i) => (
          <TouchableOpacity
            key={s.id}
            style={styles.btn}
            onPress={() => onChange(i)}
          >
            <Text style={[styles.text, activeIndex === i && styles.textActive]}>
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, marginTop: 8 },
  track: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e6edf6',
    flexDirection: 'row',
    position: 'relative',
    padding: 2,
  },
  indicator: {
    position: 'absolute',
    top: 2,
    width: '47.5%',
    height: '92%',
    backgroundColor: '#2563EB',
    borderRadius: 14,
    zIndex: 0,
  },
  btn: { width: '50%', paddingVertical: 10, alignItems: 'center', zIndex: 1 },
  text: { color: '#52606d', fontWeight: '700' },
  textActive: { color: '#fff' },
});
