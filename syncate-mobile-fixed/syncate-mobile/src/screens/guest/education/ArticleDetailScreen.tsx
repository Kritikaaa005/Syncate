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
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";

import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { usePublishedArticle } from "@/hooks/usePublishedArticle";

export default function ArticleDetail() {
  const params = useLocalSearchParams<{ slug?: string | string[] }>();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const { isDark } = useTheme();
  const theme = isDark ? guestTheme.mode.dark : guestTheme.mode.light;
  const { t } = useTranslation("guest");

  const { article, loading, error } = usePublishedArticle(slug);

  const goBackToArticles = () => {
    router.back();
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={theme.primary} />

          <Text style={[styles.loadingText, { color: theme.text }]}>
            {t("loading_article")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !article) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.background }]}
      >
        <View style={styles.errorWrap}>
          <Pressable
            onPress={goBackToArticles}
            style={({ pressed }) => [
              styles.errorBackButton,
              { backgroundColor: theme.primarySoft },
              pressed && styles.pressed,
            ]}
          >
            <ArrowLeft size={18} color={theme.primary} />

            <Text style={[styles.errorBackText, { color: theme.primary }]}>
              {t("back_to_articles")}
            </Text>
          </Pressable>

          {/* `error` comes from the backend hook — left as-is. Only the
             fallback string "Article not found." is our own text. */}
          <Text style={[styles.errorText, { color: theme.text }]}>
            {error || t("article_not_found")}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const paragraphs = article.content
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.background }]}
    >
      <ScrollView
        style={{ backgroundColor: theme.background }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Pressable
              onPress={goBackToArticles}
              accessibilityRole="button"
              accessibilityLabel={t("back_to_articles")}
              style={({ pressed }) => [
                styles.backButton,
                { backgroundColor: theme.primarySoft },
                pressed && styles.pressed,
              ]}
            >
              <ArrowLeft size={20} color={theme.primary} />
            </Pressable>

            <View
              style={[
                styles.categoryPill,
                { backgroundColor: theme.primarySoft },
              ]}
            >
              {/* article.category — backend data, not translated here */}
              <Text style={[styles.categoryText, { color: theme.primary }]}>
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
                borderColor: theme.border,
                backgroundColor: theme.card,
              },
            ]}
          >
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.primarySoft },
              ]}
            >
              <Sparkles size={22} color={theme.primary} />
            </View>

            {/* article.title — backend data */}
            <Text style={[styles.title, { color: theme.text }]}>
              {article.title}
            </Text>

            {!!article.author && (
              <View style={styles.authorRow}>
                <UserRound size={14} color={theme.primary} />

                <Text style={[styles.authorText, { color: theme.muted }]}>
                  {t("by_author_prefix")} {article.author}
                </Text>
              </View>
            )}

            <View style={styles.metaRow}>
              <Clock size={14} color={theme.muted} />

              <Text style={[styles.metaText, { color: theme.muted }]}>
                {t("educational_article_label")}
              </Text>
            </View>
          </View>

          <View
            style={[
              styles.bodyCard,
              {
                borderColor: theme.border,
                backgroundColor: theme.card,
              },
            ]}
          >
            {/* article.short_description and paragraphs — backend data */}
            <Text style={[styles.description, { color: theme.muted }]}>
              {article.short_description}
            </Text>

            <View style={styles.paragraphs}>
              {paragraphs.map((paragraph, index) => (
                <Text
                  key={`${article.slug}-${index}`}
                  style={[styles.paragraph, { color: theme.text }]}
                >
                  {paragraph}
                </Text>
              ))}
            </View>
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

  paragraphs: {
    gap: 16,
  },

  paragraph: {
    fontSize: 14,
    lineHeight: 28,
  },
});