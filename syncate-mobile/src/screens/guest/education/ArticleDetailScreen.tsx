// app/guest/articles/[slug].tsx

import { router, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Clock,
  Sparkles,
  UserRound,
} from "lucide-react-native";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Markdown from "react-native-markdown-display";
import { SafeAreaView } from "react-native-safe-area-context";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { usePublishedArticle } from "@/hooks/usePublishedArticle";

export default function ArticleDetail() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { isDark } = useTheme();
  const t = isDark ? guestTheme.mode.dark : guestTheme.mode.light;

  const { article, loading, error } = usePublishedArticle(slug);

  const goBackToArticles = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: t.background }]}
      >
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={t.primary} />

          <Text style={[styles.loadingText, { color: t.text }]}>
            Loading article...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: t.background }]}
      >
        <View style={styles.errorWrap}>
          <Pressable
            onPress={goBackToArticles}
            style={({ pressed }) => [
              styles.errorBackButton,
              { backgroundColor: t.primarySoft },
              pressed && styles.pressed,
            ]}
          >
            <ArrowLeft size={18} color={t.primary} />

            <Text style={[styles.errorBackText, { color: t.primary }]}>
              Back to articles
            </Text>
          </Pressable>

          <Text style={[styles.errorText, { color: t.text }]}>
            {error || "Article not found."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const markdownStyles = {
    body: {
      color: t.text,
      fontSize: 14,
      lineHeight: 26,
    },
    heading1: { color: t.text, fontSize: 21, fontWeight: "700" as const },
    heading2: { color: t.text, fontSize: 18, fontWeight: "700" as const },
    heading3: { color: t.text, fontSize: 16, fontWeight: "600" as const },
    strong: { fontWeight: "700" as const },
    bullet_list: { marginBottom: 8 },
    ordered_list: { marginBottom: 8 },
    list_item: { marginBottom: 6 },
    link: { color: t.primary },
    paragraph: { marginTop: 0, marginBottom: 16 },
  };

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: t.background }]}
    >
      <ScrollView
        style={{ backgroundColor: t.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Pressable
              onPress={goBackToArticles}
              accessibilityRole="button"
              accessibilityLabel="Back to articles"
              style={({ pressed }) => [
                styles.backButton,
                { backgroundColor: t.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <ArrowLeft size={20} color={t.primary} />
            </Pressable>

            <View
              style={[
                styles.categoryPill,
                { backgroundColor: t.primarySoft },
              ]}
            >
              <Text style={[styles.categoryText, { color: t.primary }]}>
                {article.category}
              </Text>
            </View>
          </View>

          {article.cover_image_url ? (
            <Image
              source={{ uri: article.cover_image_url }}
              style={styles.coverImage}
              resizeMode="cover"
              accessibilityLabel={article.title}
            />
          ) : null}

          <View
            style={[
              styles.introCard,
              {
                borderColor: t.border,
                backgroundColor: t.card,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: t.primarySoft },
              ]}
            >
              <Sparkles size={22} color={t.primary} />
            </View>

            <Text style={[styles.title, { color: t.text }]}>
              {article.title}
            </Text>

            {!!article.author && (
              <View style={styles.authorRow}>
                <UserRound size={14} color={t.primary} />

                <Text style={[styles.authorText, { color: t.muted }]}>
                  By {article.author}
                </Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <Clock size={14} color={t.muted} />

              <Text style={[styles.metaText, { color: t.muted }]}>
                Educational article
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.bodyCard,
              {
                borderColor: t.border,
                backgroundColor: t.card,
              },
            ]}
          >
            <Text style={[styles.description, { color: t.muted }]}>
              {article.short_description}
            </Text>

            <Markdown style={markdownStyles}>
              {article.content}
            </Markdown>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },

  loadingText: {
    marginTop: 12,
    textAlign: "center",
    fontSize: 14,
  },

  errorWrap: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 32,
  },

  errorBackButton: {
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },

  errorBackText: {
    fontSize: 14,
    fontWeight: "500",
  },

  errorText: {
    marginTop: 32,
    textAlign: "center",
    fontSize: 15,
  },

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  topRow: {
    marginBottom: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  backButton: {
    height: 44,
    width: 44,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.96 }],
  },

  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },

  categoryText: {
    fontSize: 12,
    fontWeight: "500",
  },

  coverImage: {
    marginBottom: 20,
    height: 192,
    width: "100%",
    borderRadius: 26,
  },

  introCard: {
    marginBottom: 20,
    borderRadius: 26,
    borderWidth: 1,
    padding: 20,
  },

  iconCircle: {
    marginBottom: 16,
    height: 56,
    width: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },

  title: {
    marginBottom: 10,
    fontSize: 25,
    fontWeight: "600",
    lineHeight: 31,
  },

  authorRow: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  authorText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    fontSize: 13,
  },

  bodyCard: {
    borderRadius: 24,
    borderWidth: 1,
    padding: 20,
  },

  description: {
    marginBottom: 20,
    fontSize: 15,
    lineHeight: 28,
  },

});