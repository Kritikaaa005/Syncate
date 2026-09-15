// LOCATION: syncate-mobile/src/screens/dashboard/SymptomChatScreen.tsx
//
// Small first-stage reproductive-health chatbot.
// It runs locally and uses transparent rules/keywords.
// It does NOT diagnose conditions and does not send health text to a third party.

import { router } from "expo-router";
import {
  ArrowLeft,
  Bot,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useTheme } from "@/contexts/ThemeContext";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const QUICK_PROMPTS = [
  "My period cramps are painful",
  "My period is late",
  "I have heavy bleeding",
  "Tell me about PCOS",
];

const INITIAL_MESSAGE: ChatMessage = {
  id: "welcome",
  role: "assistant",
  text:
    "Hi, I’m Syncate’s health assistant. You can ask me simple questions about periods, symptoms, PCOS, endometriosis, discharge, mood or pregnancy concerns. I can give general educational guidance, but I can’t diagnose you.",
};

function includesAny(text: string, words: string[]): boolean {
  return words.some((word) => text.includes(word));
}

function createReply(rawInput: string): string {
  const input = rawInput.trim().toLowerCase();

  if (!input) {
    return "Tell me what you are noticing, for example pain, bleeding, discharge, a late period or a mood change.";
  }

  if (
    includesAny(input, [
      "faint",
      "fainting",
      "can't breathe",
      "cannot breathe",
      "chest pain",
      "suicidal",
      "kill myself",
      "unconscious",
    ])
  ) {
    return "Those symptoms can need urgent help. Please contact emergency medical services or go to the nearest emergency department now. If possible, stay with someone you trust.";
  }

  if (
    includesAny(input, [
      "heavy bleeding",
      "very heavy",
      "soaking",
      "pad every hour",
      "pads every hour",
      "large clots",
    ])
  ) {
    return "Heavy bleeding can have different causes. Seek urgent medical care if you are soaking through a pad or tampon about every hour for several hours, feel faint or weak, have severe pain, or may be pregnant. Otherwise, record the bleeding and discuss repeated heavy periods with a healthcare professional.";
  }

  if (
    includesAny(input, [
      "cramp",
      "cramps",
      "period pain",
      "pelvic pain",
      "painful period",
      "दुखाइ",
    ])
  ) {
    return "Mild to moderate cramps are common around menstruation. Heat, rest and gentle movement may help some people. If pain is severe, suddenly different, keeps you from normal activities, or repeatedly worsens, it is worth discussing with a healthcare professional. Repeated severe pain can have several causes and should not be self-diagnosed.";
  }

  if (
    includesAny(input, [
      "late period",
      "missed period",
      "period is late",
      "irregular",
      "cycle late",
      "महिनावारी ढिलो",
    ])
  ) {
    return "A late or irregular period can happen for many reasons, including normal cycle variation, stress, illness, major lifestyle changes or pregnancy. If pregnancy is possible, a pregnancy test is the most direct next step. If irregular cycles keep happening or you have other concerning symptoms, consider speaking with a healthcare professional.";
  }

  if (
    includesAny(input, [
      "pregnant",
      "pregnancy",
      "pregnancy test",
      "missed my period",
    ])
  ) {
    return "If pregnancy is possible after a missed period, consider using a home pregnancy test according to its instructions. If the result is positive, unclear, or symptoms such as severe one-sided pain, fainting or heavy bleeding occur, seek professional medical care.";
  }

  if (
    includesAny(input, [
      "discharge",
      "vaginal discharge",
      "smell",
      "odor",
      "itching",
      "itchy",
    ])
  ) {
    return "Vaginal discharge can normally change across the menstrual cycle. A strong new odor, itching, burning, pain, fever, or a major change in color or texture can be worth medical assessment, especially if it persists. Tracking when it happens may help you describe the pattern.";
  }

  if (includesAny(input, ["pcos", "polycystic"])) {
    return "PCOS is a condition that can affect ovulation, periods and androgen-related symptoms. Possible patterns include irregular periods, acne or increased hair growth, but these signs are not enough to diagnose PCOS. Diagnosis requires professional assessment and sometimes tests. Syncate can help you record patterns to discuss at an appointment.";
  }

  if (includesAny(input, ["endometriosis", "endo"])) {
    return "Endometriosis can be associated with symptoms such as significant pelvic pain, painful periods, pain during sex or bowel/bladder symptoms around menstruation. Those symptoms can also have other causes. A symptom pattern can support a medical conversation, but an app or chatbot cannot diagnose endometriosis.";
  }

  if (
    includesAny(input, [
      "mood",
      "sad",
      "anxious",
      "irritable",
      "pms",
      "pmdd",
      "emotion",
    ])
  ) {
    return "Mood can change around the menstrual cycle, but intensity matters. Tracking mood alongside cycle dates can help reveal a repeating pattern. If low mood, anxiety or irritability is severe, affects daily life, or includes thoughts of self-harm, please seek professional support promptly.";
  }

  if (
    includesAny(input, [
      "fever",
      "infection",
      "burning urine",
      "burning when",
    ])
  ) {
    return "Fever, worsening pelvic pain, painful urination, or other infection-like symptoms should not be diagnosed through a tracker. Consider timely medical assessment, especially if symptoms are severe or getting worse.";
  }

  if (
    includesAny(input, [
      "medicine",
      "medication",
      "dose",
      "tablet",
      "pill",
    ])
  ) {
    return "I can help you track medicines, but I should not choose a medicine or change a dose for you. Follow the instructions from your doctor, pharmacist or the medicine label, and ask a qualified professional if you are unsure.";
  }

  return "I can help with general information about periods, cramps, bleeding, discharge, mood, PCOS, endometriosis, pregnancy concerns and symptom tracking. Tell me a little more about what you are experiencing. I will keep the answer educational rather than trying to diagnose you.";
}

