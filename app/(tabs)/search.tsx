import MoviesCard from "@/components/MoviesCard";
import SearchBar from "@/components/SearchBar";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { updateSearchCount } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { Text } from "@react-navigation/elements";
import { useEffect, useState } from "react";

import { ActivityIndicator, FlatList, Image, View } from "react-native";

export default function Search() {
  const [searchQuery, setsearchQuery] = useState("");

  // fetchMovies now returns { results, totalResults }
  const {
    data:movies, // will be { results: Movie[], totalResults: number } or null
    loading,
    error,
    refetch: loadMovies,
    reset,
  } = useFetch(() => fetchMovies({ query: searchQuery }), false);

  useEffect(() => {
    const timeoutId =setTimeout(async () => {
      if (searchQuery.trim()) {
        await loadMovies();

        if(movies?.length>0 && movies?.[0])
        await updateSearchCount(searchQuery,movies[0]);

      } else {
        reset();
      }
    },500)
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  
  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#030014" }}>
        <Image
          source={images.bg}
          style={{ flex: 1, position: "absolute", width: "100%", zIndex: 0 }}
          resizeMode="cover"
        />
        <FlatList
          data={movies}
          renderItem={({ item }) => <MoviesCard {...item} />}
          keyExtractor={(item) => item.id.toString()}
          style={{ flex: 1, paddingHorizontal: 20 }}
          numColumns={3}
          columnWrapperStyle={{
            justifyContent: "center",
            gap: 16,
            marginVertical: 16,
          }}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListHeaderComponent={
            <>
              <View
                style={{
                  width: "100%",
                  flexDirection: "row",
                  justifyContent: "center",
                  marginTop: 80,
                  alignItems: "center",
                }}
              >
                <Image source={icons.logo} style={{ width: 48, height: 40 }} />
              </View>
              <View style={{ marginVertical: 20 }}>
                <SearchBar
                  value={searchQuery}
                  onchangeText={(text: string) => setsearchQuery(text)}
                  placeholder="Search movies..."
                />
              </View>
              {loading && (
                <ActivityIndicator
                  size="large"
                  color="#0000ff"
                  style={{ marginVertical: 12 }}
                />
              )}
              {error && (
                <Text
                  style={{
                    color: "#ef4444",
                    paddingHorizontal: 20,
                    marginVertical: 12,
                  }}
                >
                  Error: {error.message}
                </Text>
              )}
              {!loading &&
                !error &&
                searchQuery.trim() &&
                movies?.length > 0 && (
                  <Text
                    style={{
                      fontWeight: 700,
                      color: "#fff",
                      fontSize: 20,
                      lineHeight: 28,
                    }}
                  >
                    Search Results for{" "}
                    <Text style={{ color: "#AB8BFF" }}>{searchQuery}</Text>
                  </Text>
                )}
            </>
          }
          ListEmptyComponent={
            !loading && !error ? (
                <View style={{marginTop:40,paddingHorizontal:20}}>
              <Text style={{ color: "#6b7280", fontSize: 16, textAlign: "center"}}>
                {searchQuery.trim()?"No results found...":"Search for a movie..."}
              </Text>
                </View>
            ): null
          } 
        />
      </View>
    </>
  );
}
