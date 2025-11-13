import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
  name: string;
  avatar: string;
  email?: string;
  location?: string;
  role?: string;
  bio?: string;
  skills?: string[];
  onSettings?: () => void;
  onSignOut?: () => void;
  onMyRecipes?: () => void;
  onNew?: () => void;
};

export default function ProfileHeader({
  name,
  avatar,
  email,
  location,
  role,
  bio,
  skills = [],
  onSettings,
  onSignOut,
  onMyRecipes,
  onNew,
}: Props) {
  return (
    <LinearGradient
      colors={['#e6f8f0', '#ffffff']}
      style={styles.headerGradient}
    >
      <View style={styles.headerInner}>
        <TouchableOpacity onPress={onSettings} style={styles.iconBtn}>
          <Ionicons name="settings-outline" size={20} color="#065f46" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onSignOut}
          style={[styles.iconBtn, { backgroundColor: '#fff0f0' }]}
        >
          <Feather name="log-out" size={18} color="#ef4444" />
        </TouchableOpacity>
      </View>

      <View style={styles.profileTop}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.titleCol}>
          <Text style={styles.name}>{name}</Text>
          {!!email && <Text style={styles.email}>{email}</Text>}
          {!!location && (
            <View style={styles.locationRow}>
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text style={styles.locationText}>{location}</Text>
            </View>
          )}
          {!!role && <Text style={styles.roleText}>{role.toUpperCase()}</Text>}
        </View>
      </View>

      <Text style={styles.bio} numberOfLines={3}>
        {bio}
      </Text>

      {skills.length > 0 && (
        <View style={styles.skillsRow}>
          {skills.slice(0, 4).map((s) => (
            <View key={s} style={styles.skillChip}>
              <Text style={styles.skillText}>{s}</Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={onMyRecipes} style={styles.primaryBtn}>
          <Text style={styles.primaryBtnText}>My Recipes</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onNew} style={styles.ghostBtn}>
          <Feather name="plus" size={18} color="#065f46" />
          <Text style={styles.ghostBtnText}>New</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  headerGradient: {
    paddingHorizontal: 16,
    paddingBottom: 18,
    paddingTop: 18,
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginBottom: 12,
  },
  headerInner: { flexDirection: 'row', justifyContent: 'space-between' },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#e6f6ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileTop: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#ffffff',
    marginRight: 12,
    backgroundColor: '#fff',
  },
  titleCol: { flex: 1 },
  name: { fontSize: 20, fontWeight: '800', color: '#052e16' },
  email: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  locationRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  locationText: { marginLeft: 6, color: '#6b7280' },
  roleText: { marginTop: 6, color: '#065f46', fontWeight: '700', fontSize: 12 },
  bio: { marginTop: 10, color: '#475569', lineHeight: 20 },
  skillsRow: { flexDirection: 'row', gap: 8, marginTop: 10, flexWrap: 'wrap' },
  skillChip: {
    backgroundColor: '#eef6f1',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  skillText: { color: '#065f46', fontWeight: '700', fontSize: 12 },
  actionRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  primaryBtn: {
    flex: 1,
    backgroundColor: '#16a34a',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: { color: '#fff', fontWeight: '700' },
  ghostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    borderColor: '#d1fae5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  ghostBtnText: { color: '#065f46', fontWeight: '700' },
});
