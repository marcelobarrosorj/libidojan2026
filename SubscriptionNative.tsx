import React, { useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { StripeProvider, useStripe } from '@stripe/stripe-react-native'
import { CardField } from '@stripe/stripe-react-native'

// Supondo que você tenha essas variáveis (ajuste conforme seu app)
const userId = 'seu-user-id' // Pegue do auth do Supabase
const email = 'user@example.com' // Pegue do auth do Supabase
const priceId = 'price_...' // Seu price ID do Stripe (ex.: 'price_1J2K3L4M5N6O7P8Q9R0S')

const SubscriptionNative: React.FC = () => {
  const [cardDetails, setCardDetails] = useState(null)
  const { createPaymentMethod } = useStripe()

  const handleSubscribe = async () => {
    // 1. Criar payment method
    const { paymentMethod, error } = await createPaymentMethod({
      paymentMethodType: 'Card',
      card: cardDetails
    })

    if (error) {
      Alert.alert('Erro', error.message)
      return
    }

    // 2. Chamar seu endpoint
    try {
      const response = await fetch('https://libido2026.vercel.app/api/billing/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          email,
          priceId,
          paymentMethodId: paymentMethod.id
        })
      })

      const data = await response.json()
      if (response.ok) {
        Alert.alert('Sucesso', 'Assinatura criada! Premium ativado via webhook.')
      } else {
        Alert.alert('Erro', data.error)
      }
    } catch (err) {
      Alert.alert('Erro', 'Falha ao conectar com o servidor.')
    }
  }

  return (
    <StripeProvider publishableKey="pk_live_..."> {/* Sua publishable key do Stripe */}
      <View style={{ padding: 20 }}>
        <Text>Insira os dados do cartão:</Text>
        <CardField
          postalCodeEnabled={false}
          placeholders={{ number: '4242 4242 4242 4242' }}
          cardStyle={{ backgroundColor: '#FFFFFF', textColor: '#000000' }}
          style={{ width: '100%', height: 50, marginVertical: 30 }}
          onCardChange={(cardDetails) => setCardDetails(cardDetails)}
        />
        <TouchableOpacity onPress={handleSubscribe} style={{ backgroundColor: 'blue', padding: 10 }}>
          <Text style={{ color: 'white' }}>Assinar</Text>
        </TouchableOpacity>
      </View>
    </StripeProvider>
  )
}

export default SubscriptionNative
