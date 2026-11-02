import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import './index.css'

import eyesLogo from './assets/logos/eyes.png'
import appIcon from './assets/logos/app-icon.png'
import orangeWordmark from './assets/logos/wordmark-orange.png'
import whiteWordmark from './assets/logos/wordmark-white.png'
import alingLucingPhoto from './assets/restaurants/aling-lucing.jpg'
import everybodysPhoto from './assets/restaurants/everybodys-cafe.jpg'
import susiesPhoto from './assets/restaurants/susies-cuisine.jpg'
import razonsPhoto from './assets/restaurants/razons-of-guagua.jpg'
import mangInasalPhoto from './assets/restaurants/mang-inasal.jpg'
import chowkingPhoto from './assets/restaurants/chowking.jpg'
import ramenNagiPhoto from './assets/restaurants/ramen-nagi.jpg'
import yellowCabPhoto from './assets/restaurants/yellow-cab.jpg'
import bonchonPhoto from './assets/restaurants/bonchon.jpg'
import {places,type Budget,type Diet,type Place} from './places'
import avatarOrange from './assets/avatars/avatar-orange.png'
import avatarMango from './assets/avatars/avatar-mango.png'
import avatarRed from './assets/avatars/avatar-red.png'
import avatarLime from './assets/avatars/avatar-lime.png'
import avatarTeal from './assets/avatars/avatar-teal.png'
import avatarIndigo from './assets/avatars/avatar-indigo.png'
import avatarUbe from './assets/avatars/avatar-ube.png'
import avatarRose from './assets/avatars/avatar-rose.png'

type Mode = 'pasa' | 'invite'
type Screen = 'splash'|'home'|'tropa'|'setup'|'lobby'|'swipe'|'pass'|'remote'|'vote'|'match'|'empty'|'details'|'deals'|'tropaTab'|'profile'|'settings'|'editProfile'|'terms'|'privacy'|'credits'|'responses'
type ResultMethod = 'Most votes'|'SpinEat! picked it'|'Bunot picked it'
type Person = { id: string; name: string; avatar: string }
type LatLng = { lat:number; lng:number }
type Restaurant = Place & { photo:string; credit?:PhotoCredit; price?:PublishedPrice; menu?:MenuInfo }
type PublishedPrice = { range:string; unit:string; source:string; url:string }
type MenuInfo = { items:Array<[string,string?]>; source?:string; url?:string; note?:string }
type DeckCard = Restaurant & { deckTag?:string }
type SavedTropa = { id:string; name:string; people:Array<Pick<Person,'name'|'avatar'>> }
type Plan = { id:string; restaurant:string; date:string; time:string; reminder:boolean }
type HistoryItem = { restaurantId:number; cravings:string[] }
type DealFilter = 'All'|'Group'|'Hirit'|'Claimed'
type Theme = 'light'|'dark'|'system'
type Profile = { name:string; email:string; homeArea:string; budget:Budget; diets:Diet[] }
type Alerts = { deals:boolean; reminders:boolean }
type Session = {
  mode:Mode; people:Person[]; hostId:string; budget:Budget; cravings:string[]; other:string
  area:string; diets:Diet[]; deck:DeckCard[]; swipes:Record<string,boolean[]>
  currentPerson:number; currentCard:number; votes:Record<string,number>; resultMethod:ResultMethod
  finalId:number|null; previousDeck:number[]
}

const photos = [
  'https://images.unsplash.com/photo-1658713064117-51f51ecfaf69?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1646821195934-fb7ddb6166ab?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1673518415903-c243d36cd269?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1467189386127-c4e5e31ee213?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1698268076632-204e5ec28615?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1516054575922-f0b8eeadec1a?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1760638260770-b6ec82ad8e33?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1778940517177-3ff09530ef98?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1695605302492-1cf7a0f789c0?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1772498181580-068f0744ad17?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1780082755456-3a72460270ea?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1610057098265-05f2bcbedd55?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1614563637806-1d0e645e0940?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1651981075280-9a9e01acbff0?auto=format&fit=crop&w=900&q=86',
  'https://images.unsplash.com/photo-1772693471187-6e7d364f99ee?auto=format&fit=crop&w=900&q=86',
]
type PhotoCredit = { author:string; license:string; url:string }
const credits:Record<string,PhotoCredit> = {
  bonchon:{author:"Amaeka Lyrae Loremas Cabaccang",license:"CC BY-SA 4.0",url:"https://commons.wikimedia.org/wiki/File:Bonchon_Wings,_Japanese_Rice,_Ebiko_Kimchi_Yaki_Udon,_and_Garlic_Mayo_Sauce.jpg"},
  alingLucing:{author:"Ralff Nestor Nacor",license:"CC BY-SA 4.0",url:"https://commons.wikimedia.org/wiki/File:Aling_Lucing_The_Sisig_Queen_Restaurant,_Angeles,_Pampanga,_Aug_2026_(2).jpg"},
  everybodys:{author:"Pancit Canton Media",license:"CC0",url:"https://commons.wikimedia.org/wiki/File:Food_from_Everybody%27s_Cafe_in_the_City_of_San_Fernando,_Pampanga,_Philippines.jpg"},
  susies:{author:"Pancit Canton Media",license:"CC0",url:"https://commons.wikimedia.org/wiki/File:Pancit_palabok_from_Susie%27s_Cuisine_and_buko_pandan_juice_from_Nathaniel%27s_in_Marquee_Mall,_Angeles_City,_Philippines.jpg"},
  razons:{author:"Video13",license:"CC BY-SA 4.0",url:"https://commons.wikimedia.org/wiki/File:Razon%27s_Halo-Halo_%26_Palabok_of_Guagua,_Pampanga.jpg"},
  mangInasal:{author:"Zarate123",license:"CC BY-SA 4.0",url:"https://commons.wikimedia.org/wiki/File:Mang_Inasal_restaurants_30.jpg"},
  chowking:{author:"Ramon FVelasquez",license:"CC BY-SA 3.0",url:"https://commons.wikimedia.org/wiki/File:Chowkingjf.JPG"},
  ramenNagi:{author:"Judgefloro",license:"CC0",url:"https://commons.wikimedia.org/wiki/File:0673ajfUniversal_Noodle_Ramen_Nagi_in_the_Philippinesfvf.jpg"},
  yellowCab:{author:"Wikimedia Commons contributor",license:"CC BY 3.0",url:"https://commons.wikimedia.org/wiki/File:Yellow_Cab_Pizza_Angeles.jpg"},
}
const categoryOptions = ['Filipino','Kapampangan','Korean','Japanese','Chinese & Dim Sum','Thai & Asian Fusion','American (Burgers & Pizza)','Café & Coffee','Merienda & Desserts','Salad & Healthy','Kahit ano','Other']
const categoryIcons:Record<string,string> = {'Filipino':'F','Kapampangan':'K','Korean':'KR','Japanese':'JP','Chinese & Dim Sum':'C','Thai & Asian Fusion':'T','American (Burgers & Pizza)':'A','Café & Coffee':'C','Merienda & Desserts':'M','Salad & Healthy':'S','Kahit ano':'✓','Other':'+'}
const areas = ['Near me','Angeles City','Clark','Mabalacat','San Fernando','Magalang','Arayat','Guagua']
const avatarOptions = [
  {name:'Orange',src:avatarOrange},{name:'Mango',src:avatarMango},{name:'Red',src:avatarRed},{name:'Lime',src:avatarLime},
  {name:'Teal',src:avatarTeal},{name:'Indigo',src:avatarIndigo},{name:'Ube',src:avatarUbe},{name:'Rose',src:avatarRose},
]
const defaultProfile:Profile = {name:'',email:'',homeArea:'Near me',budget:'Sakto',diets:[]}
const defaultAlerts:Alerts = {deals:true,reminders:true}
const prefsKey='lookarin-prefs'
const loadPrefs=():{profile?:Profile;theme?:Theme;alerts?:Alerts;avatar?:string}=>{
  try{return JSON.parse(localStorage.getItem(prefsKey)||'{}')}catch{return {}}
}
const savedPrefs=loadPrefs()
const savedAvatar=avatarOptions.find(a=>a.name===savedPrefs.avatar)?.src||avatarOrange
const makeDemoPeople = (profileAvatar:string):Person[] => {
  const available=avatarOptions.map(a=>a.src).filter(src=>src!==profileAvatar)
  return ['Person 1','Person 2','Person 3','Person 4'].map((name,i)=>({id:`p${i+1}`,name,avatar:i===0?profileAvatar:available[i-1]}))
}
const blankSession = (mode:Mode='pasa', demo=false, profileAvatar=avatarOrange, profile=defaultProfile):Session => ({
  mode, people:demo?makeDemoPeople(profileAvatar).map((p,i)=>i===0&&profile.name?{...p,name:profile.name}:p):[{id:'p1',name:profile.name,avatar:profileAvatar}], hostId:'p1', budget:profile.budget,
  cravings:demo?['Kapampangan','Korean']:['Kahit ano'], other:'', area:profile.homeArea, diets:[...profile.diets],
  deck:[], swipes:{}, currentPerson:0, currentCard:0, votes:{}, resultMethod:'Most votes',
  finalId:null, previousDeck:[]
})

// Distances are estimates from central Angeles City. Budgets and diet tags are estimates too.
const samplePhotos:Record<string,number[]> = {'Filipino':[0,1,2],'Kapampangan':[0,1,2],'Korean':[9,10],'Japanese':[8,12],'Chinese & Dim Sum':[13],'Thai & Asian Fusion':[6,11],'American (Burgers & Pizza)':[15,16],'Café & Coffee':[3,5],'Merienda & Desserts':[5,7],'Salad & Healthy':[14]}
const realPhotos:Record<string,string> = {alingLucing:alingLucingPhoto,everybodys:everybodysPhoto,susies:susiesPhoto,razons:razonsPhoto,mangInasal:mangInasalPhoto,chowking:chowkingPhoto,ramenNagi:ramenNagiPhoto,yellowCab:yellowCabPhoto,bonchon:bonchonPhoto}
const samplePhoto=(p:Place)=>{const pool=samplePhotos[p.categories[0]];return photos[pool[p.id%pool.length]]}

