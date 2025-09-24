// import { View, Text, Image, Pressable } from "react-native";
// import { Link } from "expo-router";
// import { Recipe } from "@/src/types/entities";
// // import RatingStars from "@/src/components/common/RatingStars";

// export default function RecipeCard({ r }: { r: Recipe }) {
//   return (
//     <Link href={`/recipe/${r.slug}`} asChild>
//       <Pressable className="p-3 rounded-2xl bg-white shadow">
//         <Image source={{ uri: r.coverUrl }} className="w-full h-44 rounded-xl" />
//         <View className="mt-3">
//           <Text className="font-semibold text-base" numberOfLines={2}>{r.title}</Text>
//           <View className="flex-row items-center mt-1">
//             {/* <RatingStars value={r.avgRating ?? 0} /> */}
//             <Text className="text-gray-500 ml-2">{r.totalRatings ?? 0}</Text>
//           </View>
//         </View>
//       </Pressable>
//     </Link>
//   );
// }
