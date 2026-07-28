// Destination: src/components/common/LegalDocumentBody.tsx
//
// Takes raw legal text and renders it with numbered sections ("1. Eligibility")
// bolded as mini-headings. Doesn't know about screens, fetching, or theme —
// just takes content + colors as props.

import React from "react";
import { StyleSheet, Text, View } from "react-native";

const SECTION_HEADING_PATTERN = /^\d+\.\s+.+/;

type LegalDocumentBodyProps = {
  content: string;
  headingColor: string;
  bodyColor: string;
};

export default function LegalDocumentBody({
  content,
  headingColor,
  bodyColor,
}: LegalDocumentBodyProps) {
  const paragraphs = content.split(/\n\n+/);

  return (
    <View>
      {paragraphs.map((paragraph, index) => {
        const lines = paragraph.split("\n");
        const firstLineIsHeading = SECTION_HEADING_PATTERN.test(lines[0]);

        if (firstLineIsHeading) {
          const [heading, ...rest] = lines;
          return (
            <View key={index} style={styles.section}>
              <Text style={[styles.heading, { color: headingColor }]}>{heading}</Text>
              {rest.length > 0 && (
                <Text style={[styles.body, { color: bodyColor }]}>{rest.join("\n")}</Text>
              )}
            </View>
          );
        }

        return (
          <Text key={index} style={[styles.body, styles.paragraphSpacing, { color: bodyColor }]}>
            {paragraph}
          </Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 20,
  },
  heading: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 6,
  },
  body: {
    fontSize: 14,
    lineHeight: 21,
  },
  paragraphSpacing: {
    marginBottom: 20,
  },
});
