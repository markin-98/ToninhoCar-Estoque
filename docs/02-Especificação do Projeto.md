# Especificações do Projeto

Esta seção apresenta a especificação do projeto **Toninho Car Estoque** com foco na forma como os usuários irão interagir com a aplicação no contexto real da mecânica. A partir das necessidades levantadas junto ao cliente, foram definidos os perfis de usuários, as histórias de usuário, os requisitos funcionais e não funcionais, as restrições do projeto, o diagrama de casos de uso, a matriz de rastreabilidade e os elementos básicos de gerenciamento do projeto.

O sistema será desenvolvido como uma aplicação mobile voltada para o controle de estoque da mecânica **Toninho Car**, permitindo o cadastro e exclusão de produtos, controle de preços, registro de entrada e saída de peças, consulta rápida de itens, preenchimento da ficha do carro, histórico de movimentações, alerta de estoque baixo e geração de relatórios.

Para a elaboração desta especificação, foram utilizadas as seguintes técnicas e ferramentas:
- levantamento de requisitos por meio de conversa direta com o cliente;
- definição de personas com base nos perfis reais de uso da aplicação;
- construção de histórias de usuário para representar as necessidades dos usuários;
- identificação e organização dos requisitos funcionais e não funcionais;
- priorização de requisitos com apoio da técnica **MoSCoW**;
- modelagem textual do diagrama de casos de uso;
- criação da matriz de rastreabilidade para alinhar objetivos, histórias e requisitos;
- organização inicial das atividades da equipe e estimativa de orçamento do projeto.

---

## Personas

### Persona 1 – Antônio
Antônio tem 42 anos, é o dono da mecânica **Toninho Car** e acompanha diretamente a rotina do negócio, desde o atendimento até a organização interna da oficina. Ele precisa de uma aplicação simples e confiável para controlar os produtos cadastrados, atualizar preços, registrar entradas e saídas e consultar relatórios, pois deseja manter o estoque organizado e ter mais segurança nas informações utilizadas na gestão da mecânica.

### Persona 2 – Carol
Carol tem 31 anos e atua no setor administrativo da mecânica, auxiliando no controle interno e na conferência das informações do estoque. Ela precisa acessar dados organizados, acompanhar preços, consultar produtos e verificar movimentações, pois sua função exige apoio à administração e maior clareza no acompanhamento das informações registradas no sistema.

### Persona 3 – Antoni
Antoni tem 27 anos e trabalha como funcionário da oficina, participando da rotina operacional dos serviços realizados nos veículos. Ele precisa consultar produtos com rapidez, verificar a quantidade disponível, remover unidades do estoque e preencher a ficha do carro, pois utiliza peças durante os atendimentos e precisa registrar essas informações sem atrapalhar o andamento do trabalho.

---

## Histórias de Usuários

Com base na análise das personas, foram identificadas as seguintes histórias de usuário para o projeto **Toninho Car Estoque**:

| EU COMO... `PERSONA` | QUERO/PRECISO ... `FUNCIONALIDADE` | PARA ... `MOTIVO/VALOR` |
|----------------------|------------------------------------|--------------------------|
| Administrador | realizar login com perfil administrativo | acessar as funcionalidades de gerenciamento do sistema |
| Administrador | gerenciar os produtos do estoque | manter os itens cadastrados, atualizados e organizados |
| Administrador | gerenciar os preços dos produtos | garantir o controle correto e a atualização dos valores |
| Administrador | registrar movimentações de entrada e saída de estoque | controlar o fluxo de peças e produtos da oficina |
| Administrador | consultar o histórico de movimentações | acompanhar tudo o que foi registrado no sistema |
| Administrador | receber alerta de estoque baixo | planejar a reposição de produtos |
| Administrador | gerar relatórios gerenciais do estoque | acompanhar a movimentação e os valores dos produtos |
| Funcionário | realizar login com perfil de funcionário | acessar apenas as funções permitidas para minha rotina |
| Funcionário | consultar produtos cadastrados e quantidade disponível | localizar rapidamente as peças disponíveis para uso |
| Funcionário | registrar a saída de produtos do estoque | informar a utilização da peça no serviço realizado |
| Funcionário | gerenciar a ficha do carro | associar os itens utilizados a um veículo atendido |

---

## Requisitos

Os requisitos do projeto foram definidos com base nas histórias de usuário e organizados em requisitos funcionais e requisitos não funcionais. Para determinar a prioridade de cada item, foi utilizada a técnica **MoSCoW**, que permite classificar os requisitos conforme sua importância para a primeira versão da aplicação.

A técnica foi aplicada da seguinte forma:
- requisitos essenciais para o funcionamento inicial do sistema foram classificados como **ALTA**;
- requisitos importantes, mas não críticos para a primeira entrega, foram classificados como **MÉDIA**;
- requisitos desejáveis, porém complementares, foram classificados como **BAIXA**.

### Requisitos Funcionais

