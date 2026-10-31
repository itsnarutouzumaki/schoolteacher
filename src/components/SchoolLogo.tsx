import React from "react";
import { Image, type ImageStyle, type StyleProp } from "react-native";
import { getSchoolConfiguration } from "../config/schoolConfig";

const schoolLogo = require("../../../shared/assets/logo.png");
const schoolName = getSchoolConfiguration().school.name;

export function SchoolLogo({
  size = 88,
  style,
}: {
  size?: number;
  style?: StyleProp<ImageStyle>;
}) {
  return (
    <Image
      source={schoolLogo}
      resizeMode="contain"
      accessible
      accessibilityLabel={`${schoolName} logo`}
      style={[{ width: size, height: size }, style]}
    />
  );
}
