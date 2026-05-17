import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/index';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';

// ── Types ─────────────────────────────────────────────────────────────────────
type Fase = 1 | 2 | 3;

// ── Mock — substituir por dados reais da API + WebSocket ──────────────────────
const PEDIDO = {
  id: '#4522',
  produto: 'Picanha Angus 4kg',
  fornecedor: 'BovPrime',
  posicaoNaFila: 2,
  totalEntregas: 5,
  eta: '~18 min',
};

const STEPS = ['Confirmado', 'Em rota', 'Entregue'];

// ── Component ─────────────────────────────────────────────────────────────────
export function DeliveryScreen({ navigation }: { navigation: any }) {
  // TODO: substituir pelo status real vindo do WebSocket /topic/tracking/{orderId}
  const [fase, setFase] = useState<Fase>(1);

  const etapa  = fase === 1 ? 1 : fase === 2 ? 2 : 3;
  const status = fase === 1 ? 'Em separação' : fase === 2 ? 'Em rota' : 'Próximo';

  return (
    <View style={s.container}>
      <TopBar title="Acompanhar Entregas" />

      {/* ── Placeholder do mapa ── */}
      <View style={s.map}>
        {[...Array(6)].map((_, i) => (
          <View key={`v${i}`} style={[s.gridLine, s.gridLineV, { left: `${i * 20}%` as any }]} />
        ))}
        {[...Array(5)].map((_, i) => (
          <View key={`h${i}`} style={[s.gridLine, s.gridLineH, { top: `${i * 25}%` as any }]} />
        ))}
        <View style={s.liveBadge}>
          <Text style={{ color: Colors.green, fontWeight: '700', fontSize: FontSize.sm }}>
            {fase === 1 ? '🟡 EM SEPARAÇÃO' : fase === 2 ? '🔴 AO VIVO' : '📍 PRÓXIMO'}
          </Text>
        </View>
        {/* Ícone central muda por fase */}
        <Text style={{ fontSize: 48 }}>
          {fase === 1 ? '📦' : fase === 2 ? '🚚' : '📍'}
        </Text>
        {/* TODO: substituir por MapView quando tiver a chave do Google Maps */}
        {fase === 3 && (
          <Text style={s.mapNote}>Mapa ao vivo disponível após configuração</Text>
        )}
      </View>

      <ScrollView contentContainerStyle={s.list}>

        {/* ── Card do pedido ativo ── */}
        <View style={[s.card, { borderColor: `${Colors.green}44` }]}>
          <View style={s.cardTop}>
            <View>
              <Text style={s.cardId}>{PEDIDO.id}</Text>
              <Text style={s.cardProd}>{PEDIDO.produto}</Text>
              <Text style={s.cardSup}>por {PEDIDO.fornecedor}</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Badge label={status} />
              <Text style={s.eta}>{PEDIDO.eta}</Text>
            </View>
          </View>

          {/* ── Banner de fase ── */}
          <View style={s.faseBanner}>
            {fase === 1 && (
              <>
                <Text style={s.faseIcon}>📦</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.faseTitle}>Pedido em separação</Text>
                  <Text style={s.faseSub}>Seu pedido está sendo preparado pelo fornecedor.</Text>
                </View>
              </>
            )}
            {fase === 2 && (
              <>
                <Text style={s.faseIcon}>🚚</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.faseTitle}>Entregador em rota</Text>
                  <Text style={s.faseSub}>
                    Você é a entrega {PEDIDO.posicaoNaFila} de {PEDIDO.totalEntregas}.
                  </Text>
                </View>
              </>
            )}
            {fase === 3 && (
              <>
                <Text style={s.faseIcon}>📍</Text>
                <View style={{ flex: 1 }}>
                  <Text style={s.faseTitle}>Entregador próximo!</Text>
                  <Text style={s.faseSub}>Seu pedido está chegando. Fique atento!</Text>
                </View>
              </>
            )}
          </View>

          {/* ── Tracker de etapas ── */}
          <View style={s.tracker}>
            {STEPS.map((step, i) => (
              <React.Fragment key={step}>
                <View style={[s.dot, i < etapa && s.dotActive]}>
                  {i < etapa && <Text style={{ color: '#0A0C0E', fontSize: 10, fontWeight: '900' }}>✓</Text>}
                </View>
                {i < STEPS.length - 1 && (
                  <View style={[s.line, i < etapa - 1 && s.lineActive]} />
                )}
              </React.Fragment>
            ))}
          </View>
          <View style={s.trackerLabels}>
            {STEPS.map(step => <Text key={step} style={s.trackerLabel}>{step}</Text>)}
          </View>
        </View>

        {/* ── Botões de simulação — remover após integração WebSocket ── */}
        <View style={s.card}>
          <Text style={s.simLabel}>Simular fase (remover após integração):</Text>
          <View style={s.simRow}>
            {([1, 2, 3] as Fase[]).map(f => (
              <TouchableOpacity
                key={f}
                style={[s.faseBtn, fase === f && s.faseBtnActive]}
                onPress={() => setFase(f)}
              >
                <Text style={[s.faseBtnTxt, fase === f && s.faseBtnTxtActive]}>
                  Fase {f}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Empty state ── */}
        <View style={[s.card, { alignItems: 'center' }]}>
          <Text style={{ color: Colors.muted, fontSize: FontSize.sm, marginBottom: 8 }}>
            Sem outros pedidos ativos
          </Text>
          <Button label="FAZER PEDIDO" onPress={() => navigation.navigate('HomeTab')} sm />
        </View>

      </ScrollView>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },

  map:             { height: 240, backgroundColor: '#0d1117', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border, position: 'relative', overflow: 'hidden' },
  gridLine:        { position: 'absolute', backgroundColor: `${Colors.border}44` },
  gridLineV:       { top: 0, bottom: 0, width: 1 },
  gridLineH:       { left: 0, right: 0, height: 1 },
  liveBadge:       { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(10,12,14,0.92)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: `${Colors.green}44` },
  mapNote:         { position: 'absolute', bottom: 10, color: Colors.muted, fontSize: FontSize.xs },

  list:            { padding: Spacing.xl, gap: 12 },
  card:            { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardId:          { fontWeight: '800', color: Colors.text, fontSize: FontSize.base },
  cardProd:        { color: Colors.muted, fontSize: FontSize.sm },
  cardSup:         { color: Colors.muted, fontSize: FontSize.xs },
  eta:             { color: Colors.green, fontWeight: '800', fontSize: FontSize.base, marginTop: 8 },

  faseBanner:      { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: Colors.subtle, borderRadius: Radius.md, padding: Spacing.md, marginBottom: 16 },
  faseIcon:        { fontSize: 28 },
  faseTitle:       { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 2 },
  faseSub:         { color: Colors.muted, fontSize: FontSize.xs, lineHeight: 18 },

  tracker:         { flexDirection: 'row', alignItems: 'center' },
  dot:             { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.subtle, alignItems: 'center', justifyContent: 'center' },
  dotActive:       { backgroundColor: Colors.green },
  line:            { flex: 1, height: 2, backgroundColor: Colors.border },
  lineActive:      { backgroundColor: Colors.green },
  trackerLabels:   { flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 },
  trackerLabel:    { color: Colors.muted, fontSize: FontSize.xs },

  simLabel:        { color: Colors.muted, fontSize: FontSize.xs, marginBottom: 8 },
  simRow:          { flexDirection: 'row', gap: 8 },
  faseBtn:         { flex: 1, padding: Spacing.sm, borderRadius: Radius.md, borderWidth: 1, borderColor: Colors.border, alignItems: 'center' },
  faseBtnActive:   { backgroundColor: Colors.green, borderColor: Colors.green },
  faseBtnTxt:      { color: Colors.muted, fontSize: FontSize.xs, fontWeight: '700' },
  faseBtnTxtActive:{ color: '#0A0C0E' },
});