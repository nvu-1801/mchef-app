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
  onSubmit: (data: RecipeForm) => Promise<void>; // bạn truyền hàm create/update vào đây
  onDelete?: () => Promise<void>;                // optional: hiển thị khi edit
  titleText?: string;                            // custom header
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
  const header = titleText ?? (mode === 'create' ? 'Create Recipe' : 'Edit Recipe');

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
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior={Platform.select({ ios: 'padding', android: undefined })}
        style={styles.overlay}
      >
        <View style={styles.sheet}>
          <View style={styles.headerRow}>
            <Text style={styles.header}>{header}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
            <Text style={styles.label}>Title *</Text>
            <TextInput
              value={form.title}
              onChangeText={(t) => update('title', t)}
              placeholder="e.g. Grilled Chicken"
              style={styles.input}
            />

            <Text style={styles.label}>Summary</Text>
            <TextInput
              value={form.summary ?? ''}
              onChangeText={(t) => update('summary', t)}
              placeholder="Short description"
              style={[styles.input, styles.textarea]}
              multiline
            />

            <Text style={styles.label}>Cover URL</Text>
            <TextInput
              value={form.cover ?? ''}
              onChangeText={(t) => update('cover', t)}
              placeholder="https://..."
              style={styles.input}
              autoCapitalize="none"
            />

            <Text style={styles.label}>Category ID</Text>
            <TextInput
              value={form.category_id ?? ''}
              onChangeText={(t) => update('category_id', t)}
              placeholder="category id"
              style={styles.input}
              autoCapitalize="none"
            />

            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 8 }]}>
                <Text style={styles.label}>Servings</Text>
                <TextInput
                  value={form.servings != null ? String(form.servings) : ''}
                  onChangeText={(t) => update('servings', t ? Number(t) : null)}
                  placeholder="e.g. 2"
                  style={styles.input}
                  keyboardType="number-pad"
                />
              </View>
              <View style={[styles.col, { marginLeft: 8 }]}>
                <Text style={styles.label}>Time (minutes)</Text>
                <TextInput
                  value={form.time_minutes != null ? String(form.time_minutes) : ''}
                  onChangeText={(t) => update('time_minutes', t ? Number(t) : null)}
                  placeholder="e.g. 15"
                  style={styles.input}
                  keyboardType="number-pad"
                />
              </View>
            </View>

            <Text style={styles.label}>Diet</Text>
            <View style={styles.pillRow}>
              {(['veg', 'nonveg'] as Diet[]).map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.pill,
                    form.diet === d && styles.pillActive,
                  ]}
                  onPress={() => update('diet', form.diet === d ? null : d)}
                >
                  <Text style={[styles.pillText, form.diet === d && styles.pillTextActive]}>
                    {d === 'veg' ? 'Veg' : 'Non-veg'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={[styles.row, { alignItems: 'center', marginTop: 8 }]}>
              <Text style={[styles.label, { marginBottom: 0, flex: 1 }]}>Published</Text>
              <Switch
                value={!!form.published}
                onValueChange={(v) => update('published', v)}
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            {mode === 'edit' && onDelete ? (
              <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={deleting}>
                {deleting ? <ActivityIndicator /> : <Text style={styles.deleteText}>Delete</Text>}
              </TouchableOpacity>
            ) : (
              <View />
            )}

            <TouchableOpacity
              style={[styles.primaryBtn, !canSubmit || loading ? styles.disabled : null]}
              onPress={handleSubmit}
              disabled={!canSubmit || loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : (
                <Text style={styles.primaryText}>{mode === 'create' ? 'Create' : 'Save'}</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 16,
    paddingTop: 12,
    maxHeight: '90%',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  header: { fontSize: 18, fontWeight: '700', flex: 1 },
  closeBtn: { padding: 8 },
  closeText: { fontSize: 18 },
  label: { fontSize: 13, color: '#4b5563', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 10, padding: 10, fontSize: 14, backgroundColor: '#fff',
  },
  textarea: { height: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row' },
  col: { flex: 1 },
  pillRow: { flexDirection: 'row' },
  pill: {
    borderWidth: 1, borderColor: '#e5e7eb', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, marginRight: 8,
  },
  pillActive: { backgroundColor: '#eef6f1', borderColor: '#c7e2d3' },
  pillText: { color: '#111827', fontSize: 13 },
  pillTextActive: { fontWeight: '700', color: '#065f46' },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12 },
  primaryBtn: { backgroundColor: '#111827', paddingHorizontal: 18, paddingVertical: 12, borderRadius: 12 },
  disabled: { opacity: 0.6 },
  primaryText: { color: '#fff', fontWeight: '700' },
  deleteBtn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12, backgroundColor: '#fff0f0' },
  deleteText: { color: '#dc2626', fontWeight: '700' },
});
