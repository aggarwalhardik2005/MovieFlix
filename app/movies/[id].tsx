import { icons } from '@/constants/icons';
import { fetchMovieDetails } from '@/services/api';
import useFetch from '@/services/useFetch';
import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface MovieInfoProps{
  label:string;
  value?: string|number|null;
}
const MovieInfo=({label,value}:MovieInfoProps)=>(
  <View style={{flexDirection:'column',alignItems:'flex-start',justifyContent:'center',marginTop:20}}>
      <Text style={{color: '#D1D5DB',fontWeight: '400'}}>
        {label}
      </Text>
      <Text style={{color:'#E5E7EB',fontWeight:'bold',fontSize:14,marginTop:8}}>
        {value || "N/A"}
      </Text>
  </View>
)

const MovieDetails = () => {

  const {id}=useLocalSearchParams();
  const {data:movie,loading}=useFetch(()=>fetchMovieDetails(id as string));
  return (
    <View style={{flex:1,backgroundColor:'#0D0D0D'}}>
      <ScrollView contentContainerStyle={{
        paddingBottom:80
      }}>
        <View>
          <Image
            style={{width:'100%',height:500}}
            resizeMode='stretch'
            source={{uri:`https://image.tmdb.org/t/p/w500${movie?.poster_path}`}}/>
        </View>
        <View style={{flexDirection: 'column',alignItems: 'flex-start',justifyContent: 'center',marginTop: 20,paddingHorizontal:20}}>
            <Text style={{color:'#FFFFFF',fontWeight:'bold',fontSize:20}}>{movie?.title}</Text>
            <View style={{flexDirection: 'row',alignItems:'center',columnGap:4,marginTop:8}}>
              <Text style={{color: '#D1D5DB',fontSize:14}}>{movie?.release_date?.split('-')[0]}</Text>
              <Text style={{color: '#D1D5DB',fontSize:14}}>{movie?.runtime}min</Text>
            </View>

            <View style={{flexDirection: 'row',alignItems:'center',backgroundColor:'#24213D',paddingHorizontal:8,paddingVertical:4,borderRadius:6,columnGap:4,marginTop:8}}>
                <Image source={icons.star} style={{width:16,height:16}}/>
                <Text style={{color:'#FFFFFF',fontWeight:'bold',fontSize:14}}>{Math.round(movie?.vote_average??0)}/10</Text>
                <Text style={{color:'#D1D5DB',fontSize:14}}>({movie?.vote_count} votes)</Text>
            </View>
            <MovieInfo label='Overview' value={movie?.overview}/>
            <MovieInfo label='Genres' value={movie?.genres?.map((g)=>g.name).join(' - ') || 'N/A'}/>
              <View style={{flexDirection: 'row',justifyContent: 'space-between',width: '50%'}}>
                  <MovieInfo label='Budget' value={`$${movie?.budget/1_000_000} million `}/>
                    <MovieInfo label='Revenue' value={`$${Math.round(movie?.revenue)/1_000_000}`}/>
              </View>
              <MovieInfo label='Production Companies' value={movie?.production_companies.map((c)=>c.name).join(' - ') || 'N/A'}/>
        </View>
      </ScrollView>
      <TouchableOpacity style={{flexDirection:'row',alignItems:'center',justifyContent:'center',zIndex:50, position:'absolute', bottom:20, left:0, right:0, marginHorizontal:20, backgroundColor:'#A78BFA', borderRadius:8, paddingVertical:14 }}
        onPress={router.back}>
        <Image source={icons.arrow} style={{width:20,height:20,marginRight:4,marginTop:2,transform: [{ rotate: '180deg' }]}} tintColor={'#fff'}/>
        <Text style={{color:'#FFFFFF',fontWeight:'semibold',fontSize:16}}>Go Back</Text>
      </TouchableOpacity>
    </View>
  )
}

export default MovieDetails

const styles = StyleSheet.create({})