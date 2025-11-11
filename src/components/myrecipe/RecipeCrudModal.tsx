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
import { supabaseNative } from '@/src/libs/supabase/supabase-native';
import ImagePreview from '@/src/components/common/ImagePreview';
import CategorySelect from '@/src/components/categories/CategorySelect';

type Diet = 'veg' | 'nonveg';

export type RecipeStepInput = {
  step_no: number;
  content: string;
  image_url?: string | null;
};

export type IngredientInput = {
  ingredient: string;
  amount: number | null;
  note?: string | null;
};

export type RecipeForm = {
  title: string; // hiển thị label "Food name"
  slug?: string; // ẩn khỏi UI, auto-generate
  summary?: string | null;
  cover_image_url?: string | null;
  category_id?: string; // chọn từ dropdown
  servings?: number | null;
  time_minutes?: number | null;
  diet?: Diet | null;
  tips?: string | null;
  published?: boolean;

  recipe_steps: RecipeStepInput[];
  dish_ingredients: IngredientInput[];
};

type Category = { id: string; name: string; slug: string };

type Props = {
  visible: boolean;
  mode: 'create' | 'edit';
  initial?: Partial<RecipeForm>;
  onClose: () => void;
  onSubmit: (data: RecipeForm) => Promise<void>;
  onDelete?: () => Promise<void>;
  titleText?: string;
};

/* ===================== helpers ===================== */
function slugifyVI(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // bỏ dấu
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // non-alnum -> -
    .replace(/^-+|-+$/g, '') // trim -
    .replace(/-+/g, '-'); // collapse --
}

function FieldGroup({
  label,
  labelIcon,
  children,
}: {
  label: string;
  labelIcon: any;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        <Feather name={labelIcon} size={12} color="#16a34a" /> {label}
      </Text>
      <View style={styles.inputWrapper}>{children}</View>
    </View>
  );
}

function Input(
  props: React.ComponentProps<typeof TextInput> & { multiline?: boolean },
) {
  const { style, multiline, ...rest } = props;
  return (
    <TextInput
      {...rest}
      placeholderTextColor="#9ca3af"
      style={[styles.input, multiline && styles.textarea, style]}
      multiline={multiline}
    />
  );
}

function SmallLabel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: any;
}) {
  return <Text style={[styles.smallLabel, style]}>{children}</Text>;
}

function SectionTitle({ icon, text }: { icon: any; text: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
        marginTop: 10,
      }}
    >
      <Feather name={icon} size={14} color="#16a34a" />
      <Text
        style={{
          fontWeight: '800',
          fontSize: 16,
          marginLeft: 6,
          color: '#111827',
        }}
      >
        {text}
      </Text>
    </View>
  );
}

function AddButton({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.addBtn} onPress={onPress}>
      <Feather name="plus" size={16} color="#16a34a" />
      <Text style={styles.addBtnText}>{label}</Text>
    </TouchableOpacity>
  );
}

function IconButton({
  icon,
  onPress,
  color = '#6b7280',
}: {
  icon: any;
  onPress: () => void;
  color?: string;
}) {
  return (
    <TouchableOpacity onPress={onPress} style={styles.iconBtn}>
      <Feather name={icon} size={18} color={color} />
    </TouchableOpacity>
  );
}