| ID | Descrição do Requisito | Prioridade | Responsável |
|----|-------------------------|------------|-------------|
| RF-001 | Permitir que o usuário realize login no sistema conforme seu perfil de acesso | ALTA | Equipe |
| RF-002 | Permitir que o administrador gerencie os produtos do estoque, incluindo cadastro, edição e exclusão | ALTA | Equipe |
| RF-003 | Permitir que o administrador gerencie os preços dos produtos, incluindo cadastro e alteração | ALTA | Equipe |
| RF-004 | Permitir registrar movimentações de estoque, incluindo entrada, saída e baixa de unidade de produto | ALTA | Equipe |
| RF-005 | Permitir consulta rápida dos produtos cadastrados e da quantidade disponível de cada item | ALTA | Equipe |
| RF-006 | Permitir gerenciar a ficha do carro, incluindo criação e consulta dos registros | ALTA | Equipe |
| RF-007 | Permitir registrar e consultar o histórico de movimentações de entrada e saída | ALTA | Equipe |
| RF-008 | Permitir emitir alerta de estoque baixo para produtos com quantidade mínima | MÉDIA | Equipe |
| RF-009 | Permitir gerar relatórios gerenciais com informações de movimentações e valores do estoque | MÉDIA | Equipe |

### Requisitos não Funcionais

| ID | Descrição do Requisito | Prioridade |
|-------|-------------------------|----|
| RNF-001 | O sistema deve ser responsivo para rodar em dispositivos móveis | ALTA |
| RNF-002 | O sistema deve possuir interface simples, intuitiva e adequada ao ambiente de oficina | ALTA |
| RNF-003 | O sistema deve processar as principais requisições do usuário em no máximo 3 segundos | MÉDIA |
| RNF-004 | O sistema deve controlar o acesso às funcionalidades de acordo com o perfil autenticado | ALTA |
| RNF-005 | O sistema deve manter consistência dos dados nas movimentações de entrada e saída | ALTA |
| RNF-006 | O sistema deve apresentar informações legíveis e organizadas em telas de celular | ALTA |
| RNF-007 | O sistema deve permitir manutenção e evolução futura da aplicação | MÉDIA |
| RNF-008 | O sistema deve registrar as movimentações de forma confiável para consulta posterior | ALTA |

---

## Restrições

O projeto está restrito pelos itens apresentados na tabela a seguir.

| ID | Restrição |
|----|-----------|
| 01 | O projeto deverá ser entregue até o final do semestre |
| 02 | Não pode ser desenvolvido um módulo de backend |
| 03 | A primeira versão do sistema será focada em ambiente mobile |
| 04 | O escopo inicial estará limitado às funcionalidades levantadas junto ao cliente |
| 05 | O sistema trabalhará inicialmente com apenas dois perfis de acesso: administrador e funcionário |
| 06 | O projeto deverá utilizar ferramentas gratuitas ou disponíveis em contexto acadêmico |
| 07 | Funcionalidades não validadas com o cliente não farão parte da primeira entrega |

---

## Diagrama de Casos de Uso

O diagrama de casos de uso representa as interações entre os atores do sistema e as funcionalidades centrais da aplicação **Toninho Car Estoque**. Foram identificados dois atores principais: **Administrador** e **Funcionário**, cada um com permissões específicas de acordo com sua responsabilidade dentro da mecânica.

![Diagrama de Caso de Uso](img/caso_uso_toninho_car_estoque.png)

### Descrição sucinta dos atores e casos de uso

| Ator / Caso de Uso | Descrição |
|---|---|
| Administrador | Usuário responsável pelo gerenciamento do estoque, cadastro de produtos, controle de preços e relatórios |
| Funcionário | Usuário responsável pelas operações de consulta, retirada de peças e preenchimento da ficha do carro |
| Realizar login | Permite acesso ao sistema com autenticação e controle de perfil |
| Cadastrar produto | Permite incluir novos itens no estoque |
| Excluir produto | Permite remover itens que não serão mais utilizados |
| Cadastrar preço | Permite informar o valor inicial do produto |
| Alterar preço | Permite atualizar o valor de um produto já cadastrado |
| Registrar entrada de estoque | Permite lançar novos produtos ou reposições no estoque |
| Registrar saída de estoque | Permite registrar a retirada de itens do estoque |
| Consultar produtos | Permite pesquisar e visualizar produtos cadastrados |
| Visualizar quantidade disponível | Permite verificar o saldo atual de cada item |
| Criar ficha do carro | Permite registrar veículo e itens utilizados em determinado serviço |
| Consultar ficha do carro | Permite visualizar fichas já registradas |
| Visualizar histórico de movimentações | Permite rastrear entradas e saídas registradas |
| Receber alerta de estoque baixo | Permite identificar necessidade de reposição |
| Gerar relatório de valores | Permite acompanhar financeiramente os itens movimentados |

---

# Matriz de Rastreabilidade

A matriz de rastreabilidade relaciona os objetivos do sistema, as histórias de usuário e os requisitos especificados, garantindo alinhamento entre a necessidade do usuário e a funcionalidade prevista na solução.

