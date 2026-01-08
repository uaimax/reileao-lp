

<Image align="center" src="https://files.readme.io/c88a092-Group_453.png" />

Utilizando a URL de Retorno, é possível que o pagamento seja processado completamente na interface do Asaas, com seu cliente sendo redirecionado de volta para o seu site após a conclusão do pagamento.

<Embed url="https://www.youtube.com/watch?v=vgXBrCJA0rk" title="Configurar Redirecionamentos Após Pagamento | Asaas Dev" favicon="https://www.google.com/favicon.ico" image="https://i.ytimg.com/vi/vgXBrCJA0rk/hqdefault.jpg" provider="youtube.com" href="https://www.youtube.com/watch?v=vgXBrCJA0rk" typeOfEmbed="youtube" html="%3Ciframe%20class%3D%22embedly-embed%22%20src%3D%22%2F%2Fcdn.embedly.com%2Fwidgets%2Fmedia.html%3Fsrc%3Dhttps%253A%252F%252Fwww.youtube.com%252Fembed%252FvgXBrCJA0rk%253Ffeature%253Doembed%26display_name%3DYouTube%26url%3Dhttps%253A%252F%252Fwww.youtube.com%252Fwatch%253Fv%253DvgXBrCJA0rk%26image%3Dhttps%253A%252F%252Fi.ytimg.com%252Fvi%252FvgXBrCJA0rk%252Fhqdefault.jpg%26key%3D7788cb384c9f4d5dbbdbeffd9fe4b92f%26type%3Dtext%252Fhtml%26schema%3Dyoutube%22%20width%3D%22854%22%20height%3D%22480%22%20scrolling%3D%22no%22%20title%3D%22YouTube%20embed%22%20frameborder%3D%220%22%20allow%3D%22autoplay%3B%20fullscreen%3B%20encrypted-media%3B%20picture-in-picture%3B%22%20allowfullscreen%3D%22true%22%3E%3C%2Fiframe%3E" />

A URL de Retorno funciona com cobranças, links de pagamento e assinaturas, sendo possível escolher entre redirecionamento automático  `autoRedirect` ou não. Caso não seja escolhido o redirecionamento automático, após a conclusão do pagamento pelo seu cliente, um botão com o texto **“Ir para o site”** será mostrado.

O `autoRedirect` funciona para pagamentos via cartão de crédito, cartão de débito (somente na fatura) e Pix, pois são os meios de pagamentos que permitem confirmação de pagamento instantânea.

A URL informada deve ser obrigatoriamente do mesmo domínio cadastrado em seus dados comerciais, que você encontra em **"Configurações da conta"** na aba **"Informações"**.

![](https://files.readme.io/4da7205-spaces_s4JaM24l9va6tBt4AJNp_uploads_iuEwB5RL3s9QMDRji1E7_image.webp)

### Criando uma fatura com redirecionamento automático

A forma de criação de cobrança é a mesma, sendo apenas necessário um atributo adicional, o `callback`. Caso ele seja informado, sua cobrança estará configurada para enviar o cliente de volta ao seu site após o pagamento.

> **POST`/v3/lean/payments`**\
> [Confira a referência completa deste endpoint](https://docs.asaas.com/reference/criar-nova-cobranca-com-dados-resumidos-na-resposta)

```json
{
  "customer": "cus_000005219613",
  "billingType": "PIX",
  "value": 2000.00,
  "dueDate": "2023-07-21",
  "callback":{
    "successUrl": "https://seusite.com/redirect",
    "autoRedirect": false // somente enviar em caso de desativação do redirect automatico
  }
}
```

> 📘
>
> Caso você tenha definido o `autoRedirect` como`false` um botão com o texto "Ir para o site" será exibido para o seu cliente após a conclusão do pagamento.

Após criar uma cobrança com URL de Retorno, você pode redirecionar seu cliente para a URL no atributo `invoiceUrl` do JSON de resposta. No momento que o pagamento for concluído, ele será enviado para a URL que você definiu.

Caso o cliente acesse novamente o link da fatura (`invoiceUrl`) em outro momento, ele não será mais redirecionado para o seu site pois o pagamento já terá sido concluído anteriormente. Neste caso, ele verá apenas uma fatura paga.

> 📘
>
> Você pode informar o parâmetro `?autoRedirect=true` na URL da fatura caso queira que o usuário seja sempre redirecionado quando acessar o `invoiceUrl`.

Você também poderá atualizar uma Cobrança enviando os mesmos atributos [no endpoint de atualização de cobrança](https://docs.asaas.com/reference/atualizar-cobranca-existente-com-dados-resumidos-na-resposta).

<Image alt="Uma tela com um carregamento de 5 segundos é mosrada ao cliente ao realizar o pagamento com sucesso." align="center" src="https://files.readme.io/3dbf7a4-spaces_s4JaM24l9va6tBt4AJNp_uploads_iYdBHRZhiX5TSeGcKJd3_image.webp">
  Uma tela com um carregamento de 5 segundos é mosrada ao cliente ao realizar o pagamento com sucesso.
</Image>

### Criando um link de pagamento com redirecionamento automático

Da mesma forma, é possível criar um link de pagamento que, ao sucesso do pagamento, redireciona o cliente ao link informado.

> **POST`/v3/paymentLinks`**\
> [Confira a referência completa deste endpoint](https://docs.asaas.com/reference/criar-um-link-de-pagamentos)

```json
{
  "name": "Meu link da pagamento",
  "billingType": "UNDEFINED",
  "value": 2000.00,
  "chargeType": "DETACHED",
  "callback":{
    "successUrl": "https://seusite.com/redirect",
    "autoRedirect": false // somente enviar em caso de desativação do redirect automatico
  }
}
```

> 📘
>
> Da mesma forma que na fatura, caso você tenha definido o `autoRedirect` como`false` um botão com a mensagem "ir para o site" será mostrado na tela de pagamento aprovado.

Após criar o Link de Pagamento com URL de sucesso, você pode redirecionar seu cliente a `url` retornada. No momento que o pagamento for confirmado, ele será enviado para a URL que você definiu.

<Image alt="Exemplo de botão de retorno no link de pagamento quando o `autoRedirect `é desativado." align="center" src="https://files.readme.io/56fd56a-spaces_s4JaM24l9va6tBt4AJNp_uploads_A8wiJpa8as0CcuZe3fl2_image.webp">
  Exemplo de botão de retorno no link de pagamento quando o `autoRedirect `é desativado.
</Image>

Você também poderá atualizar um Link de Pagamento enviando os mesmos atributos no [endpoint de atualização de link de pagamento](https://docs.asaas.com/reference/atualizar-um-link-de-pagamentos).