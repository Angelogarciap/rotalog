import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

const STATUS_COLOR: Record<string, string> = {
  entregue: Colors.green, DELIVERED: Colors.green,
  cancelado: Colors.danger, CANCELLED: Colors.danger, REJECTED: Colors.danger,
  pendente: Colors.warning, PENDING: Colors.warning, ACCEPTED: Colors.warning,
  PREPARING: Colors.warning, DISPATCHED: Colors.warning,
};
const STATUS_ICON: Record<string, string> = {
  entregue: '✓', DELIVERED: '✓',
  cancelado: '✕', CANCELLED: '✕', REJECTED: '✕',
  pendente: '⏱', PENDING: '⏱', ACCEPTED: '⏱', PREPARING: '⏱', DISPATCHED: '🚚',
};
const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pendente', ACCEPTED: 'Aceito', PREPARING: 'Em preparo',
  DISPATCHED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado', REJECTED: 'Rejeitado',
};

export function HistoryScreen({ navigation }: { navigation: any }) {
  const [pedidos, setPedidos]   = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);
  const [erro, setErro]         = useState(false);

  useEffect(() => {
    async function loadOrders() {
      try {
        const { data } = await api.get('/api/v1/orders');
        const list = Array.isArray(data) ? data : data.content ?? data.orders ?? [];
        setPedidos(list);
      } catch {
        setErro(true);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const normalizeStatus = (p: any) =>
    p.status ?? (p.entregue ? 'entregue' : 'pendente');

  return (
    <View style={s.container}>
      <TopBar title="Histórico de Pedidos" onBack={() => navigation.goBack()} />
      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.green} size="large" /></View>
      ) : erro ? (
        <View style={s.center}>
          <Text style={{ color: Colors.muted }}>Não foi possível carregar os pedidos.</Text>
        </View>
      ) : (
        <FlatList
          data={pedidos}
          keyExtractor={i => String(i.id)}
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
              <Text style={{ color: Colors.muted }}>Nenhum pedido encontrado.</Text>
            </View>
          }
          renderItem={({ item: p }) => {
            const status = normalizeStatus(p);
            const statusColor = STATUS_COLOR[status] ?? Colors.muted;
            const statusIcon  = STATUS_ICON[status]  ?? '?';
            const statusLabel = STATUS_LABEL[status]  ?? status;

            // normaliza campos da API
            const id         = p.id ?? p.orderId ?? '-';
            const fornecedor = p.supplierName ?? p.supplier?.name ?? p.fornecedor ?? '-';
            const data_fmt   = p.createdAt
              ? new Date(p.createdAt).toLocaleDateString('pt-BR', { day:'2-digit', month:'short' })
              : (p.data ?? '-');
            const total      = typeof p.totalAmount === 'number'
              ? `R$ ${p.totalAmount.toFixed(2)}`
              : (p.total ?? '-');
            const itens: string[] = p.items?.map((i: any) => i.productName ?? i.nome ?? 'Item') ?? p.itens ?? [];

            return (
              <View style={s.card}>
                <View style={s.top}>
                  <Text style={s.id}>#{typeof id === 'number' ? id : id.toString().replace('#','')}</Text>
                  <View style={[s.badge, { backgroundColor: `${statusColor}22` }]}>
                    <Text style={[s.badgeTxt, { color: statusColor }]}>
                      {statusIcon} {statusLabel}
                    </Text>
                  </View>
                </View>
                <Text style={s.meta}>{fornecedor} · {data_fmt}</Text>
                {itens.length > 0 && <Text style={s.itens}>{itens.join(' · ')}</Text>}
                <View style={s.footer}>
                  <Text style={s.total}>{total}</Text>
                  {(status === 'entregue' || status === 'DELIVERED') && (
                    <TouchableOpacity style={s.repeatBtn}>
                      <Text style={s.repeatTxt}>Repetir pedido</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          }}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  list:      { padding: Spacing.xl, gap: 12 },
  center:    { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  card:      { backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  top:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  id:        { fontWeight: '800', color: Colors.text, fontSize: FontSize.base },
  badge:     { borderRadius: Radius.full, paddingHorizontal: 10, paddingVertical: 3 },
  badgeTxt:  { fontSize: FontSize.xs, fontWeight: '700' },
  meta:      { color: Colors.muted, fontSize: FontSize.sm },
  itens:     { color: Colors.muted, fontSize: FontSize.xs, marginBottom: 12 },
  footer:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  total:     { color: Colors.green, fontWeight: '800', fontSize: FontSize.base },
  repeatBtn: { backgroundColor: `${Colors.green}22`, borderWidth: 1, borderColor: `${Colors.green}44`, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 6 },
  repeatTxt: { color: Colors.green, fontWeight: '700', fontSize: FontSize.xs },
});
