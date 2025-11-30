import MoviesCard from "@/components/MoviesCard";
import SearchBar from "@/components/SearchBar";
import TrendingCard from "@/components/TrendingCard";
import { icons } from "@/constants/icons";
import { images } from "@/constants/images";
import { fetchMovies } from "@/services/api";
import { getTrendingMovies } from "@/services/appwrite";
import useFetch from "@/services/useFetch";
import { Text } from "@react-navigation/elements";
import { useRouter } from "expo-router";
import { use } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  View,
} from "react-native";

export default function Index() {
  const router = useRouter();

  const{
    data:trendingMovies,
    loading: trendingLoading,
    error: trendingError
  }=useFetch(getTrendingMovies);
  // fetchMovies now returns { results, totalResults }
  const {
    data:movies, // will be { results: Movie[], totalResults: number } or null
    loading: moviesLoading,
    error: moviesError,
  } = useFetch(() => fetchMovies({ query: "" }), true);


  return (
    <>
      <View style={{ flex: 1, backgroundColor: "#030014" }}>
        <Image
          source={images.bg}
          style={{ position: "absolute", width: "100%", zIndex: 0 }}
        />
        <ScrollView
          style={{ flex: 1, paddingHorizontal: 5 }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: "100%", paddingBottom: 10 }}
        >
          <Image
            source={icons.logo}
            style={{
              width: 48,
              height: 40,
              marginTop: 80,
              marginBottom: 20,
              marginLeft: "auto",
              marginRight: "auto",
            }}
          />

          {moviesLoading || trendingLoading ? (
            <ActivityIndicator
              size="large"
              color="#0000ff"
              style={{ marginTop: 40, alignSelf: "center" }}
            />
          ) : moviesError || trendingError ? (
            <Text style={{ color: "#fff", marginTop: 20 }}>
              Error: {moviesError?.message || trendingError?.message}
            </Text>
          ) : (
            <View style={{ flex: 1, marginTop: 20 }}>
              <SearchBar
                onPress={() => router.push("/search")}
                placeholder="Search for a movie"
              />

              {trendingMovies && (
              <View style={{ marginTop: 40 }}>
                  <Text style={{fontSize: 18,color:'#FFFFFF',fontWeight: 'bold',marginBottom: 12}}>Trending Movies</Text>
              </View>
              )}

              <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                ItemSeparatorComponent={()=><View style={{width:16}}/>}
                data={trendingMovies}
                style={{marginBottom: 16,marginTop:12}}
                renderItem={({item,index})=>(
                  <TrendingCard movie={item} index={index}/>
                )}
                keyExtractor={(item)=>item.movie_id.toString()}
              />

              <Text
                style={{
                  fontSize: 18,
                  color: "#FFFFFF",
                  fontWeight: "bold",
                  marginTop: 20,
                  marginBottom: 6,
                }}
              >
                Latest Movies
              </Text>

              <FlatList
                data={movies} // still safe: if fewer items, slice won't error
                renderItem={({ item }) => <MoviesCard {...item} />}
                keyExtractor={(item) => item.id} // imdbID is already a string
                numColumns={3}
                columnWrapperStyle={{
                  justifyContent: "flex-start",
                  gap: 20,
                  paddingRight: 5,
                  marginBottom: 10,
                }}
                style={{ marginTop: 8, paddingBottom: 128 }}
                scrollEnabled={false}
                ListEmptyComponent={
                  <Text style={{ color: "#fff", marginTop: 20 }}>
                    No movies found.
                  </Text>
                }
              />
            </View>
          )}
        </ScrollView>
      </View>
    </>
  );
}