const guide2026='https://www.kozystaycation.com/best-restaurants-near-clark'
const pricing:Record<number,Pick<Restaurant,'price'|'menu'>> = {
  1:{price:{range:'₱150–300',unit:'per person',source:'Kozy Staycation guide, 2026',url:guide2026},menu:{items:[['Sizzling Sisig, small','₱285'],['Sizzling Sisig, medium','₱590'],['Sizzling Sisig, large (2 kilos)','₱1,425']],source:'Foodpanda',url:'https://www.foodpanda.ph/restaurant/e2sl/aling-lucing-sisig-main',note:'Delivery list prices. Dine-in prices may be lower.'}},
  2:{price:{range:'₱200–500',unit:'per person',source:'Kozy Staycation guide, 2026',url:guide2026},menu:{items:[['Morcon','₱720'],['Fried Itik','₱650'],['Tapang Kalabaw','₱550'],['Longanisa','₱120'],['Adobong Camaru'],['Kare-Kare with Bagoong']],source:"Everybody's Cafe menu listing, 2026",url:'https://everybodys-cafe.res-menu.net/menu',note:'Dish prices are for a full order, usually shared.'}},
  3:{price:{range:'₱250–500',unit:'per person',source:'Kozy Staycation guide, 2026',url:guide2026},menu:{items:[['Pancit Palabok'],['Pancit Luglug'],['Tibok-Tibok'],['Morcon']]}},
  8:{price:{range:'₱70–110',unit:'per halo-halo',source:'GMA News feature, undated',url:'https://gmanetwork.com/news/lifestyle/food/487466/your-favorite-halo-halo-places-kabigting-s-halo-halo/story'},menu:{items:[['Halo-Halo','₱70'],['Pastillas Halo-Halo','₱110']],note:'Older prices, and the ₱70 was at the Nepo Mall branch.'}},
  13:{price:{range:'₱445–595',unit:'per bowl',source:'Suroy, August 2026',url:'https://suroy.ph/ramen-nagi-ayala-center-cebu/'},menu:{items:[['Butao King','₱445'],['Red King','₱545'],['Black King','₱545'],['Green King','₱545'],['Wonder Kakuni King','₱595'],['Kaedama (extra noodles)','₱95']],source:'Suroy, August 2026',url:'https://suroy.ph/ramen-nagi-ayala-center-cebu/',note:'Prices checked at the Cebu branch. Confirm at SM City Clark.'}},
  14:{price:{range:'₱68–245',unit:'per item',source:'Foodpanda, Calapan branch',url:'https://www.foodpanda.ph/restaurant/yipr/mix-and-match-jollibee-mang-inasal-chowking-and-greenwich-citymall-calapan'},menu:{items:[['Pork Chao Fan','₱68'],['Pork Chao Fan with Drink','₱92'],['Beef Chao Fan','₱109'],['Pork Siomai Platter','₱245']],source:'Foodpanda, Calapan branch',url:'https://www.foodpanda.ph/restaurant/yipr/mix-and-match-jollibee-mang-inasal-chowking-and-greenwich-citymall-calapan',note:'Delivery prices from another branch.'}},
  16:{menu:{items:[['Dear Darla Pizza'],['New York-style pizzas'],['Pasta']]}},
  17:{price:{range:'₱91–207',unit:'per item',source:'Foodpanda, Super 8 Angeles and Calapan',url:'https://www.foodpanda.ph/restaurant/y8de/mang-inasal-super-8-angeles'},menu:{items:[['Crema de Leche Halo-Halo','₱91'],['Palabok, regular','₱108'],['Grilled Liempo with one rice','₱163'],['Paa Large','₱177'],['Pecho Large','₱207']],source:'Foodpanda',url:'https://www.foodpanda.ph/restaurant/y8de/mang-inasal-super-8-angeles',note:'Delivery prices. Paa and Pecho are from the Calapan branch.'}},
  18:{price:{range:'₱400–1,200',unit:'per person',source:'Restaurant Guru',url:'https://restaurantguru.com/Binulo-Restaurant-Angeles'},menu:{items:[['Murcon Kapampangan','₱950'],['Kare-Kare','₱950'],['Tidtad','₱580'],['Binulo Rice','₱220'],['Binulong Manok']],source:'SPOT.ph, April 2026',url:'https://www.spot.ph/eatdrink/the-latest-eat-drink/spot-out-of-town-where-to-eat-in-clark-pampanga-a3412-20260423-dyn',note:'Dish prices are for a full order, usually shared.'}},
  20:{price:{range:'₱2,500–4,000',unit:'per person',source:'Kozy Staycation guide, 2026',url:guide2026},menu:{items:[['Seasonal tasting menu by Chef Claude Tayag']]}},
  27:{price:{range:'₱400–600',unit:'per person',source:'Restaurant Guru',url:'https://restaurantguru.com/Fortune-Angeles-3'}},
  33:{price:{range:'₱1,000–1,200',unit:'per person',source:'Restaurant Guru',url:'https://restaurantguru.com/Paizanos-Pizzeria-Angeles'}},
  41:{price:{range:'About ₱75',unit:'per halo-halo',source:'GMA News feature, undated',url:'https://gmanetwork.com/news/lifestyle/food/486830/your-favorite-halo-halo-places-luz-the-original-razon-s-halo-halo/story'},menu:{items:[['Halo-Halo','₱75'],['Pancit Palabok']],note:'Older price from the original Guagua branch.'}},
  44:{price:{range:'₱499',unit:'unlimited',source:'SunStar and Kozy Staycation',url:'https://www.sunstar.com.ph/pampanga/lifestyle/romantic-baboy-opens-at-sm-city-clark'},menu:{items:[['Unlimited pork, beef, six sides, and rice','₱499']]}},
  45:{price:{range:'₱200–400',unit:'per person',source:'Kozy Staycation guide, 2026',url:guide2026},menu:{items:[['Soy Garlic Chicken Wings']]}},
}
const restaurants:Restaurant[] = places.map(p=>({...p,photo:p.photoKey?realPhotos[p.photoKey]:samplePhoto(p),credit:p.photoKey?credits[p.photoKey]:undefined,...pricing[p.id]}))
const areaCenters:Record<string,LatLng> = {'Angeles City':{lat:15.145,lng:120.589},'Clark':{lat:15.182,lng:120.527},'Mabalacat':{lat:15.222,lng:120.575},'San Fernando':{lat:15.033,lng:120.685},'Magalang':{lat:15.215,lng:120.661},'Arayat':{lat:15.15,lng:120.77},'Guagua':{lat:14.965,lng:120.632}}
const nearRadius=10
const kmBetween=(a:LatLng,b:LatLng)=>{
  const rad=Math.PI/180,dLat=(b.lat-a.lat)*rad,dLng=(b.lng-a.lng)*rad
  const h=Math.sin(dLat/2)**2+Math.cos(a.lat*rad)*Math.cos(b.lat*rad)*Math.sin(dLng/2)**2
  return 6371*2*Math.asin(Math.sqrt(h))
}
const kmLabel=(km:number)=>`${km<10?km.toFixed(1):Math.round(km)} km`
const mapLink=(r:Restaurant)=>`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([r.name,r.address,r.area,'Pampanga'].filter(Boolean).join(', '))}`
const ratingLabel=(r:Restaurant)=>r.rating?`★ ${r.rating.toFixed(1)}`:''
const tierPrice:Record<Budget,string> = {Tipid:'₱100–250',Sakto:'₱250–500',Bawi:'₱500–1,000'}
const priceLabel = (r:Restaurant) => r.price?`${r.price.range} ${r.price.unit}`:`Est. ${tierPrice[r.budget]} per person`

const Icon = ({name,size=22}:{name:string;size?:number}) => {
  const p:Record<string,React.ReactNode> = {
    home:<><path d="M3 11 12 3l9 8"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    tag:<><path d="M20 13 13 20 4 11V4h7z"/><circle cx="8.5" cy="8.5" r="1"/></>,
    people:<><circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2.5-6 6-6s6 2 6 6M16 5a3 3 0 0 1 0 6M17 14c2.5.5 4 2.3 4 5"/></>,
    person:<><circle cx="12" cy="8" r="4"/><path d="M4 21c.7-5 3.3-7 8-7s7.3 2 8 7"/></>,
    chevron:<path d="m15 18-6-6 6-6"/>, arrow:<path d="m5 12 14 0m-6-6 6 6-6 6"/>,
    spark:<path d="m12 2 1.7 6.3L20 10l-6.3 1.7L12 18l-1.7-6.3L4 10l6.3-1.7z"/>,
    share:<><path d="M12 16V3m-4 4 4-4 4 4"/><path d="M5 12v8h14v-8"/></>,
    map:<><path d="M12 21s7-6 7-12a7 7 0 1 0-14 0c0 6 7 12 7 12z"/><circle cx="12" cy="9" r="2.5"/></>,
    x:<path d="m6 6 12 12M18 6 6 18"/>, heart:<path d="M20 5.8c-2.4-2.4-6.2-1.4-8 1.4-1.8-2.8-5.6-3.8-8-1.4-2.7 2.7-1 7.2 8 13 9-5.8 10.7-10.3 8-13z"/>,
    qr:<><path d="M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM15 14h2v2h-2zM19 14h2v4h-2zM14 19h4v2h-4zM20 20h1v1"/></>,
    check:<path d="m5 12 4 4L19 6"/>, undo:<path d="M9 7 4 12l5 5M5 12h8a6 6 0 0 1 6 6"/>,
    plus:<path d="M12 5v14M5 12h14"/>, trash:<><path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/></>,
    info:<><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7h.01"/></>,
    gear:<><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
    moon:<path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z"/>,
    bell:<><path d="M6 10a6 6 0 0 1 12 0c0 6 2 7 2 7H4s2-1 2-7z"/><path d="M10 21h4"/></>,
    doc:<><path d="M6 3h9l4 4v14H6z"/><path d="M9 12h7M9 16h7"/></>,
    shield:<path d="M12 3 5 6v6c0 4.5 3 7.5 7 9 4-1.500 7-4.500 7-9V6z"/>,
    edit:<path d="M4 20h4L19 9l-4-4L4 16zM13 7l4 4"/>,
    crown:<><path d="m4 8 4 4 4-7 4 7 4-4-2 10H6z"/></>, refresh:<><path d="M20 7v5h-5"/><path d="M18 16a8 8 0 1 1 1-9l1 5"/></>, lock:<><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  }
  return <svg aria-hidden viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{p[name]}</svg>
}
type ButtonKind = 'primary'|'secondary'|'plain'|'white'|'blue'|'green'|'gold'|'red'|'neutral'
const Button = ({children,onClick,kind='primary',disabled,className=''}:{children:React.ReactNode;onClick?:()=>void;kind?:ButtonKind;disabled?:boolean;className?:string}) =>
  <button className={`btn ${kind} ${className}`} onClick={onClick} disabled={disabled}>{children}</button>
const Avatar = ({avatar,small=false,profile=false,className=''}:{avatar:string;small?:boolean;profile?:boolean;className?:string}) => <img className={`avatar ${small?'small':''} ${profile?'profile-avatar':''} ${className}`} src={avatar} alt="Profile avatar"/>
const Eyes = ({happy=false,className=''}:{happy?:boolean;className?:string}) => happy?<div className={`happy-eyes ${className}`}>⌃&nbsp;&nbsp;⌃</div>:<img className={`eyes ${className}`} src={eyesLogo} alt=""/>
const FoodImage = ({src,alt,className=''}:{src:string;alt:string;className?:string}) => {
  const [loaded,setLoaded]=useState(false)
  return <span className={`food-image ${className} ${loaded?'loaded':''}`}><Eyes/><img src={src} alt={alt} onLoad={()=>setLoaded(true)}/></span>
}
const Chip = ({children,selected,onClick,disabled}:{children:React.ReactNode;selected?:boolean;onClick?:()=>void;disabled?:boolean}) =>
  <button className={`chip ${selected?'selected':''}`} onClick={onClick} disabled={disabled}>{selected&&<Icon name="check" size={15}/>} {children}</button>
const Sheet = ({children,onClose,className=''}:{children:React.ReactNode;onClose:()=>void;className?:string}) => {
  const start=useRef<number|null>(null)
  return <div className="sheet-wrap" onClick={e=>e.target===e.currentTarget&&onClose()}><div className={`sheet ${className}`} onPointerDown={e=>{start.current=e.currentTarget.scrollTop===0?e.clientY:null}} onPointerUp={e=>{if(start.current!==null&&e.clientY-start.current>90)onClose();start.current=null}}><div className="grabber"/>{children}</div></div>
}
const TabBar = ({screen,go}:{screen:Screen;go:(s:Screen)=>void}) => <div className="tabbar">{[
  ['home','Home','home'],['deals','Deals','tag'],['tropaTab','Tropa','people'],['profile','Profile','person']
].map(([s,l,i])=><button key={s} className={screen===s?'active':''} onClick={()=>go(s as Screen)}><Icon name={i}/><span>{l}</span></button>)}</div>
const AppShell = ({children,tabs=false,className='',screen,screenDirection='forward',go}:{children:React.ReactNode;tabs?:boolean;className?:string;screen?:Screen;screenDirection?:'forward'|'back';go?:(s:Screen)=>void}) => <main className={`phone screen-${screenDirection} ${className}`}>{children}{tabs&&screen&&go&&<TabBar screen={screen} go={go}/>}</main>

const BottomAction=({children,onClick,disabled,hint,kind='primary'}:{children:React.ReactNode;onClick:()=>void;disabled?:boolean;hint?:string;kind?:ButtonKind})=><div className="bottom-action consistent-action"><Button kind={kind} onClick={onClick} disabled={disabled}>{children}</Button>{disabled&&hint&&<small>{hint}</small>}</div>

const PersonRow = ({person,index,isHost,canRemove,inputRef,onNameChange,onMakeHost,onRemove,onAvatarClick}:{
  person:Person;index:number;isHost:boolean;canRemove:boolean;inputRef:(element:HTMLInputElement|null)=>void
  onNameChange:(id:string,value:string)=>void;onMakeHost:(id:string)=>void;onRemove:(id:string)=>void;onAvatarClick:(id:string)=>void
}) => <div className="person-row">
  <button className="person-avatar-button" aria-label={`Change ${person.name||`Person ${index+1}`} avatar`} onClick={()=>onAvatarClick(person.id)}><Avatar avatar={person.avatar}/></button>
  <div className="name-field">
    <input type="text" inputMode="text" autoComplete="name" enterKeyHint="next" ref={inputRef} aria-label={`Person ${index+1} name`} value={person.name} placeholder={index===0?'Person 1 (Ikaw)':`Person ${index+1}`} onChange={e=>onNameChange(person.id,e.target.value)}/>
    {isHost?<span className="host-badge">Ang Bahala</span>:<button className="make-host" onClick={()=>onMakeHost(person.id)}><Icon name="crown" size={16}/> Gawing Bahala</button>}
  </div>
  {index>0&&<button aria-label={`Remove ${person.name||`Person ${index+1}`}`} disabled={!canRemove} onClick={()=>onRemove(person.id)}><Icon name="trash" size={18}/></button>}
</div>
const tropaKey = (people:Array<{name:string}>) => people.map(p=>p.name.trim().toLocaleLowerCase()).sort().join('|')
const titleCase = (value:string) => value.trim().replace(/\b\w/g,letter=>letter.toUpperCase())
const HandoffLayout = ({person,waiting=false}:{person:Person;waiting?:boolean}) => <div className={`handoff-group ${waiting?'waiting-handoff':''}`}>
  <Eyes className="handoff-eyes"/>
  <div className="privacy-pill"><Icon name="lock" size={17}/>{waiting?'Sandali lang':'Bawal sumilip!'}</div>
  {waiting?<h2>{`Hinihintay pa si ${titleCase(person.name)}...`}</h2>:<><h2>Tapos ka na ba?</h2><p className="handoff-label">Pasa mo kay</p><h1 className={person.name.length>14?'long-name':''}>{titleCase(person.name)}</h1></>}
  <p className="handoff-helper">{waiting?`Kinukuha lang ang picks ni ${titleCase(person.name)}.`:`Ibigay ang phone kay ${titleCase(person.name)} para siya na ang mag-swipe.`}</p>
</div>

// Current device scale, so drag distances stay 1:1 with the finger when the iPhone frame is scaled down
let deviceScale=1

