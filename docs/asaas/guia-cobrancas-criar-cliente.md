

O primeiro passo para criar uma cobrança é ter o **identificador único do seu cliente**, você pode fazer isso criando um novo cliente ou consultando um que já foi criado anteriormente.

<Embed url="https://www.youtube.com/watch?v=mxt0OAP2AqY" title="Aprenda a Criar Clientes no Asaas | Asaas Dev" favicon="https://www.google.com/favicon.ico" image="https://i.ytimg.com/vi/mxt0OAP2AqY/hqdefault.jpg" provider="youtube.com" href="https://www.youtube.com/watch?v=mxt0OAP2AqY" typeOfEmbed="youtube" html="%3Ciframe%20class%3D%22embedly-embed%22%20src%3D%22%2F%2Fcdn.embedly.com%2Fwidgets%2Fmedia.html%3Fsrc%3Dhttps%253A%252F%252Fwww.youtube.com%252Fembed%252Fmxt0OAP2AqY%253Ffeature%253Doembed%26display_name%3DYouTube%26url%3Dhttps%253A%252F%252Fwww.youtube.com%252Fwatch%253Fv%253Dmxt0OAP2AqY%26image%3Dhttps%253A%252F%252Fi.ytimg.com%252Fvi%252Fmxt0OAP2AqY%252Fhqdefault.jpg%26key%3D7788cb384c9f4d5dbbdbeffd9fe4b92f%26type%3Dtext%252Fhtml%26schema%3Dyoutube%22%20width%3D%22854%22%20height%3D%22480%22%20scrolling%3D%22no%22%20title%3D%22YouTube%20embed%22%20frameborder%3D%220%22%20allow%3D%22autoplay%3B%20fullscreen%3B%20encrypted-media%3B%20picture-in-picture%3B%22%20allowfullscreen%3D%22true%22%3E%3C%2Fiframe%3E" />

> **POST** **`/v3/customers`**\
> [Confira a referência completa deste endpoint](https://docs.asaas.com/reference/criar-novo-cliente)

```json
{
      "name": "Marcelo Almeida",
      "cpfCnpj": "24971563792",
      "mobilePhone": "4799376637"
}
```

Ao criar um cliente, um objeto JSON será retornado com algumas informações e o mais importante, o identificador do seu cliente, que deve ser algo semelhante a isso: `cus_000005219613`. Com o identificador em mãos, já é possível criar uma cobrança.

> 🚧
>
> **É permitido a criação de clientes duplicados.** Caso não queira que isso aconteça, é necessário armazenar em sua aplicação os identificadores dos clientes criados, ou implementar uma busca antes de realizar a criação do cliente. Você pode consultar a existência do cliente no [Listar Clientes](https://docs.asaas.com/reference/listar-clientes).

## Referência da API

> 📘 Confira a referência completa do endpoint Clientes`(/v3/customers)`
>
> [Acesse nossa referência da API](https://docs.asaas.com/reference/criar-novo-cliente)