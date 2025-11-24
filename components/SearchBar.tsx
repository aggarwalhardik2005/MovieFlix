import { StyleSheet, View, Image, TextInput } from "react-native";
import React from "react";
import { icons } from "@/constants/icons";

interface Props {
  placeholder?: string;
  onPress?: () => void;
  value?:string;
  onchangeText?:(text:string)=>void;
}
const SearchBar = ({ placeholder, onPress,value,onchangeText}: Props) => {
  return (
    <View
      style={{
        flexDirection: "row", // flex-row
        alignItems: "center", // items-center
        backgroundColor: "#0F0D23", // bg-dark-200  (from your tailwind config)
        borderRadius: 9999, // rounded-full
        paddingHorizontal: 20, // px-5 → 5 * 4 = 20
        paddingVertical: 16, // py-4 → 4 * 4 = 16
      }}
    >
      <Image
        source={icons.search}
        style={{ width: 20, height: 20 }}
        resizeMode="contain"
        tintColor="#ab8bff"
      />
      <TextInput
        onPress={onPress}
        placeholder={placeholder}
        value={value}
        onChangeText={onchangeText}
        placeholderTextColor="#a8b5db"
        style={{ flex: 1, marginLeft: 8, color: "#ffffff" }}
      />
    </View>
  );
};

export default SearchBar;

const styles = StyleSheet.create({});
