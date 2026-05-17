import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Badge } from '../../components/ui/index';
import { Button } from '../../components/ui/Button';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

const STEPS = ['Confirmado', 'Em rota', 'Entregue'];

// Mapeamento de status da API para fase visual (1, 2, 3)
const STATUS_TO_FASE: Record<string, 1|2|3> = {
  PENDING: 1, ACCEPTED: 1, PREPARING: 1,
  DISPATCHED: 2,
  DELIVERED: 3,
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Em separação', ACCEPTED: 'Em separação', PREPARING: 'Em separação',
  DISPATCHED: 'Em rota',
  DELIVERED: 'Próximo',
};

export function DeliveryScreen({ navigation }: { navigation: any }) {
  const [pedidos, setPedidos]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const pollingRef               = useRef<ReturnType<typeof setInterval> | null>(null);

  async function fetchOrders() {
    try {
      const { data } = await api.get('/api/v1/orders');
      const list = Array.isArray(data) ? data : data.content ?? data.orders ?? [];
      // filtra apenas pedidos ativos (não entregues nem cancelados)
      const ativos = list.filter((p: any) =>
        !['DELIVERED', 'CANCELLED', 'REJECTED', 'entregue', 'cancelado'].includes(p.status)
      );
      setPedidos(ativos);
    } catch {
      // silencia erros de polling
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchOrders();
    // Poll a cada 15 segundos para simular atualização em tempo real
    // (substituir por WebSocket /topic/tracking/{orderId} quando disponível)
    pollingRef.current = setInterval(fetchOrders, 15_000);
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  return (
    <View style={s.container}>
      <TopBar title="Acompanhar Entregas" />

      {/* Placeholder do mapa */}
      <View style={s.map}>
        {[...Array(6)].map((_, i) => (
          <View key={`v${i}`} style={[s.gridLine, s.gridLineV, { left: `${i * 20}%` as any }]} />
        ))}
        {[...Array(5)].map((_, i) => (
          <View key={`h${i}`} style={[s.gridLine, s.gridLineH, { top: `${i * 25}%` as any }]} />
        ))}
        <View style={s.liveBadge}>
          <Text style={{ color: Colors.green, fontWeight: '700', fontSize: FontSize.sm }}>
            {pedidos.length > 0 ? '🔴 AO VIVO' : '📦 SEM PEDIDOS ATIVOS'}
          </Text>
        </View>
        <Text style={{ fontSize: 48 }}>
          {pedidos.length > 0
            ? (STATUS_TO_FASE[pedidos[0]?.status] === 3 ? '📍' : STATUS_TO_FASE[pedidos[0]?.status] === 2 ? '🚚' : '📦')
            : '🗺️'}
        </Text>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.green} size="large" /></View>
      ) : (
        <ScrollView contentContainerStyle={s.list}>
          {pedidos.length === 0 ? (
            <View style={[s.card, { alignItems: 'center' }]}>
              <Text style={{ color: Colors.muted, fontSize: FontSize.sm, marginBottom: 8 }}>
                Sem pedidos ativos no momento
              </Text>
              <Button label="FAZER PEDIDO" onPress={() => navigation.navigate('HomeTab')} sm />
            </View>
          ) : (
            pedidos.map(pedido => {
              const fase    = STATUS_TO_FASE[pedido.status] ?? 1;
              const etapa   = fase;
              const status  = STATUS_LABEL[pedido.status] ?? pedido.status;
              const prodNome = pedido.items?.[0]?.productName ?? pedido.items?.[0]?.nome ?? 'Pedido';
              const fornNome = pedido.supplierName ?? pedido.supplier?.name ?? '-';
              const pedidoId = `#${pedido.id?.toString().replace('#','') ?? '-'}`;

              return (
                <View key={pedido.id} style={[s.card, { borderColor: `${Colors.green}44` }]}>
                  <View style={s.cardTop}>
                    <View>
                      <Text style={s.cardId}>{pedidoId}</Text>
                      <Text style={s.cardProd}>{prodNome}</Text>
                      <Text style={s.cardSup}>por {fornNome}</Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Badge label={status} />
                    </View>
                  </View>

                  {/* Banner de fase */}
                  <View style={s.faseBanner}>
                    <Text style={s.faseIcon}>{fase === 1 ? '📦' : fase === 2 ? '🚚' : '📍'}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={s.faseTitle}>
                        {fase === 1 ? 'Pedido em separação' : fase === 2 ? 'Entregador em rota' : 'Entregador próximo!'}
                      </Text>
                      <Text style={s.faseSub}>
                        {fase === 1 ? 'Seu pedido está sendo preparado pelo fornecedor.'
                          : fase === 2 ? 'Seu pedido está a caminho.'
                          : 'Fique atento, está chegando!'}
                      </Text>
                    </View>
                  </View>

                  {/* Tracker */}
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
              );
            })
          )}
        </ScrollView>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.bg },
  map:             { height: 200, backgroundColor: '#0d1117', alignItems: 'center', justifyContent: 'center', borderBottomWidth: 1, borderBottomColor: Colors.border, position: 'relative', overflow: 'hidden' },
  gridLine:        { position: 'absolute', backgroundColor: `${Colors.border}44` },
  gridLineV:       { top: 0, bottom: 0, width: 1 },
  gridLineH:       { left: 0, right: 0, height: 1 },
  liveBadge:       { position: 'absolute', top: 12, left: 12, backgroundColor: 'rgba(10,12,14,0.92)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: `${Colors.green}44` },
  list:            { padding: Spacing.xl, gap: 12 },
  center:          { flex: 1, alignItems: 'center', justifyContent: 'center' },
  card:            { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardTop:         { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  cardId:          { fontWeight: '800', color: Colors.text, fontSize: FontSize.base },
  cardProd:        { color: Colors.muted, fontSize: FontSize.sm },
  cardSup:         { color: Colors.muted, fontSize: FontSize.xs },
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
});
