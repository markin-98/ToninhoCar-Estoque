# Arquitetura da Solução

<span style="color:red">Pré-requisitos: <a href="3-Projeto de Interface.md"> Projeto de Interface</a></span>

Definição de como o software é estruturado em termos dos componentes que fazem parte da solução e do ambiente de hospedagem da aplicação.

![Arquitetura da Solução](img/02-mob-arch.png)

## Diagrama de Classes

<img width="1701" height="1603" alt="Diagrama de Classe - Toninho drawio" src="https://github.com/user-attachments/assets/0b86c74f-9b5e-4adc-8136-bddb33da6654" />

## Modelo ER

<img width="1672" height="1490" alt="Toninho Car - Modelo ER drawio (1)" src="https://github.com/user-attachments/assets/1d3ba23c-c8c0-490b-93f5-fc3c13d77a2d" />

## Esquema Relacional

<img width="862" height="551" alt="Esquema Relacional drawio" src="https://github.com/user-attachments/assets/4bd7c43a-2836-4c0c-8b26-11f04744e9b7" />

## Modelo Físico

Arquivo banco.sql contendo os scripts de criação das tabelas do banco de dados incluído dentro da pasta src\bd.

## Tecnologias Utilizadas

Considerando o projeto **Toninho Car Estoque**, a solução pode ser implementada como um aplicativo mobile desenvolvido em **React Native com TypeScript**, por ser uma tecnologia muito adequada para criar interfaces leves, responsivas e compatíveis com a rotina de uso em celular dentro da oficina. Para o gerenciamento de navegação entre telas e organização da experiência do usuário, podem ser utilizadas bibliotecas de suporte do próprio ecossistema React Native, enquanto a persistência dos dados pode ser feita em um banco **SQLite**, o que combina bem com a proposta do trabalho, já que o modelo relacional foi estruturado com tabelas, chaves primárias, chaves estrangeiras e integridade referencial. Como o projeto não prevê um backend próprio, a aplicação pode consumir diretamente esse banco local para registrar produtos, movimentações, fichas de carro e histórico de preços, mantendo as informações organizadas e acessíveis mesmo em um cenário mais simples e acadêmico. Para a autenticação e controle de perfis, o sistema pode tratar internamente os acessos de administrador e funcionário com base no campo de perfil do usuário, garantindo que cada tipo de conta veja apenas as funcionalidades permitidas. Além disso, ferramentas como **VS Code** podem ser usadas no desenvolvimento, **Git/GitHub** no controle de versão e colaboração da equipe, e **draw.io** na modelagem dos diagramas do projeto, como o esquema relacional, o diagrama de casos de uso e os fluxos de navegação.

A figura que representa essa interação pode mostrar o fluxo de forma bem simples: o **usuário acessa o aplicativo mobile**, faz o **login**, o sistema verifica o **perfil de acesso** e direciona para as funcionalidades correspondentes; em seguida, quando o usuário consulta, cadastra ou registra alguma informação, a aplicação envia essa ação para a **camada de regras do sistema**, que valida os dados e grava ou busca as informações no **banco SQLite**; depois disso, a resposta retorna para o aplicativo e é exibida na tela ao usuário. Esse desenho deixa claro que a interação acontece em um ciclo entre **usuário → aplicativo → banco de dados → aplicativo → usuário**, o que ajuda a entender como a solução funciona na prática dentro da mecânica. Se quiser, eu posso transformar esse texto em uma versão ainda mais formal, pronta para colar direto no documento acadêmico.

## Hospedagem

No projeto Toninho Car Estoque, a hospedagem e o lançamento da plataforma foram pensados de forma simples e compatível com o contexto acadêmico. Como a solução foi desenvolvida para ambiente mobile e não possui um backend próprio nesta primeira versão, o principal apoio para publicação e organização do projeto foi o GitHub, que serviu para versionamento do código, controle das alterações e compartilhamento com a equipe. Para a apresentação do protótipo e dos materiais do projeto, o GitHub Pages pode ser usado na divulgação da página institucional ou da documentação, enquanto o Expo ajuda na programação colaborativa e nos testes rápidos durante o desenvolvimento. Caso houvesse uma camada de servidor ou API, o Heroku poderia ser utilizado para hospedar essa parte, mas, neste projeto, o lançamento ficou concentrado na entrega do aplicativo e na validação com o cliente.

## Qualidade de Software

Para o projeto Toninho Car Estoque, a equipe definiu como base de qualidade as características da ISO/IEC 25010 que melhor atendem ao contexto real de uso da aplicação, que é um sistema mobile simples, prático e voltado para a rotina de uma mecânica automotiva. Nesse cenário, as subcaracterísticas priorizadas foram principalmente as de adequação funcional, usabilidade, confiabilidade, eficiência de desempenho e segurança, pois elas estão diretamente relacionadas à necessidade de registrar produtos, consultar informações rapidamente, controlar movimentações e garantir que os dados permaneçam íntegros e acessíveis apenas aos perfis autorizados.

Dentro de adequação funcional, a equipe buscará garantir completude funcional, correção funcional e adequação funcional, assegurando que o sistema contemple os requisitos previstos, execute corretamente as operações de cadastro, consulta, baixa e geração de relatórios, e realmente ajude na gestão do estoque. As métricas para essa parte podem incluir a quantidade de requisitos funcionais implementados, a taxa de aprovação nos testes funcionais e o percentual de cenários de uso executados com sucesso.

Na característica de usabilidade, as subcaracterísticas mais importantes serão operabilidade, aprendizado do uso, proteção contra erros do usuário e acessibilidade/clareza da interface, porque o sistema será utilizado em ambiente de oficina, com necessidade de rapidez e interação simples pelo celular. Para avaliar isso, a equipe pode observar o tempo médio para realizar tarefas como consultar um produto ou registrar uma saída, a quantidade de erros cometidos durante o uso, a necessidade de retrabalho em telas e a avaliação dos usuários quanto à facilidade de navegação.

Em relação à **confiabilidade**, as subcaracterísticas escolhidas serão maturidade, disponibilidade e recuperabilidade, já que o sistema precisa manter os registros de forma consistente e confiável, sem perder informações de estoque e histórico. As métricas podem ser a taxa de falhas durante testes, o número de interrupções no uso, a capacidade de recuperação após erro e a integridade dos dados após inserções, atualizações e exclusões.

Para eficiência de desempenho, a equipe considerará principalmente o tempo de resposta e o uso de recursos, pois o aplicativo deve responder rapidamente, sem atrapalhar a rotina dos funcionários. As métricas podem ser o tempo médio de carregamento das telas, o tempo de resposta nas consultas, a quantidade de operações processadas em curto período e o consumo de memória durante o uso em dispositivos móveis.

Por fim, a característica de segurança será tratada por meio de confidencialidade, integridade e controle de acesso, uma vez que o sistema possui perfis diferentes de usuário, e cada um deve acessar apenas as funções permitidas. Nesse caso, as métricas podem incluir o número de acessos bloqueados por perfil incorreto, a ausência de falhas de autenticação, o percentual de operações realizadas com controle de permissão correto e a validação da preservação dos dados armazenados.

Assim, a escolha dessas subcaracterísticas se justifica porque elas atendem diretamente aos objetivos do projeto e às necessidades dos usuários da mecânica Toninho Car. Com isso, a equipe consegue orientar o desenvolvimento para um produto funcional, fácil de usar, confiável, rápido e seguro, aumentando as chances de aceitação da solução no uso cotidiano.
