import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/index';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

const STEPS = ['Confirmado', 'Em rota', 'Entregue'];
const PEDIDO = { id: '#4522', status: 'Em rota', etapa: 2, produto: 'Picanha Angus 4kg', fornecedor: 'BovPrime', eta: '~18 min' };

export function DeliveryScreen({ navigation }: { navigation: any }) {
  return (
    <View style={s.container}>
      <TopBar title="Acompanhar Entregas" />

      {/* Map placeholder */}
      <View style={s.map}>
        {[...Array(6)].map((_, i) => (
          <View key={`v${i}`} style={[s.gridLine, s.gridLineV, { left: `${i * 20}%` as any }]} />
        ))}
        {[...Array(5)].map((_, i) => (
          <View key={`h${i}`} style={[s.gridLine, s.gridLineH, { top: `${i * 25}%` as any }]} />
        ))}
        <View style={s.liveBadge}>
          <Text style={{ color: Colors.green, fontWeight: '700', fontSize: FontSize.sm }}>🔴 AO VIVO</Text>
        </View>
        <Text style={{ fontSize: 36 }}>🗺️</Text>
      </View>

      <ScrollView contentContainerStyle={s.list}>
        {/* Active order */}
        <View style={[s.card, { borderColor: `${Colors.green}44` }]}>
          <View style={s.cardTop}>
            <View>
              <Text style={s.cardId}>{PEDIDO.id}</Text>
              <Text style={s.cardProd}>{PEDIDO.produto}</Text>
              <Text style={s.cardSup}>por {PEDIDO.fornecedor}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Badge label={PEDIDO.status} />
              <Text style={s.eta}>{PEDIDO.eta}</Text>
            </View>
          </View>

          {/* Tracker */}
          <View style={s.tracker}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <View style={[s.dot, i < PEDIDO.etapa && s.dotActive]}>
                  {i < PEDIDO.etapa && <Text style={{ color: '#0A0C0E', fontSize: 10, fontWeight: '900' }}>✓</Text>}
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[s.line, i < PEDIDO.etapa - 1 && s.lineActive]} />
                )}
              </React.Fragment>
            ))}
          </View>
          <View style={s.trackerLabels}>
            {STEPS.map(step => <Text key={step} style={s.trackerLabel}>{step}</Text>)}
          </View>
        </View>

        {/* Empty state */}
        <View style={[s.card, { alignItems: 'center' }]}>
          <Text style={{ color: Colors.muted, fontSize: FontSize.sm, marginBottom: 8 }}>Sem outros pedidos ativos</Text>
          <Button label="FAZER PEDIDO" onPress={() => navigation.navigate('HomeTab')} sm />
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.bg },
  map:           { height: 220, backgroundColor: '#0d1117', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border, position: 'relative', overflow: 'hidden' },
  gridLine:      { position: 'absolute', backgroundColor: `${Colors.border}44` },
  gridLineV:     { top: 0, bottom: 0, width: 1 },
  gridLineH:     { left: 0, right: 0, height: 1 },
  liveBadge:     { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(10,12,14,0.92)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: `${Colors.green}44` },
  list:          { padding: Spacing.xl, gap: 12 },
  card:          { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTop:       { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardId:        { fontWeight: '800', color: Colors.text, fontSize: FontSize.base },
  cardProd:      { color: Colors.muted, fontSize: FontSize.sm },
  cardSup:       { color: Colors.muted, fontSize: FontSize.xs },
  eta:           { color: Colors.green, fontWeight: '800', fontSize: FontSize.base, marginTop: 8 },
  tracker:       { flexDirection: 'row', alignItems: 'center' },
  dot:           { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.subtle, alignItems: 'center', justifyContent: 'center' },
  dotActive:     { backgroundColor: Colors.green },
  line:          { flex: 1, height: 2, backgroundColor: Colors.border },
  lineActive:    { backgroundColor: Colors.green },
  trackerLabels: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  trackerLabel:  { color: Colors.muted, fontSize: FontSize.xs },
});