/* ===================== main ===================== */
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
    slug: '',
    summary: '',
    cover_image_url: '',
    category_id: '',
    servings: null,
    time_minutes: null,
    diet: null,
    tips: '',
    published: false,
    recipe_steps: [{ step_no: 1, content: '', image_url: null }],
    dish_ingredients: [{ ingredient: '', amount: null, note: '' }],
  });

  // categories state
  const [cats, setCats] = useState<Category[]>([]);
  const [catOpen, setCatOpen] = useState(false); // dropdown open/close
  const [catLoading, setCatLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const header =
    titleText ?? (mode === 'create' ? 'Create Recipe' : 'Edit Recipe');

  const update = <K extends keyof RecipeForm>(k: K, v: RecipeForm[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const setStep = (idx: number, patch: Partial<RecipeStepInput>) =>
    setForm((f) => {
      const next = [...f.recipe_steps];
      next[idx] = { ...next[idx], ...patch };
      return {
        ...f,
        recipe_steps: next.map((s, i) => ({ ...s, step_no: i + 1 })),
      };
    });

  const addStep = () =>
    setForm((f) => ({
      ...f,
      recipe_steps: [
        ...f.recipe_steps,
        { step_no: f.recipe_steps.length + 1, content: '', image_url: null },
      ],
    }));

  const removeStep = (idx: number) =>
    setForm((f) => {
      const next = f.recipe_steps
        .filter((_, i) => i !== idx)
        .map((s, i) => ({ ...s, step_no: i + 1 }));
      return {
        ...f,
        recipe_steps: next.length
          ? next
          : [{ step_no: 1, content: '', image_url: null }],
      };
    });

  const moveStep = (idx: number, dir: -1 | 1) =>
    setForm((f) => {
      const next = [...f.recipe_steps];
      const j = idx + dir;
      if (j < 0 || j >= next.length) return f;
      const tmp = next[idx];
      next[idx] = next[j];
      next[j] = tmp;
      return {
        ...f,
        recipe_steps: next.map((s, i) => ({ ...s, step_no: i + 1 })),
      };
    });

  const setIng = (idx: number, patch: Partial<IngredientInput>) =>
    setForm((f) => {
      const next = [...f.dish_ingredients];
      next[idx] = { ...next[idx], ...patch };
      return { ...f, dish_ingredients: next };
    });

  const addIng = () =>
    setForm((f) => ({
      ...f,
      dish_ingredients: [
        ...f.dish_ingredients,
        { ingredient: '', amount: null, note: '' },
      ],
    }));

  const removeIng = (idx: number) =>
    setForm((f) => {
      const next = f.dish_ingredients.filter((_, i) => i !== idx);
      return {
        ...f,
        dish_ingredients: next.length
          ? next
          : [{ ingredient: '', amount: null, note: '' }],
      };
    });

  // init from props + load categories
  useEffect(() => {
    if (!visible) return;

    // populate form
    const steps: RecipeStepInput[] = (
      initial?.recipe_steps?.length
        ? initial?.recipe_steps
        : [{ step_no: 1, content: '', image_url: null }]
    ) as RecipeStepInput[];

    const ings: IngredientInput[] = (
      initial?.dish_ingredients?.length
        ? initial?.dish_ingredients
        : [{ ingredient: '', amount: null, note: '' }]
    ) as IngredientInput[];

    setForm({
      title: initial?.title ?? '',
      slug: initial?.slug ?? '', // hidden, sẽ auto gen khi submit
      summary: initial?.summary ?? '',
      cover_image_url: initial?.cover_image_url ?? '',
      category_id: initial?.category_id ?? '',
      servings: initial?.servings ?? null,
      time_minutes: initial?.time_minutes ?? null,
      diet: (initial?.diet as Diet | null) ?? null,
      tips: initial?.tips ?? '',
      published: initial?.published ?? false,
      recipe_steps: steps
        .map((s, i) => ({
          step_no: s?.step_no ?? i + 1,
          content: s?.content ?? '',
          image_url: s?.image_url ?? null,
        }))
        .sort((a, b) => (a.step_no ?? 0) - (b.step_no ?? 0))
        .map((s, i) => ({ ...s, step_no: i + 1 })),
      dish_ingredients: ings.map((g) => ({
        ingredient: g?.ingredient ?? '',
        amount: g?.amount ?? null,
        note: g?.note ?? '',
      })),
    });

    // load categories
    (async () => {
      try {
        setCatLoading(true);
        const { data, error } = await supabaseNative
          .from('categories')
          .select('id, name, slug')
          .order('name', { ascending: true });
        if (error) throw error;
        setCats(data ?? []);
      } catch (e) {
        console.error('Load categories failed:', e);
      } finally {
        setCatLoading(false);
      }
    })();
  }, [initial, visible, mode]);

  // validation
  const canSubmit = useMemo(() => {
    if (!form.title?.trim()) return false;
    if (form.servings != null && form.servings < 0) return false;
    if (form.time_minutes != null && form.time_minutes < 0) return false;
    if (!form.recipe_steps.some((s) => s.content.trim().length > 0))
      return false;
    for (const g of form.dish_ingredients) {
      if (g.ingredient.trim() && g.amount != null && g.amount < 0) return false;
    }
    return true;
  }, [form]);

  // submit
  const handleSubmit = async () => {
    if (!canSubmit || loading) return;
    try {
      setLoading(true);

      // Auto slug từ title (ẩn UI)
      const autoSlug = slugifyVI(form.title || '');

      const payload: RecipeForm = {
        ...form,
        title: form.title.trim(),
        slug: autoSlug || undefined, // ⬅️ nếu muốn server tự sinh, có thể xóa dòng này
        summary: form.summary?.trim() || null,
        cover_image_url: form.cover_image_url?.trim() || null,
        category_id: form.category_id?.trim() || undefined,
        tips: form.tips?.trim() || null,
        recipe_steps: form.recipe_steps
          .map((s, i) => ({
            step_no: i + 1,
            content: s.content.trim(),
            image_url: s.image_url?.trim?.() || null,
          }))
          .filter((s) => s.content.length > 0),
        dish_ingredients: form.dish_ingredients
          .map((g) => ({
            ingredient: g.ingredient.trim(),
            amount:
              g.amount === null || g.amount === undefined
                ? null
                : Number(g.amount),
            note: g.note?.trim() || null,
          }))
          .filter(
            (g) =>
              g.ingredient.length > 0 ||
              g.amount !== null ||
              (g.note && g.note.length > 0),
          ),
      };

      await onSubmit(payload);
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

  // render
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
          <View style={styles.handleBar} />

          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerLabel}>Recipe Manager</Text>
              <Text style={styles.header}>
                {titleText ??
                  (mode === 'create' ? 'Create Recipe' : 'Edit Recipe')}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Feather name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Food name (title) */}
            <FieldGroup labelIcon="edit-3" label="Food name *">
              <Input
                value={form.title}
                onChangeText={(t) => update('title', t)}
                placeholder="Sụn gà chiên"
              />
            </FieldGroup>

            {/* Cover Image URL + Preview */}
            <FieldGroup labelIcon="image" label="Cover Image URL">
              <Input
                value={form.cover_image_url ?? ''}
                onChangeText={(t) => update('cover_image_url', t)}
                placeholder="https://example.com/image.jpg"
                autoCapitalize="none"
              />
              <View style={{ marginTop: 10 }}>
                <ImagePreview uri={form.cover_image_url} height={180} />
              </View>
            </FieldGroup>

            {/* Category */}
            <FieldGroup labelIcon="tag" label="Category">
              <CategorySelect
                value={form.category_id ?? undefined}
                onChange={(id) => update('category_id', id)}
              />
            </FieldGroup>

            {/* Servings + Time */}
            <View style={styles.row}>
              <View style={[styles.col, { marginRight: 8 }]}>
                <FieldGroup labelIcon="users" label="Servings">
                  <Input
                    value={form.servings != null ? String(form.servings) : ''}
                    onChangeText={(t) =>
                      update('servings', t ? Number(t) : null)
                    }
                    placeholder="5"
                    keyboardType="number-pad"
                  />
                </FieldGroup>
              </View>
              <View style={[styles.col, { marginLeft: 8 }]}>
                <FieldGroup labelIcon="clock" label="Time (min)">
                  <Input
                    value={
                      form.time_minutes != null ? String(form.time_minutes) : ''
                    }
                    onChangeText={(t) =>
                      update('time_minutes', t ? Number(t) : null)
                    }
                    placeholder="30"
                    keyboardType="number-pad"
                  />
                </FieldGroup>
              </View>
            </View>

            {/* Diet */}
            <FieldGroup labelIcon="heart" label="Diet Preference">
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
            </FieldGroup>

            {/* Tips */}
            <FieldGroup labelIcon="info" label="Tips">
              <Input
                value={form.tips ?? ''}
                onChangeText={(t) => update('tips', t)}
                placeholder="Ướp 20 phút, chiên 30s"
              />
            </FieldGroup>

            {/* Publish */}
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

            {/* ===== Ingredients Editor ===== */}
            <SectionTitle icon="list" text="Ingredients" />
            {form.dish_ingredients.map((g, idx) => (
              <View key={idx} style={styles.cardRow}>
                <View style={[styles.col, { flex: 1.4, marginRight: 8 }]}>
                  <SmallLabel>Ingredient</SmallLabel>
                  <Input
                    value={g.ingredient}
                    onChangeText={(t) => setIng(idx, { ingredient: t })}
                    placeholder="Sụn gà"
                  />
                </View>
                <View style={[styles.col, { flex: 0.9, marginHorizontal: 8 }]}>
                  <SmallLabel>Amount</SmallLabel>
                  <Input
                    value={g.amount != null ? String(g.amount) : ''}
                    onChangeText={(t) =>
                      setIng(idx, {
                        amount: t ? Number(t.replace(',', '.')) : null,
                      })
                    }
                    placeholder="500"
                    keyboardType="decimal-pad"
                  />
                </View>
                <View style={[styles.col, { flex: 1.1, marginLeft: 8 }]}>
                  <SmallLabel>Unit/Note</SmallLabel>
                  <Input
                    value={g.note ?? ''}
                    onChangeText={(t) => setIng(idx, { note: t })}
                    placeholder="g / tbsp / tsp / chiên ngập..."
                  />
                </View>
                <View style={{ justifyContent: 'center', marginLeft: 6 }}>
                  <IconButton
                    icon="trash-2"
                    color="#dc2626"
                    onPress={() => removeIng(idx)}
                  />
                </View>
              </View>
            ))}
            <AddButton label="Add Ingredient" onPress={addIng} />

            {/* ===== Steps Editor ===== */}
            <SectionTitle icon="hash" text="Steps" />
            {form.recipe_steps.map((s, idx) => (
              <View key={idx} style={styles.stepCard}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text style={styles.stepBadge}>Step {idx + 1}</Text>
                  <View style={{ flexDirection: 'row', marginLeft: 'auto' }}>
                    <IconButton
                      icon="arrow-up"
                      onPress={() => moveStep(idx, -1)}
                    />
                    <IconButton
                      icon="arrow-down"
                      onPress={() => moveStep(idx, +1)}
                    />
                    <IconButton
                      icon="trash-2"
                      color="#dc2626"
                      onPress={() => removeStep(idx)}
                    />
                  </View>
                </View>
                <SmallLabel>Content</SmallLabel>
                <Input
                  multiline
                  value={s.content}
                  onChangeText={(t) => setStep(idx, { content: t })}
                  placeholder="Ướp sụn gà với nước mắm, tỏi băm, tiêu 20 phút."
                />
                <SmallLabel style={{ marginTop: 10 }}>
                  Image URL (optional)
                </SmallLabel>
                <Input
                  value={s.image_url ?? ''}
                  onChangeText={(t) => setStep(idx, { image_url: t })}
                  placeholder="https://example.com/step.jpg"
                  autoCapitalize="none"
                />
                <View style={{ marginTop: 10 }}>
                  <ImagePreview uri={s.image_url} height={140} />
                </View>
              </View>
            ))}
            <AddButton label="Add Step" onPress={addStep} />
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

/* ================== styles ================== */
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
    borderTopColor: '#f0fdf4',
    borderBottomColor: '#f0fdf4',
  },
  headerLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#16a34a',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  header: { fontSize: 24, fontWeight: '800', color: '#111827', marginTop: 4 },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f9fafb',
    alignItems: 'center',
    justifyContent: 'center',
  },

  scrollContent: { paddingBottom: 20 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 },
  inputWrapper: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#fafafa',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: { fontSize: 15, color: '#111827', paddingVertical: 12 },
  textarea: { minHeight: 90, textAlignVertical: 'top' },
  row: { flexDirection: 'row', marginBottom: 16 },
  col: { flex: 1 },

  // diet pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
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
  pillActive: { backgroundColor: '#f0fdf4', borderColor: '#86efac' },
  pillText: { color: '#6b7280', fontSize: 14, fontWeight: '600' },
  pillTextActive: { color: '#16a34a', fontWeight: '700' },

  // publish
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
  publishTitle: { fontSize: 16, fontWeight: '700', color: '#111827' },
  publishHint: { fontSize: 13, color: '#6b7280', marginTop: 2 },

  // footer
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
  disabled: { opacity: 0.5 },
  primaryText: { color: '#fff', fontWeight: '700', fontSize: 16 },
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
  deleteText: { color: '#dc2626', fontWeight: '700', fontSize: 15 },

  // extra
  smallLabel: { fontSize: 12, color: '#6b7280', marginBottom: 6 },
  cardRow: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 14,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 10,
  },
  addBtn: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#f0fdf4',
    borderWidth: 2,
    borderColor: '#d1fae5',
    marginBottom: 12,
    gap: 6,
  },
  addBtnText: { color: '#16a34a', fontWeight: '700' },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
  stepCard: {
    borderWidth: 2,
    borderColor: '#e5e7eb',
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 12,
    marginBottom: 10,
  },
  stepBadge: {
    fontWeight: '800',
    color: '#111827',
    backgroundColor: '#eefbf3',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
  },

  // category select
  selectBtn: {
    minHeight: 48,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: { color: '#111827', fontSize: 15 },
  optionPanel: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
    backgroundColor: '#fff',
    overflow: 'hidden',
  },
  optionItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionActive: { backgroundColor: '#f0fdf4' },
  optionText: { color: '#111827', fontSize: 15, fontWeight: '600' },
  optionTextActive: { color: '#16a34a' },
  optionSlug: { color: '#9ca3af', fontWeight: '400' },
});
