

No momento de criar um checkout, você tem três formas de informar os dados do cliente:

**Usando o campo customerData (dados manuais)**\
Ideal para quando você ainda não tem o cliente cadastrado no Asaas ou quer preencher os dados automaticamente no checkout.

Você informa os dados diretamente no corpo da requisição.

Exemplo:

```json
"customerData": {
  "name": "Ana Paula",
  "cpfCnpj": "12345678900",
  "email": "[ana@email.com](mailto:ana@email.com)",
  "phone": "47988887777",
  "address": "Rua das Flores",
  "addressNumber": 123,
  "complement": "Casa",
  "postalCode": "89000000",
  "province": "Centro",
  "city": 4205407
}
```

Observação: antes de colocar o sistema em operação, você deve verificá-lo adequadamente e, para fins de teste, pode usar o [gerador de CPF](https://www.4devs.com.br/gerador_de_cpf) para criar um número de CPF válido e testar o sistema.

Esses dados já virão preenchidos na tela de checkout, facilitando o pagamento e reduzindo fricção para o cliente.

**Usando o campo customer (ID do cliente já cadastrado)**\
Ideal para quem já cadastrou o cliente anteriormente via API ou painel Asaas.

Você só precisa informar o ID do cliente (ex: `cus_000005821234`), e o Asaas puxará os dados automaticamente.

Exemplo:

```json
"customer": "cus_000005821234"
```

O checkout será gerado já com os dados do cliente preenchidos, como nome, e-mail, CPF, endereço, etc., conforme estão salvos no cadastro.

> 🚧 Atenção
>
> * Você deve usar apenas um dos dois campos: customerData ou customer.
> * Informar os dois ao mesmo tempo não é permitido.
> * Se for usar customer, certifique-se de que o cliente já exista na base do Asaas.

**Deixando o seu cliente preencher os dados**

Caso não envie nenhuma das informações citadas acima, o seu cliente poderá informar os próprios dados diretamente na tela de checkout.