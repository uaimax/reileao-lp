

Para criar uma cobrança parcelada, ao invés de enviar o parâmetro `value`, envie `installmentCount`\
e `installmentValue`, que representam o **número de parcelas** e o **valor da cada parcela** respectivamente.

```json Request
{
  "customer": "{CUSTOMER_ID}",
  "billingType": "BOLETO",
  "installmentCount": 6,
  "installmentValue": 20,
  "dueDate": "2017-06-10",
  "description": "Pedido 056984",
  "externalReference": "056984",
  "discount": {
    "value": 10,
    "dueDateLimitDays": 0
  },
  "fine": {
    "value": 1
  },
  "interest": {
    "value": 2
  }
}
```
```json Response
{
  "object": "payment",
  "id": "pay_080225913252",
  "dateCreated": "2017-03-10",
  "customer": "cus_G7Dvo4iphUNk",
  "paymentLink": null,
  "installment": "5a2c890b-dd63-4b5a-9169-96c8d7828f4c",
  "dueDate": "2017-06-10",
  "value": 20,
  "netValue": 15,
  "billingType": "BOLETO",
  "canBePaidAfterDueDate": true,
  "pixTransaction": null,
  "status": "PENDING",
  "description": "Pedido 056984",
  "externalReference": "056984",
  "originalValue": null,
  "interestValue": null,
  "originalDueDate": "2017-06-10",
  "paymentDate": null,
  "clientPaymentDate": null,
  "installmentNumber": 3,
  "transactionReceiptUrl": null,
  "nossoNumero": "6453",
  "invoiceUrl": "https://www.asaas.com/i/080225913252",
  "bankSlipUrl": "https://www.asaas.com/b/pdf/080225913252",
  "invoiceNumber": "00005101",
  "discount": {
    "value": 10,
    "dueDateLimitDays": 0
  },
  "fine": {
    "value": 1
  },
  "interest": {
    "value": 2
  },
  "deleted": false,
  "postalService": false,
  "anticipated": false,
  "anticipable": false,
  "refunds": null
}
```

Caso prefira informar apenas o valor total do parcelamento, envie o campo `totalValue` no lugar do `installmentValue` com o valor desejado. Se não for possível a divisão exata dos valores de cada parcela, a diferença sera compensada na última parcela.

Por exemplo, um parcelamento com o valor total de R$ 350,00 divido em 12 vezes geraria 11 parcelas no valor de R$: 29,16, sendo a décima segunda parcela no valor de R$: 29,24, totalizando R$: 350.00.

A resposta em caso de sucesso será a primeira cobrança do parcelamento. Caso queira recuperar todas as parcelas basta executar a seguinte requisição com o `installment` retornado :

> `GET https://api.asaas.com/v3/installments/{installment_id}/payments`

Outras ações sobre o parcelamento podem ser encontradas em nossa [seção de parcelamentos](https://docs.asaas.com/reference/recuperar-um-unico-parcelamento).

> 🚧 Atenção
>
> * É permitido a criação de parcelamentos no cartão de crédito em **até 21x para cartões de bandeira Visa e Master.**\
>   Anteriormente, era suportado parcelamentos de até 12 parcelas para todas as bandeiras.\
>     **Para outras bandeiras, exceto Visa e Master, o limite continua sendo de 12 parcelas.**

<br />

> ❗️ Importante
>
> Para cobranças avulsas (1x) não deve-se usar os atributos do parcelamento: **`installmentCount`**, **`installmentValue`** e **`totalValue`**. Se for uma cobrança em 1x, usa-se apenas o **`value`**.
>
> **Somente cobranças com 2 ou mais parcelas usa-se os atributos do parcelamento.**