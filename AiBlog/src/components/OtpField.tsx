import { StyleSheet, Text, TextInputProps, View } from "react-native";
import { OtpInput } from "react-native-otp-entry";

interface Props extends TextInputProps {
  onTextChange: (value: string) => void;
}
const TEXT_DARK = "#1A1A1A";
export default function OtpField({ onTextChange }: Props) {
  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <Text style={styles.inputLabel}>OTP</Text>
      <OtpInput
        focusColor={"#f1b023ff"}
        type="numeric"
        numberOfDigits={6}
        onTextChange={onTextChange}
        autoFocus={true}
        theme={{
          containerStyle: {
            justifyContent: "center",
            gap: 14,
            alignItems: "center",
            height: 1,
            width: 10,
            marginVertical: 30,
          },
          pinCodeTextStyle: { color: "black" },
          focusStickStyle: { borderColor: "#f1b023ff" },
          pinCodeContainerStyle: { backgroundColor: "white" },
        }}
      />
    </View>
  );
}
const styles = StyleSheet.create({
  inputLabel: {
    fontSize: 16,
    alignSelf: "flex-start",
    marginRight: "auto",
    fontWeight: "500",
    color: TEXT_DARK,
    marginBottom: 16,
  },
});
