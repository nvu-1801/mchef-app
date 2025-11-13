import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const PLANS = [
  {
    id: '794f552b-06d1-4a40-a5db-7e5b8f1e05ab',
    title: 'Premium 1 Tháng',
    description: 'Truy cập không giới hạn các video nấu ăn',
    amount: '99000.00',
    currency: 'VND',
    duration_days: 30,
    features: ['Xem video HD', 'Lưu recipe yêu thích', 'Nhận thông báo'],
    active: true,
    display_order: 1,
  },
  {
    id: 'b1cd042c-442f-4394-877c-223900054d58',
    title: 'Premium 3 Tháng',
    description: 'Tiết kiệm khi mua gói 3 tháng',
    amount: '249000.00',
    currency: 'VND',
    duration_days: 90,
    features: [
      'Xem video HD',
      'Lưu recipe yêu thích',
      'Nhận thông báo',
      'Hỗ trợ ưu tiên',
    ],
    active: true,
    display_order: 2,
  },
  {
    id: '9cc66c55-731c-4fbb-868d-78faae1f3250',
    title: 'Premium 1 Năm',
    description: 'Tiết kiệm tối đa với gói 1 năm',
    amount: '799000.00',
    currency: 'VND',
    duration_days: 365,
    features: [
      'Xem video HD',
      'Lưu recipe yêu thích',
      'Nhận thông báo',
      'Hỗ trợ ưu tiên',
      'Nội dung độc quyền',
    ],
    active: true,
    display_order: 3,
  },
];

function formatCurrency(amount: string, currency = 'VND') {
  const n = Number(amount) || 0;
  // show as "799.000 ₫"
  return n.toLocaleString('vi-VN') + ' ₫';
}

export default function PremiumScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  const onSelectPlan = (plan: any) => {
    setSelectedId(plan.id);
    Alert.alert(
      'Xác nhận',
      `Bạn chọn "${plan.title}" - ${formatCurrency(plan.amount)}. Tiếp tục?`,
      [
        { text: 'Huỷ', style: 'cancel', onPress: () => setSelectedId(null) },
        {
          text: 'Mua',
          onPress: () => {
            // Placeholder - integrate payment logic here
            Alert.alert('Thành công', 'Giả lập thanh toán hoàn tất');
            router.back();
          },
        },
      ],
    );
  };

  const renderPlan = ({ item }: { item: (typeof PLANS)[0] }) => {
    const recommended = item.display_order === 3; // highlight annual plan
    return (
      <View style={[styles.cardWrap]}>
        <LinearGradient
          colors={recommended ? ['#fff8f0', '#fff'] : ['#ffffff', '#f8fafc']}
          style={[styles.card, recommended && styles.recommendedCard]}
        >
          <View style={styles.cardHeader}>
            <View style={styles.titleBlock}>
              <Text style={styles.planTitle}>{item.title}</Text>
              <Text style={styles.planDesc}>{item.description}</Text>
            </View>

            {recommended && (
              <View style={styles.recoBadge}>
                <Ionicons name="trophy" size={14} color="#fff" />
                <Text style={styles.recoText}>Best value</Text>
              </View>
            )}
          </View>

          <View style={styles.cardBody}>
            <View style={styles.features}>
              {item.features.map((f: string) => (
                <View key={f} style={styles.featureRow}>
                  <View style={styles.checkCircle}>
                    <Ionicons name="checkmark" size={14} color="#fff" />
                  </View>
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <View style={styles.actionBlock}>
              <View style={styles.priceWrap}>
                <Text style={styles.price}>{formatCurrency(item.amount)}</Text>
                <Text style={styles.duration}>{item.duration_days} ngày</Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onSelectPlan(item)}
                style={styles.selectBtnContainer}
              >
                <LinearGradient
                  colors={
                    recommended
                      ? ['#ff7a00', '#ef4444']
                      : ['#16a34a', '#059669']
                  }
                  style={styles.selectBtn}
                >
                  <Text style={styles.selectText}>
                    {recommended ? 'Chọn gói tốt nhất' : 'Chọn'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </View>
    );
  };

  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top }]}>
      <LinearGradient colors={['#f0fdf4', '#ffffff']} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#065f46" />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <Text style={styles.headerTitle}>Nâng cấp Premium</Text>
          <Text style={styles.headerSub}>
            Trải nghiệm không giới hạn, nội dung độc quyền
          </Text>
        </View>
        <View style={{ width: 36 }} />
      </LinearGradient>

      <FlatList
        data={PLANS.sort((a, b) => a.display_order - b.display_order)}
        keyExtractor={(i) => i.id}
        contentContainerStyle={styles.list}
        renderItem={renderPlan}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
        ListFooterComponent={<View style={{ height: 40 }} />}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f8fafc' },

  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleWrap: { flex: 1 },
  headerTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  headerSub: { fontSize: 13, color: '#6b7280', marginTop: 4 },

  list: { padding: 16, paddingBottom: 40 },

  cardWrap: {},
  card: {
    borderRadius: 16,
    padding: 14,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  recommendedCard: {
    borderWidth: 1,
    borderColor: '#ffedd5',
    transform: [{ translateY: -6 }],
  },

  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  titleBlock: { flex: 1 },
  planTitle: { fontSize: 18, fontWeight: '900', color: '#0f172a' },
  planDesc: { color: '#6b7280', marginTop: 6, fontSize: 13 },

  recoBadge: {
    backgroundColor: '#ff7a00',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#ff7a00',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4,
  },
  recoText: { color: '#fff', fontWeight: '800', fontSize: 12 },

  cardBody: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  features: { flex: 1 },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  checkCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: { color: '#374151', fontWeight: '600', fontSize: 13 },

  actionBlock: { width: 130, alignItems: 'flex-end' },
  priceWrap: { alignItems: 'flex-end', marginBottom: 8 },
  price: { fontSize: 18, fontWeight: '900', color: '#065f46' },
  duration: { color: '#6b7280', fontSize: 12 },

  selectBtnContainer: { width: '100%' },
  selectBtn: {
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectText: { color: '#fff', fontWeight: '800' },
});
