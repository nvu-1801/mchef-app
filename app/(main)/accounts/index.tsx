import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

/** ====== Types ====== */
type Role = "Admin" | "Editor" | "User";
type Status = "Hoạt động" | "Tạm ngừng";

type Account = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: Role;
  status: Status;
  lastActive: string; // humanized, ví dụ "1 giờ trước"
};

/** ====== Mock data (hãy thay bằng API/RTK Query của bạn) ====== */
const MOCK: Account[] = [
  {
    id: "1",
    name: "Anh Dương",
    email: "anhduong@cooking.com",
    avatarUrl: "https://images.unsplash.com/photo-1607746882042-944635dfe10e?w=300",
    role: "Admin",
    status: "Hoạt động",
    lastActive: "1 giờ trước",
  },
  {
    id: "2",
    name: "Mai Hương",
    email: "maihuong@cooking.com",
    role: "Editor",
    status: "Hoạt động",
    lastActive: "30 phút trước",
  },
  {
    id: "3",
    name: "Trần Văn",
    email: "tranvan@cooking.com",
    role: "User",
    status: "Hoạt động",
    lastActive: "2 ngày trước",
  },
  {
    id: "4",
    name: "Nguyễn Lan",
    email: "nguyenlan@cooking.com",
    role: "User",
    status: "Tạm ngừng",
    lastActive: "1 tuần trước",
  },
  {
    id: "5",
    name: "Phạm Tuấn",
    email: "pham.tuan@cooking.com",
    role: "Admin",
    status: "Hoạt động",
    lastActive: "6 giờ trước",
  },
];

