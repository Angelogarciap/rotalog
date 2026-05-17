import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Button } from '../../components/ui/Button';
import { Produto } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

interface Props { navigation: any; route: any; addToCart: (p: Produto) => void; }

export function SupplierScreen({ navigation, route, addToCart }: Props) {
  const fornecedor = route?.params?.fornecedor ?? {};
  const supplierId = fornecedor.id;

  const nome      = fornecedor.name      ?? fornecedor.nome      ?? '';
  const categoria = fornecedor.category  ?? fornecedor.categoria ?? '';
  const nota      = fornecedor.rating    ?? fornecedor.nota      ?? 0;
  const entregas  = fornecedor.deliveries ?? fornecedor.entregas ?? 0;
  const distancia = fornecedor.distance  ?? fornecedor.distancia ?? '-';
  const tempo     = fornecedor.deliveryTime ?? fornecedor.tempo  ?? '-';
  const img       = fornecedor.img       ?? '🏪';
  const cor       = fornecedor.cor       ?? Colors.green;

  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const { data } = await api.get(`/api/v1/suppliers/${supplierId}/products`);
        const list = Array.isArray(data) ? data : data.content ?? data.products ?? [];
        setProdutos(list);
      } catch {
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    }
    if (supplierId) {
      loadProducts();
    } else {
      setLoading(false);
    }
  }, [supplierId]);

  const toCartItem = (p: any): Produto => ({
    id: p.id,
    nome: p.name ?? p.nome ?? '',
    preco: p.price ?? p.preco ?? 0,
    unidade: p.unit ?? p.unidade ?? 'un',
    fornecedor: nome,
    img: p.img ?? '📦',
    categoria: p.category ?? p.categoria ?? '',
    estoque: (p.stockQuantity ?? p.quantity ?? p.estoque ?? 1) > 0,
  });

  return (
    <View style={s.container}>
      <TopBar title="" onBack={() => navigation.goBack()} transparent />
      <ScrollView contentContainerStyle={s.scroll}>
        {/* Hero */}
        <View style={[s.hero, { backgroundColor: `${cor}11` }]}>
          <Text style={{ fontSize: 64, marginBottom: 12 }}>{img}</Text>
          <Text style={s.name}>{nome}</Text>
          <Text style={s.cat}>{categoria}</Text>
          <View style={s.stats}>
            {([['Avaliação', nota], ['Entregas', entregas], ['Distância', distancia]] as [string, any][]).map(([k, v]) => (
              <View key={k} style={{ alignItems: 'center' }}>
                <Text style={s.statVal}>{v}</Text>
                <Text style={s.statKey}>{k}</Text>
              </View>
            ))}
          </View>
          {tempo !== '-' && (
            <View style={s.etaBadge}>
              <Text style={s.etaTxt}>🕐 Entrega estimada: <Text style={{ color: Colors.text, fontWeight: '700' }}>{tempo}</Text></Text>
            </View>
          )}
        </View>

        {/* Produtos */}
        <Text style={s.section}>— PRODUTOS DISPONÍVEIS</Text>
        {loading ? (
          <ActivityIndicator color={Colors.green} style={{ marginTop: 20 }} />
        ) : produtos.length === 0 ? (
          <Text style={{ color: Colors.muted, textAlign: 'center', marginTop: 20 }}>
            Nenhum produto disponível.
          </Text>
        ) : (
          <View style={s.grid}>
            {produtos.map(p => {
              const item = toCartItem(p);
              return (
                <View key={p.id} style={s.prodCard}>
                  <Text style={{ fontSize: 32, textAlign: 'center', marginBottom: 8 }}>{item.img}</Text>
                  <Text style={s.prodName} numberOfLines={2}>{item.nome}</Text>
                  <Text style={s.prodPrice}>R$ {item.preco.toFixed(2)}/{item.unidade}</Text>
                  {item.estoque
                    ? <Button label="+ Adicionar" onPress={() => addToCart(item)} sm full style={{ marginTop: 8 }} />
                    : <Button label="Indisponível" onPress={() => {}} sm full disabled style={{ marginTop: 8 }} />
                  }
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  scroll:    { padding: Spacing.xl, gap: 16 },
  hero:      { alignItems: 'center', borderRadius: Radius.xl, padding: Spacing.xl },
  name:      { color: Colors.text, fontSize: FontSize.xl, fontWeight: '900', marginBottom: 4 },
  cat:       { color: Colors.muted, marginBottom: 12 },
  stats:     { flexDirection: 'row', gap: 32, marginBottom: 12 },
  statVal:   { color: Colors.green, fontWeight: '900', fontSize: FontSize.lg, textAlign: 'center' },
  statKey:   { color: Colors.muted, fontSize: FontSize.xs },
  etaBadge:  { backgroundColor: Colors.card, borderRadius: Radius.md, paddingHorizontal: Spacing.md, paddingVertical: 10, borderWidth: 1, borderColor: Colors.border },
  etaTxt:    { color: Colors.muted, fontSize: FontSize.sm },
  section:   { color: Colors.muted, fontSize: FontSize.xs, letterSpacing: 1, fontWeight: '700', textTransform: 'uppercase' },
  grid:      { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  prodCard:  { flex: 1, minWidth: '45%', backgroundColor: Colors.card, borderRadius: Radius.md, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  prodName:  { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 4 },
  prodPrice: { color: Colors.green, fontWeight: '800', fontSize: FontSize.sm },
});