| Objetivo do Sistema | História de Usuário Relacionada | Requisito(s) Relacionado(s) |
|---|---|---|
| Controlar o acesso ao sistema por perfil | Como administrador, quero realizar login com perfil administrativo para acessar as funcionalidades de gerenciamento do sistema | RF-001, RNF-004 |
| Controlar o acesso ao sistema por perfil | Como funcionário, quero realizar login com perfil de funcionário para acessar apenas as funções permitidas para minha rotina | RF-001, RNF-004 |
| Manter o cadastro de produtos organizado | Como administrador, quero gerenciar os produtos do estoque para manter os itens cadastrados, atualizados e organizados | RF-002 |
| Garantir o controle e a atualização dos preços | Como administrador, quero gerenciar os preços dos produtos para garantir o controle correto e a atualização dos valores | RF-003 |
| Controlar a movimentação de entrada e saída do estoque | Como administrador, quero registrar movimentações de entrada e saída de estoque para controlar o fluxo de peças e produtos da oficina | RF-004, RF-007 |
| Consultar rapidamente os produtos e quantidades disponíveis | Como funcionário, quero consultar produtos cadastrados e quantidade disponível para localizar rapidamente as peças disponíveis para uso | RF-005 |
| Registrar o uso de produtos nos atendimentos | Como funcionário, quero registrar a saída de produtos do estoque para informar a utilização da peça no serviço realizado | RF-004, RF-007 |
| Relacionar peças e serviços realizados | Como funcionário, quero gerenciar a ficha do carro para associar os itens utilizados a um veículo atendido | RF-006 |
| Acompanhar o histórico de movimentações | Como administrador, quero consultar o histórico de movimentações para acompanhar tudo o que foi registrado no sistema | RF-007, RNF-008 |
| Planejar a reposição de itens | Como administrador, quero receber alerta de estoque baixo para planejar a reposição de produtos | RF-008 |
| Acompanhar indicadores quantitativos e financeiros do estoque | Como administrador, quero gerar relatórios gerenciais do estoque para acompanhar a movimentação e os valores dos produtos | RF-009 |
| Garantir usabilidade no contexto real de uso | Como funcionário, quero consultar produtos cadastrados e quantidade disponível para localizar rapidamente as peças disponíveis para uso | RNF-001, RNF-002, RNF-003, RNF-006 |

---

# Gerenciamento de Projeto

De acordo com o PMBoK v6, o gerenciamento de projetos envolve diferentes áreas integradas, como escopo, tempo, custos, qualidade, recursos e partes interessadas. No contexto do projeto **Toninho Car Estoque**, o gerenciamento será conduzido com foco na organização da equipe, no planejamento das atividades e no uso de recursos compatíveis com o contexto acadêmico do projeto.

## Gerenciamento de Equipe

O gerenciamento da equipe será orientado pela divisão das atividades em etapas, permitindo melhor controle das entregas e distribuição equilibrada das responsabilidades entre os integrantes. Como o projeto envolve levantamento de requisitos, documentação, prototipação, desenvolvimento e testes, será necessário adotar uma dinâmica colaborativa, com acompanhamento contínuo da evolução das tarefas.

A equipe atuará no levantamento e validação dos requisitos com base nas informações fornecidas pelo cliente, na documentação do projeto e atualização do repositório, na modelagem das telas e fluxo de navegação, no desenvolvimento da aplicação mobile, nos testes das funcionalidades e na preparação da apresentação final.

| Área de Atuação | Responsabilidades |
|---|---|
| Análise de Requisitos | levantamento das necessidades, organização das histórias de usuário, definição e revisão dos requisitos |
| Documentação | produção e manutenção dos documentos do projeto e organização do GitHub |
| UX/UI | criação de esboços, definição de fluxo de navegação e melhoria da experiência de uso |
| Desenvolvimento | implementação da aplicação e das funcionalidades priorizadas |
| Testes e Validação | verificação do funcionamento do sistema e identificação de ajustes necessários |

## Gestão de Orçamento

A gestão de orçamento do projeto considera o contexto de um trabalho acadêmico, no qual a equipe utilizará recursos próprios e ferramentas gratuitas. Dessa forma, o custo financeiro direto do projeto é reduzido, concentrando-se principalmente no esforço de desenvolvimento, organização e testes.

O projeto será desenvolvido com ferramentas gratuitas ou gratuitas para fins acadêmicos, os integrantes utilizarão seus próprios computadores e dispositivos móveis, não haverá contratação de serviços pagos para a primeira versão e a proposta atual contempla o desenvolvimento de um protótipo funcional.

| Item | Descrição | Custo Estimado |
|---|---|---|
| Ambiente de desenvolvimento | uso de editor de código, bibliotecas e framework React | R$ 0,00 |
| Repositório e versionamento | uso do GitHub Classroom | R$ 0,00 |
| Prototipação e diagramas | uso de ferramentas gratuitas como Figma, Draw.io ou Mermaid | R$ 0,00 |
| Testes | execução em computadores e celulares dos integrantes | R$ 0,00 |
| Documentação | produção realizada pela própria equipe | R$ 0,00 |

Neste cenário, o projeto apresenta custo financeiro direto nulo, pois depende principalmente do tempo, da dedicação e da organização da equipe.
