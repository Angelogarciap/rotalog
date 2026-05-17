import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { TopBar } from '../../components/layout/TopBar';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Produto } from '../../data/mock';
import { Colors, FontSize, Radius, Spacing } from '../../theme';
import { api } from '../../services/api';

const CATS = ['Todos', 'Carnes', 'Construção', 'Verduras', 'Grãos', 'Aves', 'Legumes'];

interface Props { navigation: any; addToCart: (p: Produto) => void; }

export function CatalogScreen({ navigation, addToCart }: Props) {
  const [busca, setBusca] = useState('');
  const [cat, setCat]     = useState('Todos');
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        // Busca todos os fornecedores e agrega os produtos
        const { data: suppliers } = await api.get('/api/v1/suppliers');
        const supplierList = Array.isArray(suppliers) ? suppliers : suppliers.content ?? suppliers.suppliers ?? [];
        const allProducts: any[] = [];
        await Promise.all(
          supplierList.slice(0, 10).map(async (s: any) => {
            try {
              const { data } = await api.get(`/api/v1/suppliers/${s.id}/products`);
              const prods = Array.isArray(data) ? data : data.content ?? data.products ?? [];
              prods.forEach((p: any) => {
                allProducts.push({
                  ...p,
                  fornecedorNome: s.name ?? s.nome ?? '',
                  supplierId: s.id,
                });
              });
            } catch { /* ignora fornecedor sem produtos */ }
          })
        );
        setProdutos(allProducts);
      } catch {
        setProdutos([]);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const toCartItem = (p: any): Produto => ({
    id: p.id,
    nome: p.name ?? p.nome ?? '',
    preco: p.price ?? p.preco ?? 0,
    unidade: p.unit ?? p.unidade ?? 'un',
    fornecedor: p.fornecedorNome ?? p.fornecedor ?? '',
    img: p.img ?? '📦',
    categoria: p.category ?? p.categoria ?? '',
    estoque: (p.stockQuantity ?? p.quantity ?? 1) > 0,
  });

  const filtrados = produtos
    .map(toCartItem)
    .filter(p =>
      (cat === 'Todos' || p.categoria === cat) &&
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );

  return (
    <View style={s.container}>
      <TopBar title="Catálogo de Produtos" onBack={() => navigation.goBack()} />
      <View style={s.filters}>
        <Input placeholder="Buscar produto..." value={busca} onChangeText={setBusca} />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: Spacing.md }}>
          {CATS.map(c => (
            <TouchableOpacity key={c} onPress={() => setCat(c)} style={[s.chip, cat === c && s.chipActive]}>
              <Text style={[s.chipText, cat === c && s.chipTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={s.center}><ActivityIndicator color={Colors.green} size="large" /></View>
      ) : (
        <FlatList
          data={filtrados}
          keyExtractor={i => `${i.id}-${i.fornecedor}`}
          numColumns={2}
          contentContainerStyle={s.grid}
          columnWrapperStyle={{ gap: 12 }}
          ListEmptyComponent={
            <View style={s.center}>
              <Text style={{ color: Colors.muted }}>Nenhum produto encontrado.</Text>
            </View>
          }
          renderItem={({ item: p }) => (
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('Product', { produto: p })} activeOpacity={0.8}>
              <View style={s.cardImg}><Text style={{ fontSize: 40 }}>{p.img}</Text></View>
              <Text style={s.cardName} numberOfLines={2}>{p.nome}</Text>
              <Text style={s.cardSup}>{p.fornecedor}</Text>
              <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 2, marginBottom: 8 }}>
                <Text style={s.cardPrice}>R$ {p.preco.toFixed(2)}</Text>
                <Text style={s.cardUnit}>/{p.unidade}</Text>
              </View>
              {p.estoque
                ? <Button label="+ Adicionar" onPress={() => addToCart(p)} sm full />
                : <Button label="Indisponível" onPress={() => {}} sm full disabled />
              }
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:      { flex: 1, backgroundColor: Colors.bg },
  filters:        { padding: Spacing.xl, paddingBottom: 0 },
  chip:           { backgroundColor: Colors.card, borderWidth: 1, borderColor: Colors.border, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: 6 },
  chipActive:     { backgroundColor: Colors.green, borderColor: Colors.green },
  chipText:       { color: Colors.muted, fontSize: FontSize.xs, fontWeight: '700' },
  chipTextActive: { color: '#0A0C0E' },
  grid:           { padding: Spacing.xl, gap: 12 },
  card:           { flex: 1, backgroundColor: Colors.card, borderRadius: Radius.lg, padding: Spacing.md, borderWidth: 1, borderColor: Colors.border },
  cardImg:        { alignItems: 'center', backgroundColor: Colors.surface, borderRadius: Radius.md, paddingVertical: 12, marginBottom: 8 },
  cardName:       { color: Colors.text, fontWeight: '700', fontSize: FontSize.sm, marginBottom: 2 },
  cardSup:        { color: Colors.muted, fontSize: FontSize.xs, marginBottom: 6 },
  cardPrice:      { color: Colors.green, fontWeight: '800', fontSize: FontSize.base },
  cardUnit:       { color: Colors.muted, fontSize: FontSize.xs },
  center:         { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
});
