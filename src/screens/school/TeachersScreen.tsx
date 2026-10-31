import { C } from '../../theme';
import React,{useMemo,useState} from 'react';
import {Image,Pressable,View} from 'react-native';
import {useApp} from '../../app-context';
import {useI18n} from '../../i18n/I18nContext';
import {AppText,Card,Field,Pill} from '../../components/UI';
import {Screen} from '../../components/Screen';
import {styles} from './TeachersScreen.styles';
export default function TeachersScreen(){
 const {teachers,navigate}=useApp();const {t,language}=useI18n();const [search,setSearch]=useState('');
 const list=useMemo(()=>teachers.filter(item=>`${item.name} ${item.designation} ${item.highestDegree} ${item.subjects.join(' ')}`.toLowerCase().includes(search.toLowerCase())),[teachers,search]);
 return <Screen title={t('teachers')}><Field label={t('search')} value={search} onChangeText={setSearch} placeholder={`${t('search')}…`}/>{list.map(person=><Pressable key={person.id} onPress={()=>navigate('TeacherDetail',{teacherId:person.id})}><Card style={styles.row}><Image source={{uri:person.photoUrl}} style={styles.photo}/><View style={styles.copy}><AppText size={13} weight="bold">{person.name}</AppText><AppText size={11} color="#71809A">{language==='hi'?(person.designationHi||person.designation):person.designation}</AppText><Pill label={person.highestDegree} tone="blue"/></View><AppText color={C.primary} size={21}>›</AppText></Card></Pressable>)}{!list.length?<Card><AppText>{t('noResults')}</AppText></Card>:null}</Screen>;
}