/** ====== Small UI primitives ====== */
function Chip({
  text,
  tone = "neutral",
}: {
  text: string;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const bg =
    tone === "success"
      ? "#E6F4EA"
      : tone === "warning"
      ? "#FFF4E5"
      : tone === "danger"
      ? "#FDE8E8"
      : "#F3F4F6";
  const color =
    tone === "success"
      ? "#1B5E20"
      : tone === "warning"
      ? "#7C4A03"
      : tone === "danger"
      ? "#7F1D1D"
      : "#374151";
  return (
    <View
      style={{
        backgroundColor: bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Text style={{ fontSize: 12, fontWeight: "700", color }}>{text}</Text>
    </View>
  );
}

function Avatar({ uri, size = 44 }: { uri?: string; size?: number }) {
  return uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: "#E5E7EB",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Ionicons name="person" size={size * 0.56} color="#9CA3AF" />
    </View>
  );
}

/** ====== Account Card ====== */
function AccountCard({
  item,
  onPressMore,
  onPressItem,
}: {
  item: Account;
  onPressItem?: (acc: Account) => void;
  onPressMore?: (acc: Account) => void;
}) {
  const statusTone =
    item.status === "Hoạt động"
      ? "success"
      : item.status === "Tạm ngừng"
      ? "danger"
      : "neutral";

  return (
    <Pressable
      onPress={() => onPressItem?.(item)}
      style={{
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 1,
        marginBottom: 12,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Avatar uri={item.avatarUrl} />

        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontSize: 16, fontWeight: "700", color: "#111827" }}>
            {item.name}
          </Text>
          <Text style={{ color: "#6B7280", marginTop: 2 }}>{item.email}</Text>

          <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
            <Chip text={item.role} tone="neutral" />
            <Chip text={item.status} tone={statusTone as any} />
          </View>

          <Text style={{ color: "#9CA3AF", marginTop: 8 }}>
            Đăng nhập cuối: {item.lastActive}
          </Text>
        </View>

        <Pressable
          onPress={() => onPressMore?.(item)}
          hitSlop={12}
          style={{
            padding: 6,
            marginLeft: 6,
            borderRadius: 999,
            alignSelf: "flex-start",
          }}
        >
          <Ionicons name="ellipsis-vertical" size={20} color="#6B7280" />
        </Pressable>
      </View>
    </Pressable>
  );
}

/** ====== Filters Bar ====== */
function FiltersBar({
  q,
  setQ,
  role,
  setRole,
  status,
  setStatus,
  onCreate,
}: {
  q: string;
  setQ: (s: string) => void;
  role: Role | "All";
  setRole: (r: Role | "All") => void;
  status: Status | "All";
  setStatus: (s: Status | "All") => void;
  onCreate: () => void;
}) {
  return (
    <View>
      {/* Title + avatar quick space could be here */}
      <Text
        style={{
          fontSize: 20,
          fontWeight: "800",
          color: "#111827",
          marginBottom: 12,
        }}
      >
        Quản lý tài khoản
      </Text>

      {/* Search */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E5E7EB",
          paddingHorizontal: 12,
          height: 44,
          backgroundColor: "#fff",
        }}
      >
        <Ionicons name="search" size={18} color="#9CA3AF" />
        <TextInput
          value={q}
          onChangeText={setQ}
          placeholder="Tìm kiếm người dùng..."
          placeholderTextColor="#9CA3AF"
          style={{ marginLeft: 8, flex: 1, color: "#111827" }}
        />
        {q?.length > 0 && (
          <Pressable onPress={() => setQ("")} hitSlop={10}>
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      {/* Row: Create + filters */}
      <View
        style={{
          flexDirection: "row",
          gap: 10,
          marginTop: 12,
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={onCreate}
          style={{
            backgroundColor: "#2E7D32",
            paddingHorizontal: 14,
            height: 42,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "row",
          }}
        >
          <Ionicons name="add-circle" size={18} color="#fff" />
          <Text
            style={{
              color: "#fff",
              fontWeight: "800",
              marginLeft: 8,
              fontSize: 14,
              letterSpacing: 0.2,
            }}
          >
            Tạo tài khoản
          </Text>
        </Pressable>

        {/* Role filter */}
        <Pressable
          onPress={() => {
            const order: (Role | "All")[] = ["All", "Admin", "Editor", "User"];
            const next = order[(order.indexOf(role) + 1) % order.length];
            setRole(next);
          }}
          style={{
            backgroundColor: "#F9FAFB",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            height: 42,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 12,
            flexDirection: "row",
          }}
        >
          <Ionicons name="briefcase-outline" size={18} color="#374151" />
          <Text style={{ marginLeft: 6, fontWeight: "700", color: "#374151" }}>
            {role === "All" ? "Role: Tất cả" : `Role: ${role}`}
          </Text>
        </Pressable>

        {/* Status filter */}
        <Pressable
          onPress={() => {
            const order: (Status | "All")[] = ["All", "Hoạt động", "Tạm ngừng"];
            const next = order[(order.indexOf(status) + 1) % order.length];
            setStatus(next);
          }}
          style={{
            backgroundColor: "#F9FAFB",
            borderWidth: 1,
            borderColor: "#E5E7EB",
            height: 42,
            borderRadius: 10,
            alignItems: "center",
            justifyContent: "center",
            paddingHorizontal: 12,
            flexDirection: "row",
          }}
        >
          <Ionicons name="filter" size={18} color="#374151" />
          <Text style={{ marginLeft: 6, fontWeight: "700", color: "#374151" }}>
            {status === "All" ? "Trạng thái: Tất cả" : `Trạng thái: ${status}`}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

/** ====== Main Screen ====== */
export default function AccountsScreen() {
  const insets = useSafeAreaInsets();
  // loading từ API
  const [loading] = useState(false);

  // local filters
  const [q, setQ] = useState("");
  const [role, setRole] = useState<Role | "All">("All");
  const [status, setStatus] = useState<Status | "All">("All");

  // data: thay MOCK bằng data từ API
  const data = MOCK;

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return data.filter((u) => {
      const byQ =
        !query ||
        u.name.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query);
      const byRole = role === "All" || u.role === role;
      const byStatus = status === "All" || u.status === status;
      return byQ && byRole && byStatus;
    });
  }, [q, role, status, data]);

  function handleCreate() {
    // TODO: mở modal tạo tài khoản hoặc điều hướng tới /accounts/create
    console.log("Create account");
  }

  function handleMore(acc: Account) {
    // TODO: mở ActionSheet: Xem chi tiết / Đổi role / Tạm ngừng / Kích hoạt / Reset mật khẩu / Xoá
    console.log("More actions for", acc.email);
  }

  function handleOpen(acc: Account) {
    // TODO: router.push(`/accounts/${acc.id}`)
    console.log("Open account", acc.email);
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#F3F4F6",
        paddingTop: insets.top + 8,
      }}
    >
      <View style={{ paddingHorizontal: 16 }}>
        <FiltersBar
          q={q}
          setQ={setQ}
          role={role}
          setRole={setRole}
          status={status}
          setStatus={setStatus}
          onCreate={handleCreate}
        />
      </View>

      {loading ? (
        <View
          style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
        >
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 24 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", color: "#6B7280", marginTop: 32 }}>
              Không có tài khoản phù hợp.
            </Text>
          }
          renderItem={({ item }) => (
            <AccountCard
              item={item}
              onPressMore={handleMore}
              onPressItem={handleOpen}
            />
          )}
        />
      )}
    </View>
  );
}
