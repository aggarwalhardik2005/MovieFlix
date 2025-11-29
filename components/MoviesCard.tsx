import { icons } from "@/constants/icons";
import { Text } from "@react-navigation/elements";
import { Link } from "expo-router";
import React from "react";
import { Image, StyleSheet, TouchableOpacity, View } from "react-native";


const MoviesCard = ({ id, poster_path, title, vote_average, release_date}: Movie) => {
  return (
    <Link href={`/movies/${id}`} asChild>
      <TouchableOpacity style={{ width: "30%" }}>
        {/* Poster */}
        <Image
          source={{
            uri: poster_path
              ? `https://image.tmdb.org/t/p/w500${poster_path}`
              : "https://placehold.co/600x400/1a1a1a/ffffff.png",
          }}
          style={{ width: "100%", height: 208, borderRadius: 8 }}
          resizeMode="cover"
        />

        {/* Title */}
        <Text
          style={{
            fontSize: 14,
            lineHeight: 18,
            fontWeight: "bold",
            color: "#FFFFFF",
            marginTop: 6,
          }}
          numberOfLines={1}
        >
          {title}
        </Text>

        {/* Inline row: Star + Rating */}
        <View
          style={{ flexDirection: "row", alignItems: "center", marginTop: 3 }}
        >
          <Image
            source={icons.star}
            style={{ width: 14, height: 14, marginRight: 5 }}
          />
          <Text
            style={{
              fontSize: 13,
              color: "#FFD700",
              fontWeight: "600",
            }}
          >
            {Math.round(vote_average/2)}
          </Text>
        </View>

        {/* Year */}
        <Text
          style={{
            fontSize: 12,
            color: "#AAAAAA",
            marginTop: 2,
          }}
        >
          {release_date?.split("-")[0]}
        </Text>
      </TouchableOpacity>
    </Link>
  );
};

export default MoviesCard;

const styles = StyleSheet.create({});
