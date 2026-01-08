

Caso queira que a cobrança seja em recorrência (por exemplo, todo mês), use o tipo `RECURRENT`:

```json
{
    "billingTypes": [
        "CREDIT_CARD"
    ],
    "chargeTypes": [
        "RECURRENT"
    ],
    "minutesToExpire": 100,
    "callback": {
        "cancelUrl": "https://google.com/cancel",
        "expiredUrl": "https://google.com/expired",
        "successUrl": "https://google.com/success"
    },
    "items": [
        {
            "description": "Camiseta Branca",
            "imageBase64": "{{image1}}",
            "name": "teste2",
            "quantity": 2,
            "value": 100.00
        }
    ],
    "customerData": {
        "address": "Avenida Rolf Wiest",
        "addressNumber": "277",
        "city": 13660,
        "complement": "complemento",
        "cpfCnpj": "92593962046",
        "email": "testenovopagado@asaas.com",
        "name": "Teste Novo Pagador",
        "phone": "49999009999",
        "postalCode": "89223005",
        "province": "Bom Retiro"
    },
    "subscription": {
        "cycle": "MONTHLY",
        "endDate": "2025-10-31 15:02:38",
        "nextDueDate": "2024-10-31 15:02:38"
    }
}
```

Nesse exemplo, o checkout exibirá a opção para pagamento via cartão de crédito, e ao ser concluído, o Asaas criará uma assinatura com cobranças automáticas mensais (ou o ciclo escolhido) entre as datas indicadas. O cliente é cobrado sem precisar repetir o processo.