function Prototype(){
  const [screen,setScreen]=useState<Screen>('splash')
  const [profileAvatar,setProfileAvatar]=useState(savedAvatar)
  const [profile,setProfile]=useState<Profile>({...defaultProfile,...savedPrefs.profile})
  const [profileDraft,setProfileDraft]=useState<Profile>(defaultProfile)
  const [editBack,setEditBack]=useState<Screen>('profile')
  const [theme,setTheme]=useState<Theme>(savedPrefs.theme||'light')
  const [alerts,setAlerts]=useState<Alerts>({...defaultAlerts,...savedPrefs.alerts})
  const [session,setSession]=useState<Session>(()=>blankSession('pasa',false,savedAvatar,{...defaultProfile,...savedPrefs.profile}))
  const [demo,setDemo]=useState(false)
  const [plus,setPlus]=useState(false)
  const [plusPlan,setPlusPlan]=useState<'month'|'year'>('month')
  const [savedTropas,setSavedTropas]=useState<SavedTropa[]>([])
  const [plans,setPlans]=useState<Plan[]>([])
  const [historyItems,setHistoryItems]=useState<HistoryItem[]>([])
  const [menu,setMenu]=useState(false)
  const [sheet,setSheet]=useState<'exit'|'share'|'directions'|'tsamba'|'plus'|'plusConfirm'|'plusWelcome'|'saved'|'saveTropa'|'planner'|'managePlus'|'personAvatar'|'profileAvatar'|'passBack'|'reset'|'menu'|null>(null)
  const [selected,setSelected]=useState<Restaurant>(restaurants[0])
  const [detailBack,setDetailBack]=useState<Screen>('home')
  const [joined,setJoined]=useState(1)
  const [moreOpen,setMoreOpen]=useState(false)
  const [cravingHint,setCravingHint]=useState('')
  const [dragX,setDragX]=useState(0)
  const [swipeLock,setSwipeLock]=useState(false)
  const [passNext,setPassNext]=useState('')
  const [remoteName,setRemoteName]=useState('')
  const [voteChoice,setVoteChoice]=useState<number|null>(null)
  const [votesRevealed,setVotesRevealed]=useState(false)
  const [voteOverlay,setVoteOverlay]=useState('')
  const [game,setGame]=useState<'wheel'|'claw'>('wheel')
  const [gameRunning,setGameRunning]=useState(false)
  const [gameWinner,setGameWinner]=useState<number|null>(null)
  const [wheelRotation,setWheelRotation]=useState(0)
  const [demoTie,setDemoTie]=useState(false)
  const [screenDirection,setScreenDirection]=useState<'forward'|'back'>('forward')
  const [clawPosition,setClawPosition]=useState(50)
  const [planDraft,setPlanDraft]=useState<Plan>({id:'',restaurant:restaurants[0].name,date:'',time:'',reminder:true})
  const [avatarPersonId,setAvatarPersonId]=useState<string|null>(null)
  const [draftProfileAvatar,setDraftProfileAvatar]=useState(savedAvatar)
  const [nextPersonId,setNextPersonId]=useState(2)
  const [claimed,setClaimed]=useState<number[]>([])
  const [dealFilter,setDealFilter]=useState<DealFilter>('All')
  const [toast,setToast]=useState('')
  const [emptyReason,setEmptyReason]=useState('')
  const [emptyAlt,setEmptyAlt]=useState('')
  const here=useRef<LatLng|null>(null)
  const [origin,setOrigin]=useState({...areaCenters['Angeles City'],label:'from central Angeles City'})
  const away=(r:Restaurant)=>kmLabel(kmBetween(origin,r))
  const [notice,setNotice]=useState<{id:string;avatar:string;title:string;body:string}|null>(null)
  const [openAnswers,setOpenAnswers]=useState<string|null>(null)
  const dragStart=useRef(0)
  const votePassTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const flowTimer=useRef<ReturnType<typeof setInterval>|null>(null)
  const toastTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const noticeTimer=useRef<ReturnType<typeof setTimeout>|null>(null)
  const inputRefs=useRef<Record<string,HTMLInputElement|null>>({})

  useEffect(()=>{if(screen==='splash'){const t=setTimeout(()=>setScreen('home'),4000);return()=>clearTimeout(t)}},[screen])
  useLayoutEffect(()=>{
    const media=window.matchMedia('(prefers-color-scheme: dark)')
    const apply=()=>{document.documentElement.dataset.appTheme=theme==='dark'||(theme==='system'&&media.matches)?'dark':'light'}
    apply()
    media.addEventListener('change',apply)
    return()=>media.removeEventListener('change',apply)
  },[theme])
  useLayoutEffect(()=>{
    const bar=['splash','pass','remote'].includes(screen)?'#ff5a1f':getComputedStyle(document.documentElement).getPropertyValue('--cream').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content',bar)
  },[screen,theme])
  useEffect(()=>{
    const avatar=avatarOptions.find(a=>a.src===profileAvatar)?.name
    try{localStorage.setItem(prefsKey,JSON.stringify({profile,theme,alerts,avatar}))}catch{/* preferences just won't persist */}
  },[profile,theme,alerts,profileAvatar])
  const patch=(p:Partial<Session>)=>setSession(s=>({...s,...p}))
  const host=session.people.find(p=>p.id===session.hostId)||session.people[0]
  const current=session.people[session.currentPerson]||session.people[0]
  const finalRestaurant=restaurants.find(r=>r.id===session.finalId)||session.deck[0]||restaurants[0]

  const notify=(message:string)=>{
    setToast(message)
    if(toastTimer.current)clearTimeout(toastTimer.current)
    toastTimer.current=setTimeout(()=>setToast(''),2200)
  }
  const pushNotice=(person:Person,title:string,body:string)=>{
    setNotice({id:person.id,avatar:person.avatar,title,body})
    if(noticeTimer.current)clearTimeout(noticeTimer.current)
    noticeTimer.current=setTimeout(()=>setNotice(null),3400)
  }
  const clearFlow=()=>{
    if(flowTimer.current){clearInterval(flowTimer.current);flowTimer.current=null}
    if(votePassTimer.current){clearTimeout(votePassTimer.current);votePassTimer.current=null}
    setRemoteName('');setVoteOverlay('');setNotice(null)
  }
  const resetRound=()=>{clearFlow();setVoteChoice(null);setVotesRevealed(false);setMenu(false);setSheet(null)}
  const start=(mode:Mode)=>{resetRound();setNextPersonId(demo?5:2);setSession(blankSession(mode,demo,profileAvatar,profile));setDemoTie(Date.now()%2===0);setScreenDirection('forward');setScreen('tropa')}
  const exitSession=()=>{resetRound();setNextPersonId(2);setSession(blankSession('pasa',false,profileAvatar,profile));setScreenDirection('back');setScreen('home')}
  const go=(s:Screen,back=false)=>{setMenu(false);setScreenDirection(back?'back':'forward');setScreen(s)}
  const details=(r:Restaurant)=>{setSelected(r);setDetailBack(screen);go('details')}

  const stepFor:Record<string,number>={tropa:1,setup:2,lobby:2,swipe:3,pass:3,remote:3,responses:3,vote:4,match:5,empty:2}
  const sessionBack=()=>{
    if(screen==='tropa')go('home',true)
    else if(screen==='setup')go('tropa',true)
    else if(screen==='lobby')go('setup',true)
    else if(screen==='swipe'){
      if(session.mode==='pasa'&&!demo&&session.currentPerson>0){patch({currentPerson:session.currentPerson-1});go('pass',true)}
      else go(session.mode==='invite'?'lobby':'setup',true)
    }
    else if(screen==='vote'){clearFlow();patch({currentCard:Math.max(0,session.deck.length-1)});go('swipe',true)}
    else if(screen==='empty')go('setup',true)
    else if(screen==='responses'){clearFlow();patch({currentCard:Math.max(0,session.deck.length-1)});go('swipe',true)}
  }
  const sessionHeader=(title:string,helper:string)=><>
    <div className="session-nav">
      <button aria-label="Back" onClick={sessionBack}><Icon name="chevron"/></button>
      <button aria-label="Close session" onClick={()=>setSheet('exit')}><Icon name="x"/></button>
    </div>
    <div className="step-progress"><div><strong>Step {stepFor[screen]} of 5</strong><span>{['Tropa','Setup','Swipe','Botohan','Dito Na!'][stepFor[screen]-1]}</span></div><div className="step-dots">{[1,2,3,4,5].map(n=><i key={n} className={n<=stepFor[screen]?'on':''}/>)}</div></div>
    <div className="session-title"><h1>{title}</h1><p>{helper}</p></div>
  </>

  const namesValid=useMemo(()=>{
    const clean=session.people.map(p=>p.name.trim().toLocaleLowerCase())
    return session.people.length>=2&&clean.every(Boolean)&&new Set(clean).size===clean.length
  },[session.people])
  const setupValid=!!session.budget&&session.cravings.length>0&&(!session.cravings.includes('Other')||!!session.other.trim())
  const setPeople=(updater:(people:Person[])=>Person[])=>setSession(prev=>({...prev,people:updater(prev.people)}))
  const updateName=(id:string,value:string)=>setPeople(prev=>prev.map(p=>p.id===id?{...p,name:value}:p))
  const addPerson=()=>{if(session.people.length<8){const id=`p${nextPersonId}`;setNextPersonId(value=>value+1);const used=new Set(session.people.map(p=>p.avatar));const avatar=avatarOptions.find(option=>!used.has(option.src))?.src||avatarOrange;setPeople(prev=>[...prev,{id,name:'',avatar}]);setTimeout(()=>inputRefs.current[id]?.focus(),80)}}
  const removePerson=(id:string)=>{
    if(session.people.length<=2)return
    const next=session.people.filter(p=>p.id!==id)
    setSession(prev=>({...prev,people:next,hostId:id===prev.hostId?next[0].id:prev.hostId}))
  }
  const toggleCraving=(c:string)=>{
    setCravingHint('')
    if(c==='Kahit ano'){patch({cravings:['Kahit ano'],other:''});return}
    let next=session.cravings.filter(x=>x!=='Kahit ano')
    if(next.includes(c)){next=next.filter(x=>x!==c)}
    else if(next.length>=3){setCravingHint('Hanggang 3 lang');return}
    else next=[...next,c]
    patch({cravings:next,other:c==='Other'?session.other:next.includes('Other')?session.other:''})
  }

  const makeDeck=(avoid:number[])=>{
    const level:Budget[]=['Tipid','Sakto','Bawi']
    const required=session.diets.filter(d=>d!=='Allergies')
    const eligible=restaurants.filter(r=>required.every(d=>r.diets.includes(d))&&(!plus||!r.featured))
    const nearMe=session.area==='Near me'
    // Near me starts from central Angeles City without a location, or when no listed restaurant is close.
    const located=!!here.current&&restaurants.some(r=>kmBetween(here.current!,r)<=nearRadius)
    const start=nearMe?(located?here.current!:areaCenters['Angeles City']):areaCenters[session.area]
    if(nearMe&&!located)notify('Di makuha ang location mo. Angeles City muna.')
    setOrigin({...start,label:nearMe&&located?'from you':`from central ${nearMe?'Angeles City':session.area}`})
    const otherText=session.other.trim().toLocaleLowerCase()
    const searchText=(r:Restaurant)=>`${r.name} ${r.type} ${r.description} ${r.categories.map(c=>c.replace(/\s*\(.*\)/,'')).join(' ')} ${r.known}`.toLocaleLowerCase()
    const fits=(r:Restaurant,craving:string)=>craving==='Other'?searchText(r).includes(otherText):r.categories.includes(craving)
    const anything=session.cravings.includes('Kahit ano')
    const wanted=anything?categoryOptions.filter(c=>c!=='Kahit ano'&&c!=='Other'):session.cravings
    const inArea=(r:Restaurant)=>nearMe?kmBetween(start,r)<=nearRadius:r.area===session.area
    const budgetGap=(r:Restaurant)=>Math.abs(level.indexOf(r.budget)-level.indexOf(session.budget))
    // Ratings with few reviews lean toward the average so a single 5.0 does not beat a proven favorite.
    const trust=(r:Restaurant)=>((r.rating??4.2)*(r.reviews??0)+4.2*40)/((r.reviews??0)+40)
    const closeness=(r:Restaurant)=>nearMe?Math.floor(kmBetween(start,r)/3):0
    const rank=(x:Restaurant,y:Restaurant)=>(avoid.includes(x.id)?1:0)-(avoid.includes(y.id)?1:0)||closeness(x)-closeness(y)||budgetGap(x)-budgetGap(y)||trust(y)-trust(x)||kmBetween(start,x)-kmBetween(start,y)||x.id-y.id
    // Only restaurants in the chosen area and category. Take turns so every chosen category gets cards.
    const queues=wanted.map(craving=>eligible.filter(r=>inArea(r)&&fits(r,craving)).sort(rank))
    const picks:Restaurant[]=[]
    for(let added=true;added&&picks.length<6;){
      added=false
      for(const queue of queues){
        const next=queue.find(r=>!picks.includes(r))
        if(next&&picks.length<6){picks.push(next);added=true}
      }
    }
    if(picks.length<2){
      const names=session.cravings.map(c=>c==='Other'?session.other.trim():c).join(', ')
      const place=nearMe?'malapit sa iyo':`sa ${session.area}`
      const nearby=areas.filter(a=>a!=='Near me'&&a!==session.area).sort((x,y)=>kmBetween(start,areaCenters[x])-kmBetween(start,areaCenters[y]))
      setEmptyAlt(nearby.find(a=>eligible.filter(r=>r.area===a&&wanted.some(c=>fits(r,c))).length>=2)||'')
      setEmptyReason(picks.length===0&&!required.length?`Wala pa kaming ${names} ${place}.`:`Kulang ang ${names} ${place}${required.length?` na swak sa ${required.join(', ')}`:''}.`)
      patch({deck:[],swipes:{},votes:{},finalId:null});go('empty');return
    }
    const next=picks.map(r=>{
      let deckTag:string|undefined
      if(r.budget!==session.budget)deckTag=level.indexOf(r.budget)>level.indexOf(session.budget)?'Konting dagdag':'Mas tipid'
      return {...r,deckTag}
    })
    patch({deck:next,swipes:{},votes:{},currentPerson:0,currentCard:0,finalId:null,previousDeck:session.deck.map(r=>r.id)})
    setVoteChoice(null);setVotesRevealed(false)
    if(session.mode==='invite'){setJoined(1);go('lobby')}else go('swipe')
  }
  const buildDeck=(avoid:number[]=[])=>{
    if(session.area==='Near me'&&!here.current&&navigator.geolocation){
      notify('Hinahanap ka...')
      navigator.geolocation.getCurrentPosition(p=>{here.current={lat:p.coords.latitude,lng:p.coords.longitude};makeDeck(avoid)},()=>makeDeck(avoid),{timeout:7000,maximumAge:600000})
      return
    }
    makeDeck(avoid)
  }
  const continueSetup=()=>buildDeck()

  const generateSwipes=(base:Record<string,boolean[]>)=>{
    const next={...base}
    session.people.slice(1).forEach((p,pi)=>{next[p.id]=session.deck.map((_,i)=>demo?((i+pi)%3!==1):((i+pi*2+1)%3!==0))})
    return next
  }
  const startResponses=(base:Record<string,boolean[]>)=>{
    clearFlow()
    const all=generateSwipes(base)
    const pending=session.people.slice(1).filter(p=>(base[p.id]?.length||0)<session.deck.length)
    patch({swipes:base,currentPerson:0,currentCard:0});setOpenAnswers(null);go('responses')
    let i=0
    if(!pending.length)return
    flowTimer.current=setInterval(()=>{
      const person=pending[i]
      const yes=all[person.id].filter(Boolean).length
      setSession(prev=>({...prev,swipes:{...prev.swipes,[person.id]:all[person.id]}}))
      setOpenAnswers(person.id)
      pushNotice(person,`${titleCase(person.name)} answered!`,`${yes} of ${session.deck.length} G! Tap to see the picks.`)
      i++
      if(i>=pending.length&&flowTimer.current){clearInterval(flowTimer.current);flowTimer.current=null}
    },2600)
  }
  const finishHostSwipes=(base:Record<string,boolean[]>)=>{
    if(session.mode==='invite'){startResponses(base);return}
    if(demo){
      patch({swipes:base});setRemoteName(session.people[1]?.name||'tropa');go('remote')
      let i=1
      flowTimer.current=setInterval(()=>{i++;if(i<session.people.length)setRemoteName(session.people[i].name);else{clearFlow();patch({swipes:generateSwipes(base),currentPerson:0,currentCard:0});go('vote')}},600)
    }else{patch({swipes:base,currentPerson:0,currentCard:0});go('vote')}
  }
  const answer=(yes:boolean)=>{
    if(swipeLock||!session.deck[session.currentCard])return
    const answers=session.swipes[current.id]||[]
    if(answers.length!==session.currentCard)return
    setSwipeLock(true);setDragX(yes?460:-460)
    const nextAnswers=[...answers,yes]
    const nextSwipes={...session.swipes,[current.id]:nextAnswers}
    setTimeout(()=>{
      setDragX(0);setSwipeLock(false)
      if(session.currentCard<session.deck.length-1)patch({swipes:nextSwipes,currentCard:session.currentCard+1})
      else if(session.mode==='pasa'&&!demo&&session.currentPerson<session.people.length-1){
        patch({swipes:nextSwipes});setPassNext(session.people[session.currentPerson+1].name);go('pass')
      }else finishHostSwipes(session.mode==='pasa'&&!demo?nextSwipes:nextSwipes)
    },180)
  }
  const undo=()=>{
    if(swipeLock)return
    const answers=session.swipes[current.id]||[]
    if(!answers.length)return
    const next=answers.slice(0,-1)
    patch({swipes:{...session.swipes,[current.id]:next},currentCard:Math.max(0,next.length)})
  }
  const acceptPass=()=>{
    const next=session.currentPerson+1
    patch({currentPerson:next,currentCard:Math.min(session.swipes[session.people[next].id]?.length||0,session.deck.length-1)})
    go('swipe')
  }

  const gCounts=useMemo(()=>session.deck.map((r,index)=>({r,index,count:session.people.filter(p=>session.swipes[p.id]?.[index]).length})).sort((a,b)=>b.count-a.count||a.index-b.index),[session.deck,session.swipes,session.people])
  const topThree=useMemo(()=>{
    const positive=gCounts.filter(x=>x.count>0).slice(0,3)
    return [...positive,...gCounts.filter(x=>!positive.some(y=>y.r.id===x.r.id)).slice(0,3-positive.length)]
  },[gCounts])
  const tally=useMemo(()=>topThree.map(x=>({...x,voters:session.people.filter(p=>session.votes[p.id]===x.r.id)})).sort((a,b)=>b.voters.length-a.voters.length||a.index-b.index),[topThree,session.votes,session.people])
  const tied=tally.filter(x=>x.voters.length===tally[0]?.voters.length)

  const generateVotes=(hostVotes:Record<string,number>)=>{
    const next={...hostVotes}
    const options=topThree.map(x=>x.r.id)
    const others=session.people.slice(1)
    if(demo&&demoTie){
      if(session.people.length===4){next[others[0].id]=options[1];next[others[1].id]=options[0];next[others[2].id]=options[1]}
      else others.forEach((p,i)=>next[p.id]=options[(i+1)%Math.min(3,options.length)])
    }else others.forEach((p,i)=>next[p.id]=i===others.length-1&&others.length>2?options[1]:options[0])
    return next
  }
  const castVote=()=>{
    if(voteChoice===null)return
    const nextVotes={...session.votes,[current.id]:voteChoice};setVoteChoice(null)
    if(session.mode==='pasa'&&!demo&&session.currentPerson<session.people.length-1){
      setVoteOverlay(`Pasa kay ${session.people[session.currentPerson+1].name}!`)
      patch({votes:nextVotes})
      votePassTimer.current=setTimeout(()=>{setVoteOverlay('');patch({currentPerson:session.currentPerson+1});votePassTimer.current=null},1000)
    }else if(session.mode==='invite'||demo){
      setRemoteName(session.people[1]?.name||'tropa');patch({votes:nextVotes})
      let i=1
      flowTimer.current=setInterval(()=>{i++;if(i<session.people.length)setRemoteName(session.people[i].name);else{clearFlow();patch({votes:generateVotes(nextVotes),currentPerson:0});setVotesRevealed(true)}},500)
    }else{patch({votes:nextVotes,currentPerson:0});setVotesRevealed(true)}
  }
  const concludeVote=()=>{
    if(tied.length>1)setSheet('tsamba')
    else finishSession(tally[0].r.id,'Most votes')
  }
  const finishSession=(restaurantId:number,method:ResultMethod)=>{
    patch({finalId:restaurantId,resultMethod:method})
    setHistoryItems(h=>[...h,{restaurantId,cravings:[...session.cravings]}])
    go('match')
  }
  const playGame=()=>{
    if(gameRunning||!tied.length)return
    const winnerIndex=Math.floor(Math.random()*tied.length)
    const winner=tied[winnerIndex].r.id
    setGameWinner(winner);setGameRunning(true)
    if(game==='wheel'){
      const slice=360/tied.length
      setWheelRotation(-12)
      setTimeout(()=>setWheelRotation(360*7-(winnerIndex*slice+slice/2)),180)
    }else{
      setClawPosition((winnerIndex+.5)/tied.length*100)
    }
    setTimeout(()=>setGameRunning(false),game==='wheel'?5000:4200)
    setTimeout(()=>{setGameRunning(false);setSheet(null);finishSession(winner,game==='wheel'?'SpinEat! picked it':'Bunot picked it');setGameWinner(null);setWheelRotation(0)},game==='wheel'?5500:4800)
  }
  const newDeck=()=>{patch({swipes:{},votes:{},currentPerson:0,currentCard:0,finalId:null});buildDeck(session.deck.map(r=>r.id))}

  const tropaSaved=savedTropas.some(t=>tropaKey(t.people)===tropaKey(session.people))
  const saveCurrentTropa=()=>{
    const people=session.people.filter(p=>p.name.trim()).map(({name,avatar})=>({name:name.trim(),avatar}))
    if(!people.length)return
    setSheet(null)
    if(tropaSaved){notify('Saved na ’tong tropa');return}
    setSavedTropas(t=>[...t,{id:`t${Date.now()}`,name:`${people[0].name}'s Tropa`,people}]);notify('Tropa saved')
  }
  const useTropa=(t:SavedTropa)=>{
    const people=t.people.map((person,i)=>({id:`p${i+1}`,...person}))
    setNextPersonId(people.length+1)
    patch({people,hostId:people[0].id});setJoined(1);setSheet(null)
  }
  const startSaved=(t:SavedTropa,mode:Mode='pasa')=>{
    const people=t.people.map((person,i)=>({id:`p${i+1}`,...person}))
    setNextPersonId(people.length+1)
    setSession({...blankSession(mode,false,profileAvatar,profile),people,hostId:people[0].id})
    setSheet(null);go('tropa')
  }
  const changePersonAvatar=(avatar:string)=>{
    if(!avatarPersonId)return
    setPeople(prev=>prev.map(person=>person.id===avatarPersonId?{...person,avatar}:person))
    setSheet(null);setAvatarPersonId(null)
  }
  const openPassBack=()=>{
    if(votePassTimer.current){clearTimeout(votePassTimer.current);votePassTimer.current=null}
    setSheet('passBack')
  }
  const confirmPassBack=()=>{
    if(voteOverlay){
      const selectedVote=session.votes[current.id]
      setVoteChoice(selectedVote??null)
      setSession(prev=>{
        const votes={...prev.votes}
        delete votes[current.id]
        return {...prev,votes}
      })
      setVoteOverlay('')
      setSheet(null)
      return
    }
    setSheet(null)
    const answers=session.swipes[current.id]||[]
    patch({swipes:{...session.swipes,[current.id]:answers.slice(0,-1)},currentCard:Math.max(0,answers.length-1)})
    go('swipe',true)
  }
  const cancelPassBack=()=>{
    setSheet(null)
    if(voteOverlay&&!votePassTimer.current){
      votePassTimer.current=setTimeout(()=>{setVoteOverlay('');patch({currentPerson:session.currentPerson+1});votePassTimer.current=null},500)
    }
  }
  const plusDeal=(r:Restaurant)=>plus&&r.deal?`${r.deal} · extra 10% off`:r.deal
  const dealText=(r:Restaurant)=>r.deal?plusDeal(r):r.hirit
  const dealLabel=(r:Restaurant)=>plus&&r.deal?'PLUS DEAL':'SAMPLE DEAL'
  const dealCode=(r:Restaurant)=>`LOOK-${r.id}24`
  const planPrice=plusPlan==='month'?'₱49 / month':'₱399 / year'
  const openMenu=(r:Restaurant)=>{setSelected(r);setSheet('menu')}
  const claimDeal=()=>{setClaimed(c=>c.includes(selected.id)?c:[...c,selected.id]);setDealFilter('Claimed');go('deals',true)}
  const openPlanner=(restaurant=restaurants[0].name)=>{setPlanDraft({id:'',restaurant,date:'',time:'',reminder:alerts.reminders});setSheet('planner')}
  const openEditProfile=(back:Screen)=>{setProfileDraft(profile);setEditBack(back);go('editProfile')}
  const saveProfile=()=>{
    const next={...profileDraft,name:profileDraft.name.trim(),email:profileDraft.email.trim()}
    setProfile(next)
    setSession(blankSession('pasa',false,profileAvatar,next))
    go(editBack,true);notify('Profile saved')
  }
  const resetApp=()=>{
    setSheet(null);setProfile(defaultProfile);setProfileAvatar(avatarOrange);setTheme('light');setAlerts(defaultAlerts);setDemo(false);setPlus(false)
    setSavedTropas([]);setPlans([]);setHistoryItems([]);setClaimed([])
    setSession(blankSession('pasa',false,avatarOrange,defaultProfile));go('home',true);notify('App data cleared')
  }
  const shareTo=(target:string)=>{
    setSheet(null)
    if(target!=='Copy Link'){notify(`Sent via ${target} (demo)`);return}
    const link='https://lookarin.app/kain/7G2K'
    if(!navigator.clipboard){notify(link);return}
    navigator.clipboard.writeText(link).then(()=>notify('Link copied'),()=>notify(link))
  }
  const sharedSheets=<>
    {sheet==='exit'&&<Sheet onClose={()=>setSheet(null)}><div className="exit-sheet"><Eyes/><h2>Exit session?</h2><p>Mawawala ang progress.</p><Button onClick={()=>setSheet(null)}>Stay</Button><Button kind="red" onClick={exitSession}>Exit</Button></div></Sheet>}
    {sheet==='share'&&<Sheet onClose={()=>setSheet(null)}><h2>{screen==='profile'?'Share Busog Recap':'Send KAINvite'}</h2><p className="muted">{screen==='profile'?'I-share ang food-trip stats.':'Share with your barkada'}</p><div className="share-row">{['Messages','Copy Link','AirDrop'].map((x,i)=><button key={x} onClick={()=>shareTo(x)}><span><Icon name={i===1?'share':'people'}/></span>{x}</button>)}</div></Sheet>}
    {sheet==='directions'&&<Sheet onClose={()=>setSheet(null)}><div className="map-placeholder"><Icon name="map" size={38}/><span>{selected.area}</span></div><h2>{selected.name}</h2><p className="muted">{selected.address?`${selected.address}, `:''}{selected.area}</p><p className="muted">About {away(selected)} {origin.label}, straight line</p><a className="btn green" target="_blank" rel="noreferrer" href={mapLink(selected)}>Open in Google Maps</a></Sheet>}
    {sheet==='plus'&&<Sheet onClose={()=>setSheet(null)}><p className="eyebrow">LOOKARIN! PLUS</p><h2>Pang-Plus ’to!</h2><p className="muted">Unlock saved tropa, planner, at more.</p><div className="plan-grid"><div><strong>Free</strong><p>Pasa-Phone, KAINvite, Swipe Kain, games, diet tags, and standard deals.</p></div><div className="plus-plan"><strong>Plus</strong><p>Saved tropa, Planner, actual Recap, bigger deals, and no Featured cards.</p></div></div><div className="price-options"><button className={plusPlan==='month'?'selected':''} onClick={()=>setPlusPlan('month')}>₱49 <span>/ month</span>{plusPlan==='month'&&<Icon name="check"/>}</button><button className={plusPlan==='year'?'selected':''} onClick={()=>setPlusPlan('year')}>₱399 <span>/ year</span><b>Save 32%</b>{plusPlan==='year'&&<Icon name="check"/>}</button></div><Button kind="gold" onClick={()=>setSheet('plusConfirm')}>Try Plus</Button></Sheet>}
    {sheet==='plusConfirm'&&<Sheet onClose={()=>setSheet(null)}><div className="confirm-plus"><Eyes/><h2>Demo lang ’to.</h2><p>{planPrice}. Walang totoong bayad.</p><Button kind="gold" onClick={()=>{setPlus(true);setSheet('plusWelcome')}}>Activate Plus</Button><Button kind="neutral" className="stacked-action" onClick={()=>setSheet(null)}>Cancel</Button></div></Sheet>}
    {sheet==='plusWelcome'&&<Sheet onClose={()=>setSheet(null)}><div className="welcome-plus"><img src={appIcon} alt="Lookarin mascot"/><h2>Welcome to Plus!</h2><p>Mas sulit na ang bawat kainan.</p><Button onClick={()=>setSheet(null)}>G!</Button></div></Sheet>}
    {sheet==='saved'&&<Sheet onClose={()=>setSheet(null)}><h2>Saved tropa</h2><p className="muted">Pili ng barkada.</p><div className="saved-list">{savedTropas.length?savedTropas.map(t=><button key={t.id} onClick={()=>useTropa(t)}><div className="stacked">{t.people.slice(0,4).map((person,i)=><Avatar key={`${t.id}-${i}`} avatar={person.avatar} small/>)}</div><span><strong>{t.name}</strong><small>{t.people.map(person=>person.name).join(', ')}</small></span><Icon name="chevron"/></button>):<p>Wala pang saved tropa.</p>}</div></Sheet>}
    {sheet==='saveTropa'&&<Sheet onClose={()=>setSheet(null)}><h2>Save this tropa?</h2><p className="muted">Gamitin ulit sa susunod na kainan.</p><Button kind="green" onClick={saveCurrentTropa}>Save tropa</Button><Button kind="neutral" className="stacked-action" onClick={()=>setSheet(null)}>Not now</Button></Sheet>}
    {sheet==='planner'&&<Sheet onClose={()=>setSheet(null)}><h2>Lakad Planner</h2><p className="muted">Set the next kainan.</p><div className="planner-form"><label>Restaurant<select value={planDraft.restaurant} onChange={e=>setPlanDraft(prev=>({...prev,restaurant:e.target.value}))}>{restaurants.map(r=><option key={r.id}>{r.name}</option>)}</select></label><label>Date<input type="date" value={planDraft.date} onChange={e=>setPlanDraft(prev=>({...prev,date:e.target.value}))}/></label><label>Time<input type="time" value={planDraft.time} onChange={e=>setPlanDraft(prev=>({...prev,time:e.target.value}))}/></label><button onClick={()=>setPlanDraft(prev=>({...prev,reminder:!prev.reminder}))}><span>Reminder</span><span className={`toggle ${planDraft.reminder?'on':''}`}><i/></span></button></div><Button kind="green" disabled={!planDraft.date||!planDraft.time} onClick={()=>{const item={...planDraft,id:planDraft.id||`l${Date.now()}`};setPlans(p=>[...p.filter(x=>x.id!==item.id),item]);setSheet(null);notify('Plan saved')}}>Save plan</Button></Sheet>}
    {sheet==='managePlus'&&<Sheet onClose={()=>setSheet(null)}><h2>Manage Plus</h2><p className="muted">Plus is active in this demo.</p><div className="price-options"><button className={plusPlan==='month'?'selected':''} onClick={()=>setPlusPlan('month')}>₱49 <span>/ month</span>{plusPlan==='month'&&<Icon name="check"/>}</button><button className={plusPlan==='year'?'selected':''} onClick={()=>setPlusPlan('year')}>₱399 <span>/ year</span><b>Save 32%</b>{plusPlan==='year'&&<Icon name="check"/>}</button></div><Button kind="red" onClick={()=>{setPlus(false);setSheet(null);notify('Plus turned off')}}>Turn off Plus (demo)</Button></Sheet>}
    {sheet==='personAvatar'&&<Sheet onClose={()=>{setSheet(null);setAvatarPersonId(null)}}><h2>Pili ng avatar</h2><div className="avatar-grid">{avatarOptions.map(option=>{const used=session.people.some(person=>person.id!==avatarPersonId&&person.avatar===option.src);const selected=session.people.find(person=>person.id===avatarPersonId)?.avatar===option.src;return <button key={option.name} className={selected?'selected':''} disabled={used} onClick={()=>changePersonAvatar(option.src)}><Avatar avatar={option.src}/><span>{option.name}</span>{selected&&<i><Icon name="check" size={14}/></i>}</button>})}</div></Sheet>}
    {sheet==='profileAvatar'&&<Sheet onClose={()=>setSheet(null)}><h2>Piliin ang profile mo</h2><div className="avatar-grid profile-picker">{avatarOptions.map(option=><button key={option.name} className={draftProfileAvatar===option.src?'selected':''} onClick={()=>setDraftProfileAvatar(option.src)}><Avatar avatar={option.src}/><span>{option.name}</span>{draftProfileAvatar===option.src&&<i><Icon name="check" size={14}/></i>}</button>)}</div><Button kind="green" onClick={()=>{setProfileAvatar(draftProfileAvatar);setPeople(prev=>prev.map((person,index)=>index===0?{...person,avatar:draftProfileAvatar}:person));setSheet(null)}}>Save</Button></Sheet>}
    {sheet==='menu'&&<Sheet onClose={()=>setSheet(null)} className="menu-sheet"><p className="eyebrow">MENU</p><h2>{selected.name}</h2><p className="menu-price">{priceLabel(selected)}</p>
      {selected.menu?<div className="menu-list">{selected.menu.items.map(([dish,cost])=><div key={dish}><span>{dish}</span>{cost?<strong>{cost}</strong>:<small>Ask for price</small>}</div>)}</div>:<div className="menu-empty"><strong>Wala pang published menu.</strong><p>{selected.known?`Known for: ${selected.known}.`:selected.type}</p></div>}
      {selected.menu?.note&&<p className="menu-note">{selected.menu.note}</p>}
      <p className="menu-note">{selected.price?<>Price from <a target="_blank" rel="noreferrer" href={selected.price.url}>{selected.price.source}</a>. </>:'Estimated price, not a published one. '}{selected.menu?.source&&<>Menu from <a target="_blank" rel="noreferrer" href={selected.menu.url}>{selected.menu.source}</a>. </>}Prices can change.</p>
      <a className="btn blue" target="_blank" rel="noreferrer" href={`https://www.google.com/search?q=${encodeURIComponent(selected.name+' '+selected.area+' Pampanga menu')}`}>Find the full menu online</a></Sheet>}
    {sheet==='passBack'&&<Sheet onClose={cancelPassBack}><h2>{`Babalik ka kay ${titleCase(current.name)}?`}</h2><p className="muted">Makikita ulit ang huling sagot.</p><Button onClick={confirmPassBack}>Oo, balik</Button><Button kind="neutral" className="stacked-action" onClick={cancelPassBack}>Cancel</Button></Sheet>}
    {toast&&<div className="toast" role="status">{toast}</div>}
    {notice&&<button className="push-banner" onClick={()=>{setOpenAnswers(notice.id);setNotice(null)}}><Avatar avatar={notice.avatar} small/><span><strong>{notice.title}</strong><small>{notice.body}</small></span></button>}
  </>

  const dealRestaurants=restaurants.filter(r=>r.deal||r.hirit)
  const openDeals=dealRestaurants.filter(r=>!claimed.includes(r.id))
  if(screen==='splash')return <main className="phone splash intro" onClick={()=>setScreen('home')}>
    <div className="banderitas intro-flags">{['#fff3df','#f2b63c','#2f4b8f','#c8414b','#fff3df','#f2b63c','#2f4b8f','#c8414b','#fff3df'].map((c,i)=><i key={i} style={{background:c,animationDelay:`${i*.05}s`}}/>)}</div>
    <div className="intro-stage"><div className="intro-bubble"><span>Nukarin?</span><span>Lookarin!</span></div><div className="intro-eyes"><img src={eyesLogo} alt=""/></div></div>
    <div className="confetti">{Array.from({length:12},(_,i)=><i key={i}/>)}</div>
    <img className="splash-icon" src={appIcon} alt="Lookarin app icon"/><img className="splash-word" src={whiteWordmark} alt="LOOKARIN"/><p>Always stuck on “Nukarin?”</p><small>Nananu ka pa? Let’s Lookarin!</small>
    <span className="intro-skip">Tap to skip</span>
  </main>

  if(screen==='home')return <AppShell key={screen} tabs screen={screen} screenDirection={screenDirection} go={go}><div className="home-header"><img src={orangeWordmark} alt="LOOKARIN!"/><button className="avatar-button" onClick={()=>setMenu(!menu)}><Avatar avatar={profileAvatar}/></button>{menu&&<div className="profile-menu"><div><span>Demo mode</span><button className={`toggle ${demo?'on':''}`} onClick={()=>setDemo(!demo)}><i/></button></div><button onClick={()=>start('pasa')}><Icon name="spark" size={18}/>New session</button><button onClick={()=>go('profile')}><Icon name="person" size={18}/>Profile</button><button onClick={()=>go('settings')}><Icon name="gear" size={18}/>Settings</button></div>}</div>
    <section className="content home-content"><h1>Nukarin tayo?</h1><p className="subtitle">{`Tara, ${profile.name||'tropa'}. Let’s G!`}</p>
      <button className="hero-card lift" onClick={()=>start('pasa')}><div><small>2-MINUTE FOOD TRIP</small><h2>Gutom na ang tropa?</h2><p>Pili na kayo in 2 minutes.</p><span className="hero-cta">Simulan na <Icon name="arrow" size={18}/></span></div><Eyes className="hero-eyes"/></button>
      <div className="mode-grid"><button className="mode-card lift" onClick={()=>start('pasa')}><span className="icon-box"><Icon name="person"/></span><strong>Pasa-Phone</strong><p>Magkakasama? Isang phone lang.</p></button><button className="mode-card lift" onClick={()=>start('invite')}><span className="icon-box blue"><Icon name="share"/></span><strong>KAINvite</strong><p>Magkakalayo? Send the link.</p></button></div>
      <div className="section-head"><h2>Tara Deals near you</h2><button onClick={()=>go('deals')}>See All</button></div><div className="deal-scroll">{openDeals.map(r=><button className="mini-deal lift" key={r.id} onClick={()=>details(r)}><FoodImage src={r.photo} alt={`Food at ${r.name}`}/><div><small>{dealLabel(r)}</small><strong>{r.name}</strong><p>{dealText(r)}</p></div></button>)}</div>
      {!plus&&<button className="plus-card lift" onClick={()=>setSheet('plus')}><div><span className="plus-badge">PLUS</span><h2>Mas sulit with Plus</h2><p>Saved tropa, Lakad Planner, and 10% more on group deals.</p><strong>See Lookarin Plus</strong></div><Icon name="chevron"/></button>}
    </section>{sharedSheets}</AppShell>

  if(screen==='tropa')return <AppShell key={screen} screenDirection={screenDirection}>{sessionHeader("Sino-sino kayo?","I-add ang tropa mo.")}<section className="session-content"><div className="people-editor">{session.people.map((person,index)=><PersonRow key={person.id} person={person} index={index} isHost={person.id===session.hostId} canRemove={session.people.length>2} inputRef={element=>{inputRefs.current[person.id]=element}} onNameChange={updateName} onMakeHost={id=>patch({hostId:id})} onRemove={removePerson} onAvatarClick={id=>{setAvatarPersonId(id);setSheet('personAvatar')}}/>)}</div><Button kind="secondary" className="add-person" disabled={session.people.length>=8} onClick={addPerson}><Icon name="plus"/> Add person</Button><button className="saved-tropa-row" onClick={()=>plus?setSheet('saved'):setSheet('plus')}><Icon name={plus?'people':'lock'}/><span><strong>Use saved tropa</strong><small>{plus?'Pick from your Tropa List':'Pang-Plus ’to!'}</small></span>{!plus&&<span className="plus-badge">PLUS</span>}<Icon name="chevron"/></button>{plus&&namesValid&&<button className="saved-tropa-row" disabled={tropaSaved} onClick={()=>setSheet('saveTropa')}><Icon name={tropaSaved?'check':'plus'}/><span><strong>{tropaSaved?'Saved tropa':'Save this tropa'}</strong><small>{tropaSaved?'Nasa Tropa List mo na':'Gamitin ulit sa susunod'}</small></span><Icon name="chevron"/></button>}</section><BottomAction disabled={!namesValid} hint={session.people.length<2?'Mag-add ng kahit isang kasama':!session.people.every(p=>p.name.trim())?'Kumpletuhin ang names':'Dapat walang duplicate na name'} onClick={()=>go('setup')}>Next</BottomAction>{sharedSheets}</AppShell>

  if(screen==='setup')return <AppShell key={screen} screenDirection={screenDirection}>{sessionHeader(`Ikaw ang Bahala, ${host.name.trim()||'friend'}!`,"Set the budget at craving ng grupo.")}<section className="session-content setup-compact">
    <div className="group"><h3>1. Budget</h3><div className="budget-list">{([['Tipid','₱','Petsa de peligro mode'],['Sakto','₱₱','Sakto lang'],['Bawi','₱₱₱','Treat yourself']] as [Budget,string,string][]).map(([b,p,d])=><button key={b} className={`budget-card ${session.budget===b?'selected':''}`} onClick={()=>patch({budget:b})}><span>{p}</span><div><strong>{b}</strong><small>{d}</small></div><i>{session.budget===b&&<Icon name="check" size={16}/>}</i></button>)}</div></div>
    <div className="group"><div className="group-line"><h3>2. Craving</h3><small>{session.cravings.filter(x=>x!=='Kahit ano').length}/3</small></div><div className="category-grid">{categoryOptions.map(c=><button key={c} className={`category-chip ${session.cravings.includes(c)?'selected':''}`} onClick={()=>toggleCraving(c)}><span>{session.cravings.includes(c)?<Icon name="check" size={14}/>:categoryIcons[c]}</span>{c}</button>)}</div>{session.cravings.includes('Other')&&<input className="other-input" value={session.other} onChange={e=>setSession(prev=>({...prev,other:e.target.value}))} placeholder="e.g. halo-halo, ramen, pizza"/>}{cravingHint&&<small className="limit-hint">{cravingHint}</small>}</div>
    <div className="group more-options"><button className={`more-toggle ${moreOpen?'open':''}`} aria-expanded={moreOpen} onClick={()=>setMoreOpen(!moreOpen)}><div><h3>3. More options</h3><small>{session.area}{session.diets.length?` · ${session.diets.length} diet need${session.diets.length>1?'s':''}`:''}</small></div><Icon name="chevron"/></button>{moreOpen&&<div className="more-body"><strong>Area</strong><div className="chips">{areas.map(a=><Chip key={a} selected={session.area===a} onClick={()=>patch({area:a})}>{a}</Chip>)}</div><strong>Diet needs</strong><div className="diet-chips">{(['Vegetarian','No pork','Allergies'] as Diet[]).map(d=><Chip key={d} selected={session.diets.includes(d)} onClick={()=>patch({diets:session.diets.includes(d)?session.diets.filter(x=>x!==d):[...session.diets,d]})}>{d}</Chip>)}</div></div>}</div>
  </section><BottomAction disabled={!setupValid} hint={session.cravings.length===0?'Pumili ng craving':session.cravings.includes('Other')&&!session.other.trim()?'Ilagay ang Other craving':'Pumili ng budget'} onClick={continueSetup}>Next</BottomAction>{sharedSheets}</AppShell>

  if(screen==='lobby')return <AppShell key={screen} screenDirection={screenDirection}>{sessionHeader("Tawagin na ang tropa!","Send the KAINvite link.")}<section className="session-content lobby-compact"><div className="qr-card"><div className="qr"><Icon name="qr" size={126}/></div><strong>lookarin.app/kain/7G2K</strong><small>Link expires in 30 minutes</small><Button kind="blue" onClick={()=>setSheet('share')}><Icon name="share"/> Send KAINvite</Button>{plus?<Button kind="plain" onClick={()=>setSheet('saved')}><Icon name="people"/> Send to saved tropa</Button>:<button className="locked-inline" onClick={()=>setSheet('plus')}><Icon name="lock"/> Send to saved tropa <span className="plus-badge">PLUS</span></button>}</div><div className="joined"><h3>{joined} of {session.people.length} joined</h3>{session.people.map((p,i)=><div className={`joined-person ${i<joined?'':'still-waiting'}`} key={p.id}><Avatar avatar={p.avatar}/><div><strong>{p.name}</strong><small>{i===0?'Host':i<joined?'Joined':'Naghihintay ng sagot...'}</small></div>{i<joined?<Icon name="check"/>:<span className="waiting-dots"><i/><i/><i/></span>}</div>)}</div></section><BottomAction disabled={joined<2} hint="Hintayin ang isang kasama" onClick={()=>{patch({currentPerson:0,currentCard:0});go('swipe')}}>Start na!</BottomAction>{joined<session.people.length&&<LobbyJoiner joined={joined} setJoined={setJoined} total={session.people.length} onJoin={i=>pushNotice(session.people[i],`${titleCase(session.people[i].name)} joined!`,'Sumali na sa KAINvite mo.')}/>} {sharedSheets}</AppShell>

  if(screen==='empty')return <AppShell key={screen} screenDirection={screenDirection}>{sessionHeader('Wala tayong nahanap.',emptyReason)}<section className="empty-state session-empty"><div className="confused-mascot"><img src={appIcon} alt="Confused Lookarin mascot"/><span>?</span></div>{emptyAlt&&<Button kind="green" onClick={()=>{setSession(prev=>({...prev,area:emptyAlt}));go('setup')}}>Lipat sa {emptyAlt}</Button>}</section><BottomAction onClick={()=>go('setup')}>Balik sa Setup</BottomAction>{sharedSheets}</AppShell>

  if(screen==='pass')return <AppShell key={screen} screenDirection={screenDirection} className="pass-screen"><button className="handoff-back" aria-label="Go back" onClick={openPassBack}><Icon name="chevron"/></button><HandoffLayout person={session.people[session.currentPerson+1]||current}/><Button kind="white" className="handoff-action" onClick={acceptPass}>Ako na ’to!</Button>{sharedSheets}</AppShell>

  if(screen==='responses'){
    const invited=session.people.slice(1)
    const answeredBy=(p:Person)=>(session.swipes[p.id]?.length||0)>=session.deck.length
    const answered=invited.filter(answeredBy).length
    const waitingFor=invited.find(p=>!answeredBy(p))
    const answerList=(p:Person)=><div className="answer-list">{session.deck.map((r,i)=>{const yes=session.swipes[p.id]?.[i];return <button key={r.id} onClick={()=>details(r)}><FoodImage src={r.photo} alt=""/><span>{r.name}</span><b className={yes?'yes':'no'}>{yes?'G!':'Next'}</b></button>})}</div>
    return <AppShell key={screen} screenDirection={screenDirection}>{sessionHeader(waitingFor?'Hinihintay ang tropa':'Sumagot na lahat!',waitingFor?`${answered} of ${invited.length} answered. Sasabihan ka namin.`:'Tingnan ang sagot nila, then botohan na.')}<section className="session-content responses">
      {session.people.map((p,i)=>{const done=i===0||answeredBy(p);const yes=(session.swipes[p.id]||[]).filter(Boolean).length;const open=openAnswers===p.id;return <div className={`response-card ${done?'done':'waiting'}`} key={p.id}>
        <button className="response-head" disabled={!done} aria-expanded={open} onClick={()=>setOpenAnswers(open?null:p.id)}><Avatar avatar={p.avatar}/><span className="response-name"><strong>{p.name}{i===0?' (Ikaw)':''}</strong><small>{done?`${yes} of ${session.deck.length} G!`:'Hindi pa sumasagot'}</small></span>{done?<span className="status-pill answered"><Icon name="check" size={14}/> Answered</span>:<span className="status-pill pending"><span className="waiting-dots"><i/><i/><i/></span> Waiting</span>}</button>
        {!done&&<button className="remind-button" onClick={()=>notify(`Reminder sent to ${titleCase(p.name)} (demo)`)}><Icon name="bell" size={16}/> Remind</button>}
        {done&&open&&answerList(p)}
      </div>})}
    </section><BottomAction kind="green" disabled={!!waitingFor} hint={waitingFor?`Hinihintay pa si ${titleCase(waitingFor.name)}`:undefined} onClick={()=>{setNotice(null);go('vote')}}>Tuloy sa Botohan</BottomAction>{sharedSheets}</AppShell>
  }

  if(screen==='remote'){const waitingPerson=session.people.find(person=>person.name===remoteName)||current;return <AppShell key={screen} screenDirection={screenDirection} className="waiting-screen"><HandoffLayout person={waitingPerson} waiting/>{sharedSheets}</AppShell>}

  if(screen==='swipe'){
    const card=session.deck[Math.min(session.currentCard,session.deck.length-1)]
    const answers=session.swipes[current.id]||[]
    if(!card)return <AppShell key={screen} screenDirection={screenDirection}>{sessionHeader("Inaayos ang cards...","Sandali lang.")}<section className="remote-state"><img src={appIcon} alt="Lookarin mascot"/></section>{sharedSheets}</AppShell>
    const completed=answers.length>=session.deck.length
    const endDrag=()=>{const x=dragX;dragStart.current=0;if(Math.abs(x)>85)answer(x>0);else setDragX(0)}
    return <AppShell key={screen} screenDirection={screenDirection} className="swipe-screen">{sessionHeader(`${current.name}, G ka ba dito?`,"Swipe right kung G, left kung next.")}<section className="swipe-content session-swipe"><div className="progress-head"><Avatar avatar={current.avatar} small/><div><strong>Card {Math.min(session.currentCard+1,6)} of {session.deck.length}</strong><span>{answers.length} answered</span></div><button className="undo-button" disabled={!answers.length||swipeLock} onClick={undo}><Icon name="undo" size={18}/> Undo</button><Eyes className={dragX>20?'look-right':dragX<-20?'look-left':''}/></div><div className="progress"><i style={{width:`${(answers.length/session.deck.length)*100}%`}}/></div><div className="card-stack"><div className="food-card behind"/><div className="food-card behind second"/><article key={card.id} className="food-card active" style={{transform:`translateX(${dragX}px) rotate(${dragX/25}deg)`,transition:swipeLock?'transform .18s':''}} onPointerDown={e=>{if(!completed&&!swipeLock){dragStart.current=e.clientX;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)}}} onPointerMove={e=>dragStart.current&&setDragX((e.clientX-dragStart.current)/deviceScale)} onPointerUp={endDrag} onPointerCancel={()=>{dragStart.current=0;setDragX(0)}}><FoodImage src={card.photo} alt={`Food at ${card.name}`}/><div className={`stamp yes ${dragX>25?'show':''}`}>G!</div><div className={`stamp no ${dragX<-25?'show':''}`}>NEXT</div>{(card.deal||card.hirit)&&<div className="deal-ribbon"><Icon name="spark" size={15}/> {plus&&card.deal?'PLUS DEAL':'TARA DEAL'}</div>}<button className="card-menu" onPointerDown={e=>e.stopPropagation()} onPointerUp={e=>e.stopPropagation()} onClick={()=>openMenu(card)}><Icon name="doc" size={15}/> Menu</button><div className="card-gradient"/><div className="food-info"><div className="food-tags">{card.featured&&<span>Featured</span>}{card.lokal&&<span>LOKAL</span>}{card.deckTag&&<span>{card.deckTag}</span>}{!card.credit&&<span>Sample photo</span>}</div><h2>{card.name}</h2><p>{card.area} · {away(card)}{card.rating?` · ${ratingLabel(card)}`:''}</p><p>{card.categories.join(' · ')}</p><p className="card-price">{priceLabel(card)}</p>{(card.deal||card.hirit)&&<div className="deal-line"><small>{dealLabel(card)}</small><strong>{dealText(card)}</strong></div>}</div></article></div>{!completed&&<div className="swipe-actions"><button disabled={swipeLock} aria-label="Next" onClick={()=>answer(false)}><Icon name="x" size={30}/><span>Next</span></button><button disabled={swipeLock} className="yes" aria-label="G!" onClick={()=>answer(true)}><Icon name="heart" size={30}/><span>G!</span></button></div>}{completed&&<Button onClick={()=>session.mode==='invite'?startResponses(session.swipes):go('vote')}>{session.mode==='invite'?'Tingnan ang sagot ng tropa':'Huling Botohan'}</Button>}</section>{sharedSheets}</AppShell>
  }

  if(screen==='vote'){const podium=[topThree[1],topThree[0],topThree[2]].filter(Boolean);return <AppShell key={screen} screenDirection={screenDirection}>{sessionHeader("Top 3 ng tropa!","Isang vote bawat isa.")}<section className="session-content vote-compact"><div className="vote-turn"><Avatar avatar={current.avatar} small/><strong>{votesRevealed?'Votes revealed':`${current.name}, alin dito?`}</strong></div><div className={`podium ${votesRevealed?'revealed':''}`}>{podium.map((x,displayIndex)=>{const place=displayIndex===1?1:displayIndex===0?2:3;const voters=session.people.filter(p=>session.votes[p.id]===x.r.id);return <div className={`podium-spot place-${place} ${voteChoice===x.r.id?'selected':''} ${votesRevealed&&tally[0]?.r.id===x.r.id?'winner':''}`} key={x.r.id}><button className="podium-pick" disabled={votesRevealed||!!remoteName} onClick={()=>setVoteChoice(x.r.id)}>{x.count===session.people.length&&<span className="lahat"><Icon name="crown" size={16}/> Lahat G!</span>}<FoodImage src={x.r.photo} alt={`Food at ${x.r.name}`}/><strong>{x.r.name}</strong><b className="count-up">{x.count} G!</b><span className="podium-rank">{place}</span></button><button className="podium-info" onClick={()=>details(x.r)} aria-label={`View ${x.r.name}`}><Icon name="info" size={17}/></button>{votesRevealed&&<div className="podium-voters">{voters.map(p=><Avatar key={p.id} avatar={p.avatar} small/>)}</div>}</div>})}</div>{remoteName&&<div className="vote-loading"><Avatar avatar={session.people.find(person=>person.name===remoteName)?.avatar||profileAvatar} small/> Hinihintay pa si {remoteName}...</div>}</section>
    {!votesRevealed?<BottomAction disabled={voteChoice===null||!!remoteName} hint="Pumili ng isang restaurant" onClick={castVote}>Vote</BottomAction>:<BottomAction kind={tied.length>1?'gold':'green'} onClick={concludeVote}>{tied.length>1?'Tsamba Time!':'Dito na tayo!'}</BottomAction>}
    {voteOverlay&&<div className="pass-overlay handoff-overlay"><button className="handoff-back" aria-label="Go back" onClick={openPassBack}><Icon name="chevron"/></button><HandoffLayout person={session.people[session.currentPerson+1]||current}/></div>}
    {sheet==='tsamba'&&<Sheet onClose={()=>!gameRunning&&setSheet(null)} className="tsamba-sheet"><div className="sheet-title"><div><h2>It’s a Tie! Ano, Tsamba Time?</h2><p>{game==='wheel'?'Ikot na, bahala na!':'Bunot ka na, tsamba na!'}</p></div><Eyes/></div><div className="segment"><button disabled={gameRunning} className={game==='wheel'?'on':''} onClick={()=>setGame('wheel')}>SpinEat!</button><button disabled={gameRunning} className={game==='claw'?'on':''} onClick={()=>setGame('claw')}>Bunot</button></div>
      {game==='wheel'?<div className={`wheel-wrap premium-wheel ${gameRunning?'spinning':''} ${gameWinner&&!gameRunning?'landed':''}`} onPointerUp={()=>!gameRunning&&playGame()}><div className="pointer"/><div className="wheel-lights">{Array.from({length:20},(_,i)=><i key={i} style={{transform:`rotate(${i*18}deg) translateY(-137px)`}}/>)}</div><div className="wheel dynamic-wheel" style={{background:`conic-gradient(${tied.map((_,i)=>`${['#ff5a1f','#f2b63c','#2f4b8f','#fff3df'][i%4]} ${i*360/tied.length}deg ${(i+1)*360/tied.length}deg`).join(',')})`,transform:`rotate(${wheelRotation}deg)`}}>{tied.map((x,i)=><span key={x.r.id} className={`dynamic-wheel-label ${gameWinner===x.r.id?'winning-slice':''}`} style={{transform:`rotate(${i*360/tied.length+180/tied.length}deg) translateY(-88px) rotate(-${i*360/tied.length+180/tied.length}deg) translate(-50%,-50%)`}}>{x.r.name}</span>)}<span className="wheel-hub"><img src={appIcon} alt=""/></span></div></div>:<div className={`arcade-machine ${gameRunning?'grab-sequence':''}`}><div className="arcade-sign">BUNOT!<span>{Array.from({length:8},(_,i)=><i key={i}/>)}</span></div><div className="arcade-glass"><div className="claw-rig" style={{left:`${clawPosition}%`}}><i className="cable"/><div className="claw-head"/><div className="prong p1"/><div className="prong p2"/><div className="prong p3"/></div><div className="capsules">{tied.map((x,i)=><div className={`capsule cap-${i} ${gameWinner===x.r.id?'target':''}`} key={x.r.id} style={{'--to-chute':`${(83-(i+.5)/tied.length*100)*3.16}px`} as React.CSSProperties}><FoodImage src={x.r.photo} alt=""/><span>{x.r.name}</span></div>)}</div></div><div className="arcade-controls"><div className="joystick" style={{transform:`rotate(${(clawPosition-50)/5}deg)`}}><i/></div><button disabled={gameRunning} onClick={()=>setClawPosition(Math.max(18,clawPosition-18))}>‹</button><button disabled={gameRunning} onClick={()=>setClawPosition(Math.min(82,clawPosition+18))}>›</button><div className="prize-chute">PRIZE</div></div></div>}
      {gameWinner&&!gameRunning&&<div className="game-winner">{restaurants.find(r=>r.id===gameWinner)?.name}</div>}<Button kind="gold" disabled={gameRunning||!!gameWinner} onClick={playGame}>{game==='wheel'?'Spin!':'Bunot na!'}</Button></Sheet>}{sharedSheets}</AppShell>}

  if(screen==='match'){const g=gCounts.find(x=>x.r.id===finalRestaurant.id)?.count||0;const v=session.people.filter(p=>session.votes[p.id]===finalRestaurant.id).length;return <AppShell key={screen} screenDirection={screenDirection} className="match-screen"><div className="confetti">{Array.from({length:18},(_,i)=><i key={i}/>)}</div><section className="match-content revised-match"><div className="banderitas">{['#ff5a1f','#f2b63c','#2f4b8f','#c8414b','#ff5a1f','#f2b63c','#2f4b8f','#c8414b','#ff5a1f'].map((c,i)=><i key={i} style={{background:c}}/>)}</div><div className="happy-mascot"><img src={appIcon} alt="Happy Lookarin mascot"/></div><div className="step-progress match-progress"><div><strong>Step 5 of 5</strong><span>Dito Na!</span></div><div className="step-dots">{[1,2,3,4,5].map(n=><i className="on" key={n}/>)}</div></div><h1>Dito Na! Tara, kain!</h1><button className="winner-card" onClick={()=>details(finalRestaurant)}><FoodImage src={finalRestaurant.photo} alt={`Food at ${finalRestaurant.name}`}/><div>{finalRestaurant.lokal&&<span className="lokal">LOKAL</span>}<h2>{finalRestaurant.name}</h2><p>{finalRestaurant.area} · {finalRestaurant.description}</p><p className="winner-price">{priceLabel(finalRestaurant)}</p><div className="result-stats"><span><strong>{g}</strong> G!</span><span><strong>{v}</strong> votes</span><span>{session.resultMethod}</span></div><div className="result-avatars">{session.people.map(person=><Avatar key={person.id} avatar={person.avatar} small/>)}</div></div></button>{session.diets.includes('Allergies')&&<div className="allergy-note">May allergies sa group, i-check sa staff.</div>}{(finalRestaurant.deal||finalRestaurant.hirit)&&<div className="match-deal"><Icon name="spark"/><div><small>{dealLabel(finalRestaurant)}</small><strong>{dealText(finalRestaurant)}</strong></div></div>}<Button kind="green" onClick={()=>{setSelected(finalRestaurant);setSheet('directions')}}><Icon name="map"/> Directions</Button><Button kind={finalRestaurant.deal||finalRestaurant.hirit?'gold':'neutral'} onClick={()=>details(finalRestaurant)}><Icon name={finalRestaurant.deal||finalRestaurant.hirit?'tag':'info'}/> {finalRestaurant.deal||finalRestaurant.hirit?'View Deal':'View Details'}</Button>{plus?<Button kind="blue" disabled={tropaSaved} onClick={()=>setSheet('saveTropa')}><Icon name="people"/> {tropaSaved?'Saved tropa':'Save this tropa?'}</Button>:<button className="locked-inline" onClick={()=>setSheet('plus')}><Icon name="lock"/> Save this tropa <span className="plus-badge">PLUS</span></button>}<Button kind="neutral" className="stacked-action" onClick={()=>openMenu(finalRestaurant)}><Icon name="doc"/> Menu</Button><div className="match-links"><button onClick={newDeck}><Icon name="refresh"/> Swipe ulit</button><button onClick={()=>start('pasa')}><Icon name="plus"/> Bagong session</button></div><Button kind="neutral" className="home-action" onClick={exitSession}><Icon name="home"/> Back to Home</Button></section>{sharedSheets}</AppShell>}

  if(screen==='details')return <AppShell key={screen} screenDirection={screenDirection} className="details-screen"><div className="nav"><div><Button kind="plain" className="back" onClick={()=>go(detailBack,true)}><Icon name="chevron"/>Back</Button></div><div/><div/></div><div className="detail-hero"><FoodImage src={selected.photo} alt={`Food at ${selected.name}`}/><div/></div><section className="detail-content">{selected.lokal&&<span className="lokal">LOKAL BADGE</span>}<h1>{selected.name}</h1><p className="subtitle">{selected.area} · {away(selected)}{selected.rating?` · ${ratingLabel(selected)}`:''}</p><p className="photo-credit">{selected.credit?<>{selected.otherBranch?'Photo from a branch of this restaurant. ':''}Photo: <a target="_blank" rel="noreferrer" href={selected.credit.url}>{selected.credit.author}, {selected.credit.license}</a></>:<>Sample food photo, not from this restaurant. <a target="_blank" rel="noreferrer" href={mapLink(selected)}>See real photos on Google Maps</a></>}</p><div className="detail-list"><div><span>CATEGORIES</span><strong>{selected.categories.join(' · ')}</strong></div><div><span>PRICE</span><strong>{priceLabel(selected)} · {selected.budget}</strong></div>{selected.known&&<div><span>KNOWN FOR</span><strong>{selected.known}</strong></div>}{selected.address&&<div><span>ADDRESS</span><strong>{selected.address}, {selected.area}</strong></div>}{selected.rating&&<div><span>GOOGLE MAPS, NOV 2026</span><strong>{selected.rating.toFixed(1)} stars · {selected.reviews?.toLocaleString()} reviews</strong></div>}{selected.diets.length>0&&<div><span>DIET OPTIONS</span><strong>{selected.diets.join(' · ')}</strong></div>}</div>{(selected.deal||selected.hirit)&&<><div className="ticket"><div><small>{dealLabel(selected)}</small><h2>{dealText(selected)}</h2><p>Ask the staff for details</p></div></div><Button kind="gold" onClick={claimDeal}><Icon name={claimed.includes(selected.id)?'check':'tag'}/> {claimed.includes(selected.id)?'Show in Claimed':'Claim deal'}</Button>{!plus&&selected.deal&&<button className="locked-inline" onClick={()=>setSheet('plus')}><Icon name="lock"/> Dagdag 10% off <span className="plus-badge">PLUS</span></button>}</>}<Button kind="neutral" className="detail-menu" onClick={()=>openMenu(selected)}><Icon name="doc"/> Menu</Button><div className="detail-actions"><Button kind="green" onClick={()=>setSheet('directions')}><Icon name="map"/> Directions</Button>{plus&&<Button kind="blue" onClick={()=>openPlanner(selected.name)}><Icon name="people"/> Plan lakad</Button>}</div></section>{sharedSheets}</AppShell>

  if(screen==='deals')return <AppShell key={screen} tabs screen={screen} screenDirection={screenDirection} go={go}><section className="content tab-content"><p className="eyebrow">Save food, save pera</p><h1>Deals.</h1>{openDeals[0]&&<button className="feature-deal lift" onClick={()=>details(openDeals[0])}><FoodImage src={openDeals[0].photo} alt={`Food at ${openDeals[0].name}`}/><div><small>{dealLabel(openDeals[0])}</small><h2>{openDeals[0].name}</h2><p>{dealText(openDeals[0])}</p></div></button>}{plus?<div className="plus-strip on"><Icon name="check" size={18}/><span>Plus is on. 10% more on every group deal.</span></div>:<button className="plus-strip" onClick={()=>setSheet('plus')}><Icon name="lock" size={18}/><span>Get 10% more on group deals</span><b className="plus-badge">PLUS</b></button>}<div className="deal-filters">{(['All','Group','Hirit','Claimed'] as DealFilter[]).map(f=><Chip key={f} selected={dealFilter===f} onClick={()=>setDealFilter(f)}>{f==='Claimed'&&claimed.length?`Claimed (${claimed.length})`:f}</Chip>)}</div>{dealFilter==='Claimed'?(claimed.length?<div className="claimed-list standalone-deals">{dealRestaurants.filter(r=>claimed.includes(r.id)).map(r=><article key={r.id} className="claimed-card"><button onClick={()=>details(r)}><small>{dealLabel(r)}</small><strong>{r.name}</strong><p>{dealText(r)}</p></button><div className="code-panel"><div className="barcode"/><strong>{dealCode(r)}</strong></div><p className="claimed-note">Ipakita sa staff. Sample code for this demo.</p></article>)}</div>:<div className="empty-plus-card standalone-deals">Wala pang claimed deal. Pumili ng deal sa All.</div>):(()=>{const list=openDeals.filter(r=>dealFilter==='All'||(dealFilter==='Group'&&r.deal)||(dealFilter==='Hirit'&&r.hirit));return list.length?<div className="deal-list standalone-deals">{list.map(r=><button key={r.id} onClick={()=>details(r)}><FoodImage src={r.photo} alt={`Food at ${r.name}`}/><div><small>{dealLabel(r)}</small><strong>{r.name}</strong><p>{dealText(r)}</p></div><Icon name="chevron"/></button>)}</div>:<div className="empty-plus-card standalone-deals">Claimed mo na lahat dito. Tingnan sa Claimed.</div>})()}</section>{sharedSheets}</AppShell>
  if(screen==='tropaTab')return <AppShell key={screen} tabs screen={screen} screenDirection={screenDirection} go={go}><section className="content tab-content"><div className="title-row"><div><p className="eyebrow">LOOKARIN! PLUS</p><h1>Tropa.</h1></div>{plus&&<span className="plus-badge">PLUS</span>}</div>{plus?<><div className="saved-management"><div className="section-head"><h2>Saved barkadas</h2><button onClick={()=>start('pasa')}>Add</button></div>{savedTropas.length?savedTropas.map(t=><div className="saved-card" key={t.id}><div className="stacked">{t.people.slice(0,4).map((person,i)=><Avatar key={`${t.id}-${i}`} avatar={person.avatar} small/>)}</div><input value={t.name} onChange={e=>setSavedTropas(prev=>prev.map(x=>x.id===t.id?{...x,name:e.target.value}:x))}/><p>{t.people.map(person=>person.name).join(', ')}</p><div><Button onClick={()=>startSaved(t,'pasa')}>Pasa-Phone</Button><Button kind="blue" onClick={()=>startSaved(t,'invite')}>KAINvite</Button><button aria-label={`Delete ${t.name}`} onClick={()=>setSavedTropas(a=>a.filter(x=>x.id!==t.id))}><Icon name="trash"/></button></div></div>):<div className="empty-plus-card">Save a tropa after Dito Na!</div>}</div><div className="section-head"><h2>Lakad Planner</h2><button onClick={()=>openPlanner()}>New plan</button></div><div className="plans-list">{!plans.length&&<div className="empty-plus-card">Wala pang lakad. Tap New plan.</div>}{plans.map(p=><div className="planner-card" key={p.id}><span className="calendar"><small>{p.date.slice(5,7)||'--'}</small><strong>{p.date.slice(8,10)||'--'}</strong></span><div><strong>{p.restaurant}</strong><p>{p.date} · {p.time}{p.reminder?' · Reminder on':''}</p></div><button aria-label={`Edit ${p.restaurant} plan`} onClick={()=>{setPlanDraft(p);setSheet('planner')}}><Icon name="info"/></button><button aria-label={`Delete ${p.restaurant} plan`} onClick={()=>setPlans(a=>a.filter(x=>x.id!==p.id))}><Icon name="trash"/></button></div>)}</div></>:<div className="locked-preview"><div className="blur-cards"><i/><i/><i/></div><div><span className="plus-badge">PLUS</span><h2>Pang-Plus ’to!</h2><p>Unlock saved tropa, planner, at more.</p><Button kind="gold" onClick={()=>setSheet('plus')}>See Lookarin Plus</Button></div></div>}</section>{sharedSheets}</AppShell>
  const pageNav=(title:string,back:()=>void)=><div className="nav page-nav"><div><Button kind="plain" className="back" onClick={back}><Icon name="chevron"/>Back</Button></div><strong className="nav-title">{title}</strong><div/></div>
  const settingRow=(icon:string,color:string,label:string,onClick:()=>void,right:React.ReactNode=<Icon name="chevron"/>)=><button key={label} onClick={onClick}><span className={`setting-icon ${color}`}><Icon name={icon} size={19}/></span><span className="setting-label">{label}</span>{right}</button>
  const toggleMark=(on:boolean)=><span className={`toggle ${on?'on':''}`}><i/></span>

  if(screen==='settings')return <AppShell key={screen} screenDirection={screenDirection}>{pageNav('Settings',()=>go('profile',true))}<section className="content settings-page">
    <h3 className="settings-heading">Account</h3><div className="settings-list">{settingRow('edit','orange','Edit profile',()=>openEditProfile('settings'))}{plus?settingRow('crown','gold','Manage Plus',()=>setSheet('managePlus')):settingRow('crown','gold','Get Lookarin Plus',()=>setSheet('plus'))}</div>
    <h3 className="settings-heading">Appearance</h3><div className="segment three">{(['light','dark','system'] as Theme[]).map(t=><button key={t} className={theme===t?'on':''} aria-pressed={theme===t} onClick={()=>setTheme(t)}>{t==='light'?'Light':t==='dark'?'Dark':'System'}</button>)}</div>
    <h3 className="settings-heading">Notifications</h3><div className="settings-list">{settingRow('tag','green','Deal alerts',()=>setAlerts(a=>({...a,deals:!a.deals})),toggleMark(alerts.deals))}{settingRow('bell','blue','Lakad reminders',()=>setAlerts(a=>({...a,reminders:!a.reminders})),toggleMark(alerts.reminders))}</div>
    <h3 className="settings-heading">App</h3><div className="settings-list">{settingRow('spark','orange','Demo mode',()=>setDemo(!demo),toggleMark(demo))}{settingRow('doc','neutral','Terms and Conditions',()=>go('terms'))}{settingRow('shield','neutral','Privacy Policy',()=>go('privacy'))}{settingRow('map','neutral','Photo credits',()=>go('credits'))}{settingRow('trash','red','Clear app data',()=>setSheet('reset'))}</div>
    <p className="settings-version">Lookarin prototype 1.0</p>
    {sheet==='reset'&&<Sheet onClose={()=>setSheet(null)}><h2>Clear app data?</h2><p className="muted">Mawawala ang profile, saved tropa, plans, at claimed deals sa device na ’to.</p><Button kind="red" className="sheet-first" onClick={resetApp}>Clear everything</Button><Button kind="neutral" className="stacked-action" onClick={()=>setSheet(null)}>Cancel</Button></Sheet>}
  </section>{sharedSheets}</AppShell>

  if(screen==='editProfile'){
    const nameOk=!!profileDraft.name.trim()
    const emailOk=!profileDraft.email.trim()||/^\S+@\S+\.\S+$/.test(profileDraft.email.trim())
    return <AppShell key={screen} screenDirection={screenDirection}>{pageNav('Edit profile',()=>go(editBack,true))}<section className="content profile-form">
      <button className="profile-photo" onClick={()=>{setDraftProfileAvatar(profileAvatar);setSheet('profileAvatar')}}><Avatar avatar={profileAvatar} profile/><span>Change avatar</span></button>
      <label htmlFor="profile-name">Name<input id="profile-name" type="text" autoComplete="name" value={profileDraft.name} maxLength={30} placeholder="Ano’ng pangalan mo?" onChange={e=>setProfileDraft(d=>({...d,name:e.target.value}))}/></label>
      <label htmlFor="profile-email">Email (optional)<input id="profile-email" type="email" autoComplete="email" value={profileDraft.email} placeholder="ikaw@email.com" onChange={e=>setProfileDraft(d=>({...d,email:e.target.value}))}/></label>
      <h3>Home area</h3><div className="chips">{areas.map(a=><Chip key={a} selected={profileDraft.homeArea===a} onClick={()=>setProfileDraft(d=>({...d,homeArea:a}))}>{a}</Chip>)}</div>
      <h3>Usual budget</h3><div className="chips">{(['Tipid','Sakto','Bawi'] as Budget[]).map(b=><Chip key={b} selected={profileDraft.budget===b} onClick={()=>setProfileDraft(d=>({...d,budget:b}))}>{b}</Chip>)}</div>
      <h3>Diet needs</h3><div className="chips">{(['Vegetarian','No pork','Allergies'] as Diet[]).map(d=><Chip key={d} selected={profileDraft.diets.includes(d)} onClick={()=>setProfileDraft(p=>({...p,diets:p.diets.includes(d)?p.diets.filter(x=>x!==d):[...p.diets,d]}))}>{d}</Chip>)}</div>
      <p className="form-note">Automatic na gagamitin ’to sa bawat bagong session.</p>
    </section><BottomAction kind="green" disabled={!nameOk||!emailOk} hint={nameOk?'I-check ang email mo':'Ilagay ang pangalan mo'} onClick={saveProfile}>Save profile</BottomAction>{sharedSheets}</AppShell>
  }

  if(screen==='credits')return <AppShell key={screen} screenDirection={screenDirection}>{pageNav('Photo credits',()=>go('settings',true))}<section className="content legal-page"><p className="legal-date">Real restaurant photos come from Wikimedia Commons and were resized for the app. Restaurants without a free photo use a sample food photo from Unsplash and are labeled.</p>{restaurants.filter((r,i,all)=>r.credit&&all.findIndex(x=>x.credit===r.credit)===i).map(r=><div key={r.id}><h3>{r.name}</h3><p><a target="_blank" rel="noreferrer" href={r.credit!.url}>{r.credit!.author}, {r.credit!.license}</a></p></div>)}</section></AppShell>

  if(screen==='terms'||screen==='privacy'){
    const doc=screen==='terms'?[
      ['Using Lookarin','Lookarin helps groups decide where to eat. Votes, games, and picks are suggestions for your group only.'],
      ['Restaurant info','Names, map pins, ratings, and review counts come from Google Maps listings read in November 2026 and can change. Prices, budgets, and diet tags are estimates, and distances are straight lines. Check with the restaurant before you go.'],
      ['Deals','Deals in this prototype are samples. A code does not guarantee a discount unless the restaurant accepts it.'],
      ['Diet and allergies','Diet tags are guides only. Always confirm ingredients with the staff, especially for allergies.'],
      ['Lookarin Plus','Plus is simulated in this prototype. No payment is taken, and you can turn it off at any time.'],
      ['Your account','You are responsible for the names and details you enter, including the names of your tropa.'],
    ]:[
      ['What we keep','Your name, email, home area, budget, diet needs, theme, and alert choices.'],
      ['Where it stays','In this prototype, your profile and settings stay in this browser on this device. Nothing is sent to a server.'],
      ['Tropa names','Names you enter for friends stay in this app session unless you save a tropa.'],
      ['Clearing your data','Go to Settings and tap Clear app data to remove everything from this device.'],
    ]
    return <AppShell key={screen} screenDirection={screenDirection}>{pageNav(screen==='terms'?'Terms and Conditions':'Privacy Policy',()=>go('settings',true))}<section className="content legal-page"><div className="legal-note">Sample text for this prototype. Have this reviewed before a real launch.</div><p className="legal-date">Last updated November 2026</p>{doc.map(([title,body])=><div key={title}><h3>{title}</h3><p>{body}</p></div>)}</section></AppShell>
  }

  const restaurantFrequency=historyItems.reduce<Record<number,number>>((a,h)=>({...a,[h.restaurantId]:(a[h.restaurantId]||0)+1}),{})
  const favoriteId=Object.entries(restaurantFrequency).sort((a,b)=>b[1]-a[1])[0]?.[0]
  const cravingFrequency=historyItems.flatMap(h=>h.cravings).reduce<Record<string,number>>((a,c)=>({...a,[c]:(a[c]||0)+1}),{})
  const topCraving=Object.entries(cravingFrequency).sort((a,b)=>b[1]-a[1])[0]?.[0]||'Wala pa'
  const favorite=restaurants.find(r=>r.id===Number(favoriteId))?.name||'Wala pa'
  return <AppShell key={screen} tabs screen={screen} screenDirection={screenDirection} go={go}><section className="content tab-content profile-screen"><div className="profile-title"><button className="profile-avatar-wrap" aria-label="Edit profile" onClick={()=>openEditProfile('profile')}><Avatar avatar={profileAvatar} profile/></button><div><p className="eyebrow">YOUR LOOKARIN</p><div className="profile-name"><h1>{profile.name||'Profile.'}</h1><button className="name-edit" aria-label="Edit profile" onClick={()=>openEditProfile('profile')}><Icon name="edit" size={18}/></button></div><p className="profile-meta">{profile.name?`${profile.homeArea} · ${profile.budget}`:'I-set ang profile mo'}</p></div><button className="gear-button" aria-label="Settings" onClick={()=>go('settings')}><Icon name="gear"/></button></div>{plus?<div className="recap-card"><div className="recap-top"><span><Icon name="spark"/> BUSOG RECAP</span><Button kind="plain" onClick={()=>setSheet('share')}><Icon name="share"/> Share</Button></div><h2>Your actual food-trip recap.</h2><div className="recap-stats"><div><strong>{topCraving}</strong><span>Top craving</span></div><div><strong>{historyItems.length}</strong><span>Sessions</span></div></div><p>Most picked: <strong>{favorite}</strong></p></div>:<button className="plus-card" onClick={()=>setSheet('plus')}><div><span className="plus-badge">PLUS</span><h2>Pang-Plus ’to!</h2><p>Unlock your actual Busog Recap.</p></div><Icon name="chevron"/></button>}<div className="settings-list">{settingRow('edit','orange','Edit profile',()=>openEditProfile('profile'))}{settingRow('gear','blue','Settings',()=>go('settings'))}{plus?settingRow('crown','gold','Manage Plus',()=>setSheet('managePlus')):settingRow('crown','gold','Get Lookarin Plus',()=>setSheet('plus'))}{settingRow('plus','green','New session',()=>start('pasa'))}</div></section>{sharedSheets}</AppShell>
}

