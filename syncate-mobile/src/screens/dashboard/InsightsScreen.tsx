import { BookOpen } from "lucide-react-native";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RegisteredBottomNav from "@/components/dashboard/RegisteredBottomNav";
import ArticleCard from "@/components/guest/education/ArticleCard";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { useInsightsArticles } from "@/hooks/useInsightsArticles";

function InsightsScreen() {
  const { isDark } = useTheme();
  const t = isDark ? guestTheme.mode.dark : guestTheme.mode.light;

  const { categories, sections, loading } = useInsightsArticles();

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
          <View style={styles.headerRow}>
            <View
              style={[
                styles.headerIcon,
                { backgroundColor: t.primarySoft },
              ]}
            >
              <BookOpen size={22} color={t.primary} />
            </View>

            <View style={styles.headerTextWrap}>
              <Text style={[styles.title, { color: t.text }]}>
                Insights
              </Text>

              <Text style={[styles.subtitle, { color: t.muted }]}>
                Explore your body, cycle, and wellbeing by topic.
              </Text>
            </View>
          </View>

          {categories.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipRow}
            >
              {categories.map((category) => (
                <View
                  key={category.content_type_id}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: t.primarySoft,
                      borderColor: t.border,
                    },
                  ]}
                >
                  <Text style={[styles.chipText, { color: t.primary }]}>
                    {category.name}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          {loading ? (
            <View style={styles.loadingWrap}>
              <ActivityIndicator size="large" color={t.primary} />
            </View>
          ) : sections.length === 0 ? (
            <View
              style={[
                styles.emptyCard,
                { borderColor: t.border, backgroundColor: t.card },
              ]}
            >
              <Text style={[styles.emptyText, { color: t.muted }]}>
                Articles will show up here as they're published.
              </Text>
            </View>
          ) : (
            sections.map((section) => (
              <View
                key={section.category.content_type_id}
                style={styles.section}
              >
                <View style={styles.sectionHeaderRow}>
                  <Text
                    style={[styles.sectionTitle, { color: t.text }]}
                  >
                    {section.category.name}
                  </Text>
                </View>

                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.sectionRow}
                >
                  {section.articles.map((article) => (
                    <View key={article.slug} style={styles.sectionCard}>
                      <ArticleCard article={article} theme={t} />
                    </View>
                  ))}
                </ScrollView>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      <RegisteredBottomNav activeItem="insights" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    paddingTop: 18,
    paddingBottom: 120,
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
    paddingHorizontal: 20,
  },

  headerRow: {
    marginBottom: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  headerIcon: {
    height: 48,
    width: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },

  headerTextWrap: {
    flex: 1,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 2,
  },

  subtitle: {
    fontSize: 13,
    lineHeight: 18,
  },

  chipRow: {
    gap: 8,
    paddingBottom: 22,
  },

  chip: {
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  chipText: {
    fontSize: 12.5,
    fontWeight: "600",
  },

  loadingWrap: {
    paddingVertical: 60,
    alignItems: "center",
  },

  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 24,
    alignItems: "center",
  },

  emptyText: {
    fontSize: 14,
    textAlign: "center",
  },

  section: {
    marginBottom: 26,
  },

  sectionHeaderRow: {
    marginBottom: 12,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  sectionRow: {
    gap: 12,
    paddingRight: 20,
  },

  sectionCard: {
    width: 190,
  },
});

export default InsightsScreen;