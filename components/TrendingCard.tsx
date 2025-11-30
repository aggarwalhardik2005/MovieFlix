import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { Link } from 'expo-router'
import { images } from '@/constants/images'
import MaskedView from '@react-native-masked-view/masked-view'

const TrendingCard = ({movie:{movie_id,title,poster_url},index}:TrendingCardProps) => {
  return (
    <Link href={`/movies/${movie_id}`} asChild>
        <TouchableOpacity style={{width:128,position:'relative',paddingLeft:20}}>
            <Image
                source={{uri:poster_url}}
                style={{width:128,height:192,borderRadius:8}}
                resizeMode="cover"
            />
            <View style={{position:'absolute',bottom:36,left: -14,paddingHorizontal:8,paddingVertical:4,borderRadius:9999}}>
                <MaskedView maskElement={
                  <Text style={{fontWeight: 'bold',color: '#FFFFFF',fontSize: 60}}>{index+1}</Text>
                }>
                  <Image source={images.rankingGradient} style={{width: 72,height: 72}} resizeMode='cover'/>
                </MaskedView>
            </View>
            <Text style={{fontSize: 14,fontWeight: 'bold',marginTop: 8,color: '#D1D5DB'}} numberOfLines={2}>
              {title}
            </Text>
        </TouchableOpacity>
    </Link>
  )
}

export default TrendingCard