function LobbyJoiner({joined,setJoined,total,onJoin}:{joined:number;setJoined:(n:number)=>void;total:number;onJoin:(index:number)=>void}){
  useEffect(()=>{if(joined<total){const t=setTimeout(()=>{setJoined(joined+1);onJoin(joined)},2200);return()=>clearTimeout(t)}},[joined,total,setJoined])
  return null
}

function DeviceFrame({children}:{children:React.ReactNode}){
  const [fit,setFit]=useState({scale:1,bare:false,appHeight:874})
  useLayoutEffect(()=>{
    const resize=()=>{
      const width=window.innerWidth,height=window.innerHeight,bare=width<=480
      const scale=bare?width/402:Math.min(1,(width-24)/438,(height-24)/898)
      deviceScale=scale
      setFit({scale,bare,appHeight:height/scale})
    }
    resize()
    window.addEventListener('resize',resize)
    return()=>window.removeEventListener('resize',resize)
  },[])
  return <div className="device-stage"><div className={`device ${fit.bare?'bare':''}`} style={{transform:`scale(${fit.scale})`,...(fit.bare?{height:fit.appHeight,'--device-scale':fit.scale,'--app-h':`${fit.appHeight}px`}:{})} as React.CSSProperties}>
    <div className="device-screen">
      {children}
      {!fit.bare&&<><div className="status-bar" aria-hidden><span>9:41</span><span className="status-icons"><svg viewBox="0 0 18 12" width="18" height="12" fill="currentColor"><rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/><rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1"/></svg><svg viewBox="0 0 17 12" width="17" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M1.5 4.2a10 10 0 0 1 14 0M4.2 7a6.2 6.2 0 0 1 8.6 0"/><circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none"/></svg><svg viewBox="0 0 27 13" width="27" height="13" fill="none"><rect x=".5" y=".5" width="23" height="12" rx="3.5" stroke="currentColor" opacity=".45"/><rect x="2" y="2" width="20" height="9" rx="2.2" fill="currentColor"/><path d="M25 4.5c1 .3 1.5 1 1.5 2s-.5 1.7-1.5 2z" fill="currentColor" opacity=".5"/></svg></span></div><div className="dynamic-island" aria-hidden/><div className="home-indicator" aria-hidden/></>}
    </div>
  </div></div>
}

function App(){
  return <DeviceFrame><Prototype/></DeviceFrame>
}

export default App
