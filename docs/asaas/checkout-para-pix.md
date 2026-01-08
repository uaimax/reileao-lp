# Checkout para Pix

**Exemplo de checkout simples com Pix**:

```json
{
  "billingTypes": ["PIX"],
  "chargeTypes": ["DETACHED"],
  "minutesToExpire": 60,
  "callback": {
    "cancelUrl": "https://meusite.com/cancelado",
    "expiredUrl": "https://meusite.com/expirado",
    "successUrl": "https://meusite.com/sucesso"
  },
  "items": [
    {
      "name": "Curso de Marketing",
      "description": "Curso completo de marketing digital",
      "quantity": 1,
      "value": 297.00
    }
  ]
}
```

Esse exemplo cria um checkout com:

* Pagamento via Pix
* Link válido por 1 hora
* Produto chamado “Curso de Marketing” no valor de R$ 297,00
* Redirecionamento de volta para seu site

> 🚧 Atenção
>
> * O campo items é obrigatório e define o que você está vendendo.
> * Se você quiser preencher os dados do cliente automaticamente, pode incluir o campo customerData.
> * Se estiver usando assinatura ou parcelamento, há campos extras específicos para isso.