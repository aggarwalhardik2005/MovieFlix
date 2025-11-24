import { icons } from '@/constants/icons';
import { images } from '@/constants/images';
import { Tabs } from 'expo-router';
import React from 'react';
import { Image, ImageBackground, StyleSheet, Text } from 'react-native';

const TabIcon=({focused,icon,title}:any)=>{
  if(focused){
  return (
    <>
    
       <ImageBackground source={images.highlight} style={styles.highlight}>
              <Image source={icon} tintColor={'#151312'} />
              <Text style={styles.hmtxt}>{title}</Text>
            </ImageBackground>
    </>
  )
}
  return <Image source={icon} style={{width:24,height:24,tintColor:'#A8B5DB',marginTop:14}} />
}
export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarItemStyle:{
          width:'100%',
          height:'100%',
          justifyContent:'center',
          alignItems:'center',
        },
        tabBarStyle: {
          backgroundColor: '#0f0D23',
          borderRadius: 50,
          marginHorizontal: 10,
          marginBottom: 30,
          height: 52,
          width: '95%',
          position: 'absolute',
          overflow: 'hidden',
          borderWidth: 0.5,
          borderColor: '#0f0D23',
          borderBlockColor: '#0f0D23',
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon
             focused={focused}
             icon={icons.home}
             title="Home"
            />
          ),
        }}
      />
      <Tabs.Screen 
      name="search" 
      options={{ 
        title: 'Search', 
        headerShown: false,
        tabBarIcon: ({ focused }) => (
            <TabIcon
             focused={focused}
             icon={icons.search}
             title="Search"
             />
          ),
       }}
       />
      
      <Tabs.Screen 
      name="saved" 
      options={{ 
        title: 'Saved',
        headerShown: false,
         tabBarIcon: ({ focused }) => (
            <TabIcon
             focused={focused}
             icon={icons.save}
             title="Saved"
             />
          ),
        }} />
      <Tabs.Screen 
      name="profile" 
      options={{ 
        title: 'Profile',
        headerShown: false,
         tabBarIcon: ({ focused }) => (
            <TabIcon
             focused={focused}
             icon={icons.person}
             title="Profile"
            />
          ),
        }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  highlight: {
    flexDirection: 'row',
    width: '100%',
    flex: 1,
    minWidth: 90,
    minHeight: 51,
    marginTop: 13,
    marginLeft: 5,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 50,
    overflow: 'hidden',
  },
  hmtxt: {
    color: '#6b7280',
    fontSize: 16,
    marginLeft: 4,
    fontWeight: '700',
  },
});