export default function SymptomChatScreen() {
  const { colors: theme } = useTheme();
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    INITIAL_MESSAGE,
  ]);

  const scrollRef = useRef<ScrollView>(null);

  const canSend = useMemo(
    () => input.trim().length > 0,
    [input]
  );

  const sendMessage = (textOverride?: string) => {
    const text = (textOverride ?? input).trim();

    if (!text) {
      return;
    }

    const stamp = Date.now().toString();

    setMessages((current) => [
      ...current,
      {
        id: `user-${stamp}`,
        role: "user",
        text,
      },
      {
        id: `assistant-${stamp}`,
        role: "assistant",
        text: createReply(text),
      },
    ]);

    setInput("");

    requestAnimationFrame(() => {
      scrollRef.current?.scrollToEnd({
        animated: true,
      });
    });
  };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: theme.background },
      ]}
    >
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <View style={styles.container}>
          <View style={styles.header}>
            <Pressable
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={({ pressed }) => [
                styles.headerButton,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                },
                pressed && styles.pressed,
              ]}
            >
              <ArrowLeft
                size={20}
                color={theme.text}
              />
            </Pressable>

            <View style={styles.headerTitleWrap}>
              <Text
                style={[
                  styles.headerTitle,
                  { color: theme.text },
                ]}
              >
                Syncate Assistant
              </Text>
              <Text
                style={[
                  styles.headerSubtitle,
                  { color: theme.muted },
                ]}
              >
                Educational symptom chat
              </Text>
            </View>

            <View
              style={[
                styles.botBadge,
                {
                  backgroundColor:
                    theme.primarySoft,
                },
              ]}
            >
              <Bot
                size={18}
                color={theme.primary}
              />
            </View>
          </View>

          <View
            style={[
              styles.notice,
              {
                backgroundColor:
                  theme.primarySoft,
                borderColor: theme.border,
              },
            ]}
          >
            <ShieldAlert
              size={16}
              color={theme.primary}
            />
            <Text
              style={[
                styles.noticeText,
                { color: theme.text },
              ]}
            >
              General guidance only. This assistant
              does not diagnose conditions or replace
              a healthcare professional.
            </Text>
          </View>

          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={
              styles.messagesContent
            }
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({
                animated: true,
              })
            }
          >
            {messages.map((message) => {
              const assistant =
                message.role === "assistant";

              return (
                <View
                  key={message.id}
                  style={[
                    styles.messageRow,
                    assistant
                      ? styles.messageRowLeft
                      : styles.messageRowRight,
                  ]}
                >
                  {assistant ? (
                    <View
                      style={[
                        styles.smallBot,
                        {
                          backgroundColor:
                            theme.primarySoft,
                        },
                      ]}
                    >
                      <Sparkles
                        size={14}
                        color={theme.primary}
                      />
                    </View>
                  ) : null}

                  <View
                    style={[
                      styles.bubble,
                      assistant
                        ? {
                            backgroundColor:
                              theme.card,
                            borderColor:
                              theme.border,
                          }
                        : {
                            backgroundColor:
                              theme.primaryButton,
                            borderColor:
                              theme.primaryButton,
                          },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bubbleText,
                        {
                          color: assistant
                            ? theme.text
                            : "#FFFFFF",
                        },
                      ]}
                    >
                      {message.text}
                    </Text>
                  </View>
                </View>
              );
            })}

            <View style={styles.quickSection}>
              <Text
                style={[
                  styles.quickLabel,
                  { color: theme.muted },
                ]}
              >
                QUICK QUESTIONS
              </Text>

              <View style={styles.quickWrap}>
                {QUICK_PROMPTS.map((prompt) => (
                  <Pressable
                    key={prompt}
                    onPress={() =>
                      sendMessage(prompt)
                    }
                    style={({ pressed }) => [
                      styles.quickChip,
                      {
                        backgroundColor:
                          theme.card,
                        borderColor:
                          theme.border,
                      },
                      pressed && styles.pressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        { color: theme.text },
                      ]}
                    >
                      {prompt}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>
          </ScrollView>

          <View
            style={[
              styles.composer,
              {
                backgroundColor:
                  theme.background,
                borderTopColor: theme.border,
              },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder="Ask about a symptom..."
              placeholderTextColor={theme.muted}
              multiline
              maxLength={600}
              style={[
                styles.input,
                {
                  backgroundColor: theme.card,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
              onSubmitEditing={() => {
                if (Platform.OS !== "web") {
                  sendMessage();
                }
              }}
            />

            <Pressable
              disabled={!canSend}
              onPress={() => sendMessage()}
              accessibilityRole="button"
              accessibilityLabel="Send message"
              style={({ pressed }) => [
                styles.sendButton,
                {
                  backgroundColor:
                    theme.primaryButton,
                },
                !canSend &&
                  styles.sendButtonDisabled,
                pressed &&
                  canSend &&
                  styles.pressed,
              ]}
            >
              <Send
                size={18}
                color="#FFFFFF"
              />
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center",
  },
  header: {
    minHeight: 62,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitleWrap: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
  },
  headerSubtitle: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "500",
  },
  botBadge: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  notice: {
    marginHorizontal: 18,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 9,
  },
  noticeText: {
    flex: 1,
    fontSize: 11.5,
    lineHeight: 17,
    fontWeight: "500",
  },
  messages: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 18,
  },
  messageRow: {
    width: "100%",
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  messageRowLeft: {
    justifyContent: "flex-start",
  },
  messageRowRight: {
    justifyContent: "flex-end",
  },
  smallBot: {
    width: 28,
    height: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 7,
  },
  bubble: {
    maxWidth: "82%",
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  bubbleText: {
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "500",
  },
  quickSection: {
    marginTop: 10,
  },
  quickLabel: {
    fontSize: 9.5,
    fontWeight: "800",
    letterSpacing: 1.1,
    marginBottom: 9,
  },
  quickWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  quickChip: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 11,
    paddingVertical: 8,
  },
  quickChipText: {
    fontSize: 11.5,
    fontWeight: "600",
  },
  composer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 9,
  },
  input: {
    flex: 1,
    minHeight: 46,
    maxHeight: 110,
    borderWidth: 1,
    borderRadius: 17,
    paddingHorizontal: 13,
    paddingTop: 11,
    paddingBottom: 10,
    fontSize: 13,
    lineHeight: 18,
  },
  sendButton: {
    width: 46,
    height: 46,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
});
