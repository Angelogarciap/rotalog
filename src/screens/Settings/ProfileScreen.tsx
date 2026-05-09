import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Avatar, Badge } from '../../components/ui/index';
import { ENDERECOS } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

export function ProfileScreen({ navigation }: { navigation: any }) {
  return (
    <View style={s.container}>
      <TopBar title="Meu Perfil" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={s.list}>

        {/* Avatar */}
        <View style={s.avatarWrap}>
          <Avatar size={80} letter="O" />
          <Text style={s.name}>Olga Mendes</Text>
          <Text style={s.since}>Membro desde Jan 2024</Text>
        </View>

        {/* Dados */}
        <Text style={s.section}>DADOS PESSOAIS</Text>
        <View style={s.dataCard}>
          {([['Nome', 'Olga Mendes'], ['E-mail', 'olga@email.com'], ['Telefone', '(92) 99999-0000']] as [string, string][]).map(([k, v]) => (
            <View key={k} style={s.dataRow}>
              <Text style={s.dataKey}>{k}</Text>
              <Text style={s.dataVal}>{v}</Text>
            </View>
          ))}
        </View>

        {/* Endereços */}
        <View style={s.addrHeader}>
          <Text style={s.section}>ENDEREÇOS</Text>
          <TouchableOpacity style={s.addBtn}>
            <Text style={{ color: '#0A0C0E', fontWeight: '800', fontSize: FontSize.xs }}>+ Novo</Text>
          </TouchableOpacity>
        </View>
        {ENDERECOS.map(e => (
          <View key={e.id} style={[s.addrCard, e.principal && s.addrCardPrincipal]}>
            <View style={s.addrTop}>
              <Text style={s.addrLabel}>{e.label}</Text>
              {e.principal && <Badge label="Principal" />}
            </View>
            <Text style={s.addrRua}>{e.rua}</Text>
            <Text style={s.addrSub}>{e.bairro} · {e.cidade}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:         { flex: 1, backgroundColor: Colors.bg },
  list:              { padding: Spacing.xl, gap: 10 },
  avatarWrap:        { alignItems: 'center', marginBottom: 8 },
  name:              { color: Colors.text, fontWeight: '800', fontSize: FontSize.xl, marginTop: 12 },
  since:             { color: Colors.muted, fontSize: FontSize.sm },
  section:           { color: Colors.muted, fontSize: FontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  dataCard:          { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  dataRow:           { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: Colors.border },
  dataKey:           { color: Colors.muted, fontSize: FontSize.sm },
  dataVal:           { color: Colors.text, fontWeight: '600', fontSize: FontSize.sm },
  addrHeader:        { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  addBtn:            { backgroundColor: Colors.green, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 4 },
  addrCard:          { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  addrCardPrincipal: { borderColor: Colors.green },
  addrTop:           { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  addrLabel:         { fontWeight: '800', color: Colors.text, fontSize: FontSize.base },
  addrRua:           { color: Colors.muted, fontSize: FontSize.sm },
  addrSub:           { color: Colors.muted, fontSize: FontSize.xs },
});
