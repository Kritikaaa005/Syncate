import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import ArticleCard from "@/components/guest/education/ArticleCard";
import EducationHeader from "@/components/guest/education/EducationHeader";
import { guestTheme } from "@/constants/guestTheme";
import { useTheme } from "@/contexts/ThemeContext";
import { usePublishedArticles } from "@/hooks/usePublishedArticles";

export default function EducationalContent() {
  const { isDark } = useTheme();
  const theme = isDark ? guestTheme.mode.dark : guestTheme.mode.light;

  const { articles } = usePublishedArticles();

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <ScrollView
        style={{
          backgroundColor: theme.background,
        }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <EducationHeader
            primary={theme.primary}
            primarySoft={theme.primarySoft}
          />

          <Text
            style={[
              styles.subtitle,
              {
                color: theme.muted,
              },
            ]}
          >
            Learn more about your cycle, your body, and how to take care of
            yourself.
          </Text>

          <View style={styles.grid}>
            {articles.map((article) => (
              <View key={article.slug} style={styles.gridItem}>
                <ArticleCard article={article} theme={theme} />
              </View>
            ))}
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

  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },

  content: {
    width: "100%",
    maxWidth: 430,
    alignSelf: "center",
  },

  subtitle: {
    marginBottom: 24,
    maxWidth: 340,
    alignSelf: "center",
    textAlign: "center",
    fontSize: 14.5,
    lineHeight: 24,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -8,
  },

  gridItem: {
    width: "50%",
    paddingHorizontal: 8,
    marginBottom: 16,
  },
});