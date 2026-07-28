import { router } from "expo-router";
import {
  ArrowRight,
  BookOpenText,
  UserRound,
} from "lucide-react-native";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { GuestThemeColors } from "@/constants/guestTheme";
import type { BackendArticle } from "@/services/articleService";

type Props = {
  article: BackendArticle;
  theme: GuestThemeColors;
};

function ArticleCard({ article, theme }: Props) {
  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: "/guest/articles/[slug]",
          params: {
            slug: article.slug,
          },
        })
      }
      style={({ pressed }) => [
        styles.card,
        {
          borderColor: theme.border,
          backgroundColor: theme.card,
        },
        pressed && styles.pressedScale,
      ]}
    >
      <View
        style={[
          styles.coverWrap,
          {
            backgroundColor: theme.primarySoft,
          },
        ]}
      >
        {article.cover_image_url ? (
          <Image
            source={{
              uri: article.cover_image_url,
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />
        ) : (
          <BookOpenText
            size={44}
            color={theme.primary}
          />
        )}
      </View>

      <View style={styles.body}>
        <Text
          style={[
            styles.title,
            {
              color: theme.text,
            },
          ]}
          numberOfLines={2}
        >
          {article.title}
        </Text>

        {!!article.author && (
          <View style={styles.authorRow}>
            <UserRound
              size={11}
              color={theme.primary}
            />

            <Text
              style={[
                styles.authorText,
                {
                  color: theme.muted,
                },
              ]}
              numberOfLines={1}
            >
              {article.author}
            </Text>
          </View>
        )}

        <View style={styles.footerRow}>
          <Text
            style={[
              styles.description,
              {
                color: theme.muted,
              },
            ]}
            numberOfLines={3}
          >
            {article.short_description}
          </Text>

          <View
            style={[
              styles.arrowBubble,
              {
                backgroundColor: theme.primarySoft,
              },
            ]}
          >
            <ArrowRight
              size={13}
              color={theme.primary}
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1,
    overflow: "hidden",
  },

  pressedScale: {
    opacity: 0.94,
    transform: [{ scale: 0.98 }],
  },

  coverWrap: {
    width: "100%",
    aspectRatio: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },

  coverImage: {
    width: "100%",
    height: "100%",
  },

  body: {
    flex: 1,
    padding: 12,
  },

  title: {
    marginBottom: 5,
    fontSize: 13.5,
    fontWeight: "600",
    lineHeight: 17,
  },

  authorRow: {
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  authorText: {
    flex: 1,
    fontSize: 10.5,
    lineHeight: 14,
  },

  footerRow: {
    marginTop: "auto",
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 8,
  },

  description: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 15.5,
  },

  arrowBubble: {
    height: 28,
    width: 28,
    flexShrink: 0,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default ArticleCard;