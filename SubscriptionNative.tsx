import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, ActivityIndicator, ScrollView, SafeAreaView } from 'react-native';
import { StripeProvider, CardField, useConfirmPayment } from '@stripe/stripe-react-native';

const PUBLISHABLE_KEY =
  'pk_live_51RsspgEqSklIuetZT3UOXocxXkYCTYKTznCnN6ciw1r6sghZmfkZD8gEzZ0tIUXwjdUDVaGIRxr9ZkCN5d5LeX7H00ZRa4BkE6';

const BACKEND_URL = 'https://libido2026.vercel.app';

const SubscriptionNative = () => {
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { confirmPayment } = useConfirmPayment();

  const plans = [
    { id: 'mensal', name: 'Plano Mensal', price: 4990, displayPrice: 'R$ 49,90/mês' },
    { id: 'semestral', name: 'Plano Semestral', price: 26946, displayPrice: 'R$ 269,46 (6 meses)' },
    { id: 'anual', name: 'Plano Anual', price: 47904, displayPrice: 'R$ 479,04 (12 meses)' },
  ];

  const handlePayment = async () => {
    if (!selectedPlan) {
      Alert.alert('Erro', 'Selecione um plano primeiro.');
      return;
    }

    setLoading(true);

    try {
      // 1) Criar Payment Intent no backend (LIVE)
      const response = await fetch(`${BACKEND_URL}/api/payments/create-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: selectedPlan.name,
          method: 'card',
          amountCents: selectedPlan.price,
          userId: 'native-user',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || `Erro ${response.status}: ${response.statusText}`);
      }

      if (!data?.clientSecret) {
        throw new Error('Servidor não retornou clientSecret');
      }

      // 2) Confirmar pagamento via Stripe SDK Native (LIVE)
      const { paymentIntent, error } = await confirmPayment(data.clientSecret, {
        paymentMethodType: 'Card',
      });

      if (error) {
        Alert.alert('Erro no Pagamento', error.message);
        return;
      }

      if (paymentIntent) {
        Alert.alert('✅ Sucesso!', `Pagamento realizado para ${selectedPlan.name}! Sua conta será atualizada em instantes.`);
      }
    } catch (error: any) {
      Alert.alert(
        '❌ Erro',
        `Não foi possível processar o pagamento.\n\nDetalhes: ${error?.message}\n\nVerifique sua conexão e tente novamente.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <StripeProvider publishableKey={PUBLISHABLE_KEY}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>Escolha Seu Plano</Text>
            <Text style={styles.subtitle}>Pagamento seguro via Stripe</Text>
          </View>

          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              Atenção: no modo LIVE, qualquer pagamento aprovado pode gerar cobrança real.
            </Text>
          </View>

          {plans.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              activeOpacity={0.8}
              style={[styles.planCard, selectedPlan?.id === plan.id && styles.selectedPlan]}
              onPress={() => setSelectedPlan(plan)}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planName}>{plan.name}</Text>
                {selectedPlan?.id === plan.id && <View style={styles.radioActive} />}
              </View>
              <Text style={styles.planPrice}>{plan.displayPrice}</Text>
            </TouchableOpacity>
          ))}

          {selectedPlan && (
            <View style={styles.cardContainer}>
              <Text style={styles.cardLabel}>Dados do Cartão</Text>
              <CardField
                postalCodeEnabled={false}
                placeholder={{ number: 'Número do cartão' }}
                cardStyle={styles.cardFieldStyle}
                style={styles.cardFieldContainer}
              />
              <Text style={styles.secureNote}>Seus dados são processados com segurança via Stripe.</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.payButton, (loading || !selectedPlan) && styles.disabledButton]}
            onPress={handlePayment}
            disabled={loading || !selectedPlan}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>
                {selectedPlan ? `Assinar ${selectedPlan.name}` : 'Selecione um Plano'}
              </Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </StripeProvider>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#050505' },
  container: { padding: 24, minHeight: '100%' },
  header: { marginBottom: 24, marginTop: 20, alignItems: 'center' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#ff1493', textAlign: 'center', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#888', textAlign: 'center' },
  warningBox: { backgroundColor: 'rgba(220, 38, 38, 0.08)', borderLeftWidth: 4, borderLeftColor: '#DC2626', padding: 14, marginBottom: 18, borderRadius: 8 },
  warningText: { color: '#DC2626', fontSize: 12, lineHeight: 16 },
  planCard: { backgroundColor: 'rgba(15, 15, 15, 0.9)', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 2, borderColor: '#222' },
  selectedPlan: { borderColor: '#F59E0B', backgroundColor: '#1a1405' },
  planHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  planName: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  planPrice: { fontSize: 18, color: '#F59E0B', fontWeight: '800' },
  radioActive: { width: 14, height: 14, borderRadius: 7, backgroundColor: '#F59E0B' },
  cardContainer: { marginTop: 12, backgroundColor: '#111', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: '#222' },
  cardLabel: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginBottom: 16 },
  cardFieldContainer: { height: 50, width: '100%', marginBottom: 12 },
  cardFieldStyle: { backgroundColor: '#ffffff', borderRadius: 8, textColor: '#000000', cursorColor: '#ff1493', placeholderColor: '#999999' },
  secureNote: { fontSize: 11, color: '#666', textAlign: 'center', marginTop: 4 },
  payButton: { backgroundColor: '#ff1493', padding: 20, borderRadius: 30, alignItems: 'center', marginTop: 28 },
  disabledButton: { backgroundColor: '#333' },
  payButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
});

export default SubscriptionNative;
