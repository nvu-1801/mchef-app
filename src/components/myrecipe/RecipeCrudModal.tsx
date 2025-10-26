// components/RecipeCrudModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

type Diet = 'veg' | 'nonveg';

export type RecipeForm = {
  title: string;
  summary?: string;
  cover?: string;
  category_id?: string;
  servings?: number | null;
  time_minutes?: number | null;
  diet?: Diet | null;
  published?: boolean;
};

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  initial?: Partial<RecipeForm>;
  onClose: () => void;
  onSubmit: (data: RecipeForm) => Promise<void>;
  onDelete?: () => Promise<void>;
  titleText?: string;
};

export function RecipeCrudModal({
  visible,
  mode,
  initial,
  onClose,
  onSubmit,
  onDelete,
  titleText,
}: Props) {
  const [form, setForm] = useState<RecipeForm>({
    title: '',
    summary: '',
    cover: '',
    category_id: '',
    servings: null,
    time_minutes: null,
    diet: null,
    published: false,
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const header =
    titleText ?? (mode === 'create' ? 'Create Recipe' : 'Edit Recipe');

  useEffect(() => {
    setForm({
      title: initial?.title ?? '',
      summary: initial?.summary ?? '',
      cover: initial?.cover ?? '',
      category_id: initial?.category_id ?? '',
      servings: initial?.servings ?? null,
      time_minutes: initial?.time_minutes ?? null,
      diet: (initial?.diet as Diet | null) ?? null,
      published: initial?.published ?? false,
    });
  }, [initial, visible, mode]);

  const canSubmit = useMemo(() => {
    if (!form.title?.trim()) return false;
    if (form.servings != null && form.servings < 0) return false;
    if (form.time_minutes != null && form.time_minutes < 0) return false;
    return true;
  }, [form]);

  const update = <K extends keyof RecipeForm>(k: K, v: RecipeForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    try {
      setLoading(true);
      await onSubmit({
        ...form,
        title: form.title.trim(),
        summary: form.summary?.trim(),
        cover: form.cover?.trim(),
        category_id: form.category_id?.trim(),
      });
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Submit failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!onDelete || deleting) return;
    try {
      setDeleting(true);
      await onDelete();
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e?.message ?? 'Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          {/* Decorative top bar */}
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerLabel}>Recipe Manager</Text>
              <Text style={styles.header}>{header}</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Feather name="edit-3" size={12} color="#16a34a" /> Title *
              </Text>
              <View style={[styles.inputWrapper, styles.inputFocusable]}>
                <TextInput
                  value={form.title}
                  onChangeText={(t) => update('title', t)}
                  placeholder="e.g. Grilled Salmon with Herbs"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Feather name="file-text" size={12} color="#16a34a" /> Summary
              </Text>
              <View style={[styles.inputWrapper, styles.textareaWrapper]}>
                <TextInput
                  value={form.summary ?? ''}
                  onChangeText={(t) => update('summary', t)}
                  placeholder="A brief description of your delicious creation..."
                  placeholderTextColor="#9ca3af"
                  style={[styles.input, styles.textarea]}
                  multiline
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Feather name="image" size={12} color="#16a34a" /> Cover Image
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={form.cover ?? ''}
                  onChangeText={(t) => update('cover', t)}
                  placeholder="https://example.com/image.jpg"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Feather name="tag" size={12} color="#16a34a" /> Category
              </Text>
              <View style={styles.inputWrapper}>
                <TextInput
                  value={form.category_id ?? ''}
                  onChangeText={(t) => update('category_id', t)}
                  placeholder="Category ID"
                  placeholderTextColor="#9ca3af"
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 8 }]}>
                <Text style={styles.label}>
                  <Feather name="users" size={12} color="#16a34a" /> Servings
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={form.servings != null ? String(form.servings) : ''}
                    onChangeText={(t) =>
                      update('servings', t ? Number(t) : null)
                    }
                    placeholder="4"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
              <View style={[styles.col, { marginLeft: 8 }]}>
                <Text style={styles.label}>
                  <Feather name="clock" size={12} color="#16a34a" /> Time (min)
                </Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    value={
                      form.time_minutes != null ? String(form.time_minutes) : ''
                    }
                    onChangeText={(t) =>
                      update('time_minutes', t ? Number(t) : null)
                    }
                    placeholder="30"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                    keyboardType="number-pad"
                  />
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                <Feather name="heart" size={12} color="#16a34a" /> Diet
                Preference
              </Text>
              <View style={styles.pillRow}>
                {(['veg', 'nonveg'] as Diet[]).map((d) => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.pill, form.diet === d && styles.pillActive]}
                    onPress={() => update('diet', form.diet === d ? null : d)}
                  >
                    <Feather
                      name={form.diet === d ? 'check-circle' : 'circle'}
                      size={16}
                      color={form.diet === d ? '#16a34a' : '#9ca3af'}
                      style={{ marginRight: 8 }}
                    />
                    <Text
                      style={[
                        styles.pillText,
                        form.diet === d && styles.pillTextActive,
                      ]}
                    >
                      {d === 'veg' ? 'Vegetarian' : 'Non-vegetarian'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.publishCard}>
              <View style={styles.publishIcon}>
                <Feather name="globe" size={20} color="#16a34a" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.publishTitle}>Publish Recipe</Text>
                <Text style={styles.publishHint}>Share with the community</Text>
              </View>
              <Switch
                value={!!form.published}
                onValueChange={(v) => update('published', v)}
                trackColor={{ false: '#d1d5db', true: '#86efac' }}
                thumbColor={form.published ? '#16a34a' : '#f3f4f6'}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {mode === 'edit' && onDelete ? (
              <TouchableOpacity
                style={styles.deleteBtn}
                onPress={handleDelete}
                disabled={deleting}
              >
                {deleting ? (
                  <ActivityIndicator size="small" color="#dc2626" />
                ) : (
                  <>
                    <Feather name="trash-2" size={18} color="#dc2626" />
                    <Text style={styles.deleteText}>Delete</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View />
            )}

            <TouchableOpacity
              style={[
                styles.primaryBtn,
                (!canSubmit || loading) && styles.disabled,
              ]}
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
            >
              <LinearGradient
                colors={['#16a34a', '#15803d']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Feather
                      name={mode === 'create' ? 'plus-circle' : 'check-circle'}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.primaryText}>
                      {mode === 'create' ? 'Create Recipe' : 'Save Changes'}
                    </Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 8,
    maxHeight: '92%',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0fdf4',
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingBottom: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 10,
  },
  inputWrapper: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  inputFocusable: {
    borderColor: '#d1fae5',
  },
  textareaWrapper: {
    paddingVertical: 12,
  },
  input: {
    fontSize: 15,
    color: '#111827',
    paddingVertical: 12,
  },
  textarea: {
    height: 90,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  col: {
    flex: 1,
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#fafafa',
  },
  pillActive: {
    backgroundColor: '#f0fdf4',
    borderColor: '#86efac',
  },
  pillText: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '600',
  },
  pillTextActive: {
    color: '#16a34a',
    fontWeight: '700',
  },
  publishCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#d1fae5',
  },
  publishIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  publishTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  publishHint: {
    fontSize: 13,
    color: '#6b7280',
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0fdf4',
  },
  primaryBtn: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#16a34a',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  gradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingVertical: 16,
    gap: 10,
  },
  disabled: {
    opacity: 0.5,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: '#fef2f2',
    borderWidth: 2,
    borderColor: '#fecaca',
    gap: 8,
  },
  deleteText: {
    color: '#dc2626',
    fontWeight: '700',
    fontSize: 15,
  },
});
